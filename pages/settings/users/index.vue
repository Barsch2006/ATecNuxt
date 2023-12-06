<script lang="ts">
export default {
    async beforeCreate() {
        const { user } = await checkAuth({
            throwErrorOnNotAuthenticated: true,
            redirectOnPwdChange: true,
        });

        if (!user.permissions?.MANAGE_USERS) {
            await navigateTo("/home");
        }
    },
    data() {
        return {
            searchQuery: "",
            view_user: false,
            clearNewPwd: "",
            viewed_user: {} as {
                id: string;
                fullName: string;
                username: string;
                email: string;
                organization?: "atec" | "ds" | "music" | "sl" | "extern";
                changePasswordRequired: boolean;
                permissions: {
                    GLOBAL_LOGIN: boolean;
                    MANAGE_USERS: boolean;
                    CHANGE_PWD: boolean;
                    VIEW_CONTACTS: boolean;
                    MANAGE_EVENTS: boolean;
                };
            },
            error: {
                show: false,
                msg: "",
            },
            users: Array<{
                id: string;
                fullName: string;
                username: string;
                email: string;
                organization?: "atec" | "ds" | "music" | "sl" | "extern";
                changePasswordRequired: boolean;
                permissions: {
                    GLOBAL_LOGIN: boolean;
                    MANAGE_USERS: boolean;
                    CHANGE_PWD: boolean;
                    VIEW_CONTACTS: boolean;
                    MANAGE_EVENTS: boolean;
                };
            }>(),
            rules: {
                required: (v: string) => !!v || "Dieses Feld ist erforderlich",
                email: (v: string) => /.+@.+\..+/.test(v) || "E-Mail muss gültig sein",
            },
        };
    },
    async beforeMount() {
        await this.search();
    },
    methods: {
        async search() {
            const res = await useFetch(
                `/api/users?s=${encodeURIComponent(this.searchQuery)}`,
                {
                    method: "GET",
                },
            );
            if (res.status.value === "success") {
                this.users = res.data.value as Array<{
                    id: string;
                    fullName: string;
                    username: string;
                    email: string;
                    organization?: "atec" | "ds" | "music" | "sl" | "extern";
                    changePasswordRequired: boolean;
                    permissions: {
                        GLOBAL_LOGIN: boolean;
                        MANAGE_USERS: boolean;
                        CHANGE_PWD: boolean;
                        VIEW_CONTACTS: boolean;
                        MANAGE_EVENTS: boolean;
                    };
                }>;

                this.error = {
                    show: false,
                    msg: "",
                };

                if (this.users.length <= 0) {
                    this.error = {
                        show: true,
                        msg: "Keine Benutzer gefunden",
                    };
                }
            } else {
                this.error = {
                    show: true,
                    msg: "Keine Benutzer gefunden",
                };
            }
        },
        async updateUser() {
            const res = await useFetch(`/api/users/${this.viewed_user.id}`, {
                method: "PUT",
                body: JSON.stringify(this.viewed_user),
            });
            if (res.status.value === "success") {
                this.view_user = false;
                this.error.show = false;
                await this.search();
            } else {
                this.error = {
                    show: true,
                    msg: "Fehler beim Aktualisieren des Benutzers",
                };
            }
        },
        async deleteUser() {
            const res = await useFetch(`/api/users/${this.viewed_user.id}`, {
                method: "DELETE",
            });
            if (res.status.value === "success") {
                this.view_user = false;
                this.error.show = false;
                await this.search();
            } else {
                this.error = {
                    show: true,
                    msg: "Fehler beim Löschen des Benutzers",
                };
            }
        },
        async resetPwd() {
            const res = await useFetch("/api/users/resetpwd", {
                method: "POST",
                body: JSON.stringify({
                    id: this.viewed_user.id,
                    pwdchangerequired: this.viewed_user.changePasswordRequired ?? false,
                }),
            });
            if (res.status.value === "success") {
                this.clearNewPwd = res.data.value?.pwd.toString() ?? "FEHLER";
                this.error = {
                    show: false,
                    msg: "",
                };
            } else {
                this.error = {
                    show: true,
                    msg: "Fehler beim Zurücksetzen des Passworts",
                };
            }
        },
    },
};
</script>

