type MaterialItem = {
    id: string;
    type: MaterialItemType;
    owner: OwnerType;
    location: LocationType;
    description: string;
    defect: DefectTypes;
};

type DefectTypes = "defect" | "useable" | "ok" | "unknown";

type OwnerType = "Hanel" | "ATec" | "DS" | "Musik" | "SHV" | "unknown";

type LocationType =
    | "AULA"
    | "KELLER"
    | "SEKRETARIAT"
    | "SV-RAUM"
    | "SHV"
    | "DS-FUNDUS"
    | "DS-RAUM"
    | "FS-MUSIK";

enum MaterialItemClassification {
    /**
     * Generell Ton
     */
    TON = 1,
    /**
     * Generell Licht
     */
    LICHT = 2,
    /**
     * Generell Video
     */
    VIDEO = 3,
    /**
     * Generell Stage
     */
    STAGE = 4,
    /**
     * Generell Truss und Rigging
     */
    TRUSS = 5,
    /**
     * Generell Sonstiges und Zubehör
     */
    SONSTIGES = 6,
}

type MaterialItemType = {
    manufacturer: string;
    product_name: string;
    classification: MaterialItemClassification[];
    description: string;
    sub_name: string;
    price: number;
    url: string;
};

export {
    LocationType,
    MaterialItem,
    OwnerType,
    MaterialItemType,
    MaterialItemClassification,
    DefectTypes,
};
