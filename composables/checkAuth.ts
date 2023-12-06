type CheckAuthResult = {
    authenticated: boolean;
    password_change_required?: boolean;
    user: {
        username?: string;
        full_name?: string;
        email?: string;
        permissions?: ResPermissions;
        organization?: "atec" | "ds" | "music" | "sl" | "extern";
    };
};

type ResPermissions = {
    GLOBAL_LOGIN?: boolean;
    MANAGE_USERS?: boolean;
    CHANGE_PWD?: boolean;
    VIEW_CONTACTS?: boolean;
    MANAGE_EVENTS?: boolean;
};

export default async function checkAuth(options: {
    throwErrorOnNotAuthenticated?: boolean;
    redirectOnPwdChange?: boolean;
}): Promise<CheckAuthResult> {
    const whoamiRes = await useFetch("/api/auth/whoami");

    if (whoamiRes.status.value != "success") {
        throw createError({
            statusCode: 500,
            statusMessage: "Internal server error",
            fatal: true,
        });
    }
    if (whoamiRes.data.value?.authenticated) {
        if (whoamiRes.data.value.change_password_required) {
            if (options.redirectOnPwdChange) {
                await navigateTo("/setup/chpwd");
                return {
                    authenticated: false,
                    password_change_required: true,
                    user: {},
                };
            }

            return {
                authenticated: false,
                password_change_required: true,
                user: {
                    username: whoamiRes.data.value?.user?.username,
                    full_name: whoamiRes.data.value?.user?.full_name,
                    permissions: whoamiRes.data.value?.user?.permissions,
                    organization: whoamiRes.data.value?.user?.organization,
                },
            };
        }

        return {
            authenticated: true,
            user: {
                username: whoamiRes.data.value?.user?.username,
                full_name: whoamiRes.data.value?.user?.full_name,
                permissions: whoamiRes.data.value?.user?.permissions,
                organization: whoamiRes.data.value?.user?.organization,
            },
        };
    } else {
        if (options.throwErrorOnNotAuthenticated) {
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized",
                fatal: true,
            });
        }

        return {
            authenticated: false,
            user: {},
        };
    }
}
