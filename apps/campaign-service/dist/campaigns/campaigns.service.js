"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@sitemanager/shared");
let CampaignsService = class CampaignsService {
    async getCampaigns(category) {
        let query = 'hc_campaigns?status=eq.active&select=id,title,description,category,target_amount,collected_amount,cover_image_key,status,end_date&order=created_at.desc';
        if (category)
            query += `&category=eq.${encodeURIComponent(category)}`;
        const rows = await (0, shared_1.supabaseRequest)(query);
        const campaigns = rows.map((row) => ({
            id: row.id,
            title: row.title,
            description: row.description ?? '',
            category: row.category ?? 'other',
            target_amount: Number(row.target_amount),
            collected_amount: Number(row.collected_amount),
            progress_pct: row.target_amount > 0
                ? Math.min(100, Math.round((Number(row.collected_amount) / Number(row.target_amount)) * 100))
                : 0,
            cover_image_url: (0, shared_1.getStorageUrl)('campaigns', row.cover_image_key),
            status: row.status,
            end_date: row.end_date,
        }));
        return { campaigns };
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = __decorate([
    (0, common_1.Injectable)()
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map