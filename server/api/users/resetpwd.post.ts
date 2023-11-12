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

    const { id, pwdchangerequired } = await readBody(event);

    if (!id || typeof id !== "string") {
        throw createError({ statusCode: 400, message: "Bad Request" });
    }

    if (typeof pwdchangerequired !== "boolean") {
        throw createError({ statusCode: 400, message: "Bad Request" });
    }

    const [user, userErr] = await User.getUserById(new ObjectId(id));
    if (!user || userErr) {
        throw createError({ statusCode: 404, message: "User not found" });
    }

    const newPwd = User.generatePassword();

    const [setPwd, setPwdErr] = await user.setPassword(newPwd);
    if (!setPwd || setPwdErr) {
        throw createError({ statusCode: 500, message: "Internal Server Error" });
    }

    const [setPasswordChangeRequired, setPasswordChangeRequiredErr] =
        await user.setPasswordChangeRequired(pwdchangerequired);
    if (!setPasswordChangeRequired || setPasswordChangeRequiredErr) {
        throw createError({ statusCode: 500, message: "Internal Server Error" });
    }

    return {
        pwd: newPwd,
    };
});
