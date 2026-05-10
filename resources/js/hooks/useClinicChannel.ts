// resources/js/hooks/useClinicChannel.ts
// Subscribes to the private clinic channel and listens for real-time events.
// Usage:
//   const { latestEvent } = useClinicChannel(clinicId, {
//     onStatusChanged: (data) => updateQueueItem(data),
//   })

import { useEffect, useRef, useState } from "react";

interface StatusChangedPayload {
    appointment_id: number;
    patient_name: string;
    doctor_name: string;
    doctor_id: number;
    old_status: string;
    new_status: string;
    starts_at: string;
    type: string;
}

interface ClinicChannelOptions {
    onStatusChanged?: (data: StatusChangedPayload) => void;
}

export function useClinicChannel(
    clinicId: number | undefined,
    options: ClinicChannelOptions = {},
) {
    const [latestEvent, setLatestEvent] = useState<StatusChangedPayload | null>(
        null,
    );
    const channelRef = useRef<any>(null);

    useEffect(() => {
        // Guard — Echo may not be initialised (no Reverb config in dev)
        if (!clinicId || !window.Echo) return;

        const channel = window.Echo.private(`clinic.${clinicId}`);
        channelRef.current = channel;

        channel.listen(
            ".appointment.status.changed",
            (data: StatusChangedPayload) => {
                setLatestEvent(data);
                options.onStatusChanged?.(data);
            },
        );

        return () => {
            window.Echo?.leave(`clinic.${clinicId}`);
        };
    }, [clinicId]);

    return { latestEvent };
}
