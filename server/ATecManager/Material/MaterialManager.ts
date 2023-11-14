import { Collection } from "mongodb";
import ATecManager from "../ATecManager";
import {
    DefectTypes,
    LocationType,
    MaterialItem,
    MaterialItemClassification,
    MaterialItemType,
    OwnerType,
} from "./MaterialTypes";

class MaterialManager {
    private static _instance?: MaterialManager;
    private itemCollection: Collection<MaterialItem>;
    private typesCollection: Collection<MaterialItemType>;

    static get instance(): MaterialManager | undefined {
        return MaterialManager._instance;
    }

    private constructor(
        coll: Collection<MaterialItem>,
        types: Collection<MaterialItemType>,
    ) {
        if (!MaterialManager._instance) MaterialManager._instance = this;
        this.itemCollection = coll;
        this.typesCollection = types;
    }

    static async init(): Promise<MaterialManager> {
        const manager = ATecManager.instance
            ? ATecManager.instance
            : await ATecManager.init(useRuntimeConfig());
        const coll = manager.database.collection<MaterialItem>("material-items");
        const types = manager.database.collection<MaterialItemType>("material-types");
        return new MaterialManager(coll, types);
    }

    async addMaterialItem(item: MaterialItem): Promise<boolean> {
        const result = await this.itemCollection.insertOne(item);
        return result.acknowledged;
    }

    async addMaterialItemType(type: MaterialItemType): Promise<boolean> {
        const result = await this.typesCollection.insertOne(type);
        return result.acknowledged;
    }

    async getMaterialItemTypes(): Promise<MaterialItemType[]> {
        const result = await this.typesCollection.find().toArray();
        return result;
    }

    async searchMaterialItems(query: {
        manufacturer?: string;
        product_name?: string;
        classification?: MaterialItemClassification;
        location?: LocationType;
        owner?: OwnerType;
        defect?: DefectTypes;
    }): Promise<MaterialItem[]> {
        const result = await this.itemCollection.find(query).toArray();
        return result;
    }
}

export default { MaterialManager };
