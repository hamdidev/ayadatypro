import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventClickArg, DateSelectArg, EventDropArg } from "@fullcalendar/core";
import { router } from "@inertiajs/react";
import axios from "axios";
import { useRef } from "react";

interface CalendarAppointment {
    id: number;
    patient: string;
    doctor: string;
    doctor_id: number;
    starts_at: string; // ISO string
    ends_at: string;
    status: string;
    type: string;
}

interface Props {
    appointments: CalendarAppointment[];
    doctorId?: number; // filter to a specific doctor (doctor view)
    onDateClick?: (date: string) => void;
    onEventClick?: (appointmentId: number) => void;
    editable?: boolean; // owners/receptionists can drag to reschedule
}

// Map status → FullCalendar event color
const STATUS_COLORS: Record<
    string,
    { backgroundColor: string; borderColor: string; textColor: string }
> = {
    scheduled: {
        backgroundColor: "#eff6ff",
        borderColor: "#3b82f6",
        textColor: "#1d4ed8",
    },
    confirmed: {
        backgroundColor: "#f5f3ff",
        borderColor: "#8b5cf6",
        textColor: "#6d28d9",
    },
    in_progress: {
        backgroundColor: "#fffbeb",
        borderColor: "#f59e0b",
        textColor: "#b45309",
    },
    completed: {
        backgroundColor: "#ecfdf5",
        borderColor: "#10b981",
        textColor: "#065f46",
    },
    cancelled: {
        backgroundColor: "#fef2f2",
        borderColor: "#ef4444",
        textColor: "#b91c1c",
    },
    no_show: {
        backgroundColor: "#f9fafb",
        borderColor: "#9ca3af",
        textColor: "#6b7280",
    },
};

