import User from "~/server/ATecManager/User/User";
import { ErrorTypes } from "../ATecManager/MethodResult";

export default defineEventHandler(async (event) => {
    const checkAuthResult = await event.context.auth.checkAuth({});
    if (checkAuthResult.success || checkAuthResult.user) {
        throw createError({ statusCode: 403, message: "Forbidden" });
    }

    const { fullName, username, email, organization } = await readBody(event);

    if (!fullName || typeof fullName !== "string") {
        throw createError({ statusCode: 400, message: "Bad Request" });
    }
    if (!username || typeof username !== "string") {
        throw createError({ statusCode: 400, message: "Bad Request" });
    }
    if (!email || typeof email !== "string") {
        throw createError({ statusCode: 400, message: "Bad Request" });
    }
    if (
        !organization ||
        (typeof organization !== "string" &&
            (organization != "atec" ||
                organization != "ds" ||
                organization != "music" ||
                organization != "sl" ||
                organization != "extern"))
    ) {
        throw createError({ statusCode: 400, message: "Bad Request" });
    }

    const [createUser, createUserError] = await User.createUser({
        fullName,
        username,
        email,
        organization,
        permissions: 0,
        changePasswordRequired: false,
    });

    if (createUserError) {
        if (createUserError == ErrorTypes.ALREADY_EXISTS) {
            throw createError({ statusCode: 409, message: "username already exists" });
        } else {
            throw createError({ statusCode: 500, message: "Internal Server Error" });
        }
    }

    return {
        statusCode: 200,
        username: createUser.username,
    };
});
