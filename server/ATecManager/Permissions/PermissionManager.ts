enum Permissions {
    GLOBAL_LOGIN = 1 << 0,
    MANAGE_USERS = 1 << 1,
    CHANGE_PWD = 1 << 2,
    VIEW_CONTACTS = 1 << 3,
    MANAGE_EVENTS = 1 << 4,
}

class PermissionManager {
    private _permission: number;

    /**
     * The Permission manager
     * @param permission The permissions the user this manager is for has
     */
    constructor(permission: number | Permissions = 0) {
        this._permission = permission;
    }

    /**
     * Allows a user a permission and adds it to the permission manager
     * @param permission
     */
    allow(permission: Permissions | number) {
        this._permission |= permission;
    }
    /**
     * Denys a user a permission and removes it from the permission manager
     * @param permission
     */
    deny(permission: Permissions | number) {
        this._permission &= ~permission;
    }
    /**
     * Checks if a user has a permision
     * @param permission
     * @returns Whether the user has or has not the specified permission
     */
    has(permission: Permissions | number): boolean {
        return (this._permission & permission) === permission;
    }

    get permissions(): number {
        return this._permission;
    }
}

export default PermissionManager;
export { Permissions };
