<script>
definePageMeta({
    layout: "login",
});
export default {
    data() {
        return {
            fullName: "",
            username: "",
            email: "",
            organization: "",
            rules: {
                required: (v) => !!v || "Dieses Feld ist erforderlich!",
                email: (v) =>
                    /.+@.+\..+/.test(v) || "Bitte eine gültige E-Mail Adresse angeben.",
            },
            error: {
                shown: false,
                message: "",
            },
        };
    },
    methods: {
        async regiser() {
            const res = await useFetch("/api/register", {
                method: "POST",
                body: JSON.stringify({
                    fullName: this.fullName,
                    username: this.username,
                    email: this.email,
                    organization: this.organization,
                }),
            });

            if (res.status.value === "success") {
                this.error.shown = false;
                await navigateTo("/");
            } else {
                this.error.shown = true;
                this.error.message = "Fehler beim Registrieren";
            }
        },
    },
    async beforeCreate() {
        const { authenticated } = await checkAuth({
            throwErrorOnNotAuthenticated: false,
            redirectOnPwdChange: true,
        });
        if (authenticated) {
            await navigateTo("/home");
        }
    },
};
</script>

<template>
    <div class="loginform">
        <div>
            <h1>Registriegung</h1>
            <p>
                Sie sind dabei einen Account für diese Plattform zu beantragen. Aus
                sicherheitsgründen muss Ihr Account vorher von einem Administrator
                freigegeben werden. <br />
                Sie erhalten eine E-Mail mit Ihrem Benutzernamen und Passwort, sobald Ihr
                Account freigeschaltet wurde.
            </p>
            <p>
                Bitte geben Sie keine Organisation an, der sich nicht angehören. <br />
                Falls Sie sich nicht sicher sind, welche Organisation Sie angeben sollen,
                sind Sie vermutlich nicht in der Zielgruppe der angegebenen Organisationen
                und Sie sollten keine angeben.
            </p>
        </div>

        <VForm @submit.prevent="regiser()">
            <VAlert
                v-if="error.shown"
                type="error"
                variant="flat"
                title="Fehler"
                :text="error.message"
                density="comfortable"
            />

            <VTextField
                v-model="fullName"
                label="Vollständiger Name"
                :rules="[rules.required]"
            />

            <VTextField
                v-model="email"
                label="E-Mail Adresse"
                :rules="[rules.required, rules.email]"
            />

            <VTextField
                v-model="username"
                label="Gewünschter Benutzername"
                :rules="[rules.required]"
            />

            <VSelect
                v-model="organization"
                label="Organisation"
                value=""
                :items="[
                    { label: '---', value: '' },
                    { label: 'Aula Technik AG', value: 'atec' },
                    { label: 'Fachschaft DS', value: 'ds' },
                    { label: 'Band/ Chor', value: 'music' },
                    { label: 'Schulleitung/ SHV', value: 'sl' },
                    { label: 'Externe Veranstalter', value: 'extern' },
                ]"
                item-title="label"
                item-value="value"
            />

            <VBtn type="submit" color="primary" class="mr-4">
                Registrierung beantragen
            </VBtn>
            <NuxtLink to="/">zum Login</NuxtLink>
        </VForm>
    </div>
</template>

<style scoped>
@import url(../assets/login.css);
</style>
