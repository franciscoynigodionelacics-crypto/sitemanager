import { CartService } from './cart.service';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
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
    addItem(body: {
        authUserId: string;
        campaign_id: string;
        face_value: number;
        quantity: number;
    }): Promise<{
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
    updateItem(body: {
        authUserId: string;
        cart_item_id: string;
        quantity: number;
    }): Promise<{
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
    removeItem(body: {
        authUserId: string;
        cart_item_id: string;
    }): Promise<{
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
