import { DbPurchase } from '@sitemanager/shared';
export declare class PurchasesService {
    private normalizePaymentMethod;
    private buildPaymentReference;
    private fetchHopecards;
    createPurchases(buyerAuthId: string, paymentMethod: string, checkoutItems: {
        cardId: string;
        title: string;
        amount: number;
        quantity: number;
    }[]): Promise<{
        purchases: DbPurchase[];
    }>;
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
}
