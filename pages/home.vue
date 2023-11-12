<script lang="ts">
export default {
    data() {
        return {
            apps: [] as Array<{ name: string; link: string }>,
        };
    },
    async beforeCreate() {
        const { user } = await checkAuth({
            throwErrorOnNotAuthenticated: true,
            redirectOnPwdChange: true,
        });
        if (!user) {
            navigateTo("/");
        }

        if (user.permissions?.CHANGE_PWD) {
            this.apps.push({
                name: "Sicherheitseinstellungen",
                link: "/settings/security",
            });
        }

        if (user.permissions?.MANAGE_USERS) {
            this.apps.push({
                name: "Benutzerverwaltung",
                link: "/settings/users",
            });
        }

        if (user.permissions?.VIEW_CONTACTS) {
            this.apps.push({
                name: "Kontaktanfragen",
                link: "/contact/view",
            });
        }
    },
};
</script>

<template>
    <div class="home__wrapper">
        <MenuOneLinkCard
            v-for="(app, index) in apps"
            v-bind:key="index"
            :title="app.name"
            :href="app.link"
        />
    </div>
</template>

<style scoped>
.home__wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 500px));
    gap: 10px;
}
</style>
