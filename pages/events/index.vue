<script lang="ts">
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

interface IEquipment {
    type: string;
    amount: number;
    notes?: string;
}

interface IEvent {
    veranstalter: {
        userid: string;
        fullName: string;
        email: string;
    };
    general: {
        title: string;
        description: string;
        start: number; // start datetime in unix timestamp
        end: number; // end datetime in unix timestamp
        location: string | string[];
        fileurls: string[];
    };
    technical: {
        equipment: IEquipment[];
        equipmentNotes?: string;
        planungsurl: string;
    };
    notes?: string;
    status?: {
        technicians?: {
            userid: string;
            name: string;
            email: string;
        }[];
        technicianNotes?: string[];
    };
}

export default {
    components: {
        FullCalendar,
    },
    async beforeCreate() {
        const { user } = await checkAuth({
            throwErrorOnNotAuthenticated: true,
            redirectOnPwdChange: true,
        });

        if (!user.permissions?.MANAGE_EVENTS) {
            await navigateTo("/home");
        }
    },
    data() {
        return {
            events: Array<IEvent>(),
        };
    },
    computed: {
        fullCalenderOptions() {
            return {
                plugins: [dayGridPlugin, interactionPlugin],
                initialView: "dayGridMonth",
                events: this.events.map((event: any) => {
                    return {
                        title: event.title,
                        date: event.date,
                        extendedProps: {
                            objectId: event._id,
                        },
                    };
                }),
                eventClick: async (info: any) => {
                    const objectId = info.event.extendedProps.objectId;
                    await navigateTo(`/events/${objectId}`);
                },
                height: window.innerHeight > window.innerWidth ? "60svh" : "80svh",
            };
        },
    },
};
</script>

<template>
    <FullCalendar :options="fullCalenderOptions" />
</template>

<style scoped></style>
