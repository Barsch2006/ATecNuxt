<script lang="ts">
export default {
    name: "LoginLayout",
};
</script>

<template>
    <VApp>
        <div class="login-wrapper">
            <slot></slot>
        </div>

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

<style>
@import url("../assets/login.css");
</style>
