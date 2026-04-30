export declare class CampaignsService {
    getCampaigns(category?: string): Promise<{
        campaigns: {
            id: string;
            title: string;
            description: string;
            category: string;
            target_amount: number;
            collected_amount: number;
            progress_pct: number;
            cover_image_url: string;
            status: string;
            end_date: string;
        }[];
    }>;
}
