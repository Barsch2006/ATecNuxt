<script lang="ts">
export default {
    async beforeMount() {
        const { user } = await checkAuth({
            throwErrorOnNotAuthenticated: true,
            redirectOnPwdChange: true,
        });
        if (!user.permissions?.CHANGE_PWD) {
            await navigateTo("/home");
        } else {
            if (user.permissions.CHANGE_PWD) {
                this.settings.push({
                    name: "Passwort ändern",
                    link: "/settings/security/chpwd",
                });
            }
        }
    },
    data() {
        return {
            settings: [] as Array<{ name: string; link: string }>,
        };
    },
};
</script>

<template>
    <div class="settings__wrapper">
        <MenuOneLinkCard
            v-for="(setting, index) in settings"
            v-bind:key="index"
            :title="setting.name"
            :href="setting.link"
        />
    </div>
</template>

<style scoped>
.settings__wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 500px));
    gap: 10px;
}
</style>
