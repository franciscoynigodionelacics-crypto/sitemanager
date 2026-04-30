export declare class CartService {
    private upsertActiveCart;
    private formatCart;
    getCart(authUserId: string): Promise<{
        cart: {
            id: string;
            items: {
                id: string;
                campaign_id: string;
                title: string;
                category: string;
                cover_image_url: string;
                face_value: number;
                quantity: number;
            }[];
            subtotal: number;
            processing_fee: number;
            total: number;
        };
    }>;
    addItem(authUserId: string, campaign_id: string, face_value: number, quantity: number): Promise<{
        cart: {
            id: string;
            items: {
                id: string;
                campaign_id: string;
                title: string;
                category: string;
                cover_image_url: string;
                face_value: number;
                quantity: number;
            }[];
            subtotal: number;
            processing_fee: number;
            total: number;
        };
    }>;
    updateItem(authUserId: string, cart_item_id: string, quantity: number): Promise<{
        cart: {
            id: string;
            items: {
                id: string;
                campaign_id: string;
                title: string;
                category: string;
                cover_image_url: string;
                face_value: number;
                quantity: number;
            }[];
            subtotal: number;
            processing_fee: number;
            total: number;
        };
    }>;
    removeItem(authUserId: string, cart_item_id: string): Promise<{
        cart: {
            id: string;
            items: {
                id: string;
                campaign_id: string;
                title: string;
                category: string;
                cover_image_url: string;
                face_value: number;
                quantity: number;
            }[];
            subtotal: number;
            processing_fee: number;
            total: number;
        };
    }>;
}
