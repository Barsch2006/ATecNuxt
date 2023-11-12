<script lang="ts">
definePageMeta({
    layout: "login",
});
export default {
    data() {
        return {
            username: "" as string,
            pwd: "" as string,
            error: {
                shown: false,
                message: "",
            },
            passwordless: {
                avaible: false,
                localAvaible: false,
                localUser: "",
                token: "",
                tokenHash: "",
                challenge: "",
                qr_url: "",
                qr_code: "",
                interval: undefined as NodeJS.Timeout | undefined,
            },
        };
    },
    async beforeCreate() {
        const auth = await checkAuth({
            throwErrorOnNotAuthenticated: false,
            redirectOnPwdChange: true,
        });
        if (auth.authenticated) {
            navigateTo("/home");
        }
    },
    methods: {
        async login() {
            const response = await useFetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    username: this.username,
                    password: this.pwd,
                }),
            });

            if (response.status.value === "error") {
                this.error.shown = true;
                this.error.message = "Login fehlgeschlagen";
                return;
            }

            switch (response.data.value) {
                case "Login successful":
                    navigateTo("/home");
                    break;
                case "continue with 2fa":
                    navigateTo("/totp");
                    break;
                default:
                    this.error.shown = true;
                    this.error.message = "Login fehlgeschlagen";
                    break;
            }

            await new Promise((resolve) => setTimeout(resolve, 500));
        },
    },
};
</script>

<template>
    <div class="loginform small">
        <VForm @submit.prevent="login">
            <VAlert
                v-if="error.shown"
                type="error"
                variant="flat"
                :text="error.message"
                density="comfortable"
            />
            <h1>Anmelden</h1>
            <VTextField
                label="Benutzername"
                v-model="username"
                placeholder="Benutzername"
            ></VTextField>
            <VTextField
                label="Passwort"
                v-model="pwd"
                type="password"
                placeholder="Passwort"
            ></VTextField>
            <VBtn type="submit" size="large" variant="outlined">Einloggen</VBtn>
            <NuxtLink to="/register">Jetzt registrieren</NuxtLink>
        </VForm>
    </div>
</template>

<style scoped>
@import url("../assets/login.css");

.v-img {
    width: 128px;
    height: 128px;
    margin: 10px auto;
}

.v-progress-circular {
    width: 200px;
    height: 200px;
}
</style>
