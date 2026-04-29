import { ProfileService } from './profile.service';
export declare class ProfileController {
    private readonly profileService;
    constructor(profileService: ProfileService);
    getProfile(authUserId: string, email?: string): Promise<{
        profile: {
            id: string;
            first_name: string;
            last_name: string;
            phone: string;
            address: string;
            barangay: string;
            municipality: string;
            province: string;
            profile_photo_url: string;
            profile_photo_key: string;
            status: string;
            created_at: string;
            total_donations_amount: number;
            total_donations_count: number;
        };
    }>;
    updateProfile(body: any): Promise<{
        success: boolean;
    }>;
    getImpact(authUserId: string): Promise<{
        first_name: string;
        stats: {
            total_donations_amount: number;
            total_donations_count: number;
            lives_touched: number;
        };
        donation_history: {
            id: string;
            campaign_title: string;
            amount_paid: number;
            payment_method: string;
            status: string;
            purchased_at: string;
        }[];
    }>;
}
