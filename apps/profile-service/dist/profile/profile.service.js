"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@sitemanager/shared");
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let ProfileService = class ProfileService {
    async getProfile(authUserId, email) {
        if (!authUserId || !UUID_RE.test(authUserId))
            throw new common_1.HttpException('Invalid authUserId', 400);
        let rows = await (0, shared_1.supabaseRequest)(`digital_donor_profiles?auth_user_id=eq.${authUserId}&select=id,first_name,last_name,phone,address,barangay,municipality,province,profile_photo_key,status,created_at,total_donations_amount,total_donations_count&limit=1`);
        if (rows.length === 0 && email) {
            rows = await (0, shared_1.supabaseRequest)(`digital_donor_profiles?email=eq.${encodeURIComponent(email)}&select=id,first_name,last_name,phone,address,barangay,municipality,province,profile_photo_key,status,created_at,total_donations_amount,total_donations_count&limit=1`);
        }
        if (rows.length === 0)
            throw new common_1.HttpException('Profile not found', 404);
        const row = rows[0];
        return {
            profile: {
                id: row.id, first_name: row.first_name, last_name: row.last_name,
                phone: row.phone || '', address: row.address || '',
                barangay: row.barangay || '', municipality: row.municipality || '', province: row.province || '',
                profile_photo_url: (0, shared_1.getStorageUrl)('profile-photos', row.profile_photo_key),
                profile_photo_key: row.profile_photo_key || '',
                status: row.status, created_at: row.created_at,
                total_donations_amount: row.total_donations_amount || 0,
                total_donations_count: row.total_donations_count || 0,
            },
        };
    }
    async updateProfile(authUserId, updates) {
        if (!authUserId || !UUID_RE.test(authUserId))
            throw new common_1.HttpException('Invalid authUserId', 400);
        const patch = { updated_at: new Date().toISOString() };
        const fields = ['first_name', 'last_name', 'phone', 'address', 'barangay', 'municipality', 'province', 'profile_photo_key'];
        fields.forEach((f) => { if (updates[f] !== undefined)
            patch[f] = updates[f]; });
        await (0, shared_1.supabaseRequest)(`digital_donor_profiles?auth_user_id=eq.${authUserId}`, {
            method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(patch),
        });
        return { success: true };
    }
    async getImpact(authUserId) {
        if (!authUserId || !UUID_RE.test(authUserId))
            throw new common_1.HttpException('Invalid authUserId', 400);
        const [profiles, purchases] = await Promise.all([
            (0, shared_1.supabaseRequest)(`digital_donor_profiles?auth_user_id=eq.${authUserId}&select=total_donations_amount,total_donations_count,first_name&limit=1`),
            (0, shared_1.supabaseRequest)(`hopecard_purchases?buyer_auth_id=eq.${authUserId}&select=id,amount_paid,payment_method,status,purchased_at,hopecards(hc_campaigns(title))&order=purchased_at.desc&limit=20`),
        ]);
        const profile = profiles[0] ?? { total_donations_amount: 0, total_donations_count: 0, first_name: 'Donor' };
        const totalAmount = Number(profile.total_donations_amount);
        const donationHistory = purchases.map((p) => ({
            id: p.id,
            campaign_title: p.hopecards?.hc_campaigns?.title ?? 'Donation',
            amount_paid: Number(p.amount_paid),
            payment_method: p.payment_method,
            status: p.status,
            purchased_at: p.purchased_at,
        }));
        return {
            first_name: profile.first_name,
            stats: {
                total_donations_amount: totalAmount,
                total_donations_count: Number(profile.total_donations_count),
                lives_touched: Math.floor(totalAmount / 500),
            },
            donation_history: donationHistory,
        };
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = __decorate([
    (0, common_1.Injectable)()
], ProfileService);
//# sourceMappingURL=profile.service.js.map