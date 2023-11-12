import { ObjectId, WithId } from "mongodb";
import MethodResult, { ErrorTypes } from "../MethodResult";
import ATecManager from "../ATecManager";

interface IContact {
    fullName: string;
    email: string;
    subject: string;
    content: string;
    createdAt: number;
    status: "pending" | "replied";
}

type IContactCreate = Omit<Omit<IContact, "createdAt">, "status">;

class Contact implements IContact {
    static async createContact(contact: IContactCreate): Promise<MethodResult<boolean>> {
        const atec = ATecManager.instance ?? (await ATecManager.init(useRuntimeConfig()));
        const contactCollection = atec.database.collection<IContact>("contacts");
        const insertContact: IContact = {
            ...contact,
            createdAt: Date.now(),
            status: "pending",
        };
        const result = await contactCollection.insertOne(insertContact);
        return result.acknowledged ? [true, null] : [undefined, ErrorTypes.FAILED];
    }

    static async getContacts(): Promise<MethodResult<Contact[]>> {
        const atec = ATecManager.instance ?? (await ATecManager.init(useRuntimeConfig()));
        const contactCollection = atec.database.collection<IContact>("contacts");
        const contacts = await contactCollection.find().toArray();
        const contactArray = [contacts.map((contact) => new Contact(contact)), null];
        if (!contactArray[0]) {
            return [undefined, ErrorTypes.FAILED];
        }
        return [contactArray[0], null];
    }

    static async getContact(id: ObjectId): Promise<MethodResult<Contact>> {
        const atec = ATecManager.instance ?? (await ATecManager.init(useRuntimeConfig()));
        const contactCollection = atec.database.collection<IContact>("contacts");
        const contact = await contactCollection.findOne({ _id: id });
        return contact ? [new Contact(contact), null] : [undefined, ErrorTypes.FAILED];
    }

    _id: ObjectId;
    fullName: string;
    email: string;
    subject: string;
    content: string;
    createdAt: number;
    status: "pending" | "replied";

    private constructor(contact: WithId<IContact>) {
        this._id = contact._id;
        this.fullName = contact.fullName;
        this.email = contact.email;
        this.subject = contact.subject;
        this.content = contact.content;
        this.createdAt = contact.createdAt;
        this.status = contact.status;
    }

    async setStatus(status: "pending" | "replied"): Promise<MethodResult<boolean>> {
        const atec = ATecManager.instance ?? (await ATecManager.init(useRuntimeConfig()));
        const contactCollection = atec.database.collection<IContact>("contacts");
        return contactCollection
            .updateOne({ _id: this._id }, { $set: { status } })
            .then((result) => {
                return result.acknowledged
                    ? [true, null]
                    : [undefined, ErrorTypes.FAILED];
            });
    }
}

export default Contact;
export { IContact };
