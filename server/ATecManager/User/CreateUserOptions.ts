interface CreateUserOptions {
    fullName: string;
    username: string;
    permissions?: number;
    organization?: "atec" | "ds" | "music" | "sl" | "extern";
    changePasswordRequired?: boolean;
    email: string;
}

export default CreateUserOptions;
