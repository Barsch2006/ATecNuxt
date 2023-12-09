import Event from "~/server/ATecManager/Events/Event";

export default defineEventHandler(async (event) => {
    if (!event.context.auth.checkAuth({})) {
        throw createError({
            message: "Unauthorized",
            statusCode: 401,
        });
    }

    const [events, getEventsError] = await Event.getEvents();
    if (getEventsError) {
        throw createError({
            message: getEventsError,
            statusCode: 500,
        });
    }

    return events.map((event) => {
        return {
            id: event._id.toString(),
            general: {
                title: event.general.title,
                description: event.general.description,
                start: event.general.start,
                end: event.general.end,
                location: event.general.location,
            },
            acknowledgements: event.status.technicians.length,
        };
    }) as Array<{
        id: string;
        general: {
            title: string;
            description: string;
            start: number;
            end: number;
            location: string | string[];
        };
        acknowledgements: number;
    }>;
});
