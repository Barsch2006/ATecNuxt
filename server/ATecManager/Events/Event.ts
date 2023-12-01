import { ObjectId } from "mongodb";

interface IEquipment {
    type: string;
    amount: number;
    notes?: string;
}

interface IEvent {
    veranstalter: {
        userid: ObjectId;
        fullName: string;
        email: string;
    };
    general: {
        title: string;
        description: string;
        start: number; // start datetime in unix timestamp
        end: number; // end datetime in unix timestamp
        location: string | string[];
        fileurls: string[];
    };
    technical: {
        equipment: IEquipment[];
        equipmentNotes?: string;
        planungsurl: string;
    };
    notes?: string;
    status?: {
        technicians?: {
            userid: ObjectId;
            name: string;
            email: string;
        }[];
        technicianNotes?: string[];
    };
}

export { IEvent, IEquipment };
