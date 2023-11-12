import User from "../../ATecManager/User/User";
import Session from "../../ATecManager/Session/Session";
import { Permissions } from "~/server/ATecManager/Permissions/PermissionManager";

export default eventHandler(async (event) => {
    const { username, password } = await readBody(event);

    if (
        !username ||
        !password ||
        typeof username !== "string" ||
        typeof password !== "string"
    ) {
        throw createError({ statusCode: 400, message: "Invalid body" });
    }

    const [user, findUserError] = await User.getUserByUsername(username);
    if (findUserError || !user) {
        throw createError({
            statusCode: 401,
            message: "Invalid username or password",
        });
    }

    const [passwordCorrect, passwordCheckingError] = await user.comparePassword(password);

    if (passwordCheckingError) {
        throw createError({ statusCode: 500, message: "Internal server error" });
    }

    if (!passwordCorrect) {
        throw createError({
            statusCode: 401,
            message: "Invalid username or password",
        });
    }

    if (!user.hasPermission(Permissions.GLOBAL_LOGIN)) {
        throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const [session, sessionCreateError] = await Session.createSession(user);

    if (sessionCreateError || !session) {
        throw createError({ statusCode: 500, message: "Internal server error" });
    }

    const token = session.token;

    setCookie(event, "token", token, {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        secure: useRuntimeConfig().prod,
        httpOnly: true,
        sameSite: "strict",
        path: "/",
    });

    await session.activate();

    // send response with username
    return "Login successful";
});
