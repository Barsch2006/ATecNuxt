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

    const collection = user.userCollection;

    const {
        fullName,
        username,
        email,
        organization,
        changePasswordRequired,
        permissions,
    } = await readBody(event);

    if (!fullName || typeof fullName !== "string") {
        throw createError({ statusCode: 400, message: "Bad Request" });
    }
    if (!username || typeof username !== "string") {
        throw createError({ statusCode: 400, message: "Bad Request" });
    }
    if (!email || typeof email !== "string") {
        throw createError({ statusCode: 400, message: "Bad Request" });
    }
    if (organization && typeof organization !== "string") {
        throw createError({ statusCode: 400, message: "Bad Request" });
    }

    await collection.updateOne(
        { _id: user._id },
        {
            $set: {
                fullName,
                username,
                email,
                organization,
                changePasswordRequired,
                permissions,
            },
        },
    );

    const [updatedUser, updatedUserErr] = await User.getUserById(new ObjectId(id));
    if (!updatedUser || updatedUserErr) {
        throw createError({ statusCode: 404, message: "User not found" });
    }

    // check if GLOBAL_LOGIN: boolean;
    // MANAGE_USERS: boolean;
    // CHANGE_PWD: boolean;
    // TOTP: boolean;
    // are true or false and allow or deny the user permissions
    if (permissions.MANAGE_USERS) {
        user.allowPermission(Permissions.MANAGE_USERS);
    } else {
        user.denyPermission(Permissions.MANAGE_USERS);
    }
    if (permissions.GLOBAL_LOGIN) {
        user.allowPermission(Permissions.GLOBAL_LOGIN);
    } else {
        user.denyPermission(Permissions.GLOBAL_LOGIN);
    }
    if (permissions.CHANGE_PWD) {
        user.allowPermission(Permissions.CHANGE_PWD);
    } else {
        user.denyPermission(Permissions.CHANGE_PWD);
    }
    if (permissions.VIEW_CONTACTS) {
        user.allowPermission(Permissions.VIEW_CONTACTS);
    } else {
        user.denyPermission(Permissions.VIEW_CONTACTS);
    }
    if (permissions.MANAGE_EVENTS) {
        user.allowPermission(Permissions.MANAGE_EVENTS);
    } else {
        user.denyPermission(Permissions.MANAGE_EVENTS);
    }

    return {
        statusCode: 200,
    };
});
