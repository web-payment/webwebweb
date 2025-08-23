import { promises as fs } from 'fs';
import path from 'path';

// --- Fungsi Helper ---
async function readJsonFile(filePath) {
    const data = await fs.readFile(path.join(process.cwd(), filePath), 'utf-8');
    return JSON.parse(data);
}
async function writeJsonFile(filePath, content) {
    await fs.writeFile(path.join(process.cwd(), filePath), JSON.stringify(content, null, 4));
}
// --------------------

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Metode tidak diizinkan.' });
    }

    const { action, data, adminPassword } = request.body;
    if (!action) return response.status(400).json({ message: 'Aksi tidak ditemukan.' });

    // --- Daftar Aksi Khusus Admin ---
    const adminActions = [
        'getApiKeys', 'createApiKey', 'deleteApiKey',
        'getRootDomainsAdmin', 'addRootDomain', 'deleteRootDomain'
    ];

    try {
        // --- Validasi Password untuk Aksi Admin ---
        if (adminActions.includes(action)) {
            if (adminPassword !== process.env.ADMIN_PASSWORD) {
                return response.status(403).json({ message: 'Password admin salah.' });
            }
        }

        const apiKeys = await readJsonFile('apikeys.json');

        // --- Aksi Publik (dengan validasi API Key Pengguna) ---
        if (action === 'validateApiKey') {
            const keyData = apiKeys[data.apikey];
            if (!keyData || (keyData.expires_at !== 'permanent' && new Date() > new Date(keyData.expires_at))) {
                throw new Error('API Key tidak valid atau sudah kadaluwarsa.');
            }
            return response.status(200).json({ message: 'API Key valid.' });
        }
        
        // --- Aksi yang memerlukan API Key pengguna yang valid ---
        const userActions = ['getRootDomains', 'createSubdomain'];
        if(userActions.includes(action)){
            const userApiKey = data.apikey;
            const keyData = apiKeys[userApiKey];
            if (!userApiKey || !keyData || (keyData.expires_at !== 'permanent' && new Date() > new Date(keyData.expires_at))) {
                return response.status(403).json({ message: 'Akses ditolak: API Key tidak valid.' });
            }
        }

        const domains = await readJsonFile('domains.json');

        switch (action) {
            // == AKSI UNTUK PENGGUNA ==
            case 'getRootDomains': {
                return response.status(200).json({ domains: Object.keys(domains) });
            }
            case 'createSubdomain': {
                // ... (Logika ini tetap sama seperti sebelumnya) ...
            }

            // == AKSI UNTUK ADMIN ==
            case 'getApiKeys': {
                return response.status(200).json(apiKeys);
            }
            case 'createApiKey': {
                const { key, duration, unit, isPermanent } = data;
                if (apiKeys[key]) throw new Error('API Key ini sudah ada.');
                
                let expires_at = 'permanent';
                if (!isPermanent) {
                    const now = new Date();
                    if (unit === 'days') now.setDate(now.getDate() + duration);
                    if (unit === 'weeks') now.setDate(now.getDate() + (duration * 7));
                    if (unit === 'months') now.setMonth(now.getMonth() + duration);
                    if (unit === 'years') now.setFullYear(now.getFullYear() + duration);
                    expires_at = now.toISOString();
                }
                apiKeys[key] = { created_at: new Date().toISOString(), expires_at };
                await writeJsonFile('apikeys.json', apiKeys);
                return response.status(200).json({ message: 'API Key berhasil dibuat.' });
            }
            case 'deleteApiKey': {
                const { key } = data;
                if (!apiKeys[key]) throw new Error('API Key tidak ditemukan.');
                delete apiKeys[key];
                await writeJsonFile('apikeys.json', apiKeys);
                return response.status(200).json({ message: 'API Key berhasil dihapus.' });
            }
            case 'getRootDomainsAdmin': {
                 return response.status(200).json(domains);
            }
            case 'addRootDomain': {
                const { domain, zone, apitoken } = data;
                if (domains[domain]) throw new Error('Domain ini sudah ada.');
                domains[domain] = { zone, apitoken };
                await writeJsonFile('domains.json', domains);
                return response.status(200).json({ message: 'Domain berhasil ditambahkan.' });
            }
            case 'deleteRootDomain': {
                const { domain } = data;
                if (!domains[domain]) throw new Error('Domain tidak ditemukan.');
                delete domains[domain];
                await writeJsonFile('domains.json', domains);
                return response.status(200).json({ message: 'Domain berhasil dihapus.' });
            }

            default:
                // Letakkan logika createSubdomain di sini jika belum ada di atas
                if (action === 'createSubdomain') {
                    // ... (Salin-tempel logika createSubdomain dari respons saya sebelumnya) ...
                }
                return response.status(400).json({ message: 'Aksi tidak valid.' });
        }

    } catch (error) {
        console.error(`Error pada aksi "${action}":`, error);
        return response.status(500).json({ message: error.message || 'Terjadi kesalahan di server.' });
    }
}