<script lang="ts">
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

interface IEquipment {
    type: string;
    amount: number;
    notes?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

type RestrictedEvent = {
    id: string;
    general: {
        title: string;
        description: string;
        start: number;
        end: number;
        location: string | string[];
    };
    acknowledgements: number;
};

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
    async beforeMount() {
        const res = await useFetch("/api/events", {
            method: "GET",
        });

        if (res.status.value == "success") {
            this.events = res.data.value as RestrictedEvent[];
        } else {
            throw createError({
                statusMessage: "Failed to fetch events",
                statusCode: 500,
                fatal: true,
            });
        }
    },
    data() {
        return {
            events: Array<{
                id: string;
                general: {
                    title: string;
                    description: string;
                    start: number;
                    end: number;
                    location: string | string[];
                };
                acknowledgements: number;
            }>(),
        };
    },
    computed: {
        fullCalenderOptions() {
            return {
                plugins: [dayGridPlugin, interactionPlugin],
                initialView: "dayGridMonth",
                events: this.events.map((event) => {
                    return {
                        title: event.general.title,
                        date: new Date(event.general.start * 1000)
                            .toISOString()
                            .split("T")[0],
                        extendedProps: {
                            objectId: event.id,
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

    <VTable style="margin-top: 40px" fixed-header>
        <thead>
            <tr>
                <th>Name</th>
                <th>Start</th>
                <th>Ende</th>
                <th>Ort/ Location</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in events" :key="item.id">
                <td>{{ item.general.title }}</td>
                <td>{{ new Date(item.general.start * 1000).toLocaleString() }}</td>
                <td>{{ new Date(item.general.end * 1000).toLocaleString() }}</td>
                <td>
                    {{
                        Array.isArray(item.general.location)
                            ? item.general.location.join(",")
                            : item.general.location
                    }}
                </td>
            </tr>
        </tbody>
    </VTable>
</template>

<style scoped></style>
