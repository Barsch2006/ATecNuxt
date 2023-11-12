import User from "../ATecManager/User/User";
import { Permissions } from "../ATecManager/Permissions/PermissionManager";

interface CheckAuthOptions {
    PermissionLevel?: Permissions;
}

type CheckAuthStatusCode = 200 | 401 | 403 | 500;

type CheckAuthResult =
    | {
          success: false;
          statusCode: CheckAuthStatusCode;
          user?: User;
      }
    | { user: User; success: true; statusCode: CheckAuthStatusCode };

interface Auth {
    authenticated: boolean | false;
    change_password_required?: boolean;
    user?: User;
    checkAuth: (options?: CheckAuthOptions) => Promise<CheckAuthResult>;
}

export default Auth;
export { CheckAuthOptions, CheckAuthResult, CheckAuthStatusCode };
