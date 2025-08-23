document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen-elemen ---
    const apikeyScreen = document.getElementById('apikey-screen');
    const domainCreatorScreen = document.getElementById('domain-creator-screen');
    const apikeyInput = document.getElementById('apikey-input');
    const apikeySubmitBtn = document.getElementById('apikey-submit-btn');
    
    const rootDomainSelect = document.getElementById('root-domain');
    const recordTypeSelect = document.getElementById('record-type');
    const ipInputSection = document.getElementById('ip-input-section');
    const cnameInputSection = document.getElementById('cname-input-section');
    const createDomainBtn = document.getElementById('create-domain-btn');
    
    const successPopup = document.getElementById('success-popup');
    const resultContainer = document.getElementById('result-container');
    const closePopupBtn = document.getElementById('close-popup-btn');
    const buyApikeyLink = document.getElementById('buy-apikey-link');
    const toastContainer = document.getElementById('toast-container');

    const API_URL = '/api/cloudflare';
    let validatedApiKey = null;

    // --- Toast Notification ---
    function showToast(message, type = 'info', duration = 3000) {
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

    // --- Logika API Key ---
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

            validatedApiKey = key; // Simpan API Key yang valid
            showToast('API Key valid! Selamat datang.', 'success');
            apikeyScreen.style.display = 'none';
            domainCreatorScreen.style.display = 'block';
            loadRootDomains();
        } catch (err) {
            showToast(err.message || 'API Key tidak valid atau sudah kadaluwarsa.', 'error');
        } finally {
            apikeySubmitBtn.textContent = 'Verifikasi';
            apikeySubmitBtn.disabled = false;
        }
    });

    buyApikeyLink.addEventListener('click', async (e) => {
        e.preventDefault();
        // Ganti nomor ini dengan nomor admin Anda
        window.open('https://wa.me/6285771555374?text=Halo%20Admin,%20saya%20ingin%20membeli%20API%20Key%20untuk%20layanan%20subdomain.', '_blank');
    });

    // --- Logika Pembuatan Domain ---
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
            showToast(err.message || 'Gagal memuat daftar domain.', 'error');
        }
    }

    recordTypeSelect.addEventListener('change', () => {
        if (recordTypeSelect.value === 'A') {
            ipInputSection.style.display = 'block';
            cnameInputSection.style.display = 'none';
        } else {
            ipInputSection.style.display = 'none';
            cnameInputSection.style.display = 'block';
        }
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
        } catch (err) {
            showToast(err.message || 'Gagal membuat subdomain.', 'error');
        } finally {
            createDomainBtn.textContent = 'Buat Domain';
            createDomainBtn.disabled = false;
        }
    });

    // --- Logika Popup ---
    function displaySuccessPopup(domains) {
        resultContainer.innerHTML = '';
        domains.forEach(domain => {
            const item = document.createElement('div');
            item.className = 'result-item';
            item.innerHTML = `
                <span>${domain}</span>
                <button type="button" class="copy-btn">Salin</button>
            `;
            resultContainer.appendChild(item);
        });

        successPopup.style.display = 'flex';
        setTimeout(() => successPopup.classList.add('visible'), 10);
    }
    
    resultContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('copy-btn')) {
            const domainText = e.target.previousElementSibling.textContent;
            navigator.clipboard.writeText(domainText).then(() => {
                e.target.textContent = 'Tersalin!';
                setTimeout(() => e.target.textContent = 'Salin', 2000);
            });
        }
    });

    closePopupBtn.addEventListener('click', () => {
        successPopup.classList.remove('visible');
        successPopup.addEventListener('transitionend', () => {
            successPopup.style.display = 'none';
        }, { once: true });
    });
});