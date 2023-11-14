<script lang="ts">
export default {
    name: "DefaultLayout",
    data() {
        return {
            show_nav_drawer_button: false,
            authenticated: false,
        };
    },
    methods: {
        async logout() {
            const res = await useFetch("/api/auth/logout", {
                method: "GET",
            });

            if (res.status.value == "success") {
                this.$router.push("/");
            }
        },
        setAuth(auth: boolean) {
            this.authenticated = auth;
        },
    },
    mounted() {
        this.show_nav_drawer_button = window.innerWidth > 1200;
    },
};
</script>

<template>
    <VApp dark>
        <VAppBar elevation="1" location="top">
            <VAppBarNavIcon @click="show_nav_drawer_button = !show_nav_drawer_button">
            </VAppBarNavIcon>

            <VAppBarTitle class="title__app_bar"> ATec </VAppBarTitle>

            <VSpacer />

            <VIcon
                style="margin-right: 14px"
                :icon="authenticated ? 'mdi-logout' : 'mdi-login'"
                @click="logout"
            />
        </VAppBar>

        <VNavigationDrawer v-model="show_nav_drawer_button" class="navigation__drawer">
            <NavDrawerContent @auth="setAuth" />
        </VNavigationDrawer>

        <VMain>
            <div class="content__wrapper">
                <slot />
            </div>
        </VMain>

        <VFooter
            color="primary"
            style="
                align-items: center;
                justify-content: center;
                display: flex;
                flex-direction: column;
            "
        >
            <NuxtLink style="color: #fff" to="/contact">Kontakt</NuxtLink>
        </VFooter>
    </VApp>
</template>

<style scoped>
.content__wrapper {
    padding: 10px;
    transition: filter 50ms;
}

@media screen and (max-width: 900px) {
    .title__app_bar {
        display: none;
    }
}

.v-toolbar--collapse {
    min-width: 275px;
}
</style>
