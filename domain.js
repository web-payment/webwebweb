document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen-elemen ---
    const body = document.body;
    const themeSwitchBtn = document.getElementById('themeSwitchBtn');
    const toastContainer = document.getElementById('toast-container');
    const apikeyScreen = document.getElementById('apikey-screen');
    const domainCreatorScreen = document.getElementById('domain-creator-screen');
    const apikeyInput = document.getElementById('apikey-input');
    const apikeySubmitBtn = document.getElementById('apikey-submit-btn');
    const buyApikeyLink = document.getElementById('buy-apikey-link');
    const rootDomainSelect = document.getElementById('root-domain');
    const recordTypeSelect = document.getElementById('record-type');
    const ipInputSection = document.getElementById('ip-input-section');
    const cnameInputSection = document.getElementById('cname-input-section');
    const createDomainBtn = document.getElementById('create-domain-btn');
    const successPopup = document.getElementById('success-popup');
    const resultContainer = document.getElementById('result-container');
    const buyApiKeyModal = document.getElementById('buyApiKeyModal');
    const subdomainHistoryContainer = document.getElementById('subdomain-history-container');
    const modals = document.querySelectorAll('.modal');
    const apiKeyPriceListContainer = document.getElementById('api-key-price-list-container');

    const API_URL = '/api/cloudflare';
    let validatedApiKey = null;
    let siteSettings = {};

    // --- Fungsi Dasar (Tema, Toast, Modal) ---
    function applyTheme(theme) {
        body.className = theme;
        localStorage.setItem('domain-theme', theme);
        const iconClass = theme === 'dark-mode' ? 'fa-sun' : 'fa-moon';
        if(themeSwitchBtn) {
            themeSwitchBtn.innerHTML = `<i class="fas ${iconClass}"></i>`;
        }
    }
    
    if(themeSwitchBtn) {
        themeSwitchBtn.addEventListener('click', () => {
            const newTheme = body.classList.contains('light-mode') ? 'dark-mode' : 'light-mode';
            applyTheme(newTheme);
        });
    }
    applyTheme(localStorage.getItem('domain-theme') || 'light-mode');

    function showToast(message, type = 'info', duration = 3000) {
        if (toastContainer.firstChild) {
            toastContainer.firstChild.remove();
        }
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        let iconClass = 'fas fa-info-circle';
        if (type === 'success') iconClass = 'fas fa-check-circle';
        if (type === 'error') iconClass = 'fas fa-exclamation-circle';
        toast.innerHTML = `<i class="${iconClass}"></i> ${message}`;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('animationend', () => toast.remove());
        }, duration);
    }
    
    function openModal(modal) { if(modal) modal.classList.add('is-visible'); }
    function closeModal(modal) { if(modal) modal.classList.remove('is-visible'); }
    
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('close-button') || e.target.id === 'close-popup-btn') {
                closeModal(modal);
            }
        });
    });

    // --- Logika Utama ---
    async function initializePage() {
        try {
            const res = await fetch(`/settings.json?v=${Date.now()}`);
            if (res.ok) {
                siteSettings = await res.json();
                // We will populate prices when the user clicks the buy button
            } else {
                 throw new Error("Gagal memuat pengaturan.");
            }
        } catch (e) {
            console.error("Gagal memuat settings.json", e);
            apiKeyPriceListContainer.innerHTML = '<p style="color: var(--error-color);">Gagal memuat daftar harga.</p>';
        }

        const savedUserApiKey = localStorage.getItem('userApiKey');
        if (savedUserApiKey) {
            apikeyInput.value = savedUserApiKey;
            apikeySubmitBtn.click();
        }
    }

    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    }

    function populateApiKeyPrices() {
        if (!siteSettings.apiKeyPrices || siteSettings.apiKeyPrices.length === 0) {
            apiKeyPriceListContainer.innerHTML = '<p>Daftar harga belum diatur oleh admin.</p>';
            return;
        }

        const waNumber = siteSettings.apiKeyPurchaseNumber;
        if (!waNumber) {
            apiKeyPriceListContainer.innerHTML = '<p>Nomor admin belum diatur untuk pembelian.</p>';
            return;
        }

        apiKeyPriceListContainer.innerHTML = ''; 
        
        siteSettings.apiKeyPrices.forEach(item => {
            const div = document.createElement('div');
            div.className = 'price-item';
            
            let priceHTML = `<strong>${formatRupiah(item.price)}</strong>`;
            let effectivePrice = item.price;

            const now = new Date();
            const discountEndDate = item.discountEndDate ? new Date(item.discountEndDate) : null;
            if (item.discountPrice && discountEndDate && now < discountEndDate) {
                priceHTML = `<span class="original-price"><del>${formatRupiah(item.price)}</del></span> <strong class="discounted-price">${formatRupiah(item.discountPrice)}</strong>`;
                effectivePrice = item.discountPrice;
            }

            const message = encodeURIComponent(`Halo Admin, saya ingin membeli API Key paket "${item.tier}" dengan harga ${formatRupiah(effectivePrice)}.`);
            const waLink = `https://wa.me/${waNumber}?text=${message}`;

            div.innerHTML = `
                <div class="price-info">
                    <span class="tier-name">${item.tier}</span>
                    <div class="price-values">${priceHTML}</div>
                </div>
                <a href="${waLink}" target="_blank" class="buy-button">Beli Sekarang</a>
            `;
            apiKeyPriceListContainer.appendChild(div);
        });
    }

    apikeySubmitBtn.addEventListener('click', async () => {
        const key = apikeyInput.value.trim();
        if (!key) return showToast('API Key tidak boleh kosong.', 'error');

        apikeySubmitBtn.textContent = 'Memverifikasi...';
        apikeySubmitBtn.disabled = true;

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'validateApiKey', data: { apikey: key } })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);

            validatedApiKey = key;
            localStorage.setItem('userApiKey', key);
            showToast('API Key valid! Selamat datang.', 'success');
            apikeyScreen.style.display = 'none';
            domainCreatorScreen.style.display = 'block';
            loadRootDomains();
            renderSubdomainHistory();
        } catch (err) {
            showToast(err.message || 'API Key tidak valid atau sudah kadaluwarsa.', 'error');
        } finally {
            apikeySubmitBtn.textContent = 'Verifikasi';
            apikeySubmitBtn.disabled = false;
        }
    });

    buyApikeyLink.addEventListener('click', (e) => { 
        e.preventDefault(); 
        populateApiKeyPrices(); // Always populate with the latest data
        openModal(buyApiKeyModal); 
    });
    
    async function loadRootDomains() {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'getRootDomains', data: { apikey: validatedApiKey } })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);

            rootDomainSelect.innerHTML = '';
            result.domains.forEach(domain => {
                const option = document.createElement('option');
                option.value = domain;
                option.textContent = domain;
                rootDomainSelect.appendChild(option);
            });
        } catch (err) {
            showToast(err.message || 'Gagal memuat daftar domain. Domain ini sedang bermasalah.', 'error');
            rootDomainSelect.innerHTML = '<option>Gagal memuat...</option>';
        }
    }
    
    recordTypeSelect.addEventListener('change', () => {
        ipInputSection.style.display = recordTypeSelect.value === 'A' ? 'block' : 'none';
        cnameInputSection.style.display = recordTypeSelect.value === 'CNAME' ? 'block' : 'none';
    });

    createDomainBtn.addEventListener('click', async () => {
        const subDomain = document.getElementById('subdomain-name').value.trim().toLowerCase();
        const rootDomain = document.getElementById('root-domain').value;
        const type = document.getElementById('record-type').value;
        const content = (type === 'A') 
            ? document.getElementById('ip-address').value.trim()
            : document.getElementById('cname-target').value.trim();
        const proxied = document.getElementById('proxy-status').checked;

        if (!subDomain || !content) {
            return showToast('Semua kolom wajib diisi.', 'error');
        }

        const domainData = { 
            apikey: validatedApiKey, 
            subdomain: subDomain, 
            domain: rootDomain, 
            type: type, 
            content: content, 
            proxied: proxied 
        };

        createDomainBtn.textContent = 'Memproses...';
        createDomainBtn.disabled = true;

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'createSubdomain', data: domainData })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);

            showToast('Subdomain berhasil dibuat!', 'success');
            displaySuccessPopup(result.created_domains);

            const historyEntry = { 
                domain: result.created_domains[0], 
                target: content, 
                type: type, 
                date: new Date().toISOString() 
            };
            saveSubdomainToHistory(historyEntry);
            renderSubdomainHistory();
        } catch (err) {
            showToast(err.message || 'Gagal membuat subdomain.', 'error');
        } finally {
            createDomainBtn.textContent = 'Buat Domain';
            createDomainBtn.disabled = false;
        }
    });

    function displaySuccessPopup(domains) {
        resultContainer.innerHTML = '';
        domains.forEach(domain => {
            const item = document.createElement('div');
            item.className = 'result-item';
            item.innerHTML = `<span>${domain}</span><button type="button" class="copy-btn">Salin</button>`;
            resultContainer.appendChild(item);
        });
        openModal(successPopup);
    }
    
    resultContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('copy-btn')) {
            navigator.clipboard.writeText(e.target.previousElementSibling.textContent).then(() => {
                e.target.textContent = 'Tersalin!';
                setTimeout(() => e.target.textContent = 'Salin', 2000);
            });
        }
    });

    // --- Logika Riwayat Subdomain ---
    function getSubdomainHistory() { 
        return JSON.parse(localStorage.getItem(`subdomainHistory_${validatedApiKey}`) || '[]'); 
    }
    
    function saveSubdomainToHistory(entry) {
        const history = getSubdomainHistory();
        history.unshift(entry);
        localStorage.setItem(`subdomainHistory_${validatedApiKey}`, JSON.stringify(history.slice(0, 20))); // Simpan max 20 entri
    }

    function renderSubdomainHistory() {
        const history = getSubdomainHistory();
        if (!validatedApiKey || history.length === 0) {
            subdomainHistoryContainer.innerHTML = '<p>Belum ada subdomain yang dibuat dengan API Key ini.</p>';
            return;
        }
        subdomainHistoryContainer.innerHTML = '';
        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            const formattedDate = new Date(item.date).toLocaleString('id-ID', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'});
            div.innerHTML = `
                <div class="history-item-info">
                    <strong>${item.domain}</strong>
                    <small>(${item.type}) ➔ ${item.target} • ${formattedDate}</small>
                </div>
                <button type="button" class="copy-btn-history" data-text="${item.domain}">Salin</button>`;
            subdomainHistoryContainer.appendChild(div);
        });
    }

    subdomainHistoryContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('copy-btn-history')) {
            navigator.clipboard.writeText(e.target.dataset.text).then(() => {
                e.target.textContent = 'Tersalin!';
                setTimeout(() => e.target.textContent = 'Salin', 2000);
            });
        }
    });

    initializePage();
});