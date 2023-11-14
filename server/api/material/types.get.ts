import MaterialManager from "~/server/ATecManager/Material/MaterialManager";

export default defineEventHandler(async (event) => {
    const { success, user } = await event.context.auth.checkAuth({});

    if (!success || !user) {
        throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    return {
        types: await (MaterialManager.instance
            ? MaterialManager.instance
            : await MaterialManager.init()
        ).getMaterialItemTypes(),
    };
});
