import Contact from "~/server/ATecManager/Contact/Contact";

export default defineEventHandler(async (event) => {
    const { fullName, email, subject, content } = await readBody(event);

    if (
        !fullName ||
        !email ||
        !subject ||
        !content ||
        typeof fullName !== "string" ||
        typeof email !== "string" ||
        typeof subject !== "string" ||
        typeof content !== "string"
    ) {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request",
        });
    }

    const contact = {
        fullName,
        email,
        subject,
        content,
    };

    const result = await Contact.createContact(contact);

    if (result[1]) {
        throw createError({
            statusCode: 500,
            statusMessage: "Internal Server Error",
        });
    }

    return {
        statusCode: 200,
    };
});
