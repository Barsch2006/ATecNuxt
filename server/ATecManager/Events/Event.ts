import { ObjectId, WithId } from "mongodb";

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

class Event implements WithId<IEvent> {
    _id: ObjectId;
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

    constructor(event: WithId<IEvent>) {
        this._id = event._id;
        this.veranstalter = event.veranstalter;
        this.general = event.general;
        this.technical = event.technical;
        this.notes = event.notes;
        this.status = event.status;
    }
}

export default Event;
export { IEvent, IEquipment };
