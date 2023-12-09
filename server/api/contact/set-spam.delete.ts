import { ObjectId } from "mongodb";
import ATecManager from "~/server/ATecManager/ATecManager";
import { Permissions } from "~/server/ATecManager/Permissions/PermissionManager";

export default defineEventHandler(async (event) => {
    const { success, user } = await event.context.auth.checkAuth({
        PermissionLevel: Permissions.VIEW_CONTACTS,
    });

    if (!success || !user) {
        throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const { id } = await readBody(event);

    if (!id) {
        throw createError({ statusCode: 400, message: "Missing parameters" });
    }

    const atec = ATecManager.instance
        ? ATecManager.instance
        : await ATecManager.init(useRuntimeConfig());
    const res = await atec.database
        .collection("contacts")
        .deleteOne({ _id: new ObjectId(id) });
    if (res.acknowledged && res.deletedCount === 1) {
        return {
            statusCode: 200,
            body: {
                success: true,
            },
        };
    } else {
        throw createError({ statusCode: 500, message: "Failed" });
    }
});
