"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupabaseConfig = getSupabaseConfig;
exports.supabaseRequest = supabaseRequest;
exports.getRecordId = getRecordId;
exports.getRecordTitle = getRecordTitle;
exports.findHopecardRecordByTitle = findHopecardRecordByTitle;
const HOPECARD_TITLE_KEYS = ['title', 'name', 'campaign_title', 'campaign_name', 'label'];
const HOPECARD_ID_KEYS = ['id', 'hopecard_id'];
function getEnv(name) {
    const value = process.env[name];
    return value && value.trim().length > 0 ? value : undefined;
}
function getSupabaseConfig() {
    const url = getEnv('SUPABASE_URL') ?? getEnv('NEXT_PUBLIC_SUPABASE_URL');
    const key = getEnv('SUPABASE_SERVICE_ROLE_KEY') ??
        getEnv('SUPABASE_ANON_KEY') ??
        getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    if (!url || !key) {
        throw new Error('Missing Supabase environment variables. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    }
    return { url, key };
}
async function supabaseRequest(path, init) {
    const { url, key } = getSupabaseConfig();
    const response = await fetch(`${url}/rest/v1/${path}`, {
        ...init,
        headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            ...(init?.headers ?? {}),
        },
        cache: 'no-store',
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Supabase request failed with status ${response.status}.`);
    }
    if (response.status === 204) {
        return undefined;
    }
    return response.json();
}
function normalizeValue(value) {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
}
function normalizeLoose(value) {
    return normalizeValue(value).replace(/[^a-z0-9]+/g, '');
}
function getRecordId(record) {
    for (const key of HOPECARD_ID_KEYS) {
        const value = record[key];
        if (typeof value === 'string' && value.length > 0)
            return value;
    }
    return null;
}
function getRecordTitle(record) {
    for (const key of HOPECARD_TITLE_KEYS) {
        const value = record[key];
        if (typeof value === 'string' && value.length > 0)
            return value;
    }
    return null;
}
function findHopecardRecordByTitle(records, title) {
    const normalizedTitle = normalizeValue(title);
    const normalizedLooseTitle = normalizeLoose(title);
    return (records.find((r) => normalizeValue(getRecordTitle(r)) === normalizedTitle) ??
        records.find((r) => normalizeLoose(getRecordTitle(r)) === normalizedLooseTitle) ??
        records.find((r) => normalizeLoose(getRecordTitle(r)).includes(normalizedLooseTitle)) ??
        records.find((r) => normalizedLooseTitle.includes(normalizeLoose(getRecordTitle(r)))) ??
        null);
}
