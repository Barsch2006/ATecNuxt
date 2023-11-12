import { ErrorTypes } from "~/server/ATecManager/MethodResult";
import { Permissions } from "~/server/ATecManager/Permissions/PermissionManager";

export default eventHandler(async (event) => {
    const checkAuthResult = await event.context.auth.checkAuth({
        PermissionLevel: Permissions.CHANGE_PWD,
    });
    if (!checkAuthResult.success || !checkAuthResult.user) {
        throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const { oldPassword, newPassword } = await readBody(event);

    if (!oldPassword || !newPassword) {
        throw createError({ statusCode: 400, message: "Bad Request" });
    }

    const [oldPasswordCheck, oldPasswordCheckErr] =
        await checkAuthResult.user.comparePassword(oldPassword);

    if (oldPasswordCheckErr || !oldPasswordCheck) {
        throw createError({
            statusCode: 400,
            message: "Das alte Passwort ist nicht korrekt",
        });
    }

    const [newPasswordCheck, newPasswordCheckErr] =
        await checkAuthResult.user.comparePassword(newPassword);

    if (newPasswordCheckErr || newPasswordCheck) {
        throw createError({
            statusCode: 400,
            message: "Das neue Passwort darf nicht das aktuelle Passwort sein.",
        });
    }

    const [setPassword, setPasswordErr] =
        await checkAuthResult.user.setPassword(newPassword);
    const [success, successErr] =
        await checkAuthResult.user.setPasswordChangeRequired(false);

    if (setPasswordErr || !setPassword || successErr || !success) {
        if (setPasswordErr == ErrorTypes.INVALID_ARGUMENT) {
            throw createError({
                statusCode: 400,
                message:
                    "Das neue Passwort entspricht nicht den Richtlinien für Passwörter",
            });
        }
        if (setPasswordErr == ErrorTypes.NOT_SUPPORTED) {
            throw createError({
                statusCode: 400,
                message:
                    "Das neue Passwort enthält Wörter, die es leichter zu erraten machen",
            });
        }
        throw createError({
            statusCode: 500,
            message: "Passwort ändern fehlgeschlagen.",
        });
    } else {
        return { statusCode: 200, success: true };
    }
});
