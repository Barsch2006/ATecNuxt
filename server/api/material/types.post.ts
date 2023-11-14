import { Permissions } from "~/server/ATecManager/Permissions/PermissionManager";

export default defineEventHandler(async (event) => {
    const { success, user } = await event.context.auth.checkAuth({
        PermissionLevel: Permissions.MANAGE_MATERIAL,
    });

    if (!success || !user) {
        throw createError({ statusCode: 401, message: "Unauthorized" });
    }
});
