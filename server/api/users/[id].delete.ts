import { ObjectId } from "mongodb";
import { Permissions } from "~/server/ATecManager/Permissions/PermissionManager";
import User from "~/server/ATecManager/User/User";

export default defineEventHandler(async (event) => {
    // check authentication
    const checkAuthResult = await event.context.auth.checkAuth({
        PermissionLevel: Permissions.MANAGE_USERS,
    });
    if (!checkAuthResult.success || !checkAuthResult.user) {
        throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const id = getRouterParams(event).id;

    if (!id || typeof id !== "string") {
        throw createError({ statusCode: 400, message: "Bad Request" });
    }

    const [user, userErr] = await User.getUserById(new ObjectId(id));
    if (!user || userErr) {
        throw createError({ statusCode: 404, message: "User not found" });
    }

    const [deleteUser, deleteUserErr] = await user.delete();
    if (!deleteUser || deleteUserErr) {
        throw createError({ statusCode: 500, message: "Internal Server Error" });
    }

    return {
        statusCode: 200,
    };
});