export default function AppointmentCalendar({
    appointments,
    doctorId,
    onDateClick,
    onEventClick,
    editable = false,
}: Props) {
    const calendarRef = useRef<FullCalendar>(null);

    // Convert appointments to FullCalendar event objects
    const events = appointments
        .filter((a) => !doctorId || a.doctor_id === doctorId)
        .filter((a) => a.status !== "cancelled")
        .map((a) => ({
            id: a.id.toString(),
            title: a.patient,
            start: a.starts_at,
            end: a.ends_at,
            extendedProps: { doctor: a.doctor, status: a.status, type: a.type },
            ...(STATUS_COLORS[a.status] ?? STATUS_COLORS.scheduled),
        }));

    const handleEventClick = (info: EventClickArg) => {
        const id = parseInt(info.event.id);
        if (onEventClick) {
            onEventClick(id);
        } else {
            router.visit(`/appointments/${id}`);
        }
    };

    const handleDateSelect = (info: DateSelectArg) => {
        const date = info.startStr.split("T")[0];
        if (onDateClick) {
            onDateClick(date);
        } else {
            // Navigate to appointment create with pre-filled date
            router.visit(`/appointments/create?date=${date}`);
        }
    };

    const handleEventDrop = async (info: EventDropArg) => {
        const appointmentId = parseInt(info.event.id);
        const newStart = info.event.startStr;
        const newEnd = info.event.endStr;

        try {
            await axios.put(`/appointments/${appointmentId}`, {
                starts_at: newStart,
                ends_at: newEnd,
                // Keep existing doctor/type/notes — controller handles partial update
            });
            // Success — calendar already updated optimistically
        } catch (error: any) {
            // Revert the drag on conflict
            info.revert();
            const message =
                error?.response?.data?.errors?.starts_at?.[0] ??
                "يوجد تعارض في الوقت. تم إلغاء التغيير.";
            alert(message);
        }
    };

    return (
        <div className="fc-rtl-wrapper">
            <style>{`
                /* ── RTL overrides ─────────────────────────── */
                .fc-rtl-wrapper .fc {
                    direction: rtl;
                    font-family: 'Noto Sans Arabic', sans-serif;
                }

                /* Hide default English day names */
                .fc-rtl-wrapper .fc-col-header-cell-cushion {
                    font-size: 12px;
                    font-weight: 600;
                    color: #6b7280;
                    text-decoration: none !important;
                }

                /* Toolbar buttons */
                .fc-rtl-wrapper .fc-button {
                    background: white !important;
                    border: 1px solid #e5e7eb !important;
                    color: #374151 !important;
                    box-shadow: none !important;
                    border-radius: 8px !important;
                    font-size: 13px !important;
                    padding: 6px 12px !important;
                }
                .fc-rtl-wrapper .fc-button:hover {
                    background: #f9fafb !important;
                }
                .fc-rtl-wrapper .fc-button-active,
                .fc-rtl-wrapper .fc-button-primary:not(:disabled).fc-button-active {
                    background: #0d9488 !important;
                    border-color: #0d9488 !important;
                    color: white !important;
                }

                /* Today highlight */
                .fc-rtl-wrapper .fc-day-today {
                    background: #f0fdfa !important;
                }

                /* Event pill */
                .fc-rtl-wrapper .fc-timegrid-event {
                    border-radius: 6px !important;
                    border-width: 2px !important;
                    padding: 2px 6px !important;
                    font-size: 11px !important;
                }
                .fc-rtl-wrapper .fc-event-title {
                    font-weight: 600;
                }
                .fc-rtl-wrapper .fc-event-time {
                    font-size: 10px;
                    opacity: 0.75;
                }

                /* Walk-in badge */
                .fc-rtl-wrapper .fc-event[data-type="walk_in"] {
                    border-style: dashed !important;
                }

                /* Now indicator */
                .fc-rtl-wrapper .fc-timegrid-now-indicator-line {
                    border-color: #ef4444;
                }
                .fc-rtl-wrapper .fc-timegrid-now-indicator-arrow {
                    border-top-color: #ef4444;
                }

                /* Scrollbar */
                .fc-rtl-wrapper .fc-scroller::-webkit-scrollbar { width: 4px; }
                .fc-rtl-wrapper .fc-scroller::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
            `}</style>

            <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
                // ── Layout ─────────────────────────────────────
                initialView="timeGridWeek"
                headerToolbar={{
                    start: "today prev,next",
                    center: "title",
                    end: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                buttonText={{
                    today: "اليوم",
                    month: "شهر",
                    week: "أسبوع",
                    day: "يوم",
                }}
                // RTL Arabic day names
                dayHeaderFormat={{ weekday: "short" }}
                // ── Time settings ──────────────────────────────
                slotMinTime="07:00:00"
                slotMaxTime="22:00:00"
                slotDuration="00:20:00" // matches default slot duration
                slotLabelInterval="01:00:00"
                slotLabelFormat={{
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                }}
                nowIndicator={true}
                scrollTime="08:00:00" // scroll to 8am on load
                // ── Events ─────────────────────────────────────
                events={events}
                // ── Interaction ────────────────────────────────
                selectable={editable}
                selectMirror={editable}
                editable={editable}
                eventDurationEditable={false} // don't allow resize — use edit form
                select={handleDateSelect}
                eventClick={handleEventClick}
                eventDrop={handleEventDrop}
                // ── Locale / RTL ───────────────────────────────
                locale="ar"
                direction="rtl"
                firstDay={6} // 6 = Saturday (Gulf week)
                // ── Display ────────────────────────────────────
                height="calc(100vh - 200px)"
                expandRows={true}
                allDaySlot={false}
                // ── Event render — add walk-in data attribute ──
                eventDidMount={(info) => {
                    if (info.event.extendedProps.type === "walk_in") {
                        info.el.setAttribute("data-type", "walk_in");
                    }
                }}
                // ── Event content — custom render ──────────────
                eventContent={(info) => {
                    const { status, doctor } = info.event.extendedProps;
                    return (
                        <div className="overflow-hidden w-full">
                            <div className="font-semibold truncate text-xs">
                                {info.event.title}
                            </div>
                            {info.view.type !== "dayGridMonth" && (
                                <div className="text-xs opacity-70 truncate">
                                    {info.timeText} · د. {doctor}
                                </div>
                            )}
                        </div>
                    );
                }}
            />
        </div>
    );
}
