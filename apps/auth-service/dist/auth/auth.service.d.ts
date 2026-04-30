export declare class AuthService {
    private getClients;
    login(email: string, password: string): Promise<{
        success: boolean;
        user: import("@supabase/supabase-js").AuthUser;
        isLegacyUser: boolean;
        role: any;
        session?: undefined;
    } | {
        success: boolean;
        user: import("@supabase/supabase-js").AuthUser;
        session: import("@supabase/supabase-js").AuthSession;
        isLegacyUser?: undefined;
        role?: undefined;
    }>;
    signup(body: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        barangay?: string;
        municipality?: string;
        province?: string;
        validIdUrl?: string;
        origin?: string;
    }): Promise<{
        success: boolean;
        user: import("@supabase/supabase-js").AuthUser;
        profileCreated: boolean;
        error: string;
        warning: string;
        message?: undefined;
    } | {
        success: boolean;
        user: import("@supabase/supabase-js").AuthUser;
        profileCreated: boolean;
        message: string;
        error?: undefined;
        warning?: undefined;
    }>;
    sendOtp(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyOtp(email: string, token: string, type?: string): Promise<{
        success: boolean;
        message: string;
        session: import("@supabase/supabase-js").AuthSession;
        user: import("@supabase/supabase-js").AuthUser;
    }>;
    generateOtp(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyNumericOtp(email: string, code: string): Promise<{
        success: boolean;
        message: string;
        sessionToken: string;
        email: string;
    }>;
    checkEmail(email: string): Promise<{
        success: boolean;
        exists: boolean;
    }>;
    resetPasswordWithOtp(email: string, password: string, sessionToken: string): Promise<{
        success: boolean;
        message: string;
    }>;
    updatePassword(password: string, accessToken: string): Promise<{
        success: boolean;
        message: string;
        user: import("@supabase/supabase-js").AuthUser;
    }>;
    uploadId(file: Express.Multer.File, userId: string): Promise<{
        success: boolean;
        path: string;
        url: string;
        message: string;
    }>;
}
