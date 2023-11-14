import MaterialManager from "~/server/ATecManager/Material/MaterialManager";

export default defineEventHandler(async (event) => {
    const { success, user } = await event.context.auth.checkAuth({});

    if (!success || !user) {
        throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    // todo read body and search for items

    return {
        items: await (MaterialManager.instance
            ? MaterialManager.instance
            : await MaterialManager.init()
        ).searchMaterialItems({}),
    };
});
