<script lang="ts">
export default {
    async beforeCreate() {
        const { user } = await checkAuth({
            throwErrorOnNotAuthenticated: false,
            redirectOnPwdChange: true,
        });
        if (user && user.full_name && user.email) {
            this.contactForm.fullName = user.full_name;
            this.contactForm.email = user.email;
        }
    },
    data() {
        return {
            error: {
                show: false,
                msg: "",
            },
            btn: {
                color: "primary",
                text: "Kontakt aufnehmen",
            },
            rules: {
                required: (v: string) => !!v || "Dieses Feld ist erforderlich",
                email: (v: string) => /.+@.+\..+/.test(v) || "E-Mail muss gültig sein",
                textfieldLenght: (v: string) =>
                    v.length <= 80 || "Maximal 80 Zeichen erlaubt",
                contentLenght: (v: string) =>
                    v.length <= 400 || "Maximal 400 Zeichen erlaubt",
            },
            contactForm: {
                fullName: "",
                email: "",
                subject: "",
                content: "",
            },
        };
    },
    methods: {
        async sendContact() {
            if (
                !this.contactForm.fullName ||
                !this.contactForm.email ||
                !this.contactForm.subject ||
                !this.contactForm.content
            ) {
                this.error.show = true;
                this.error.msg = "Bitte füllen Sie alle Felder aus";
                return;
            }
            const res = await useFetch("/api/contact", {
                method: "POST",
                body: JSON.stringify(this.contactForm),
            });

            if (res.status.value === "success") {
                this.btn = {
                    color: "success",
                    text: "Nachricht gesendet",
                };
            } else {
                this.error.show = true;
                this.error.msg = "Es ist ein Fehler aufgetreten";
                this.btn = {
                    color: "error",
                    text: "Nachricht konnte nicht gesendet werden",
                };
            }
        },
    },
};
</script>

<template>
    <VForm @submit.prevent="sendContact()">
        <VCard>
            <VCardTitle> Kontaktformular </VCardTitle>
            <VCardSubtitle>
                Bitte füllen Sie das Formular aus, um mit uns in Kontakt zu treten wir
                werden uns per E-Mail bei Ihnen melden.
            </VCardSubtitle>
            <VAlert
                style="margin: 6px"
                type="error"
                variant="flat"
                v-if="error.show"
                :title="error.msg"
                density="comfortable"
            />
            <VCardText>
                <VTextField
                    dense
                    v-model="contactForm.fullName"
                    label="Ihr Name"
                    :rules="[rules.required, rules.textfieldLenght]"
                />
                <VTextField
                    dense
                    v-model="contactForm.email"
                    label="Ihre E-Mail-Adresse"
                    :rules="[rules.required, rules.email, rules.textfieldLenght]"
                />
                <VTextField
                    dense
                    v-model="contactForm.subject"
                    label="Betreff"
                    :rules="[rules.required, rules.textfieldLenght]"
                />
                <VTextarea
                    dense
                    v-model="contactForm.content"
                    label="Ihre Nachricht an uns"
                    :rules="[rules.required, rules.contentLenght]"
                />
            </VCardText>
            <VCardActions>
                <VBtn type="submit" :color="btn.color" :text="btn.text" />
            </VCardActions>
        </VCard>
    </VForm>
</template>

<style scoped></style>
