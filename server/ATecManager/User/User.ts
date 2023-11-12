import ATecManager from "../ATecManager";
import { Collection, ObjectId, WithId } from "mongodb";
import MethodResult, { ErrorTypes } from "../MethodResult";
import PermissionManager, { Permissions } from "../Permissions/PermissionManager";
import { compare, hash } from "bcrypt";
import CreateUserOptions from "./CreateUserOptions";

interface IUser {
    fullName: string;
    username: string;
    password: string;
    email: string;
    permissions: number;
    changePasswordRequired: boolean;
    organization?: "atec" | "ds" | "music" | "sl" | "extern";
}

class User implements WithId<IUser> {
    static async getUserById(id: ObjectId): Promise<MethodResult<User>> {
        const atec = ATecManager.instance ?? (await ATecManager.init(useRuntimeConfig()));
        const userCollection = atec.database.collection<IUser>("users");
        const user = await userCollection.findOne({ _id: id });
        if (!user) {
            return [undefined, ErrorTypes.NOT_FOUND];
        }
        return [new User(userCollection, user), null];
    }

    static async getUserByUsername(username: string): Promise<MethodResult<User>> {
        const atec = ATecManager.instance ?? (await ATecManager.init(useRuntimeConfig()));
        const userCollection = atec.database.collection<IUser>("users");
        const user = await userCollection.findOne({ username: username });
        if (!user) {
            return [undefined, ErrorTypes.NOT_FOUND];
        }
        return [new User(userCollection, user), null];
    }

    static async searchUsersByName(
        query: string,
        limit = 0,
        skip = 0,
    ): Promise<MethodResult<User[]>> {
        const atec = ATecManager.instance ?? (await ATecManager.init(useRuntimeConfig()));
        const userCollection = atec.database.collection<IUser>("users");
        const users = await userCollection
            .find({ fullName: { $regex: query, $options: "i" } })
            .skip(skip)
            .limit(limit)
            .toArray();
        return [users.map((user) => new User(userCollection, user)), null];
    }

    static async listUsers(options: {
        limit?: number;
        skip?: number;
    }): Promise<MethodResult<User[]>> {
        const atec = ATecManager.instance ?? (await ATecManager.init(useRuntimeConfig()));
        const userCollection = atec.database.collection<IUser>("users");
        const users = await userCollection.find({}, { ...options }).toArray();
        return [users.map((user) => new User(userCollection, user)), null];
    }

    static async createUser(
        options: CreateUserOptions,
    ): Promise<MethodResult<{ id: ObjectId; username: string; password: string }>> {
        const atec = ATecManager.instance ?? (await ATecManager.init(useRuntimeConfig()));
        const userCollection = atec.database.collection<IUser>("users");

        const password = this.generatePassword();
        const passwordHash = await hash(password, 12);

        const user: IUser = {
            fullName: options.fullName,
            username: options.username,
            password: passwordHash,
            email: options.email,
            permissions: options.permissions ?? 0,
            changePasswordRequired: options.changePasswordRequired ?? true,
            organization: options.organization,
        };

        // check if user with same username exists
        const existingUser = await userCollection.findOne({ username: options.username });
        if (existingUser) {
            return [undefined, ErrorTypes.ALREADY_EXISTS];
        }

        const result = await userCollection.insertOne(user);

        if (!result.acknowledged) {
            return [undefined, ErrorTypes.FAILED];
        }

        return [{ id: result.insertedId, username: options.username, password }, null];
    }

    public static generatePassword(): string {
        const chars =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,;:!?@#$%^&*()_+-=";
        let password = "";
        for (let i = 0; i < 12; i++) {
            password += chars[Math.floor(Math.random() * chars.length)];
        }
        return password;
    }

    _id: ObjectId;
    fullName: string;
    username: string;
    password: string;
    mfa_secret?: string;
    mfa_setup_secret?: string;
    permissions: number;
    email: string;
    changePasswordRequired: boolean;
    _permissionManager: PermissionManager;
    userCollection: Collection<IUser>;
    organization?: "atec" | "ds" | "music" | "sl" | "extern";

