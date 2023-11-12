<script lang="ts">
export default {
    props: {
        error: Object,
    },
};
</script>

<template>
    <VApp>
        <VMain>
            <VAlert
                :title="error?.statusCode ?? '500'"
                :text="error?.statusMessage ?? 'unbekannter Fehler'"
                type="error"
            >
                <br />
                <br />
                <VBtn color="background" width="100%" to="/">Zurück zur Startseite</VBtn>
            </VAlert>
        </VMain>
    </VApp>
</template>

<style scoped>
.v-main {
    width: 100svw;
    height: 100svh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.v-alert {
    width: min(80svw, 400px);
    max-width: min(80svw, 600px);
}
</style>
