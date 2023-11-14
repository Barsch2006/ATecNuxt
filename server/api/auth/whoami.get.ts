import { Permissions } from "~/server/ATecManager/Permissions/PermissionManager";

type ResPermissions = {
    GLOBAL_LOGIN?: boolean;
    MANAGE_USERS?: boolean;
    CHANGE_PWD?: boolean;
    VIEW_CONTACTS?: boolean;
    MANAGE_MATERIAL?: boolean;
};

export default eventHandler(async (event) => {
    let permissions: ResPermissions = {};

    if (event.context.auth.user) {
        permissions = {
            GLOBAL_LOGIN: event.context.auth.user.hasPermission(Permissions.GLOBAL_LOGIN),
            MANAGE_USERS: event.context.auth.user.hasPermission(Permissions.MANAGE_USERS),
            CHANGE_PWD: event.context.auth.user.hasPermission(Permissions.CHANGE_PWD),
            VIEW_CONTACTS: event.context.auth.user.hasPermission(
                Permissions.VIEW_CONTACTS,
            ),
            MANAGE_MATERIAL: event.context.auth.user.hasPermission(
                Permissions.MANAGE_MATERIAL,
            ),
        };
    }

    return {
        authenticated: event.context.auth.authenticated,
        change_password_required: event.context.auth.change_password_required,
        user: {
            username: event.context.auth.user?.username,
            full_name: event.context.auth.user?.fullName,
            email: event.context.auth.user?.email,
            permissions,
            organization: event.context.auth.user?.organization,
        },
    };
});
