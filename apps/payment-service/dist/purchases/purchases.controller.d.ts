import { PurchasesService } from './purchases.service';
export declare class PurchasesController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
    getPurchases(buyerAuthId: string): Promise<{
        transactions: {
            id: string;
            title: string;
            amount: number;
            method: string;
            status: string;
            paymentReference: string;
            purchasedAt: string;
        }[];
    }>;
    createPurchases(body: {
        buyerAuthId: string;
        paymentMethod: string;
        checkoutItems: any[];
    }): Promise<{
        purchases: import("@sitemanager/shared").DbPurchase[];
    }>;
}
