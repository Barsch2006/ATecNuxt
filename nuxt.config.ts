import { aliases, mdi } from "vuetify/iconsets/mdi";
import { config } from "dotenv";
config();

export default defineNuxtConfig({
    runtimeConfig: {
        DB_NAME: process.env.DB_NAME ?? "ATec",
        DB_URL: process.env.DB_URL ?? "mongodb://127.0.0.1:27017/",
        prod: true,
        public: {
            DOMAIN: process.env.DOMAIN ?? "http://127.0.0.1:3000/",
        },
    },
    app: {
        head: {
            charset: "utf-8",
            viewport: "width=device-width, initial-scale=1",
            noscript: [{ innerHTML: "This website requires JavaScript." }],
            titleTemplate: "Veranstaltungstechnik GRB",
            meta: [
                {
                    hid: "description",
                    name: "description",
                    content:
                        "Offizielle Website rund um die Veranstaltungstechnik am Gymnasium Riedberg",
                },
                {
                    hid: "viewport",
                    name: "viewport",
                    content: "width=device-width, initial-scale=1, user-scalable=no",
                },
                {
                    hid: "og:title",
                    property: "og:title",
                    content: "Veranstaltungstechnik am Gymnasium Riedberg",
                },
                {
                    hid: "og:site_name",
                    property: "og:site_name",
                    content: "Veranstaltungstechnik GRB",
                },
                { hid: "og:type", property: "og:type", content: "website" },
                {
                    hid: "og:url",
                    property: "og:url",
                    content: process.env.DOMAIN ?? "http://127.0.0.1:3000/",
                },
                {
                    hid: "og:description",
                    property: "og:description",
                    content:
                        "Offizielle Website rund um die Veranstaltungstechnik am Gymnasium Riedberg",
                },
                {
                    hid: "og:image",
                    property: "og:image",
                    content: `${
                        process.env.DOMAIN ?? "http://127.0.0.1:3000/"
                    }favicon.jpg`,
                },
            ],
            link: [{ rel: "shortcut icon", type: "image/x-icon", href: "/favicon.jpg" }],
        },
    },
    css: ["~/assets/base.css"],
    devtools: { enabled: false },
    ssr: false,
    routeRules: {
        // Homepage pre-rendered at build time
        "/": { prerender: true, static: true },
        // Add cors headers on API routes
        "/api/**": { cors: true },
    },
    logLevel: "verbose", // todo change to "silent" in production
    modules: ["nuxt-vuetify"],
    vuetify: {
        icons: {
            defaultSet: "mdi",
            aliases: aliases,
            sets: {
                mdi: mdi,
            },
        },
        theme: {
            defaultTheme: "atecTheme",
            themes: {
                atecTheme: {
                    dark: true,
                    colors: {
                        background: "#000917",
                        surface: "#333333",
                        primary: "#006da3",
                        secondary: "#0a77ad",
                        error: "#c42708",
                        info: "#f321bb",
                        success: "#21b426",
                        warning: "#c44d08",
                    },
                },
            },
        },
    },
});
