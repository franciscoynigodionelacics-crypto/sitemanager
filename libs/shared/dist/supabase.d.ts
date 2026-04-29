type SupabaseRecord = Record<string, unknown>;
export declare function getSupabaseConfig(): {
    url: string;
    key: string;
};
export declare function supabaseRequest<T>(path: string, init?: RequestInit): Promise<T>;
export declare function getRecordId(record: SupabaseRecord): string | null;
export declare function getRecordTitle(record: SupabaseRecord): string | null;
export declare function findHopecardRecordByTitle(records: SupabaseRecord[], title: string): SupabaseRecord | null;
export {};
