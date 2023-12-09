import { ObjectId, WithId } from "mongodb";
import ATecManager from "../ATecManager";
import MethodResult, { ErrorTypes } from "../MethodResult";
import User from "../User/User";

interface IEquipment {
    type: string;
    amount: number;
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
        equipmentNote?: string;
        planungsurl: string;
    };
    notes?: string;
    status: {
        technicians: {
            userid: ObjectId;
            name: string;
            email: string;
        }[];
        technicianNotes: string[];
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
        equipmentNote?: string;
        planungsurl: string;
    };
    notes?: string;
    status: {
        technicians: {
            userid: ObjectId;
            name: string;
            email: string;
        }[];
        technicianNotes: string[];
    };

    constructor(event: WithId<IEvent>) {
        this._id = event._id;
        this.veranstalter = event.veranstalter;
        this.general = event.general;
        this.technical = event.technical;
        this.notes = event.notes;
        this.status = event.status;
    }

    async addTechnician(user: User): Promise<MethodResult<boolean>> {
        if (this.status.technicians.find((tech) => tech.userid.equals(user._id))) {
            return [undefined, ErrorTypes.ALREADY_EXISTS];
        } else {
            this.status.technicians.push({
                userid: user._id,
                name: user.fullName,
                email: user.email,
            });
            // update the event in the database
            const atec =
                ATecManager.instance ?? (await ATecManager.init(useRuntimeConfig()));
            const eventCollection = atec.database.collection<IEvent>("events");
            const result = await eventCollection.updateOne(
                { _id: this._id },
                { $push: { technicians: { userid: user._id } } },
            );
            return [result.acknowledged, null];
        }
    }

    async removeTechnician(user: User): Promise<MethodResult<boolean>> {
        const index = this.status.technicians.findIndex((tech) =>
            tech.userid.equals(user._id),
        );
        if (index === -1) {
            return [undefined, ErrorTypes.NOT_FOUND];
        } else {
            this.status.technicians.splice(index, 1);
            // update the event in the database
            const atec =
                ATecManager.instance ?? (await ATecManager.init(useRuntimeConfig()));
            const eventCollection = atec.database.collection<IEvent>("events");
            const result = await eventCollection.updateOne(
                { _id: this._id },
                { $pull: { technicians: { userid: user._id } } },
            );
            return [result.acknowledged, null];
        }
    }

    async addTechnicianNote(user: User, note: string): Promise<MethodResult<boolean>> {
        const index = this.status.technicians.findIndex((tech) =>
            tech.userid.equals(user._id),
        );
        if (index === -1) {
            return [undefined, ErrorTypes.NOT_FOUND];
        } else {
            this.status.technicianNotes[index] = note;
            // update the event in the database
            const atec =
                ATecManager.instance ?? (await ATecManager.init(useRuntimeConfig()));
            const eventCollection = atec.database.collection<IEvent>("events");
            const result = await eventCollection.updateOne(
                { _id: this._id },
                { $set: { [`technicianNotes.${index}`]: note } },
            );
            return [result.acknowledged, null];
        }
    }

    async addEquipment(equipment: IEquipment): Promise<MethodResult<boolean>> {
        this.technical.equipment.push(equipment);
        // update the event in the database
        const atec = ATecManager.instance ?? (await ATecManager.init(useRuntimeConfig()));
        const eventCollection = atec.database.collection<IEvent>("events");
        const result = await eventCollection.updateOne(
            { _id: this._id },
            { $push: { equipment: equipment } },
        );
        return [result.acknowledged, null];
    }

    async removeEquipment(index: number): Promise<MethodResult<boolean>> {
        if (index >= this.technical.equipment.length) {
            return [undefined, ErrorTypes.NOT_FOUND];
        } else {
            this.technical.equipment.splice(index, 1);
            // update the event in the database
            const atec =
                ATecManager.instance ?? (await ATecManager.init(useRuntimeConfig()));
            const eventCollection = atec.database.collection<IEvent>("events");
            const result = await eventCollection.updateOne(
                { _id: this._id },
                { $pull: { equipment: { index: index } } },
            );
            return [result.acknowledged, null];
        }
    }

    async updateGeneralInfo(general: IEvent["general"]): Promise<MethodResult<boolean>> {
        this.general = general;
        // update the event in the database
        const atec = ATecManager.instance ?? (await ATecManager.init(useRuntimeConfig()));
        const eventCollection = atec.database.collection<IEvent>("events");
        const result = await eventCollection.updateOne(
            { _id: this._id },
            { $set: { general: general } },
        );
        return [result.acknowledged, null];
    }
}

export default Event;
export { IEvent, IEquipment };