<template>
    <VDialog v-model="view_user">
        <VCard style="padding: 10px">
            <VForm @submit.prevent="updateUser()">
                <VCardTitle> Benutzer {{ viewed_user?.fullName }} </VCardTitle>
                <VAlert v-if="error.show" color="error" :title="error.msg" />
                <VCardText>
                    <VTextField
                        v-model="viewed_user.fullName"
                        label="Vollständiger Name"
                        dense
                        :rules="[rules.required]"
                    />
                    <VTextField
                        v-model="viewed_user.username"
                        label="Benutzername"
                        dense
                        :rules="[rules.required]"
                    />
                    <VTextField
                        v-model="viewed_user.email"
                        label="E-Mail Adresse"
                        dense
                        :rules="[rules.required, rules.email]"
                    />
                    <VSelect
                        v-model="viewed_user.organization"
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
                </VCardText>
                <VCardText>
                    <h2>Permissions</h2>
                    <p>Stellen Sie ein, welche Aktionen der Benutzer tätigen kann.</p>
                    <VCheckbox
                        v-model="viewed_user.permissions.GLOBAL_LOGIN"
                        label="Global Login"
                        dense
                    />
                    <VCheckbox
                        v-model="viewed_user.permissions.MANAGE_USERS"
                        label="Benutzer verwalten"
                        dense
                    />
                    <VCheckbox
                        v-model="viewed_user.permissions.CHANGE_PWD"
                        label="Passwort ändern"
                        dense
                    />
                    <VCheckbox
                        v-model="viewed_user.permissions.VIEW_CONTACTS"
                        label="Kann Kontaktanfragen ansehen"
                        dense
                    />
                </VCardText>
                <VCardText>
                    <h2>Passwort und Sicherheit</h2>
                    <VCheckbox
                        v-model="viewed_user.changePasswordRequired"
                        label="Passwort Änderung erforderlich"
                        dense
                    />
                    <VBtn
                        style="margin-top: -10px; margin-bottom: 10px"
                        variant="flat"
                        color="secondary"
                        @click="resetPwd()"
                        >Passwort zurücksetzen</VBtn
                    >
                    <p style="color: #00b600" v-if="clearNewPwd != ''">
                        Kopieren Sie das unten stehende Passwort und senden Sie es dem
                        Benutzer zu.
                    </p>
                    <VTextField
                        v-if="clearNewPwd != ''"
                        :v-model="clearNewPwd"
                        :value="clearNewPwd"
                        label="Das neue Passwort"
                        dense
                        readonly
                    />
                </VCardText>
                <VAlert v-if="error.show" color="error" :title="error.msg" />
                <VCardActions>
                    <VBtn variant="flat" color="primary" type="submit">
                        Änderungen speichern
                    </VBtn>
                    <VBtn variant="outlined" @click="view_user = false">
                        Änderungen verwerfen
                    </VBtn>
                    <VBtn variant="flat" @click="deleteUser()" color="error">
                        Benutzer löschen
                    </VBtn>
                </VCardActions>
            </VForm>
        </VCard>
    </VDialog>

    <VTextField
        v-model="searchQuery"
        label="Suche"
        dense
        outlined
        hint="press enter to search"
        clearable
        @change="search"
        prepend-inner-icon="mdi-magnify"
    >
    </VTextField>
    <VTable style="margin-top: 6px">
        <thead>
            <tr>
                <th>Name</th>
                <th>E-Mail</th>
                <th>Organisation</th>
            </tr>
        </thead>
        <tbody>
            <tr
                :class="`${!user.permissions.GLOBAL_LOGIN ? 'blocked_or_new' : ''}`"
                @click="
                    viewed_user = user;
                    view_user = true;
                "
                v-for="user in users"
                :key="user.id"
            >
                <td>
                    {{ user.fullName }}
                </td>
                <td>
                    {{ user.email }}
                </td>
                <td>
                    <p v-if="user.organization == 'atec'">Aula Technik AG</p>
                    <p v-else-if="user.organization == 'ds'">Fachschaft DS</p>
                    <p v-else-if="user.organization == 'music'">Band/ Chor</p>
                    <p v-else-if="user.organization == 'sl'">Schulleitung/ SHV</p>
                    <p v-else-if="user.organization == 'extern'">Externe Veranstalter</p>
                    <p v-else>---</p>
                </td>
            </tr>
        </tbody>
    </VTable>
    <VAlert
        style="margin: 6px"
        type="error"
        variant="flat"
        v-if="error.show"
        :title="error.msg"
        density="comfortable"
    />
</template>

<style scoped>
.blocked_or_new {
    background-color: #f321bb;
}
</style>
