"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@sitemanager/shared");
const PAYMENT_METHOD_MAP = { gcash: 'gcash', paymaya: 'maya', 'credit card': 'card' };
let PurchasesService = class PurchasesService {
    normalizePaymentMethod(method) {
        return PAYMENT_METHOD_MAP[method.trim().toLowerCase()] ?? method.trim().toLowerCase();
    }
    buildPaymentReference(method, index) {
        const prefix = method.slice(0, 3).toUpperCase();
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const suffix = crypto.randomUUID().slice(0, 8).toUpperCase();
        return `${prefix}-HC-${datePart}-${index + 1}-${suffix}`;
    }
    async fetchHopecards() {
        const results = await Promise.allSettled([
            (0, shared_1.supabaseRequest)('hc_campaigns?select=*'),
            (0, shared_1.supabaseRequest)('hopecards?select=*'),
        ]);
        const records = [];
        results.forEach((r) => { if (r.status === 'fulfilled')
            records.push(...r.value); });
        if (records.length === 0)
            throw new Error('No campaign source rows found in hc_campaigns or hopecards.');
        return records;
    }
    async createPurchases(buyerAuthId, paymentMethod, checkoutItems) {
        if (!buyerAuthId)
            throw new common_1.HttpException('buyerAuthId is required.', 400);
        if (!paymentMethod)
            throw new common_1.HttpException('paymentMethod is required.', 400);
        if (!checkoutItems?.length)
            throw new common_1.HttpException('At least one checkout item is required.', 400);
        const method = this.normalizePaymentMethod(paymentMethod);
        const hopecards = await this.fetchHopecards();
        const purchasesToInsert = checkoutItems.map((item, index) => {
            const hopecard = (0, shared_1.findHopecardRecordByTitle)(hopecards, item.title);
            const hopecardId = hopecard ? (0, shared_1.getRecordId)(hopecard) : null;
            if (!hopecardId)
                throw new Error(`No campaign row matched "${item.title}".`);
            return {
                buyer_auth_id: buyerAuthId,
                hopecard_id: hopecardId,
                amount_paid: item.amount * item.quantity,
                payment_method: method,
                payment_reference: this.buildPaymentReference(method, index),
                status: 'paid',
                purchased_at: new Date().toISOString(),
            };
        });
        const inserted = await (0, shared_1.supabaseRequest)('hopecard_purchases', {
            method: 'POST',
            headers: { Prefer: 'return=representation' },
            body: JSON.stringify(purchasesToInsert),
        });
        return { purchases: inserted };
    }
    async getPurchases(buyerAuthId) {
        if (!buyerAuthId)
            throw new common_1.HttpException('buyerAuthId is required.', 400);
        const purchases = await (0, shared_1.supabaseRequest)(`hopecard_purchases?select=*&buyer_auth_id=eq.${encodeURIComponent(buyerAuthId)}&order=purchased_at.desc`);
        const hopecards = await this.fetchHopecards();
        const titleById = new Map();
        hopecards.forEach((r) => {
            const id = (0, shared_1.getRecordId)(r);
            const title = (0, shared_1.getRecordTitle)(r);
            if (id && title)
                titleById.set(id, title);
        });
        const transactions = purchases.map((p) => ({
            id: p.id,
            title: titleById.get(p.hopecard_id) ?? p.hopecard_id,
            amount: p.amount_paid,
            method: p.payment_method,
            status: p.status,
            paymentReference: p.payment_reference,
            purchasedAt: p.purchased_at,
        }));
        return { transactions };
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = __decorate([
    (0, common_1.Injectable)()
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map