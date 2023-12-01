import { ObjectId, WithId } from "mongodb";
import ATecManager from "../ATecManager";
import MethodResult, { ErrorTypes } from "../MethodResult";

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
    public static async getEvent(id: ObjectId): Promise<MethodResult<Event>> {
        const atec = ATecManager.instance ?? (await ATecManager.init(useRuntimeConfig()));
        const eventCollection = atec.database.collection<IEvent>("events");
        const result = await eventCollection.findOne({ _id: id });
        if (result) {
            return [new Event(result), null];
        } else {
            return [undefined, ErrorTypes.NOT_FOUND];
        }
    }

    public static async getEvents(): Promise<MethodResult<Event[]>> {
        const atec = ATecManager.instance ?? (await ATecManager.init(useRuntimeConfig()));
        const eventCollection = atec.database.collection<IEvent>("events");
        const result = await eventCollection.find().toArray();
        // sort the result by start date
        result.sort((a, b) => a.general.start - b.general.start);
        if (result) {
            return [result.map((event) => new Event(event)), null];
        } else {
            return [undefined, ErrorTypes.NOT_FOUND];
        }
    }

    public static async createEvent(event: IEvent): Promise<MethodResult<boolean>> {
        const atec = ATecManager.instance ?? (await ATecManager.init(useRuntimeConfig()));
        const eventCollection = atec.database.collection<IEvent>("events");
        const result = await eventCollection.insertOne(event);
        if (result.acknowledged) {
            return [true, null];
        } else {
            return [undefined, ErrorTypes.FAILED];
        }
    }

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
