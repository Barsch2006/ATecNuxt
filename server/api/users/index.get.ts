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

    const query = getQuery(event).s;

    if (query && typeof query !== "string") {
        throw createError({ statusCode: 400, message: "Bad Request" });
    }

    const [userList, userListError] = await User.searchUsersByName(
        query?.toString() ?? "",
    );
    if (userListError || !userList) {
        throw createError({ statusCode: 500, message: "Internal Server Error" });
    }

    return userList.map((user) => {
        return {
            id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            organization: user.organization,
            changePasswordRequired: user.changePasswordRequired,
            permissions: {
                GLOBAL_LOGIN: user.hasPermission(Permissions.GLOBAL_LOGIN),
                MANAGE_USERS: user.hasPermission(Permissions.MANAGE_USERS),
                CHANGE_PWD: user.hasPermission(Permissions.CHANGE_PWD),
                VIEW_CONTACTS: user.hasPermission(Permissions.VIEW_CONTACTS),
            },
        };
    });
});
