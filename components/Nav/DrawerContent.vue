<script lang="ts">
type ResPermissions = {
    GLOBAL_LOGIN?: boolean;
    MANAGE_USERS?: boolean;
    CHANGE_PWD?: boolean;
    VIEW_CONTACTS?: boolean;
};

export default {
    methods: {
        async logout() {
            const res = await useFetch("/api/auth/logout", {
                method: "GET",
            });

            if (res.status.value == "success") {
                this.$router.push("/");
            }
        },
    },
    data() {
        return {
            auth: false,
            permissions: {} as ResPermissions,
        };
    },
    async beforeMount() {
        const { user, authenticated } = await checkAuth({
            redirectOnPwdChange: false,
            throwErrorOnNotAuthenticated: false,
        });

        this.auth = authenticated;
        this.permissions = user.permissions ?? {};
        this.$emit("auth", authenticated);
    },
};
</script>

<template>
    <VList>
        <NuxtLink v-if="!auth" to="/">
            <VIcon>mdi-login</VIcon>
            Login
        </NuxtLink>
        <NuxtLink v-if="auth" to="/home">
            <VIcon>mdi-home</VIcon>
            Home
        </NuxtLink>
        <NuxtLink v-if="auth && permissions.CHANGE_PWD" to="/settings/security">
            <VIcon>mdi-shield-account</VIcon>
            Sicherheitseinstellungen
        </NuxtLink>
        <NuxtLink v-if="auth && permissions.MANAGE_USERS" to="/settings/users">
            <VIcon>mdi-account-edit</VIcon>
            Benutzer verwalten
        </NuxtLink>
        <NuxtLink v-if="auth && permissions.VIEW_CONTACTS" to="/contact/view">
            <VIcon>mdi-email</VIcon>
            Kontaktanfragen
        </NuxtLink>
    </VList>
</template>

<style scoped>
.v-list a {
    display: flex;
    align-items: center;
    flex-direction: row;
    text-decoration: none;
    gap: 4px;
    line-height: 2em;
    color: #fff;
    padding-left: 6px;
}

.v-list a:hover:not(.v-btn) {
    color: rgb(64, 165, 206);
}
</style>
