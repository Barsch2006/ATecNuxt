import { ObjectId } from "mongodb";
import Contact from "~/server/ATecManager/Contact/Contact";
import { Permissions } from "~/server/ATecManager/Permissions/PermissionManager";

export default defineEventHandler(async (event) => {
    const { success, user } = await event.context.auth.checkAuth({
        PermissionLevel: Permissions.VIEW_CONTACTS,
    });

    if (!success || !user) {
        throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const { id, status } = await readBody(event);

    if (!id || !status) {
        throw createError({ statusCode: 400, message: "Missing parameters" });
    }

    const contact = await Contact.getContact(new ObjectId(id));

    if (!contact[0]) {
        throw createError({ statusCode: 404, message: "Contact not found" });
    }

    const [success2, err] = await contact[0].setStatus(status);

    if (!success2 || err) {
        throw createError({ statusCode: 500, message: "Failed" });
    }

    return {
        statusCode: 200,
        body: {
            success: true,
        },
    };
});
