// File: admin.js (Versi Lengkap dan Final)
document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen-elemen ---
    const loginScreen = document.getElementById('login-screen');
    const productFormScreen = document.getElementById('product-form-screen');
    const loginButton = document.getElementById('login-button');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');
    const themeSwitchBtnLogin = document.getElementById('themeSwitchBtnLogin');
    const themeSwitchBtnPanel = document.getElementById('themeSwitchBtnPanel');
    const body = document.body;
    const toastContainer = document.getElementById('toast-container');
    
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
    const apiKeyWhatsappNumberInput = document.getElementById('apikey-whatsapp-number');
    const categoryWhatsappNumbersContainer = document.getElementById('category-whatsapp-numbers-container');
    
    // Variabel Modal Edit
    const editWhatsappNumberInput = document.getElementById('edit-whatsapp-number');

    // --- Variabel Manajer Domain ---
    const apiKeyListContainer = document.getElementById('apiKeyListContainer');
    const createApiKeyBtn = document.getElementById('create-apikey-btn');
    const rootDomainListContainer = document.getElementById('rootDomainListContainer');
    const addDomainBtn = document.getElementById('add-domain-btn');
    const permanentKeyCheckbox = document.getElementById('permanent-key');
    const durationSection = document.getElementById('duration-section');
    const apiKeyPriceSettingsContainer = document.getElementById('api-key-price-settings-container');
    const addNewPriceTierBtn = document.getElementById('add-new-price-tier-btn');
    
    // --- Alamat API ---
    const API_PRODUCTS_URL = '/api/products';
    const API_CLOUDFLARE_URL = '/api/cloudflare';
    const API_BASE_URL = '/api'; 
    let activeToastTimeout = null;
    let siteSettings = {};
    
    // --- FUNGSI DASAR (Tema, Toast, Konfirmasi, Modal, dll) ---
    const savedTheme = localStorage.getItem('admin-theme') || 'light-mode';
    body.className = savedTheme;
    function updateThemeButton() {
        const iconClass = body.classList.contains('dark-mode') ? 'fa-sun' : 'fa-moon';
        if(themeSwitchBtnLogin) themeSwitchBtnLogin.querySelector('i').className = `fas ${iconClass}`;
        if (themeSwitchBtnPanel) themeSwitchBtnPanel.querySelector('i').className = `fas ${iconClass}`;
    }
    updateThemeButton();

    function toggleTheme() {
        body.classList.replace(body.classList.contains('light-mode') ? 'light-mode' : 'dark-mode', body.classList.contains('light-mode') ? 'dark-mode' : 'light-mode');
        localStorage.setItem('admin-theme', body.className);
        updateThemeButton();
    }
    if(themeSwitchBtnLogin) themeSwitchBtnLogin.addEventListener('click', toggleTheme);
    if (themeSwitchBtnPanel) themeSwitchBtnPanel.addEventListener('click', toggleTheme);
    
    if(passwordToggle) {
        passwordToggle.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            passwordToggle.querySelector('i').className = `fas ${type === 'password' ? 'fa-eye-slash' : 'fa-eye'}`;
        });
    }

    function openModal(modal) { if(modal) modal.classList.add('is-visible'); }
    function closeModal(modal) { if(modal) modal.classList.remove('is-visible'); }

    // Event listener untuk semua tombol yang membuka modal & tombol close
    document.getElementById('show-add-apikey-modal-btn').addEventListener('click', () => openModal(document.getElementById('addApiKeyModal')));
    document.getElementById('show-add-domain-modal-btn').addEventListener('click', () => openModal(document.getElementById('addDomainModal')));
    document.querySelectorAll('.modal .close-button').forEach(btn => {
        btn.addEventListener('click', (e) => closeModal(e.target.closest('.modal')));
    });
    
    function showApiKeySuccessPopup(keyDetails) {
        const modal = document.getElementById('apiKeySuccessModal');
        const detailsTextarea = document.getElementById('apiKeyDetails');
        const copyBtn = document.getElementById('copyApiKeyDetailsBtn');
        const createdAt = new Date(keyDetails.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' });
        const expiresAt = keyDetails.expires_at === 'permanent' ? 'Permanen' : new Date(keyDetails.expires_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' });
        const detailsText = `DETAIL API KEY\n-------------------------\nKey         : ${keyDetails.key}\nDibuat pada : ${createdAt}\nKadaluwarsa : ${expiresAt}\n-------------------------\nHarap simpan baik-baik.`;
        detailsTextarea.value = detailsText.trim();
        openModal(modal);
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(detailsTextarea.value).then(() => {
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Tersalin!';
                setTimeout(() => { copyBtn.innerHTML = '<i class="fas fa-copy"></i> Salin Detail'; }, 2000);
            });
        };
    }
    
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
        return new Promise((resolve) => { resolveConfirmPromise = resolve; });
    }
    confirmOkBtn.addEventListener('click', () => { closeModal(customConfirmModal); if (resolveConfirmPromise) resolveConfirmPromise(true); });
    confirmCancelBtn.addEventListener('click', () => { closeModal(customConfirmModal); if (resolveConfirmPromise) resolveConfirmPromise(false); });
    customConfirmModal.addEventListener('click', (e) => { if (e.target === customConfirmModal) { closeModal(customConfirmModal); if (resolveConfirmPromise) resolveConfirmPromise(false); } });

    function validatePhoneNumber(number) { return !number || /^[1-9]\d*$/.test(number); }
    
    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    }
    
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
        if (!password) return showToast('Password tidak boleh kosong.', 'error');
        loginButton.textContent = 'Memverifikasi...';
        loginButton.disabled = true;
        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            if (!res.ok) throw new Error((await res.json()).message);
            
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
    if(loginButton) loginButton.addEventListener('click', handleLogin);
    if(passwordInput) passwordInput.addEventListener('keypress', e => { if (e.key === 'Enter') { e.preventDefault(); handleLogin(); } });

    // --- LOGIKA NAVIGASI TAB ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.admin-tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(button.dataset.tab).classList.add('active');
            
            if (button.dataset.tab === 'manageProducts' && manageCategorySelect.value) { manageCategorySelect.dispatchEvent(new Event('change')); }
            if (button.dataset.tab === 'domainManager') { loadApiKeys(); loadRootDomains(); }
        });
    });

    // --- LOGIKA TAB "PENGATURAN" ---
    async function loadSettings() {
        try {
            const res = await fetch(`${API_BASE_URL}/getSettings`);
            if (!res.ok) throw new Error('Gagal memuat pengaturan.');
            siteSettings = await res.json();
            siteSettings.apiKeyPrices = siteSettings.apiKeyPrices || [];
            globalWhatsappNumberInput.value = siteSettings.globalPhoneNumber || '';
            apiKeyWhatsappNumberInput.value = siteSettings.apiKeyPurchaseNumber || '';
            
            categoryWhatsappNumbersContainer.innerHTML = '<h3><i class="fas fa-list-alt"></i> Nomor WA per Kategori (Opsional)</h3>';
            const categoriesInSettings = siteSettings.categoryPhoneNumbers || {};
            [...manageCategorySelect.options].filter(opt => opt.value).forEach(opt => {
                const cat = opt.value;
                const div = document.createElement('div');
                div.className = 'category-wa-input';
                div.innerHTML = `<label for="wa-${cat}">${cat}:</label><input type="text" id="wa-${cat}" data-category="${cat}" value="${categoriesInSettings[cat] || ''}" placeholder="Kosongkan untuk pakai nomor global">`;
                categoryWhatsappNumbersContainer.appendChild(div);
            });
            renderApiKeyPriceSettings();
        } catch (err) {
            showToast(err.message, 'error');
        }
    }
    
    function renderApiKeyPriceSettings() {
        apiKeyPriceSettingsContainer.innerHTML = '';
        if (!siteSettings.apiKeyPrices || siteSettings.apiKeyPrices.length === 0) {
            siteSettings.apiKeyPrices.push({ tier: '7 Hari', price: 5000, discountPrice: '', discountEndDate: '' });
        }
        siteSettings.apiKeyPrices.forEach((tier, index) => {
            const div = document.createElement('div');
            div.className = 'delete-item';
            div.innerHTML = `
                <div class="item-header" style="flex-direction: column; align-items: flex-start; gap: 15px;">
                    <div style="width: 100%; display: flex; gap: 10px;">
                        <input type="text" class="price-tier-name" placeholder="Nama Durasi (e.g., 7 Hari)" value="${tier.tier || ''}">
                        <button type="button" class="delete-btn delete-price-tier-btn" data-index="${index}" style="width: auto; padding: 10px 12px;"><i class="fas fa-trash-alt"></i></button>
                    </div>
                    <div style="width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <input type="number" class="price-tier-price" placeholder="Harga Asli (e.g., 5000)" value="${tier.price || ''}">
                        <input type="number" class="price-tier-discount-price" placeholder="Harga Diskon (Opsional)" value="${tier.discountPrice || ''}">
                    </div>
                    <label style="margin-top: 5px; margin-bottom: 5px; font-size: 0.85em;">Tanggal Berakhir Diskon (Opsional):</label>
                    <input type="datetime-local" class="price-tier-discount-date" value="${tier.discountEndDate ? tier.discountEndDate.slice(0, 16) : ''}">
                </div>`;
            apiKeyPriceSettingsContainer.appendChild(div);
        });
        apiKeyPriceSettingsContainer.querySelectorAll('.delete-price-tier-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const indexToRemove = parseInt(e.currentTarget.dataset.index, 10);
                siteSettings.apiKeyPrices.splice(indexToRemove, 1);
                renderApiKeyPriceSettings();
            });
        });
    }

    addNewPriceTierBtn.addEventListener('click', () => {
        siteSettings.apiKeyPrices.push({ tier: '', price: '', discountPrice: '', discountEndDate: '' });
        renderApiKeyPriceSettings();
    });

    saveSettingsButton.addEventListener('click', async () => {
        const globalNumber = globalWhatsappNumberInput.value.trim();
        const apiKeyWaNumber = apiKeyWhatsappNumberInput.value.trim();
        
        if (!validatePhoneNumber(globalNumber) || !globalNumber || !validatePhoneNumber(apiKeyWaNumber) || !apiKeyWaNumber) {
            return showToast("Nomor WA Global dan Nomor WA Beli API Key wajib diisi dengan format valid.", 'error');
        }
        const categoryNumbers = {};
        let isCategoryValid = true;
        categoryWhatsappNumbersContainer.querySelectorAll('input[data-category]').forEach(input => {
            const cat = input.dataset.category;
            const num = input.value.trim();
            if (num && !validatePhoneNumber(num)) {
                showToast(`Format Nomor WA kategori ${cat} salah.`, 'error');
                isCategoryValid = false;
            }
            categoryNumbers[cat] = num;
        });
        if (!isCategoryValid) return;
        
        const newApiKeyPrices = [];
        const priceTiers = apiKeyPriceSettingsContainer.querySelectorAll('.delete-item');
        let isPriceValid = true;
        priceTiers.forEach(tierElement => {
            const tierName = tierElement.querySelector('.price-tier-name').value.trim();
            const price = tierElement.querySelector('.price-tier-price').value;
            const discountPrice = tierElement.querySelector('.price-tier-discount-price').value;
            const discountEndDate = tierElement.querySelector('.price-tier-discount-date').value;
            if (!tierName || !price) { isPriceValid = false; }
            newApiKeyPrices.push({
                tier: tierName,
                price: parseInt(price, 10),
                discountPrice: discountPrice ? parseInt(discountPrice, 10) : '',
                discountEndDate: discountEndDate ? new Date(discountEndDate).toISOString() : ''
            });
        });
        if (!isPriceValid) return showToast('Nama Durasi dan Harga Asli pada setiap tingkatan harga API Key wajib diisi.', 'error');

        saveSettingsButton.disabled = true;
        try {
            const settingsToUpdate = {
                globalPhoneNumber: globalNumber,
                apiKeyPurchaseNumber: apiKeyWaNumber,
                categoryPhoneNumbers: categoryNumbers,
                apiKeyPrices: newApiKeyPrices
            };
            const result = await fetch(`${API_BASE_URL}/updateSettings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settingsToUpdate)
            }).then(res => res.json());

            if (result.message !== 'Pengaturan berhasil disimpan!') throw new Error(result.message);
            showToast('Pengaturan berhasil disimpan!', 'success');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            saveSettingsButton.disabled = false;
        }
    });

    // --- LOGIKA TAB "TAMBAH PRODUK" ---
    if(categorySelect) {
        categorySelect.addEventListener('change', () => {
            const category = categorySelect.value;
            stockPhotoSection.style.display = (category === 'Stock Akun' || category === 'Logo') ? 'block' : 'none';
            scriptMenuSection.style.display = category === 'Script' ? 'block' : 'none';
        });
    }
    
    if(addButton) {
        addButton.addEventListener('click', async (e) => { 
            e.preventDefault(); 
            const waNumber = productWhatsappNumberInput.value.trim();
            if (!validatePhoneNumber(waNumber)) {
                return showToast("Format Nomor WA salah. Harus diawali kode negara (contoh: 628...)", 'error');
            }
            const productData = {
                category: categorySelect.value,
                nama: nameInput.value.trim(),
                harga: parseInt(priceInput.value, 10),
                deskripsiPanjang: descriptionInput.value.trim(),
                images: photosInput.value.split(',').map(l => l.trim()).filter(Boolean),
                nomorWA: waNumber,
                menuContent: scriptMenuContentInput.value.trim()
            };
            if (!productData.nama || isNaN(productData.harga) || productData.harga < 0 || !productData.deskripsiPanjang) {
                return showToast('Semua kolom wajib diisi dan harga harus angka positif.', 'error');
            }
            addButton.textContent = 'Memproses...';
            addButton.disabled = true;
            try {
                const result = await fetch(API_PRODUCTS_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'addProduct', data: productData })
                }).then(res => res.json());
                if (result.message !== 'Produk berhasil ditambahkan!') throw new Error(result.message);
                showToast(`Produk "${productData.nama}" berhasil ditambahkan.`, 'success');
                document.getElementById('addProductForm').reset();
                categorySelect.dispatchEvent(new Event('change'));
            } catch (err) {
                showToast(err.message || 'Gagal menambahkan produk.', 'error');
            } finally {
                addButton.textContent = 'Tambah Produk';
                addButton.disabled = false;
            }
        });
    }

    // --- LOGIKA TAB "KELOLA PRODUK" ---
    if(manageCategorySelect) {
        manageCategorySelect.addEventListener('change', async () => {
            manageProductList.innerHTML = 'Memuat...';
            const category = manageCategorySelect.value;
            if (!category) {
                manageProductList.innerHTML = '<p>Pilih kategori untuk mengelola produk.</p>';
                saveOrderButton.style.display = 'none';
                bulkPriceEditContainer.style.display = 'none';
                return;
            }
            try {
                const res = await fetch(`/products.json?v=${new Date().getTime()}`);
                if (!res.ok) throw new Error(`Gagal memuat produk: ${res.status}`);
                const data = await res.json(); 
                const productsInCat = data[category] || [];
                if (productsInCat.length === 0) {
                    manageProductList.innerHTML = '<p>Tidak ada produk di kategori ini.</p>';
                    saveOrderButton.style.display = 'none';
                    bulkPriceEditContainer.style.display = 'none';
                    return;
                }
                renderManageList(productsInCat, category);
                saveOrderButton.style.display = 'block';
                bulkPriceEditContainer.style.display = 'flex'; 
            } catch (err) {
                showToast(err.message, 'error');
                manageProductList.innerHTML = `<p style="color:red;">${err.message}</p>`;
            }
        });
    }

    function renderManageList(productsToRender, category) {
        manageProductList.innerHTML = '';
        productsToRender.forEach(prod => {
            const item = document.createElement('div');
            item.className = 'delete-item';
            item.setAttribute('draggable', 'true');
            item.dataset.id = prod.id;
            let priceDisplay = `<span>${formatRupiah(prod.harga)}</span>`;
            if (prod.hargaAsli && prod.hargaAsli > prod.harga) {
                priceDisplay = `<span class="original-price"><del>${formatRupiah(prod.hargaAsli)}</del></span> <span class="discounted-price">${formatRupiah(prod.harga)}</span>`;
            } else if (prod.hargaAsli) {
                priceDisplay = `<span>${formatRupiah(prod.hargaAsli)}</span>`;
            }
            const isNew = prod.createdAt && Date.now() - new Date(prod.createdAt).getTime() < 24 * 60 * 60 * 1000;
            item.innerHTML = `
                <div class="item-header">
                    <span>${prod.nama} - ${priceDisplay} ${isNew ? '<span class="new-badge">NEW</span>' : ''}</span>
                    <div class="item-actions">
                        <button type="button" class="edit-btn" data-id="${prod.id}"><i class="fas fa-edit"></i> Edit</button>
                        <button type="button" class="delete-btn delete-product-btn" data-id="${prod.id}"><i class="fas fa-trash-alt"></i> Hapus</button>
                    </div>
                </div>`;
            manageProductList.appendChild(item);
        });
        setupManageActions(category, productsToRender);
    }
    
    function setupManageActions(category, productsInCat) {
        const editModal = document.getElementById('editProductModal');
        const editNameInput = document.getElementById('edit-name');
        const editPriceInput = document.getElementById('edit-price');
        const editDescInput = document.getElementById('edit-desc');
        const addPhotoBtn = document.getElementById('add-photo-btn');
        const saveEditBtn = document.getElementById('save-edit-btn');
        
        manageProductList.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.dataset.id);
                const product = productsInCat.find(p => p.id === productId);
                if (!product) return showToast('Produk tidak ditemukan.', 'error');
                
                document.getElementById('edit-product-id').value = product.id;
                document.getElementById('edit-product-category').value = category;
                document.getElementById('editModalTitle').innerHTML = `<i class="fas fa-edit"></i> Edit Produk: ${product.nama}`;
                editNameInput.value = product.nama;
                editPriceInput.value = product.hargaAsli || product.harga;
                document.getElementById('edit-discount-price').value = product.discountPrice || '';
                document.getElementById('edit-discount-date').value = product.discountEndDate ? product.discountEndDate.slice(0, 16) : '';
                editDescInput.value = product.deskripsiPanjang ? product.deskripsiPanjang.replace(/ \|\| /g, '\n') : '';
                editWhatsappNumberInput.value = product.nomorWA || '';
                
                const isPhotoCategory = category === 'Stock Akun' || category === 'Logo';
                document.getElementById('edit-photo-section').style.display = isPhotoCategory ? 'block' : 'none';
                if (isPhotoCategory) {
                    const editPhotoGrid = document.getElementById('edit-photo-grid');
                    editPhotoGrid.innerHTML = '';
                    (product.images || []).forEach(img => {
                        const photoItem = document.createElement('div');
                        photoItem.className = 'photo-item';
                        photoItem.innerHTML = `<img src="${img}" alt="Product Photo"><button type="button" class="delete-photo-btn"><i class="fas fa-times"></i></button>`;
                        editPhotoGrid.appendChild(photoItem);
                        photoItem.querySelector('.delete-photo-btn').addEventListener('click', (e_photo) => e_photo.currentTarget.closest('.photo-item').remove());
                    });
                }
                
                document.getElementById('edit-script-menu-section').style.display = category === 'Script' ? 'block' : 'none';
                if (category === 'Script') { document.getElementById('edit-script-menu-content').value = product.menuContent || ''; }
                
                openModal(editModal);
            });
        });
        
        if(addPhotoBtn) {
            addPhotoBtn.addEventListener('click', () => {
                const addPhotoInput = document.getElementById('add-photo-input');
                const newPhotoUrl = addPhotoInput.value.trim();
                if (newPhotoUrl) {
                    const newPhotoItem = document.createElement('div');
                    newPhotoItem.className = 'photo-item';
                    newPhotoItem.innerHTML = `<img src="${newPhotoUrl}" alt="Product Photo"><button type="button" class="delete-photo-btn"><i class="fas fa-times"></i></button>`;
                    document.getElementById('edit-photo-grid').appendChild(newPhotoItem);
                    newPhotoItem.querySelector('.delete-photo-btn').addEventListener('click', (e_photo) => e_photo.currentTarget.closest('.photo-item').remove());
                    addPhotoInput.value = '';
                } else { showToast('URL foto tidak boleh kosong.', 'error'); }
            });
        }

        if(saveEditBtn && !saveEditBtn.handler) {
            saveEditBtn.handler = async () => {
                const newWaNumber = editWhatsappNumberInput.value.trim();
                if (!validatePhoneNumber(newWaNumber)) return showToast("Format Nomor WA salah.", 'error');

                const hargaAsli = parseInt(editPriceInput.value, 10);
                const discountPrice = document.getElementById('edit-discount-price').value ? parseInt(document.getElementById('edit-discount-price').value, 10) : null;
                const discountEndDate = document.getElementById('edit-discount-date').value ? new Date(document.getElementById('edit-discount-date').value).toISOString() : null;
                
                let harga = hargaAsli;
                if (discountPrice !== null && discountPrice >= 0 && discountEndDate && new Date(discountEndDate) > new Date()) {
                    harga = discountPrice;
                }

                const productData = {
                    id: parseInt(document.getElementById('edit-product-id').value),
                    category: document.getElementById('edit-product-category').value,
                    nama: editNameInput.value.trim(),
                    hargaAsli, harga, discountPrice, discountEndDate,
                    deskripsiPanjang: editDescInput.value.trim().replace(/\n/g, ' || '),
                    images: [...document.getElementById('edit-photo-grid').querySelectorAll('.photo-item img')].map(img => img.src),
                    menuContent: document.getElementById('edit-script-menu-content').value.trim(),
                    nomorWA: newWaNumber
                };
                if (isNaN(productData.hargaAsli) || productData.hargaAsli < 0 || !productData.nama || !productData.deskripsiPanjang) {
                    return showToast('Data tidak valid (Nama, Harga Asli, Deskripsi harus diisi).', 'error');
                }
                saveEditBtn.textContent = 'Menyimpan...';
                saveEditBtn.disabled = true;
                try {
                    const result = await fetch(API_PRODUCTS_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'updateProduct', data: productData })
                    }).then(res => res.json());
                    if (result.message !== 'Produk berhasil diperbarui!') throw new Error(result.message);
                    showToast('Produk berhasil diperbarui.', 'success');
                    closeModal(document.getElementById('editProductModal')); 
                    manageCategorySelect.dispatchEvent(new Event('change'));
                } catch (err) {
                    showToast(err.message, 'error');
                } finally {
                    saveEditBtn.textContent = 'Simpan Perubahan';
                    saveEditBtn.disabled = false;
                }
            };
            saveEditBtn.addEventListener('click', saveEditBtn.handler);
        }
        
        let draggingItem = null;
        manageProductList.addEventListener('dragstart', (e) => {
            draggingItem = e.target;
            setTimeout(() => draggingItem.classList.add('dragging'), 0);
        });
        manageProductList.addEventListener('dragend', (e) => e.target.classList.remove('dragging'));
        manageProductList.addEventListener('dragover', (e) => {
            e.preventDefault(); 
            const afterElement = getDragAfterElement(manageProductList, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                 if (afterElement == null) manageProductList.appendChild(draggable);
                 else manageProductList.insertBefore(draggable, afterElement);
            }
        });
    }
    
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.delete-item:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else { return closest; }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    if(saveOrderButton) {
        saveOrderButton.addEventListener('click', async () => {
            const newOrder = [...manageProductList.children].map(item => parseInt(item.dataset.id));
            const category = manageCategorySelect.value;
            if (!category || newOrder.length === 0) return;
            saveOrderButton.disabled = true;
            try {
                const result = await fetch(API_PRODUCTS_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'reorderProducts', data: { category, order: newOrder } })
                }).then(res => res.json());
                if (result.message !== 'Urutan berhasil disimpan.') throw new Error(result.message);
                showToast('Urutan berhasil disimpan.', 'success');
            } catch (err) {
                showToast(err.message, 'error');
            } finally {
                saveOrderButton.disabled = false;
            }
        });
    }
    
    if(applyBulkPriceBtn) {
        applyBulkPriceBtn.addEventListener('click', async () => {
            const category = manageCategorySelect.value;
            const newBulkPrice = parseInt(bulkPriceInput.value, 10);
            if (!category || isNaN(newBulkPrice)) return;
            if (!(await showCustomConfirm(`Yakin mengubah harga SEMUA produk di "<b>${category}</b>" menjadi <b>${formatRupiah(newBulkPrice)}</b>?`))) return;
            applyBulkPriceBtn.disabled = true;
            try {
                const result = await fetch(API_PRODUCTS_URL, { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'updateProductsInCategory', data: { category, newPrice: newBulkPrice } })
                }).then(res => res.json());
                if (result.message.indexOf('berhasil diubah') === -1) throw new Error(result.message);
                showToast(result.message, 'success');
                bulkPriceInput.value = ''; 
                manageCategorySelect.dispatchEvent(new Event('change')); 
            } catch (err) {
                showToast(`Gagal: ${err.message}`, 'error');
            } finally {
                applyBulkPriceBtn.disabled = false;
            }
        });
    }
    
    if(resetPricesBtn) {
        resetPricesBtn.addEventListener('click', async () => {
            const category = manageCategorySelect.value;
            if (!category) return;
            if (!(await showCustomConfirm(`Yakin mengembalikan harga SEMUA produk di "<b>${category}</b>" ke harga awal?`))) return;
            resetPricesBtn.disabled = true;
            try {
                const result = await fetch(API_PRODUCTS_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'resetCategoryPrices', data: { category } })
                }).then(res => res.json());
                if (result.message.indexOf('berhasil dikembalikan') === -1) throw new Error(result.message);
                showToast(result.message, 'success');
                manageCategorySelect.dispatchEvent(new Event('change'));
            } catch (err) {
                showToast(`Gagal: ${err.message}`, 'error');
            } finally {
                resetPricesBtn.disabled = false;
            }
        });
    }

    // --- LOGIKA TAB "MANAJER DOMAIN" ---
    if(permanentKeyCheckbox) {
        permanentKeyCheckbox.addEventListener('change', (e) => {
            durationSection.style.display = e.target.checked ? 'none' : 'block';
        });
    }

    async function loadApiKeys() {
        apiKeyListContainer.innerHTML = 'Memuat...';
        try {
            const keys = await fetchAdminApi('getApiKeys', {});
            let html = '<h3><i class="fas fa-list"></i> Daftar API Key Aktif</h3>';
            if (Object.keys(keys).length === 0) {
                html += '<p>Belum ada API Key.</p>';
            } else {
                for (const key in keys) {
                    const expires = keys[key].expires_at === 'permanent' ? 'Permanen' : new Date(keys[key].expires_at).toLocaleString('id-ID');
                    html += `
                        <div class="delete-item">
                            <div class="item-header">
                                <span><strong>${key}</strong><br><small>Kadaluwarsa: ${expires}</small></span>
                                <div class="item-actions"> <button type="button" class="delete-btn delete-apikey-btn" data-key="${key}">Hapus</button> </div>
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
                                <div class="item-actions"> <button type="button" class="delete-btn delete-domain-btn" data-domain="${domain}">Hapus</button> </div>
                            </div>
                        </div>`;
                }
            }
            rootDomainListContainer.innerHTML = html;
        } catch (err) {
            rootDomainListContainer.innerHTML = `<p style="color: red;">Gagal memuat: ${err.message}</p>`;
        }
    }
    
    if(createApiKeyBtn) {
        createApiKeyBtn.addEventListener('click', async () => {
            const key = document.getElementById('new-apikey-name').value.trim();
            const duration = parseInt(document.getElementById('new-apikey-duration').value, 10);
            const unit = document.getElementById('new-apikey-unit').value;
            const isPermanent = permanentKeyCheckbox.checked;
            if (!key || (!isPermanent && (isNaN(duration) || duration <= 0))) return showToast('Nama Key dan Durasi harus valid.', 'error');

            createApiKeyBtn.textContent = 'Membuat...';
            createApiKeyBtn.disabled = true;
            try {
                const result = await fetchAdminApi('createApiKey', { key, duration, unit, isPermanent });
                showApiKeySuccessPopup(result.keyDetails); 
                document.getElementById('addApiKeyForm').reset();
                permanentKeyCheckbox.dispatchEvent(new Event('change'));
                loadApiKeys();
                closeModal(document.getElementById('addApiKeyModal'));
            } catch (err) {
                showToast(err.message, 'error');
            } finally {
                createApiKeyBtn.textContent = 'Buat API Key';
                createApiKeyBtn.disabled = false;
            }
        });
    }

    if(addDomainBtn) {
        addDomainBtn.addEventListener('click', async () => {
            const domain = document.getElementById('new-domain-name').value.trim();
            const zone = document.getElementById('new-domain-zone').value.trim();
            const apitoken = document.getElementById('new-domain-token').value.trim();
            if (!domain || !zone || !apitoken) return showToast('Semua kolom domain wajib diisi.', 'error');
            
            addDomainBtn.textContent = 'Menambah...';
            addDomainBtn.disabled = true;
            try {
                const result = await fetchAdminApi('addRootDomain', { domain, zone, apitoken });
                showToast(result.message, 'success');
                document.getElementById('addDomainForm').reset();
                loadRootDomains();
                closeModal(document.getElementById('addDomainModal'));
            } catch (err) {
                showToast(err.message, 'error');
            } finally {
                addDomainBtn.textContent = 'Tambah Domain';
                addDomainBtn.disabled = false;
            }
        });
    }

    // --- EVENT DELEGATION UNTUK SEMUA TOMBOL HAPUS ---
    document.body.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        if (!deleteBtn) return;
        const parent = deleteBtn.closest('.delete-item');

        // Hapus Produk
        if (deleteBtn.classList.contains('delete-product-btn')) {
            const id = parseInt(parent.dataset.id);
            const category = manageCategorySelect.value;
            if (await showCustomConfirm(`Yakin ingin menghapus produk <b>${parent.querySelector('span').textContent.split(' - ')[0]}</b>?`)) {
                try {
                    const result = await fetch(API_PRODUCTS_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'deleteProduct', data: { id, category } })
                    }).then(res => res.json());
                    if (result.message !== 'Produk berhasil dihapus.') throw new Error(result.message);
                    parent.remove();
                    showToast(result.message, 'success');
                } catch (err) { showToast(err.message, 'error'); }
            }
        }
        // Hapus API Key
        else if (deleteBtn.classList.contains('delete-apikey-btn')) {
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

    // --- INISIALISASI HALAMAN ---
    if (sessionStorage.getItem('isAdminAuthenticated')) {
        loginScreen.style.display = 'none';
        productFormScreen.style.display = 'block';
        loadSettings();
        document.querySelector('.tab-button[data-tab="addProduct"]').click();
    }
});
