import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        success: boolean;
        user: import("@supabase/auth-js").User;
        isLegacyUser: boolean;
        role: any;
        session?: undefined;
    } | {
        success: boolean;
        user: import("@supabase/auth-js").User;
        session: import("@supabase/auth-js").Session;
        isLegacyUser?: undefined;
        role?: undefined;
    }>;
    signup(body: any, req: any): Promise<{
        success: boolean;
        user: import("@supabase/auth-js").User;
        profileCreated: boolean;
        error: string;
        warning: string;
        message?: undefined;
    } | {
        success: boolean;
        user: import("@supabase/auth-js").User;
        profileCreated: boolean;
        message: string;
        error?: undefined;
        warning?: undefined;
    }>;
    sendOtp(body: {
        email: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyOtp(body: {
        email: string;
        token: string;
        type?: string;
    }): Promise<{
        success: boolean;
        message: string;
        session: import("@supabase/auth-js").Session;
        user: import("@supabase/auth-js").User;
    }>;
    generateOtp(body: {
        email: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyNumericOtp(body: {
        email: string;
        code: string;
    }): Promise<{
        success: boolean;
        message: string;
        sessionToken: string;
        email: string;
    }>;
    checkEmail(body: {
        email: string;
    }): Promise<{
        success: boolean;
        exists: boolean;
    }>;
    resetPasswordWithOtp(body: {
        email: string;
        password: string;
        sessionToken: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    updatePassword(body: {
        password: string;
        accessToken: string;
    }): Promise<{
        success: boolean;
        message: string;
        user: import("@supabase/auth-js").User;
    }>;
    uploadId(file: Express.Multer.File, userId: string): Promise<{
        success: boolean;
        path: string;
        url: string;
        message: string;
    }>;
}
