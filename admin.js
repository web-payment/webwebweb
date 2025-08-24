document.addEventListener('DOMContentLoaded', () => {
    // --- Variabel Elemen ---
    const loginScreen = document.getElementById('login-screen');
    const productFormScreen = document.getElementById('product-form-screen');
    const toastContainer = document.getElementById('toast-container');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');
    const passwordToggle = document.getElementById('passwordToggle');
    const themeSwitchBtnLogin = document.getElementById('themeSwitchBtnLogin');
    const themeSwitchBtnPanel = document.getElementById('themeSwitchBtnPanel');
    const body = document.body;
    
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
    
    // Variabel Pengaturan
    const saveSettingsButton = document.getElementById('save-settings-button');
    const globalWhatsappNumberInput = document.getElementById('global-whatsapp-number');
    const apiKeyWhatsappNumberInput = document.getElementById('apikey-whatsapp-number');
    const categoryWhatsappNumbersContainer = document.getElementById('category-whatsapp-numbers-container');
    const saveApiKeyPricesButton = document.getElementById('save-api-key-prices-button');
    const apiKeyPriceSettingsContainer = document.getElementById('api-key-price-settings-container');
    const addNewPriceTierBtn = document.getElementById('add-new-price-tier-btn');
    
    // Variabel Modal Edit
    const editWhatsappNumberInput = document.getElementById('edit-whatsapp-number');

    // Variabel Manajer Domain
    const apiKeyListContainer = document.getElementById('apiKeyListContainer');
    const createApiKeyBtn = document.getElementById('create-apikey-btn');
    const rootDomainListContainer = document.getElementById('rootDomainListContainer');
    const addDomainBtn = document.getElementById('add-domain-btn');
    const permanentKeyCheckbox = document.getElementById('permanent-key');
    const durationSection = document.getElementById('duration-section');

    // --- Alamat API ---
    const API_PRODUCTS_URL = '/api/products';
    const API_CLOUDFLARE_URL = '/api/cloudflare';
    const API_BASE_URL = '/api'; 
    let activeToastTimeout = null;
    let siteSettings = {};
    let apiKeyPrices = [];
    
    // --- FUNGSI DASAR (Tema, Toast, Konfirmasi, Validasi Nomor) ---
    function setupBaseFunctions() {
        const savedTheme = localStorage.getItem('admin-theme') || 'light-mode';
        body.className = savedTheme;
        updateThemeButton();

        themeSwitchBtnLogin.addEventListener('click', toggleTheme);
        if (themeSwitchBtnPanel) themeSwitchBtnPanel.addEventListener('click', toggleTheme);
        
        passwordToggle.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            passwordToggle.querySelector('i').className = `fas fa-${type === 'password' ? 'eye-slash' : 'eye'}`;
        });

        document.querySelectorAll('.modal .close-button').forEach(btn => {
            btn.addEventListener('click', e => closeModal(e.target.closest('.modal')));
        });
        document.getElementById('show-add-apikey-modal-btn').addEventListener('click', () => openModal(document.getElementById('addApiKeyModal')));
        document.getElementById('show-add-domain-modal-btn').addEventListener('click', () => openModal(document.getElementById('addDomainModal')));
    }

    function updateThemeButton() {
        const iconClass = body.classList.contains('dark-mode') ? 'fa-sun' : 'fa-moon';
        if(themeSwitchBtnLogin) themeSwitchBtnLogin.querySelector('i').className = `fas ${iconClass}`;
        if (themeSwitchBtnPanel) themeSwitchBtnPanel.querySelector('i').className = `fas ${iconClass}`;
    }

    function toggleTheme() {
        body.classList.toggle('dark-mode');
        body.classList.toggle('light-mode');
        localStorage.setItem('admin-theme', body.className);
        updateThemeButton();
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

    function openModal(modal) { if(modal) modal.classList.add('is-visible'); }
    function closeModal(modal) { if(modal) modal.classList.remove('is-visible'); }

    function showCustomConfirm(message) {
        confirmMessage.innerHTML = message;
        openModal(customConfirmModal);
        return new Promise((resolve) => {
            confirmOkBtn.onclick = () => { closeModal(customConfirmModal); resolve(true); };
            confirmCancelBtn.onclick = () => { closeModal(customConfirmModal); resolve(false); };
            customConfirmModal.onclick = (e) => { if(e.target === customConfirmModal) { closeModal(customConfirmModal); resolve(false); }};
        });
    }

    function validatePhoneNumber(number) { return !number || /^[1-9]\d*$/.test(number); }

    function formatRupiah(number) {
        if (isNaN(number)) return "Rp 0";
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

    // --- LOGIKA LOGIN & NAVIGASI ---
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
            await initializeAdminContent();
        } catch (e) {
            showToast(e.message || 'Password salah.', 'error');
        } finally {
            loginButton.textContent = 'Masuk';
            loginButton.disabled = false;
        }
    };
    loginButton.addEventListener('click', handleLogin);
    passwordInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleLogin(); });

    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(button.dataset.tab).classList.add('active');
            
            if (button.dataset.tab === 'manageProducts' && manageCategorySelect.value) manageCategorySelect.dispatchEvent(new Event('change'));
            if (button.dataset.tab === 'domainManager') { loadApiKeys(); loadRootDomains(); }
        });
    });

    // --- LOGIKA TAB PENGATURAN ---
    async function loadWaSettings() {
        try {
            const res = await fetch(`${API_BASE_URL}/getSettings`);
            siteSettings = res.ok ? await res.json() : {};
            globalWhatsappNumberInput.value = siteSettings.globalPhoneNumber || '';
            apiKeyWhatsappNumberInput.value = siteSettings.apiKeyPurchaseNumber || '';
            
            categoryWhatsappNumbersContainer.innerHTML = '<h3><i class="fas fa-list-alt"></i> Nomor WA per Kategori (Opsional)</h3>';
            const categoriesInSettings = siteSettings.categoryPhoneNumbers || {};
            [...manageCategorySelect.options].filter(opt => opt.value).forEach(opt => {
                const cat = opt.value;
                const div = document.createElement('div');
                div.className = 'category-wa-input';
                div.innerHTML = `<label for="wa-${cat}">${cat}:</label><input type="text" id="wa-${cat}" data-category="${cat}" value="${categoriesInSettings[cat] || ''}" placeholder="Kosongkan untuk pakai global">`;
                categoryWhatsappNumbersContainer.appendChild(div);
            });
        } catch (err) { showToast(err.message, 'error'); }
    }

    async function loadApiKeyPriceSettings() {
        try {
            const res = await fetch(`/apikey-prices.json?v=${Date.now()}`);
            apiKeyPrices = res.ok ? await res.json() : [];
        } catch (err) { apiKeyPrices = []; }
        renderApiKeyPriceSettings();
    }

    function renderApiKeyPriceSettings() {
        apiKeyPriceSettingsContainer.innerHTML = '';
        if (apiKeyPrices.length === 0) apiKeyPrices.push({ tier: '7 Hari', price: 5000, discountPrice: '', discountEndDate: '' });
        
        apiKeyPrices.forEach((tier, index) => {
            const div = document.createElement('div');
            div.className = 'delete-item';
            div.innerHTML = `<div class="item-header" style="flex-direction: column; align-items: flex-start; gap: 15px;"><div style="width: 100%; display: flex; gap: 10px;"><input type="text" class="price-tier-name" placeholder="Nama Durasi (e.g., 7 Hari)" value="${tier.tier || ''}"><button type="button" class="delete-btn delete-price-tier-btn" data-index="${index}" style="width: auto; padding: 10px 12px;"><i class="fas fa-trash-alt"></i></button></div><div style="width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;"><input type="number" class="price-tier-price" placeholder="Harga Asli" value="${tier.price || ''}"><input type="number" class="price-tier-discount-price" placeholder="Harga Diskon" value="${tier.discountPrice || ''}"></div><label style="margin: 5px 0; font-size: 0.85em;">Tgl Berakhir Diskon:</label><input type="datetime-local" class="price-tier-discount-date" value="${tier.discountEndDate ? tier.discountEndDate.slice(0, 16) : ''}"></div>`;
            apiKeyPriceSettingsContainer.appendChild(div);
        });
        apiKeyPriceSettingsContainer.querySelectorAll('.delete-price-tier-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                apiKeyPrices.splice(parseInt(e.currentTarget.dataset.index, 10), 1);
                renderApiKeyPriceSettings();
            });
        });
    }

    addNewPriceTierBtn.addEventListener('click', () => {
        apiKeyPrices.push({ tier: '', price: '', discountPrice: '', discountEndDate: '' });
        renderApiKeyPriceSettings();
    });

    saveSettingsButton.addEventListener('click', async () => {
        const globalNumber = globalWhatsappNumberInput.value.trim();
        const apiKeyWaNumber = apiKeyWhatsappNumberInput.value.trim();
        if (!validatePhoneNumber(globalNumber) || !globalNumber || !validatePhoneNumber(apiKeyWaNumber) || !apiKeyWaNumber) return showToast("Nomor WA Global & API Key wajib diisi.", 'error');
        
        const categoryNumbers = {};
        let isCategoryValid = true;
        categoryWhatsappNumbersContainer.querySelectorAll('input[data-category]').forEach(input => {
            const num = input.value.trim();
            if (num && !validatePhoneNumber(num)) {
                showToast(`Format Nomor WA kategori ${input.dataset.category} salah.`, 'error');
                isCategoryValid = false;
            }
            categoryNumbers[input.dataset.category] = num;
        });
        if (!isCategoryValid) return;

        saveSettingsButton.disabled = true;
        try {
            const res = await fetch(`${API_BASE_URL}/updateSettings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Admin-Password': sessionStorage.getItem('adminPassword') },
                body: JSON.stringify({ globalPhoneNumber: globalNumber, apiKeyPurchaseNumber: apiKeyWaNumber, categoryPhoneNumbers: categoryNumbers })
            });
            if (!res.ok) throw new Error((await res.json()).message);
            showToast('Pengaturan nomor berhasil disimpan!', 'success');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            saveSettingsButton.disabled = false;
        }
    });

    saveApiKeyPricesButton.addEventListener('click', async () => {
        const newApiKeyPrices = [];
        let isPriceValid = true;
        apiKeyPriceSettingsContainer.querySelectorAll('.delete-item').forEach(el => {
            const tierName = el.querySelector('.price-tier-name').value.trim();
            const price = el.querySelector('.price-tier-price').value;
            if (!tierName || !price) isPriceValid = false;
            newApiKeyPrices.push({
                tier: tierName,
                price: parseInt(price, 10) || 0,
                discountPrice: el.querySelector('.price-tier-discount-price').value ? parseInt(el.querySelector('.price-tier-discount-price').value, 10) : '',
                discountEndDate: el.querySelector('.price-tier-discount-date').value ? new Date(el.querySelector('.price-tier-discount-date').value).toISOString() : ''
            });
        });
        if (!isPriceValid) return showToast('Nama Durasi dan Harga Asli wajib diisi.', 'error');
        
        saveApiKeyPricesButton.disabled = true;
        try {
            const res = await fetch(`${API_BASE_URL}/updateApiKeyPrices`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Admin-Password': sessionStorage.getItem('adminPassword') },
                body: JSON.stringify(newApiKeyPrices)
            });
            if (!res.ok) throw new Error((await res.json()).message);
            showToast('Pengaturan harga API Key berhasil disimpan!', 'success');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            saveApiKeyPricesButton.disabled = false;
        }
    });
    
    // --- LOGIKA PRODUK (UTUH DARI FILE ANDA) ---
    categorySelect.addEventListener('change', () => {
        const category = categorySelect.value;
        stockPhotoSection.style.display = (category === 'Stock Akun' || category === 'Logo') ? 'block' : 'none';
        scriptMenuSection.style.display = category === 'Script' ? 'block' : 'none';
    });
    addButton.addEventListener('click', async (e) => { 
        e.preventDefault(); 
        const waNumber = productWhatsappNumberInput.value.trim();
        if (!validatePhoneNumber(waNumber)) return showToast("Format Nomor WA salah. Contoh: 628...", 'error');
        
        const productData = {
            category: categorySelect.value,
            nama: nameInput.value.trim(),
            harga: parseInt(priceInput.value, 10),
            deskripsiPanjang: descriptionInput.value.trim(),
            images: photosInput.value.split(',').map(l => l.trim()).filter(Boolean),
            nomorWA: waNumber,
            menuContent: scriptMenuContentInput.value.trim()
        };
        if (!productData.nama || isNaN(productData.harga) || productData.harga < 0 || !productData.deskripsiPanjang) return showToast('Semua kolom wajib diisi.', 'error');
        
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
            showToast(err.message, 'error');
        } finally {
            addButton.textContent = 'Tambah Produk';
            addButton.disabled = false;
        }
    });
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
            const res = await fetch(`/products.json?v=${Date.now()}`);
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
    function renderManageList(productsToRender, category) {
        manageProductList.innerHTML = '';
        productsToRender.forEach(prod => {
            const isNew = prod.createdAt && Date.now() - new Date(prod.createdAt).getTime() < 24 * 60 * 60 * 1000;
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
            item.innerHTML = `<div class="item-header"><span>${prod.nama} - ${priceDisplay} ${isNew ? '<span class="new-badge">NEW</span>' : ''}</span><div class="item-actions"><button type="button" class="edit-btn" data-id="${prod.id}"><i class="fas fa-edit"></i> Edit</button><button type="button" class="delete-btn delete-product-btn" data-id="${prod.id}"><i class="fas fa-trash-alt"></i> Hapus</button></div></div>`;
            manageProductList.appendChild(item);
        });
        setupManageActions(category, productsToRender);
    }
    function setupManageActions(category, productsInCat) {
        const editModal = document.getElementById('editProductModal');
        manageProductList.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.dataset.id);
                const product = productsInCat.find(p => p.id === productId);
                if (!product) return showToast('Produk tidak ditemukan.', 'error');
                
                document.getElementById('edit-product-id').value = product.id;
                document.getElementById('edit-product-category').value = category;
                document.getElementById('editModalTitle').innerHTML = `<i class="fas fa-edit"></i> Edit: ${product.nama}`;
                document.getElementById('edit-name').value = product.nama;
                document.getElementById('edit-price').value = product.hargaAsli || product.harga;
                document.getElementById('edit-discount-price').value = product.discountPrice || '';
                document.getElementById('edit-discount-date').value = product.discountEndDate ? product.discountEndDate.slice(0, 16) : '';
                document.getElementById('edit-desc').value = product.deskripsiPanjang ? product.deskripsiPanjang.replace(/ \|\| /g, '\n') : '';
                document.getElementById('edit-whatsapp-number').value = product.nomorWA || '';
                
                const editPhotoSection = document.getElementById('edit-photo-section');
                const isPhotoCategory = category === 'Stock Akun' || category === 'Logo';
                editPhotoSection.style.display = isPhotoCategory ? 'block' : 'none';
                if (isPhotoCategory) {
                    const editPhotoGrid = document.getElementById('edit-photo-grid');
                    editPhotoGrid.innerHTML = '';
                    (product.images || []).forEach(img => {
                        const photoItem = document.createElement('div');
                        photoItem.className = 'photo-item';
                        photoItem.innerHTML = `<img src="${img}" alt="Product Photo"><button type="button" class="delete-photo-btn"><i class="fas fa-times"></i></button>`;
                        editPhotoGrid.appendChild(photoItem);
                        photoItem.querySelector('.delete-photo-btn').addEventListener('click', e_photo => e_photo.currentTarget.closest('.photo-item').remove());
                    });
                }
                document.getElementById('edit-script-menu-section').style.display = category === 'Script' ? 'block' : 'none';
                if (category === 'Script') document.getElementById('edit-script-menu-content').value = product.menuContent || '';
                
                openModal(editModal);
            });
        });
        let draggingItem = null;
        manageProductList.addEventListener('dragstart', e => {
            draggingItem = e.currentTarget;
            setTimeout(() => draggingItem.classList.add('dragging'), 0);
        });
        manageProductList.addEventListener('dragend', e => e.currentTarget.classList.remove('dragging'));
        manageProductList.addEventListener('dragover', e => {
            e.preventDefault(); 
            const afterElement = getDragAfterElement(manageProductList, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                 if (afterElement == null) manageProductList.appendChild(draggable);
                 else manageProductList.insertBefore(draggable, afterElement);
            }
        });
    }
    document.getElementById('add-photo-btn').addEventListener('click', () => {
        const addPhotoInput = document.getElementById('add-photo-input');
        const newPhotoUrl = addPhotoInput.value.trim();
        if (newPhotoUrl) {
            const newPhotoItem = document.createElement('div');
            newPhotoItem.className = 'photo-item';
            newPhotoItem.innerHTML = `<img src="${newPhotoUrl}" alt="Product Photo"><button type="button" class="delete-photo-btn"><i class="fas fa-times"></i></button>`;
            document.getElementById('edit-photo-grid').appendChild(newPhotoItem);
            newPhotoItem.querySelector('.delete-photo-btn').addEventListener('click', e => e.currentTarget.closest('.photo-item').remove());
            addPhotoInput.value = '';
        } else { showToast('URL foto tidak boleh kosong.', 'error'); }
    });
    document.getElementById('save-edit-btn').addEventListener('click', async () => {
        const newWaNumber = document.getElementById('edit-whatsapp-number').value.trim();
        if (!validatePhoneNumber(newWaNumber)) return showToast("Format Nomor WA salah.", 'error');

        const hargaAsli = parseInt(document.getElementById('edit-price').value, 10);
        const discountPrice = document.getElementById('edit-discount-price').value ? parseInt(document.getElementById('edit-discount-price').value, 10) : null;
        const discountEndDate = document.getElementById('edit-discount-date').value ? new Date(document.getElementById('edit-discount-date').value).toISOString() : null;
        let harga = hargaAsli;
        if (discountPrice !== null && discountPrice >= 0 && discountEndDate && new Date(discountEndDate) > new Date()) {
            harga = discountPrice;
        }

        const productData = {
            id: parseInt(document.getElementById('edit-product-id').value),
            category: document.getElementById('edit-product-category').value,
            nama: document.getElementById('edit-name').value.trim(),
            hargaAsli, harga, discountPrice, discountEndDate,
            deskripsiPanjang: document.getElementById('edit-desc').value.trim().replace(/\n/g, ' || '),
            images: [...document.getElementById('edit-photo-grid').querySelectorAll('.photo-item img')].map(img => img.src),
            menuContent: document.getElementById('edit-script-menu-content').value.trim(),
            nomorWA: newWaNumber
        };
        if (isNaN(productData.hargaAsli) || !productData.nama || !productData.deskripsiPanjang) return showToast('Nama, Harga Asli, & Deskripsi harus diisi.', 'error');
        
        const saveEditBtn = document.getElementById('save-edit-btn');
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
            saveEditBtn.disabled = false;
        }
    });
    saveOrderButton.addEventListener('click', async () => {
        const newOrder = [...manageProductList.children].map(item => parseInt(item.dataset.id));
        const category = manageCategorySelect.value;
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
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.delete-item:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) return { offset, element: child };
            return closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    // --- LOGIKA MANAJER DOMAIN & HAPUS ITEM ---
    permanentKeyCheckbox.addEventListener('change', (e) => {
        durationSection.style.display = e.target.checked ? 'none' : 'block';
    });
    async function loadApiKeys() {
        apiKeyListContainer.innerHTML = 'Memuat...';
        try {
            const keys = await fetchAdminApi('getApiKeys', {});
            apiKeyListContainer.innerHTML = '<h3><i class="fas fa-list"></i> Daftar API Key Aktif</h3>';
            if (Object.keys(keys).length === 0) {
                apiKeyListContainer.innerHTML += '<p>Belum ada API Key.</p>';
            } else {
                for (const key in keys) {
                    const expires = keys[key].expires_at === 'permanent' ? 'Permanen' : new Date(keys[key].expires_at).toLocaleString('id-ID');
                    apiKeyListContainer.innerHTML += `<div class="delete-item"> <div class="item-header"> <span><strong>${key}</strong><br><small>Kadaluwarsa: ${expires}</small></span> <div class="item-actions"><button type="button" class="delete-btn delete-apikey-btn" data-key="${key}">Hapus</button></div> </div> </div>`;
                }
            }
        } catch (err) { apiKeyListContainer.innerHTML = `<p style="color: red;">Gagal memuat: ${err.message}</p>`; }
    }
    async function loadRootDomains() {
        rootDomainListContainer.innerHTML = 'Memuat...';
        try {
            const domains = await fetchAdminApi('getRootDomainsAdmin', {});
            rootDomainListContainer.innerHTML = '<h3><i class="fas fa-list"></i> Daftar Domain Aktif</h3>';
            if (Object.keys(domains).length === 0) {
                rootDomainListContainer.innerHTML += '<p>Belum ada Domain Utama.</p>';
            } else {
                for (const domain in domains) {
                    rootDomainListContainer.innerHTML += `<div class="delete-item"><div class="item-header"><span><strong>${domain}</strong></span><div class="item-actions"><button type="button" class="delete-btn delete-domain-btn" data-domain="${domain}">Hapus</button></div></div></div>`;
                }
            }
        } catch (err) { rootDomainListContainer.innerHTML = `<p style="color: red;">Gagal memuat: ${err.message}</p>`; }
    }
    createApiKeyBtn.addEventListener('click', async () => {
        const key = document.getElementById('new-apikey-name').value.trim();
        const duration = parseInt(document.getElementById('new-apikey-duration').value, 10);
        const unit = document.getElementById('new-apikey-unit').value;
        const isPermanent = permanentKeyCheckbox.checked;
        if (!key || (!isPermanent && (isNaN(duration) || duration <= 0))) return showToast('Nama Key dan Durasi harus valid.', 'error');
        
        createApiKeyBtn.disabled = true;
        createApiKeyBtn.textContent = 'Membuat...';
        try {
            await fetchAdminApi('createApiKey', { key, duration, unit, isPermanent });
            
            const now = new Date();
            let expires_at = 'permanent';
            if (!isPermanent) {
                const expiryDate = new Date(now);
                if (unit === 'days') expiryDate.setDate(now.getDate() + duration);
                if (unit === 'weeks') expiryDate.setDate(now.getDate() + duration * 7);
                if (unit === 'months') expiryDate.setMonth(now.getMonth() + duration);
                if (unit === 'years') expiryDate.setFullYear(now.getFullYear() + duration);
                expires_at = expiryDate.toISOString();
            }
            
            showApiKeySuccessPopup({ key, created_at: now.toISOString(), expires_at });
            document.getElementById('addApiKeyForm').reset();
            permanentKeyCheckbox.dispatchEvent(new Event('change'));
            loadApiKeys();
            closeModal(document.getElementById('addApiKeyModal'));
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            createApiKeyBtn.disabled = false;
            createApiKeyBtn.textContent = 'Buat API Key';
        }
    });
    function showApiKeySuccessPopup(keyDetails) {
        const modal = document.getElementById('apiKeySuccessModal');
        const detailsTextarea = document.getElementById('apiKeyDetails');
        const copyBtn = document.getElementById('copyApiKeyDetailsBtn');
        const createdAt = new Date(keyDetails.created_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' });
        const expiresAt = keyDetails.expires_at === 'permanent' ? 'Permanen' : new Date(keyDetails.expires_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' });
        detailsTextarea.value = `DETAIL API KEY\n-------------------------\nKey         : ${keyDetails.key}\nDibuat pada : ${createdAt}\nKadaluwarsa : ${expiresAt}\n-------------------------\nHarap simpan baik-baik.`;
        openModal(modal);
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(detailsTextarea.value).then(() => {
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Tersalin!';
                setTimeout(() => { copyBtn.innerHTML = '<i class="fas fa-copy"></i> Salin Detail'; }, 2000);
            });
        };
    }
    addDomainBtn.addEventListener('click', async () => {
        const domain = document.getElementById('new-domain-name').value.trim();
        const zone = document.getElementById('new-domain-zone').value.trim();
        const apitoken = document.getElementById('new-domain-token').value.trim();
        if (!domain || !zone || !apitoken) return showToast('Semua kolom domain wajib diisi.', 'error');
        
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
            addDomainBtn.disabled = false;
        }
    });
    document.body.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        if (!deleteBtn) return;

        if (deleteBtn.classList.contains('delete-product-btn')) {
            const parent = deleteBtn.closest('.delete-item');
            const id = parseInt(parent.dataset.id);
            const category = manageCategorySelect.value;
            if (await showCustomConfirm(`Yakin hapus produk <b>${parent.querySelector('span').textContent.split(' - ')[0]}</b>?`)) {
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
        else if (deleteBtn.classList.contains('delete-apikey-btn')) {
            const key = deleteBtn.dataset.key;
            if (await showCustomConfirm(`Yakin hapus API Key "<b>${key}</b>"?`)) {
                try {
                    const result = await fetchAdminApi('deleteApiKey', { key });
                    showToast(result.message, 'success');
                    loadApiKeys();
                } catch (err) { showToast(err.message, 'error'); }
            }
        }
        else if (deleteBtn.classList.contains('delete-domain-btn')) {
            const domain = deleteBtn.dataset.domain;
            if (await showCustomConfirm(`Yakin hapus Domain "<b>${domain}</b>"?`)) {
                 try {
                    const result = await fetchAdminApi('deleteRootDomain', { domain });
                    showToast(result.message, 'success');
                    loadRootDomains();
                } catch (err) { showToast(err.message, 'error'); }
            }
        }
    });

    // --- INISIALISASI HALAMAN ---
    async function initializeAdminContent() {
        document.querySelector('.tab-button[data-tab="addProduct"]').click();
        await loadWaSettings();
        await loadApiKeyPriceSettings();
    }
    
    setupBaseFunctions();
    if (sessionStorage.getItem('isAdminAuthenticated')) {
        loginScreen.style.display = 'none';
        productFormScreen.style.display = 'block';
        initializeAdminContent();
    } else {
        loginScreen.style.display = 'flex';
        productFormScreen.style.display = 'none';
    }
});