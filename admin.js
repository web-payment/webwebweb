document.addEventListener('DOMContentLoaded', () => {
    // --- Variabel Elemen ---
    const body = document.body;
    const toastContainer = document.getElementById('toast-container');
    const loginScreen = document.getElementById('login-screen');
    const productFormScreen = document.getElementById('product-form-screen');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');
    const passwordToggle = document.getElementById('passwordToggle');
    const themeSwitchers = document.querySelectorAll('.theme-switch');
    const modals = document.querySelectorAll('.modal');

    // Variabel Produk
    const categorySelect = document.getElementById('category');
    const nameInput = document.getElementById('product-name');
    const priceInput = document.getElementById('product-price');
    const descriptionInput = document.getElementById('product-description');
    const productWhatsappNumberInput = document.getElementById('product-whatsapp-number');
    const scriptMenuSection = document.getElementById('scriptMenuSection');
    const scriptMenuContentInput = document.getElementById('script-menu-content');
    const stockPhotoSection = document.getElementById('stock-photo-section');
    const photosInput = document.getElementById('product-photos');
    const addButton = document.getElementById('add-product-button');
    const manageCategorySelect = document.getElementById('manage-category');
    const manageProductList = document.getElementById('manage-product-list');
    const saveOrderButton = document.getElementById('save-order-button');
    const bulkPriceEditContainer = document.getElementById('bulk-price-edit-container');
    const bulkPriceInput = document.getElementById('bulk-price-input');
    const applyBulkPriceBtn = document.getElementById('apply-bulk-price-btn');
    const resetPricesBtn = document.getElementById('reset-prices-btn');

    // Variabel Modal
    const customConfirmModal = document.getElementById('customConfirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmOkBtn = document.getElementById('confirmOkBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    let resolveConfirmPromise;
    
    // Variabel Pengaturan
    const saveSettingsButton = document.getElementById('save-settings-button');
    const globalWhatsappNumberInput = document.getElementById('global-whatsapp-number');
    const apikeyWhatsappNumberInput = document.getElementById('apikey-whatsapp-number');
    const categoryWhatsappNumbersContainer = document.getElementById('category-whatsapp-numbers-container');
    
    // Variabel Manajer Domain (Admin)
    const showAddApiKeyModalBtn = document.getElementById('show-add-apikey-modal-btn');
    const showAddDomainModalBtn = document.getElementById('show-add-domain-modal-btn');
    const addApiKeyModal = document.getElementById('addApiKeyModal');
    const createApiKeyBtn = document.getElementById('create-apikey-btn');
    const permanentKeyCheckbox = document.getElementById('permanent-key');
    const durationSection = document.getElementById('duration-section');
    const addDomainModal = document.getElementById('addDomainModal');
    const addDomainBtn = document.getElementById('add-domain-btn');
    const apiKeyListContainer = document.getElementById('apiKeyListContainer');
    const rootDomainListContainer = document.getElementById('rootDomainListContainer');

    // --- Alamat API ---
    const API_PRODUCTS_URL = '/api/products';
    const API_CLOUDFLARE_URL = '/api/cloudflare';
    const API_BASE_URL = '/api'; 
    let activeToastTimeout = null;
    let siteSettings = {};
    
    // --- FUNGSI DASAR (Tema, Toast, Konfirmasi, Validasi Nomor) ---
    function applyTheme(theme) {
        body.className = theme;
        localStorage.setItem('admin-theme', theme);
        const iconClass = theme === 'dark-mode' ? 'fa-sun' : 'fa-moon';
        themeSwitchers.forEach(btn => {
            btn.innerHTML = `<i class="fas ${iconClass}"></i>`;
        });
    }
    themeSwitchers.forEach(btn => {
        btn.addEventListener('click', () => {
            const newTheme = body.classList.contains('light-mode') ? 'dark-mode' : 'light-mode';
            applyTheme(newTheme);
        });
    });
    applyTheme(localStorage.getItem('admin-theme') || 'light-mode');
    
    passwordToggle.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        passwordToggle.querySelector('i').className = `fas ${type === 'password' ? 'fa-eye-slash' : 'fa-eye'}`;
    });

    function showToast(message, type = 'info', duration = 3000) {
        if (toastContainer.firstChild) {
            clearTimeout(activeToastTimeout);
            toastContainer.innerHTML = '';
        }
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        let iconClass = 'fas fa-info-circle';
        if (type === 'success') iconClass = 'fas fa-check-circle';
        if (type === 'error') iconClass = 'fas fa-exclamation-circle';
        toast.innerHTML = `<i class="${iconClass}"></i> ${message}`;
        toastContainer.appendChild(toast);
        activeToastTimeout = setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('animationend', () => toast.remove());
        }, duration);
    }

    function showCustomConfirm(message) {
        confirmMessage.innerHTML = message;
        openModal(customConfirmModal);
        return new Promise((resolve) => {
            resolveConfirmPromise = resolve;
        });
    }

    confirmOkBtn.addEventListener('click', () => {
        closeModal(customConfirmModal);
        if (resolveConfirmPromise) resolveConfirmPromise(true);
    });

    confirmCancelBtn.addEventListener('click', () => {
        closeModal(customConfirmModal);
        if (resolveConfirmPromise) resolveConfirmPromise(false);
    });
    
    function openModal(modal) { if(modal) modal.classList.add('is-visible'); }
    function closeModal(modal) { if(modal) modal.classList.remove('is-visible'); }

    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
             if (e.target.classList.contains('modal') || e.target.classList.contains('close-button') || e.target.id === 'closeEditModal') {
                closeModal(modal);
             }
        });
    });

    function validatePhoneNumber(number) {
        if (!number) return true;
        const phoneRegex = /^[1-9]\d*$/;
        return phoneRegex.test(number);
    }
    
    // --- FUNGSI HELPER API ADMIN ---
    async function fetchAdminApi(action, data) {
        const adminPassword = sessionStorage.getItem('adminPassword');
        if (!adminPassword) {
            showToast('Sesi login tidak valid. Silakan login ulang.', 'error');
            return Promise.reject(new Error('Password admin tidak ditemukan'));
        }
        const response = await fetch(API_CLOUDFLARE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, data, adminPassword })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        return result;
    }

    // --- LOGIKA LOGIN ---
    const handleLogin = async () => {
        const password = passwordInput.value;
        if (!password) {
            showToast('Password tidak boleh kosong.', 'error');
            return;
        }
        loginButton.textContent = 'Memverifikasi...';
        loginButton.disabled = true;
        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            
            sessionStorage.setItem('isAdminAuthenticated', 'true');
            sessionStorage.setItem('adminPassword', password);
            
            loginScreen.style.display = 'none';
            productFormScreen.style.display = 'block';
            showToast('Login berhasil!', 'success');
            await loadSettings();
            document.querySelector('.tab-button[data-tab="addProduct"]').click();
        } catch (e) {
            showToast(e.message || 'Password salah.', 'error');
        } finally {
            loginButton.textContent = 'Masuk';
            loginButton.disabled = false;
        }
    };
    loginButton.addEventListener('click', handleLogin);
    passwordInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleLogin(); });

    // --- LOGIKA NAVIGASI TAB ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.admin-tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(button.dataset.tab).classList.add('active');
            
            if (button.dataset.tab === 'manageProducts' && manageCategorySelect.value) {
                manageCategorySelect.dispatchEvent(new Event('change'));
            }
            if (button.dataset.tab === 'domainManager') {
                loadApiKeys();
                loadRootDomains();
            }
        });
    });

    // --- LOGIKA TAB "TAMBAH & KELOLA PRODUK" ---
    categorySelect.addEventListener('change', () => {
        const category = categorySelect.value;
        stockPhotoSection.style.display = (category === 'Stock Akun' || category === 'Logo') ? 'block' : 'none';
        scriptMenuSection.style.display = category === 'Script' ? 'block' : 'none';
    });
    
    addButton.addEventListener('click', async () => { /* ... Logika Tambah Produk ... */ });
    manageCategorySelect.addEventListener('change', async () => { /* ... Logika Muat Produk Kelola ... */ });

    // --- LOGIKA TAB "PENGATURAN" ---
    async function loadSettings() {
        try {
            const res = await fetch(`${API_BASE_URL}/getSettings?v=${Date.now()}`);
            if (!res.ok) throw new Error('Gagal memuat pengaturan.');
            siteSettings = await res.json();
            globalWhatsappNumberInput.value = siteSettings.globalPhoneNumber || '';
            apikeyWhatsappNumberInput.value = siteSettings.apiKeyPurchaseNumber || '';
            
            const categoriesInSettings = siteSettings.categoryPhoneNumbers || {};
            const allCategories = [...manageCategorySelect.options].filter(opt => opt.value).map(opt => opt.value);
            categoryWhatsappNumbersContainer.innerHTML = '<h3><i class="fas fa-list-alt"></i> Nomor WA per Kategori (Opsional)</h3>';
            allCategories.forEach(cat => {
                 const div = document.createElement('div');
                 div.className = 'category-wa-input';
                 div.innerHTML = `<label for="wa-${cat}">${cat}:</label><input type="text" id="wa-${cat}" data-category="${cat}" value="${categoriesInSettings[cat] || ''}" placeholder="Kosongkan untuk pakai nomor global">`;
                 categoryWhatsappNumbersContainer.appendChild(div);
            });
        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    saveSettingsButton.addEventListener('click', async () => {
        const globalNumber = globalWhatsappNumberInput.value.trim();
        const apiKeyNumber = apikeyWhatsappNumberInput.value.trim();
        if (!validatePhoneNumber(globalNumber) || !globalNumber || !validatePhoneNumber(apiKeyNumber) || !apiKeyNumber) {
            return showToast("Semua Nomor WA wajib diisi dengan format yang benar (contoh: 628...).", 'error');
        }

        const categoryNumbers = {};
        categoryWhatsappNumbersContainer.querySelectorAll('input[data-category]').forEach(input => {
            categoryNumbers[input.dataset.category] = input.value.trim();
        });

        saveSettingsButton.disabled = true;
        try {
            const result = await fetch(`${API_BASE_URL}/updateSettings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    globalPhoneNumber: globalNumber, 
                    categoryPhoneNumbers: categoryNumbers,
                    apiKeyPurchaseNumber: apiKeyNumber 
                })
            }).then(res => res.json());
            if (result.message !== 'Pengaturan berhasil disimpan!') throw new Error(result.message);
            showToast('Pengaturan berhasil disimpan!', 'success');
            await loadSettings();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            saveSettingsButton.disabled = false;
        }
    });

    // --- LOGIKA TAB "MANAJER DOMAIN" ---
    permanentKeyCheckbox.addEventListener('change', (e) => {
        durationSection.style.display = e.target.checked ? 'none' : 'block';
    });

    showAddApiKeyModalBtn.addEventListener('click', () => openModal(addApiKeyModal));
    showAddDomainModalBtn.addEventListener('click', () => openModal(addDomainModal));

    async function loadApiKeys() {
        apiKeyListContainer.innerHTML = 'Memuat...';
        try {
            const keys = await fetchAdminApi('getApiKeys', {});
            let html = '<h3><i class="fas fa-list"></i> Daftar API Key Aktif</h3>';
            if (Object.keys(keys).length === 0) {
                html += '<p>Belum ada API Key.</p>';
            } else {
                for (const key in keys) {
                    const keyData = keys[key];
                    const expires = keyData.expires_at === 'permanent' ? 'Permanen' : new Date(keyData.expires_at).toLocaleString('id-ID');
                    html += `
                        <div class="delete-item">
                            <div class="item-header">
                                <span><strong>${key}</strong><br><small>Kadaluwarsa: ${expires}</small></span>
                                <div class="item-actions">
                                    <button type="button" class="delete-btn delete-apikey-btn" data-key="${key}">Hapus</button>
                                </div>
                            </div>
                        </div>`;
                }
            }
            apiKeyListContainer.innerHTML = html;
        } catch (err) {
            apiKeyListContainer.innerHTML = `<p style="color: red;">Gagal memuat: ${err.message}</p>`;
        }
    }

    async function loadRootDomains() {
        rootDomainListContainer.innerHTML = 'Memuat...';
        try {
            const domains = await fetchAdminApi('getRootDomainsAdmin', {});
            let html = '<h3><i class="fas fa-list"></i> Daftar Domain Aktif</h3>';
            if (Object.keys(domains).length === 0) {
                html += '<p>Belum ada Domain Utama.</p>';
            } else {
                for (const domain in domains) {
                    html += `
                        <div class="delete-item">
                             <div class="item-header">
                                <span><strong>${domain}</strong></span>
                                <div class="item-actions">
                                    <button type="button" class="delete-btn delete-domain-btn" data-domain="${domain}">Hapus</button>
                                </div>
                            </div>
                        </div>`;
                }
            }
            rootDomainListContainer.innerHTML = html;
        } catch (err) {
            rootDomainListContainer.innerHTML = `<p style="color: red;">Gagal memuat: ${err.message}</p>`;
        }
    }
    
    createApiKeyBtn.addEventListener('click', async () => {
        const key = document.getElementById('new-apikey-name').value.trim();
        const duration = parseInt(document.getElementById('new-apikey-duration').value, 10);
        const unit = document.getElementById('new-apikey-unit').value;
        const isPermanent = permanentKeyCheckbox.checked;

        if (!key || (!isPermanent && (isNaN(duration) || duration <= 0))) {
            return showToast('Nama Key dan Durasi harus valid.', 'error');
        }

        createApiKeyBtn.textContent = 'Membuat...';
        createApiKeyBtn.disabled = true;

        try {
            const result = await fetchAdminApi('createApiKey', { key, duration, unit, isPermanent });
            showToast(result.message, 'success');
            document.getElementById('addApiKeyForm').reset();
            loadApiKeys();
            closeModal(addApiKeyModal);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            createApiKeyBtn.textContent = 'Buat API Key';
            createApiKeyBtn.disabled = false;
        }
    });

    addDomainBtn.addEventListener('click', async () => {
        const domain = document.getElementById('new-domain-name').value.trim();
        const zone = document.getElementById('new-domain-zone').value.trim();
        const apitoken = document.getElementById('new-domain-token').value.trim();

        if (!domain || !zone || !apitoken) {
            return showToast('Semua kolom domain wajib diisi.', 'error');
        }
        
        addDomainBtn.textContent = 'Menambah...';
        addDomainBtn.disabled = true;

        try {
            const result = await fetchAdminApi('addRootDomain', { domain, zone, apitoken });
            showToast(result.message, 'success');
            document.getElementById('addDomainForm').reset();
            loadRootDomains();
            closeModal(addDomainModal);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            addDomainBtn.textContent = 'Tambah Domain';
            addDomainBtn.disabled = false;
        }
    });

    // --- EVENT DELEGATION UNTUK TOMBOL HAPUS ---
    document.body.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        if (!deleteBtn) return;
        
        // Hapus API Key
        if (deleteBtn.classList.contains('delete-apikey-btn')) {
            const key = deleteBtn.dataset.key;
            if (await showCustomConfirm(`Yakin menghapus API Key "<b>${key}</b>"?`)) {
                try {
                    const result = await fetchAdminApi('deleteApiKey', { key });
                    showToast(result.message, 'success');
                    loadApiKeys();
                } catch (err) { showToast(err.message, 'error'); }
            }
        }
        // Hapus Domain
        else if (deleteBtn.classList.contains('delete-domain-btn')) {
            const domain = deleteBtn.dataset.domain;
            if (await showCustomConfirm(`Yakin menghapus Domain "<b>${domain}</b>"?`)) {
                 try {
                    const result = await fetchAdminApi('deleteRootDomain', { domain });
                    showToast(result.message, 'success');
                    loadRootDomains();
                } catch (err) { showToast(err.message, 'error'); }
            }
        }
    });

    // --- INISIALISASI ---
    if (sessionStorage.getItem('isAdminAuthenticated')) {
        loginScreen.style.display = 'none';
        productFormScreen.style.display = 'block';
        loadSettings().then(() => {
            document.querySelector('.tab-button[data-tab="addProduct"]').click();
        });
    }
});