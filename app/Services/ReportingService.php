<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ReportingService
{
    private int $ttl = 900;

    public function __construct(private readonly int $clinicId) {}

    private function cache(string $key, \Closure $cb): mixed
    {
        return Cache::remember("reports:{$this->clinicId}:{$key}", $this->ttl, $cb);
    }

    public function flush(): void
    {
        foreach (['revenue', 'clinical', 'appointments', 'patients', 'operational'] as $k) {
            Cache::forget("reports:{$this->clinicId}:{$k}");
        }
    }

    // ──────────────────────────────────────────────
    // Revenue
    // issued_at   → created_at
    // balance_due → (total - amount_paid)
    // ──────────────────────────────────────────────
    public function revenue(): array
    {
        return $this->cache('revenue', function () {

            $monthly = DB::select("
                SELECT
                    TO_CHAR(created_at, 'YYYY-MM')  AS month,
                    TO_CHAR(created_at, 'Mon')       AS label,
                    SUM(total)                       AS revenue,
                    SUM(CASE WHEN status = 'paid'    THEN total ELSE 0 END)                  AS collected,
                    SUM(CASE WHEN status IN ('pending','partial') THEN (total - amount_paid) ELSE 0 END) AS outstanding,
                    COUNT(*)                         AS invoice_count
                FROM invoices
                WHERE clinic_id = ?
                  AND created_at >= NOW() - INTERVAL '12 months'
                GROUP BY 1, 2
                ORDER BY 1
            ", [$this->clinicId]);

            $byDoctor = DB::select("
                SELECT
                    u.name           AS doctor,
                    SUM(i.total)     AS revenue,
                    COUNT(i.id)      AS invoices
                FROM invoices i
                JOIN visits v ON v.id  = i.visit_id
                JOIN users  u ON u.id  = v.doctor_id
                WHERE i.clinic_id = ?
                  AND i.status    = 'paid'
                  AND i.created_at >= NOW() - INTERVAL '3 months'
                GROUP BY u.name
                ORDER BY revenue DESC
            ", [$this->clinicId]);

            $aging = DB::select("
                SELECT
                    CASE
                        WHEN NOW() - created_at <= INTERVAL '30 days' THEN '0–30 يوم'
                        WHEN NOW() - created_at <= INTERVAL '60 days' THEN '31–60 يوم'
                        WHEN NOW() - created_at <= INTERVAL '90 days' THEN '61–90 يوم'
                        ELSE '+90 يوم'
                    END                              AS bucket,
                    COUNT(*)                         AS count,
                    SUM(total - amount_paid)         AS amount
                FROM invoices
                WHERE clinic_id = ?
                  AND status IN ('pending', 'partial')
                GROUP BY 1
            ", [$this->clinicId]);

            $kpis = DB::selectOne("
                SELECT
                    COALESCE(SUM(CASE WHEN status = 'paid'
                        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
                        THEN total END), 0)                                   AS revenue_this_month,
                    COALESCE(SUM(CASE WHEN status = 'paid'
                        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')
                        THEN total END), 0)                                   AS revenue_last_month,
                    COALESCE(SUM(CASE WHEN status IN ('pending','partial')
                        THEN (total - amount_paid) END), 0)                  AS total_outstanding,
                    COUNT(CASE WHEN status = 'paid'
                        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
                        THEN 1 END)                                           AS paid_this_month
                FROM invoices
                WHERE clinic_id = ?
            ", [$this->clinicId]);

            return compact('monthly', 'byDoctor', 'aging', 'kpis');
        });
    }

    // ──────────────────────────────────────────────
    // Clinical
    // visited_at → created_at (visits table)
    // ──────────────────────────────────────────────
    public function clinical(): array
    {
        return $this->cache('clinical', function () {

            $diagnoses = DB::select("
                SELECT
                    diagnosis_code       AS code,
                    diagnosis_free_text  AS label,
                    COUNT(*)             AS frequency
                FROM visits
                WHERE clinic_id = ?
                  AND diagnosis_code IS NOT NULL
                  AND created_at >= NOW() - INTERVAL '6 months'
                GROUP BY 1, 2
                ORDER BY frequency DESC
                LIMIT 15
            ", [$this->clinicId]);

            $visitFrequency = DB::select("
                SELECT
                    CASE
                        WHEN cnt = 1            THEN 'زيارة واحدة'
                        WHEN cnt BETWEEN 2 AND 4 THEN '2–4 زيارات'
                        WHEN cnt BETWEEN 5 AND 9 THEN '5–9 زيارات'
                        ELSE '+10 زيارات'
                    END          AS bucket,
                    COUNT(*)     AS patients
                FROM (
                    SELECT patient_id, COUNT(*) AS cnt
                    FROM visits
                    WHERE clinic_id = ?
                    GROUP BY patient_id
                ) sub
                GROUP BY 1
            ", [$this->clinicId]);

            $workload = DB::select("
                SELECT
                    u.name                            AS doctor,
                    COUNT(v.id)                       AS visits,
                    COUNT(DISTINCT v.patient_id)      AS unique_patients,
                    ROUND(AVG(
                        EXTRACT(EPOCH FROM (v.updated_at - v.created_at)) / 60
                    ))                                AS avg_visit_minutes
                FROM visits v
                JOIN users u ON u.id = v.doctor_id
                WHERE v.clinic_id = ?
                  AND v.created_at >= NOW() - INTERVAL '3 months'
                GROUP BY u.name
                ORDER BY visits DESC
            ", [$this->clinicId]);

            $followUp = DB::selectOne("
                SELECT
                    COUNT(*)        AS total_followups_scheduled,
                    COUNT(a.id)     AS actually_booked,
                    ROUND(COUNT(a.id) * 100.0 / NULLIF(COUNT(*), 0), 1) AS compliance_rate
                FROM visits v
                LEFT JOIN appointments a
                    ON a.patient_id  = v.patient_id
                    AND a.type       = 'follow_up'
                    AND a.created_at > v.created_at
                    AND a.created_at < v.created_at + INTERVAL '30 days'
                WHERE v.clinic_id = ?
                  AND v.created_at >= NOW() - INTERVAL '6 months'
            ", [$this->clinicId]);

            return compact('diagnoses', 'visitFrequency', 'workload', 'followUp');
        });
    }

    // ──────────────────────────────────────────────
    // Appointments
    // scheduled_at  → starts_at
    // duration_minutes → EXTRACT(EPOCH FROM (ends_at - starts_at))/60
    // ──────────────────────────────────────────────
    public function appointments(): array
    {
        return $this->cache('appointments', function () {

            $noShowByDoctor = DB::select("
                SELECT
                    u.name          AS doctor,
                    COUNT(*)        AS total,
                    COUNT(CASE WHEN a.status = 'no_show' THEN 1 END) AS no_shows,
                    ROUND(COUNT(CASE WHEN a.status = 'no_show' THEN 1 END) * 100.0
                        / NULLIF(COUNT(*), 0), 1)  AS rate
                FROM appointments a
                JOIN users u ON u.id = a.doctor_id
                WHERE a.clinic_id = ?
                  AND a.starts_at >= NOW() - INTERVAL '3 months'
                GROUP BY u.name
                ORDER BY rate DESC
            ", [$this->clinicId]);

            $noShowByDay = DB::select("
                SELECT
                    TO_CHAR(starts_at, 'ID')    AS day_num,
                    TO_CHAR(starts_at, 'Day')   AS day_name,
                    COUNT(*)                    AS total,
                    COUNT(CASE WHEN status = 'no_show' THEN 1 END) AS no_shows
                FROM appointments
                WHERE clinic_id = ?
                  AND starts_at >= NOW() - INTERVAL '3 months'
                GROUP BY 1, 2
                ORDER BY 1
            ", [$this->clinicId]);

            $heatmap = DB::select("
                SELECT
                    EXTRACT(DOW  FROM starts_at) AS dow,
                    EXTRACT(HOUR FROM starts_at) AS hour,
                    COUNT(*)                     AS bookings
                FROM appointments
                WHERE clinic_id = ?
                  AND starts_at >= NOW() - INTERVAL '3 months'
                GROUP BY 1, 2
                ORDER BY 1, 2
            ", [$this->clinicId]);

            $cancellations = DB::select("
                SELECT
                    TO_CHAR(starts_at, 'YYYY-MM') AS month,
                    COUNT(*)                       AS cancelled
                FROM appointments
                WHERE clinic_id = ?
                  AND status    = 'cancelled'
                  AND starts_at >= NOW() - INTERVAL '6 months'
                GROUP BY 1
                ORDER BY 1
            ", [$this->clinicId]);

            $duration = DB::selectOne("
                SELECT
                    ROUND(AVG(
                        EXTRACT(EPOCH FROM (ends_at - starts_at)) / 60
                    ))   AS avg_scheduled,
                    COUNT(*) AS total
                FROM appointments
                WHERE clinic_id = ?
                  AND status    = 'completed'
                  AND starts_at >= NOW() - INTERVAL '3 months'
            ", [$this->clinicId]);

            return compact('noShowByDoctor', 'noShowByDay', 'heatmap', 'cancellations', 'duration');
        });
    }

    // ──────────────────────────────────────────────
    // Patients
    // visited_at → created_at (visits)
    // city       → removed (column doesn't exist)
    // ──────────────────────────────────────────────
    public function patients(): array
    {
        return $this->cache('patients', function () {

            $newVsReturning = DB::select("
                SELECT
                    TO_CHAR(month, 'YYYY-MM') AS month,
                    TO_CHAR(month, 'Mon')     AS label,
                    SUM(is_new)               AS new_patients,
                    SUM(1 - is_new)           AS returning_patients
                FROM (
                    SELECT
                        DATE_TRUNC('month', v.created_at) AS month,
                        CASE WHEN v.created_at = MIN(v.created_at) OVER (PARTITION BY v.patient_id)
                             THEN 1 ELSE 0 END             AS is_new
                    FROM visits v
                    WHERE v.clinic_id = ?
                      AND v.created_at >= NOW() - INTERVAL '12 months'
                ) sub
                GROUP BY 1, 2
                ORDER BY 1
            ", [$this->clinicId]);

            $retention = DB::selectOne("
                SELECT
                    COUNT(DISTINCT fv.patient_id)  AS total_patients,
                    COUNT(DISTINCT sv.patient_id)  AS retained,
                    ROUND(COUNT(DISTINCT sv.patient_id) * 100.0
                        / NULLIF(COUNT(DISTINCT fv.patient_id), 0), 1) AS retention_rate
                FROM (
                    SELECT patient_id, MIN(created_at) AS first_at
                    FROM visits WHERE clinic_id = ?
                    GROUP BY patient_id
                ) fv
                LEFT JOIN visits sv
                    ON sv.patient_id = fv.patient_id
                    AND sv.created_at > fv.first_at
                    AND sv.created_at <= fv.first_at + INTERVAL '90 days'
                    AND sv.clinic_id  = ?
            ", [$this->clinicId, $this->clinicId]);

            $ageGroups = DB::select("
                SELECT
                    CASE
                        WHEN EXTRACT(YEAR FROM AGE(dob)) < 18  THEN 'أقل من 18'
                        WHEN EXTRACT(YEAR FROM AGE(dob)) < 30  THEN '18–29'
                        WHEN EXTRACT(YEAR FROM AGE(dob)) < 45  THEN '30–44'
                        WHEN EXTRACT(YEAR FROM AGE(dob)) < 60  THEN '45–59'
                        ELSE '+60'
                    END          AS age_group,
                    COUNT(*)     AS count
                FROM patients
                WHERE clinic_id = ?
                  AND dob IS NOT NULL
                GROUP BY 1
            ", [$this->clinicId]);

            $gender = DB::select("
                SELECT
                    COALESCE(gender, 'غير محدد') AS gender,
                    COUNT(*)                      AS count
                FROM patients
                WHERE clinic_id = ?
                GROUP BY 1
            ", [$this->clinicId]);

            // cities removed — column doesn't exist
            return compact('newVsReturning', 'retention', 'ageGroups', 'gender');
        });
    }

    // ──────────────────────────────────────────────
    // Operational
    // scheduled_at  → starts_at
    // duration_minutes → derived
    // ──────────────────────────────────────────────
    public function operational(): array
    {
        return $this->cache('operational', function () {

            $occupancy = DB::select("
                SELECT
                    TO_CHAR(starts_at, 'YYYY-MM') AS month,
                    TO_CHAR(starts_at, 'Mon')     AS label,
                    COUNT(*)                      AS booked,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed
                FROM appointments
                WHERE clinic_id = ?
                  AND starts_at >= NOW() - INTERVAL '6 months'
                GROUP BY 1, 2
                ORDER BY 1
            ", [$this->clinicId]);

            $kpis = DB::selectOne("
                SELECT
                    COUNT(*)                                           AS total_appointments,
                    COUNT(CASE WHEN status = 'completed'  THEN 1 END) AS completed,
                    COUNT(CASE WHEN status = 'no_show'    THEN 1 END) AS no_shows,
                    COUNT(CASE WHEN status = 'cancelled'  THEN 1 END) AS cancelled,
                    ROUND(AVG(EXTRACT(EPOCH FROM (ends_at - starts_at)) / 60)) AS avg_duration,
                    COUNT(DISTINCT patient_id)                         AS unique_patients
                FROM appointments
                WHERE clinic_id = ?
                  AND starts_at >= NOW() - INTERVAL '30 days'
            ", [$this->clinicId]);

            return compact('occupancy', 'kpis');
        });
    }
}
