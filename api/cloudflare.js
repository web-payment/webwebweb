import { kv } from '@vercel/kv';
import path from 'path';

// --- KODE LAMA (fs) SUDAH TIDAK DIPAKAI ---
// Kita ganti dengan Vercel KV

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Metode tidak diizinkan.' });
    }

    const { action, data, adminPassword } = request.body;
    if (!action) return response.status(400).json({ message: 'Aksi tidak ditemukan.' });

    const adminActions = [
        'getApiKeys', 'createApiKey', 'deleteApiKey',
        'getRootDomainsAdmin', 'addRootDomain', 'deleteRootDomain'
    ];

    try {
        if (adminActions.includes(action)) {
            if (adminPassword !== process.env.ADMIN_PASSWORD) {
                return response.status(403).json({ message: 'Password admin salah.' });
            }
        }

        // Baca data 'apikeys' dari Vercel KV. Jika tidak ada, anggap sebagai objek kosong.
        const apiKeys = await kv.get('apikeys') || {};

        if (action === 'validateApiKey') {
            const keyData = apiKeys[data.apikey];
            if (!keyData || (keyData.expires_at !== 'permanent' && new Date() > new Date(keyData.expires_at))) {
                throw new Error('API Key tidak valid atau sudah kadaluwarsa.');
            }
            return response.status(200).json({ message: 'API Key valid.' });
        }
        
        const userActions = ['getRootDomains', 'createSubdomain'];
        if(userActions.includes(action)){
            const userApiKey = data.apikey;
            const keyData = apiKeys[userApiKey];
            if (!userApiKey || !keyData || (keyData.expires_at !== 'permanent' && new Date() > new Date(keyData.expires_at))) {
                return response.status(403).json({ message: 'Akses ditolak: API Key tidak valid.' });
            }
        }

        // Baca data 'domains' dari Vercel KV.
        const domains = await kv.get('domains') || {};

        switch (action) {
            // == AKSI UNTUK PENGGUNA ==
            case 'getRootDomains': {
                return response.status(200).json({ domains: Object.keys(domains) });
            }

            case 'createSubdomain': {
                const { subdomain, domain, type, content, proxied } = data;
                const domainInfo = domains[domain];
                if (!domainInfo) throw new Error('Domain utama tidak ditemukan.');

                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${domainInfo.apitoken}`
                };

                const created_domains = [];

                const mainRecordData = {
                    type, name: `${subdomain}.${domain}`, content, proxied, ttl: 1
                };
                
                const mainRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${domainInfo.zone}/dns_records`, {
                    method: 'POST', headers, body: JSON.stringify(mainRecordData)
                });
                const mainResult = await mainRes.json();
                if (!mainResult.success) {
                    throw new Error(`Gagal membuat record utama: ${mainResult.errors[0].message}`);
                }
                created_domains.push(mainResult.result.name);

                if (type === 'A') {
                    const nodeName = `node${Math.floor(10 + Math.random() * 90)}.${subdomain}.${domain}`;
                    const nodeRecordData = { type: 'A', name: nodeName, content, proxied, ttl: 1 };
                    
                    const nodeRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${domainInfo.zone}/dns_records`, {
                        method: 'POST', headers, body: JSON.stringify(nodeRecordData)
                    });
                    const nodeResult = await nodeRes.json();
                     if (!nodeResult.success) {
                         throw new Error(`Record utama dibuat, tapi gagal membuat record node: ${nodeResult.errors[0].message}`);
                     }
                    created_domains.push(nodeResult.result.name);
                }

                return response.status(200).json({ message: 'Subdomain berhasil dibuat!', created_domains });
            }

            // == AKSI UNTUK ADMIN ==
            case 'getApiKeys': {
                return response.status(200).json(apiKeys);
            }
            case 'createApiKey': {
                const { key, duration, unit, isPermanent } = data;
                if (!key) throw new Error('Nama API Key tidak boleh kosong.');
                if (apiKeys[key]) throw new Error('API Key ini sudah ada.');
                
                let expires_at = 'permanent';
                if (!isPermanent) {
                    const now = new Date();
                    const d = parseInt(duration, 10);
                    if (unit === 'days') now.setDate(now.getDate() + d);
                    else if (unit === 'weeks') now.setDate(now.getDate() + (d * 7));
                    else if (unit === 'months') now.setMonth(now.getMonth() + d);
                    else if (unit === 'years') now.setFullYear(now.getFullYear() + d);
                    expires_at = now.toISOString();
                }
                apiKeys[key] = { created_at: new Date().toISOString(), expires_at };
                
                // Simpan data 'apikeys' yang sudah diupdate ke Vercel KV
                await kv.set('apikeys', apiKeys);
                
                return response.status(200).json({ message: 'API Key berhasil dibuat.' });
            }
            case 'deleteApiKey': {
                const { key } = data;
                if (!apiKeys[key]) throw new Error('API Key tidak ditemukan.');
                delete apiKeys[key];
                
                // Simpan data 'apikeys' yang sudah diupdate ke Vercel KV
                await kv.set('apikeys', apiKeys);
                
                return response.status(200).json({ message: 'API Key berhasil dihapus.' });
            }
            case 'getRootDomainsAdmin': {
                 return response.status(200).json(domains);
            }
            case 'addRootDomain': {
                const { domain, zone, apitoken } = data;
                if (domains[domain]) throw new Error('Domain ini sudah ada.');
                domains[domain] = { zone, apitoken };
                
                // Simpan data 'domains' yang sudah diupdate ke Vercel KV
                await kv.set('domains', domains);
                
                return response.status(200).json({ message: 'Domain berhasil ditambahkan.' });
            }
            case 'deleteRootDomain': {
                const { domain } = data;
                if (!domains[domain]) throw new Error('Domain tidak ditemukan.');
                delete domains[domain];
                
                // Simpan data 'domains' yang sudah diupdate ke Vercel KV
                await kv.set('domains', domains);
                
                return response.status(200).json({ message: 'Domain berhasil dihapus.' });
            }

            default:
                return response.status(400).json({ message: 'Aksi tidak valid.' });
        }

    } catch (error) {
        console.error(`Error pada aksi "${action}":`, error);
        return response.status(500).json({ message: error.message || 'Terjadi kesalahan di server.' });
    }
}
