<script lang="ts">
interface Contact {
    id: string;
    author: string;
    email: string;
    subject: string;
    content: string;
    createdAt: number;
    status: "pending" | "replied";
}

export default {
    async beforeCreate() {
        const { user } = await checkAuth({
            throwErrorOnNotAuthenticated: false,
            redirectOnPwdChange: true,
        });
        if (!user.permissions?.VIEW_CONTACTS) {
            throw createError({
                statusCode: 403,
                statusMessage: "You don't have permission to view contacts",
            });
        }
    },
    data() {
        return {
            error: {
                show: false,
                msg: "",
            },
            contacts: [] as Contact[],
        };
    },
    async beforeMount() {
        const res = await useFetch("/api/contact", {
            method: "GET",
        });

        if (res.status.value != "success") {
            this.error.show = true;
            this.error.msg = "Fehler beim Laden der Kontaktanfragen";
        } else {
            this.contacts = res.data.value as Contact[];
        }
    },
    methods: {
        async toggleReplied(i: number) {
            const c = this.contacts[i];

            const res = await useFetch("/api/contact/set-status", {
                method: "PUT",
                body: JSON.stringify({
                    id: c.id,
                    status: c.status === "pending" ? "replied" : "pending",
                }),
            });

            if (res.status.value != "success") {
                this.error.show = true;
                this.error.msg = "Fehler Ändern des Status";
            } else {
                this.contacts[i].status = c.status === "pending" ? "replied" : "pending";
            }
        },
        async setAsSpam(i: number) {
            const c = this.contacts[i];

            const res = await useFetch("/api/contact/set-spam", {
                method: "DELETE",
                body: JSON.stringify({
                    id: c.id,
                }),
            });

            if (res.status.value != "success") {
                this.error.show = true;
                this.error.msg = "Fehler Ändern beim Markieren als Spam";
            } else {
                this.contacts.splice(i, 1);
            }
        },
    },
};
</script>

<template>
    <VExpansionPanels>
        <VExpansionPanel v-for="(c, i) in contacts" :key="c.id">
            <VExpansionPanelTitle
                :style="`color: ${c.status === 'pending' ? 'orange' : 'white'}`"
            >
                {{ new Date(c.createdAt).toLocaleDateString() }} - {{ c.author }}
            </VExpansionPanelTitle>
            <VExpansionPanelText>
                <VTextField v-model="c.author" label="Gesendet von: " readonly />
                <VTextField v-model="c.email" label="Email: " readonly />
                <VTextarea label="Nachricht" v-model="c.content" readonly />
                <div
                    style="
                        display: flex;
                        align-items: center;
                        flex-direction: row;
                        gap: 10px;
                    "
                >
                    <VBtn :href="`mailto://${c.email}`" color="primary" link>
                        {{ c.status === "pending" ? "" : "Nochmal" }} Antworten
                    </VBtn>
                    <VBtn
                        @click="toggleReplied(i)"
                        :color="c.status === 'pending' ? 'success' : 'warning'"
                        >Als
                        {{ c.status === "pending" ? "beantwortet" : "ungelesen" }}
                        markieren</VBtn
                    >
                    <VBtn @click="setAsSpam(i)" color="error"> als Spam markieren </VBtn>
                </div>
            </VExpansionPanelText>
        </VExpansionPanel>
    </VExpansionPanels>
</template>

<style scoped></style>
