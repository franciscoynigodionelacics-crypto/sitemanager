"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@sitemanager/shared");
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(v) {
    return !!v && UUID_RE.test(v);
}
let CartService = class CartService {
    async upsertActiveCart(authUserId) {
        const existing = await (0, shared_1.supabaseRequest)(`carts?auth_user_id=eq.${authUserId}&status=eq.active&limit=1`);
        if (existing.length > 0)
            return existing[0].id;
        const created = await (0, shared_1.supabaseRequest)('carts', {
            method: 'POST',
            headers: { Prefer: 'return=representation' },
            body: JSON.stringify({ auth_user_id: authUserId, status: 'active' }),
        });
        return created[0].id;
    }
    formatCart(cartId, items) {
        const mappedItems = items.map((item) => ({
            id: item.id,
            campaign_id: item.campaign_id,
            title: item.hc_campaigns?.title ?? 'Campaign',
            category: item.hc_campaigns?.category ?? 'other',
            cover_image_url: (0, shared_1.getStorageUrl)('campaigns', item.hc_campaigns?.cover_image_key ?? null),
            face_value: Number(item.face_value),
            quantity: item.quantity,
        }));
        const subtotal = mappedItems.reduce((sum, i) => sum + i.face_value * i.quantity, 0);
        const processing_fee = Math.round(subtotal * 0.015);
        return { cart: { id: cartId, items: mappedItems, subtotal, processing_fee, total: subtotal + processing_fee } };
    }
    async getCart(authUserId) {
        if (!isUuid(authUserId))
            throw new common_1.HttpException('Invalid authUserId', 400);
        const cartId = await this.upsertActiveCart(authUserId);
        const items = await (0, shared_1.supabaseRequest)(`cart_items?cart_id=eq.${cartId}&select=id,cart_id,campaign_id,face_value,quantity,hc_campaigns(title,category,cover_image_key)`);
        return this.formatCart(cartId, items);
    }
    async addItem(authUserId, campaign_id, face_value, quantity) {
        if (!isUuid(authUserId) || !isUuid(campaign_id) || face_value == null) {
            throw new common_1.HttpException('authUserId, campaign_id, face_value required', 400);
        }
        const cartId = await this.upsertActiveCart(authUserId);
        const existing = await (0, shared_1.supabaseRequest)(`cart_items?cart_id=eq.${cartId}&campaign_id=eq.${campaign_id}&limit=1`);
        if (existing.length > 0) {
            await (0, shared_1.supabaseRequest)(`cart_items?id=eq.${existing[0].id}`, {
                method: 'PATCH', headers: { Prefer: 'return=minimal' },
                body: JSON.stringify({ quantity: existing[0].quantity + (quantity ?? 1) }),
            });
        }
        else {
            await (0, shared_1.supabaseRequest)('cart_items', {
                method: 'POST', headers: { Prefer: 'return=minimal' },
                body: JSON.stringify({ cart_id: cartId, campaign_id, face_value, quantity: quantity ?? 1 }),
            });
        }
        const items = await (0, shared_1.supabaseRequest)(`cart_items?cart_id=eq.${cartId}&select=id,cart_id,campaign_id,face_value,quantity,hc_campaigns(title,category,cover_image_key)`);
        return this.formatCart(cartId, items);
    }
    async updateItem(authUserId, cart_item_id, quantity) {
        if (!isUuid(authUserId) || !isUuid(cart_item_id) || quantity === undefined) {
            throw new common_1.HttpException('authUserId, cart_item_id, quantity required', 400);
        }
        const cartId = await this.upsertActiveCart(authUserId);
        if (quantity <= 0) {
            await (0, shared_1.supabaseRequest)(`cart_items?id=eq.${cart_item_id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
        }
        else {
            await (0, shared_1.supabaseRequest)(`cart_items?id=eq.${cart_item_id}`, {
                method: 'PATCH', headers: { Prefer: 'return=minimal' },
                body: JSON.stringify({ quantity }),
            });
        }
        const items = await (0, shared_1.supabaseRequest)(`cart_items?cart_id=eq.${cartId}&select=id,cart_id,campaign_id,face_value,quantity,hc_campaigns(title,category,cover_image_key)`);
        return this.formatCart(cartId, items);
    }
    async removeItem(authUserId, cart_item_id) {
        if (!isUuid(authUserId) || !isUuid(cart_item_id)) {
            throw new common_1.HttpException('authUserId, cart_item_id required', 400);
        }
        const cartId = await this.upsertActiveCart(authUserId);
        await (0, shared_1.supabaseRequest)(`cart_items?id=eq.${cart_item_id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
        const items = await (0, shared_1.supabaseRequest)(`cart_items?cart_id=eq.${cartId}&select=id,cart_id,campaign_id,face_value,quantity,hc_campaigns(title,category,cover_image_key)`);
        return this.formatCart(cartId, items);
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)()
], CartService);
//# sourceMappingURL=cart.service.js.map