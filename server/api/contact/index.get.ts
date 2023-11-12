import Contact from "~/server/ATecManager/Contact/Contact";
import { Permissions } from "~/server/ATecManager/Permissions/PermissionManager";

export default defineEventHandler(async (event) => {
    const { success, user } = await event.context.auth.checkAuth({
        PermissionLevel: Permissions.VIEW_CONTACTS,
    });

    if (!success || !user) {
        throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const [contacts, contactFetchErr] = await Contact.getContacts();

    if (contactFetchErr) {
        throw createError({ statusCode: 500, message: "Internal Server Error" });
    }

    return contacts.map((c: Contact) => {
        return {
            id: c._id,
            author: c.fullName,
            email: c.email,
            subject: c.subject,
            content: c.content,
            createdAt: c.createdAt,
            status: c.status,
        };
    });
});
