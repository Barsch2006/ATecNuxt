import { MongoClient, Db } from "mongodb";
import Session from "./Session/Session";

class ATecManager {
    ready: boolean = false;
    private readonly client: MongoClient;
    readonly database: Db;

    private static _instance?: ATecManager;

    static get instance(): ATecManager | undefined {
        return ATecManager._instance;
    }

    private constructor(db: Db, client: MongoClient, cb: (manager: ATecManager) => void) {
        if (ATecManager.instance && ATecManager.instance.ready) {
            console.log(
                "ATecManager instance already exists! Class ATecManager is a singleton!",
            );
        }

        this.database = db;
        this.client = client;

        this.ready = true;

        setInterval(Session.tick, 1000 * 60); // 1 minute

        ATecManager._instance = this;

        cb(this);
    }

    static init(config: {
        prod: boolean;
        DB_URL: string;
        DB_NAME: string;
    }): Promise<ATecManager> {
        return new Promise(async (resolve: (value: ATecManager) => void, reject) => {
            if (ATecManager.instance) return resolve(ATecManager.instance);

            try {
                const client = await MongoClient.connect(config.DB_URL);
                const db = client.db(
                    config.DB_NAME +
                        (config.prod || config.DB_NAME.endsWith("--test") ? "" : "--DEV"),
                );

                if (!db) return;

                new ATecManager(db, client, resolve);
            } catch (err) {
                reject(err);
                return;
            }
        });
    }

    static destroy() {
        ATecManager.instance?.client?.close();
        ATecManager._instance = undefined;
    }
}

export default ATecManager;