    private constructor(collection: Collection<IUser>, user: WithId<IUser>) {
        this._id = user._id;
        this.fullName = user.fullName;
        this.password = user.password;
        this.username = user.username;
        this.permissions = user.permissions;
        this.changePasswordRequired = user.changePasswordRequired;
        this._permissionManager = new PermissionManager(this.permissions);
        this.userCollection = collection;
        this.organization = user.organization;
        this.email = user.email;
    }

    async delete() {
        try {
            const deleteResult = await this.userCollection.deleteOne({ _id: this._id });
            return [deleteResult.deletedCount === 1, null];
        } catch {
            return [undefined, ErrorTypes.DATABASE_ERROR];
        }
    }

    /**
     * check if the user has a permission
     * @param perm Permission
     */
    hasPermission(perm: Permissions | number): boolean {
        return this._permissionManager.has(perm);
    }

    /**
     * give the user a permission
     * @param perm Permission
     */
    async allowPermission(perm: Permissions | number): Promise<MethodResult<boolean>> {
        this._permissionManager.allow(perm);
        this.permissions = this._permissionManager.permissions;
        try {
            const updateResult = await this.userCollection.findOneAndUpdate(
                { _id: this._id },
                { $set: { permissions: this.permissions } },
            );
            return [updateResult.ok === 1, null];
        } catch {
            return [undefined, ErrorTypes.DATABASE_ERROR];
        }
    }

    /**
     * deny the user a permission
     * @param perm Permission
     */
    async denyPermission(perm: Permissions | number): Promise<MethodResult<boolean>> {
        this._permissionManager.deny(perm);
        this.permissions = this._permissionManager.permissions;
        try {
            const updateResult = await this.userCollection.findOneAndUpdate(
                { _id: this._id },
                { $set: { permissions: this.permissions } },
            );
            return [updateResult.ok === 1, null];
        } catch {
            return [undefined, ErrorTypes.DATABASE_ERROR];
        }
    }

    async setPasswordChangeRequired(required: boolean): Promise<MethodResult<boolean>> {
        this.changePasswordRequired = required;
        try {
            const updateResult = await this.userCollection.findOneAndUpdate(
                { _id: this._id },
                { $set: { changePasswordRequired: this.changePasswordRequired } },
            );
            return [updateResult.ok === 1, null];
        } catch {
            return [undefined, ErrorTypes.DATABASE_ERROR];
        }
    }

    /**
     * set the user's password
     * @param password string
     */
    async setPassword(password: string): Promise<MethodResult<boolean>> {
        // check some password requirements
        if (password.length < 10) {
            return [undefined, ErrorTypes.INVALID_ARGUMENT];
        }
        if (!/[a-z]/.test(password)) {
            return [undefined, ErrorTypes.INVALID_ARGUMENT];
        }
        if (!/[A-Z]/.test(password)) {
            return [undefined, ErrorTypes.INVALID_ARGUMENT];
        }
        if (!/[0-9]/.test(password)) {
            return [undefined, ErrorTypes.INVALID_ARGUMENT];
        }

        let passwordHash: string;
        try {
            passwordHash = await hash(password, 12);
        } catch {
            return [undefined, ErrorTypes.FAILED];
        }
        this.password = passwordHash;
        try {
            const dbResult = await this.userCollection.findOneAndUpdate(
                {
                    _id: this._id,
                },
                { $set: { password: this.password } },
            );
            if (dbResult.ok === 1) {
                return [true, null];
            } else {
                return [false, null];
            }
        } catch {
            return [undefined, ErrorTypes.DATABASE_ERROR];
        }
    }

    /**
     * Compare a password with the user's password
     * @param password string
     */
    async comparePassword(password: string): Promise<MethodResult<boolean>> {
        try {
            const hashResult = await compare(password, this.password);
            return [hashResult, null];
        } catch {
            return [undefined, ErrorTypes.FAILED];
        }
    }
}

export default User;
export { IUser };
