document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const productFormScreen = document.getElementById('product-form-screen');
    const toastContainer = document.getElementById('toast-container');

    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');
    const passwordToggle = document.getElementById('passwordToggle');

    const themeSwitchBtnLogin = document.getElementById('themeSwitchBtnLogin');
    const themeSwitchBtnPanel = document.getElementById('themeSwitchBtnPanel');
    const body = document.body;

    const savedTheme = localStorage.getItem('admin-theme') || 'light-mode';
    body.className = savedTheme;
    function updateThemeButton() {
        const iconClass = body.classList.contains('dark-mode') ? 'fa-sun' : 'fa-moon';
        themeSwitchBtnLogin.querySelector('i').className = `fas ${iconClass}`;
        if (themeSwitchBtnPanel) {
            themeSwitchBtnPanel.querySelector('i').className = `fas ${iconClass}`;
        }
    }
    updateThemeButton();

    function toggleTheme() {
        if (body.classList.contains('light-mode')) {
            body.classList.replace('light-mode', 'dark-mode');
            localStorage.setItem('admin-theme', 'dark-mode');
        } else {
            body.classList.replace('dark-mode', 'light-mode');
            localStorage.setItem('admin-theme', 'light-mode');
        }
        updateThemeButton();
    }
    themeSwitchBtnLogin.addEventListener('click', toggleTheme);
    if (themeSwitchBtnPanel) {
        themeSwitchBtnPanel.addEventListener('click', toggleTheme);
    }
    
    // Toggle Password Visibility
    passwordToggle.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        passwordToggle.querySelector('i').className = `fas ${type === 'password' ? 'fa-eye-slash' : 'fa-eye'}`;
    });

    const categorySelect = document.getElementById('category');
    const nameInput = document.getElementById('product-name');
    const priceInput = document.getElementById('product-price');
    const descriptionInput = document.getElementById('product-description');
    const scriptMenuSection = document.getElementById('scriptMenuSection');
    const scriptMenuContentInput = document.getElementById('script-menu-content');
    const stockPhotoSection = document.getElementById('stock-photo-section');
    const photosInput = document.getElementById('product-photos');
    const addButton = document.getElementById('add-product-button');

    const manageCategorySelect = document.getElementById('manage-category');
    const manageProductList = document.getElementById('manage-product-list');
    const saveOrderButton = document.getElementById('save-order-button');
    let currentProducts = [];

    const API_BASE_URL = '/api';
    let activeToastTimeout = null;

    function showToast(message, type = 'info', duration = 3000) {
        // Hapus toast yang ada sebelum menampilkan yang baru
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
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            sessionStorage.setItem('isAdminAuthenticated', 'true');
            loginScreen.style.display = 'none';
            productFormScreen.style.display = 'block';
            showToast('Login berhasil!', 'success');
        } catch (e) {
            showToast(e.message || 'Password salah.', 'error');
        } finally {
            loginButton.textContent = 'Masuk';
            loginButton.disabled = false;
        }
    };
    loginButton.addEventListener('click', handleLogin);
    passwordInput.addEventListener('keypress', e => e.key === 'Enter' && handleLogin());

    categorySelect.addEventListener('change', () => {
        const category = categorySelect.value;
        stockPhotoSection.style.display = (category === 'Stock Akun' || category === 'Logo') ? 'block' : 'none';
        scriptMenuSection.style.display = category === 'Script' ? 'block' : 'none';
    });


    addButton.addEventListener('click', async () => {
        const productData = {
            category: categorySelect.value,
            nama: nameInput.value.trim(),
            harga: parseInt(priceInput.value, 10),
            deskripsiPanjang: descriptionInput.value.trim(),
            images: photosInput.value.split(',').map(l => l.trim()).filter(Boolean),
            createdAt: new Date().toISOString()
        };
        if (productData.category === 'Script') {
            productData.menuContent = scriptMenuContentInput.value.trim();
        }

        if (!productData.nama || !productData.harga || !productData.deskripsiPanjang) {
            return showToast('Semua kolom wajib diisi.', 'error');
        }
        addButton.textContent = 'Memproses...';
        addButton.disabled = true;
        try {
            const res = await fetch(`${API_BASE_URL}/addProduct`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.message);
            showToast(`Produk "${productData.nama}" berhasil ditambahkan.`, 'success');
            // Reset form
            nameInput.value = '';
            priceInput.value = '';
            descriptionInput.value = '';
            photosInput.value = '';
            scriptMenuContentInput.value = '';
            categorySelect.value = 'Panel'; // Reset ke kategori default
            categorySelect.dispatchEvent(new Event('change')); // Picu perubahan untuk menyembunyikan/menampilkan seksi yang relevan
        } catch (err) {
            showToast(err.message || 'Gagal menambahkan produk.', 'error');
        } finally {
            addButton.textContent = 'Tambah Produk';
            addButton.disabled = false;
        }
    });

    // Logika tab
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.admin-tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(button.dataset.tab).classList.add('active');
            if (button.dataset.tab === 'manageProducts') {
                // Pastikan untuk memicu pemuatan ulang daftar produk saat tab "Kelola Produk" diaktifkan
                // ini akan memuat produk sesuai urutan terbaru
                manageCategorySelect.value = ''; // Reset pilihan kategori
                manageProductList.innerHTML = ''; // Kosongkan daftar
                saveOrderButton.style.display = 'none'; // Sembunyikan tombol simpan urutan
            }
        });
    });

    // Kelola Produk (sekarang berada di tab)
    manageCategorySelect.addEventListener('change', async () => {
        manageProductList.innerHTML = 'Memuat...';
        const category = manageCategorySelect.value;
        if (!category) {
            manageProductList.innerHTML = '';
            saveOrderButton.style.display = 'none';
            return;
        }
        try {
            // Tambahkan timestamp untuk mencegah cache pada products.json
            const timestamp = new Date().getTime();
            const res = await fetch(`/products.json?v=${timestamp}`);
            const data = await res.json();
            const productsInCat = data[category] || [];
            if (productsInCat.length === 0) {
                manageProductList.innerHTML = '<p>Tidak ada produk di kategori ini.</p>';
                saveOrderButton.style.display = 'none';
                return;
            }
            renderManageList(productsInCat, category);
            saveOrderButton.style.display = 'block';
        } catch (err) {
            console.error("Error loading products:", err); // Log error
            manageProductList.innerHTML = '<p>Gagal memuat produk.</p>';
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
            
            const priceDisplay = prod.hargaAsli && prod.hargaAsli > prod.harga
                ? `<span class="original-price"><del>Rp${prod.hargaAsli}</del></span> <span class="discounted-price">Rp${prod.harga}</span>`
                : `<span>Rp${prod.harga}</span>`;
            
            item.innerHTML = `
                <div class="item-header">
                    <span>${prod.nama} - ${priceDisplay} ${isNew ? '<span class="new-badge">NEW</span>' : ''}</span>
                    <div class="item-actions">
                        <button class="edit-btn" data-id="${prod.id}"><i class="fas fa-edit"></i> Edit</button>
                        <button class="delete-btn"><i class="fas fa-trash-alt"></i> Hapus</button>
                    </div>
                </div>
            `;
            manageProductList.appendChild(item);
        });

        setupManageActions(category, productsToRender);
    }
    
    function setupManageActions(category, productsInCat) {
        // Hapus Produk
        manageProductList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async e => {
                const parent = e.target.closest('.delete-item');
                const id = parseInt(parent.dataset.id);
                try {
                    const res = await fetch('/api/deleteProduct', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id, category: category })
                    });
                    const result = await res.json();
                    if (!res.ok) throw new Error(result.message);
                    showToast(result.message, 'success');
                    parent.remove();
                } catch (err) {
                    showToast(err.message, 'error');
                }
            });
        });

        // Logika Modal Edit
        const editModal = document.getElementById('editProductModal');
        const closeEditModalBtn = document.getElementById('closeEditModal');
        const editModalTitle = document.getElementById('editModalTitle');
        const saveEditBtn = document.getElementById('save-edit-btn');
        
        const editProductId = document.getElementById('edit-product-id');
        const editProductCategory = document.getElementById('edit-product-category');
        const editNameInput = document.getElementById('edit-name');
        const editPriceInput = document.getElementById('edit-price');
        const editDescInput = document.getElementById('edit-desc');
        const editPhotoSection = document.getElementById('edit-photo-section');
        const editPhotoGrid = document.getElementById('edit-photo-grid');
        const addPhotoInput = document.getElementById('add-photo-input');
        const addPhotoBtn = document.getElementById('add-photo-btn');
        const editScriptMenuSection = document.getElementById('edit-script-menu-section');
        const editScriptMenuContent = document.getElementById('edit-script-menu-content');
        
        // Buka Modal
        manageProductList.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = parseInt(btn.dataset.id);
                const product = productsInCat.find(p => p.id === productId);
                if (!product) return showToast('Produk tidak ditemukan.', 'error');
                
                editProductId.value = product.id;
                editProductCategory.value = category;
                editModalTitle.innerHTML = `<i class="fas fa-edit"></i> Edit Produk: ${product.nama}`;
                editNameInput.value = product.nama;
                editPriceInput.value = product.harga;
                editDescInput.value = product.deskripsiPanjang.replace(/ \|\| /g, '\n');
                
                // Atur visibilitas dan konten berdasarkan kategori
                if (category === 'Stock Akun' || category === 'Logo') {
                    editPhotoSection.style.display = 'block';
                    editPhotoGrid.innerHTML = '';
                    (product.images || []).forEach(img => {
                        const photoItem = document.createElement('div');
                        photoItem.className = 'photo-item';
                        photoItem.innerHTML = `<img src="${img}" alt="Product Photo"><button type="button" class="delete-photo-btn"><i class="fas fa-times"></i></button>`;
                        editPhotoGrid.appendChild(photoItem);
                        // Tambahkan event listener untuk tombol hapus foto yang baru ditambahkan
                        photoItem.querySelector('.delete-photo-btn').addEventListener('click', (e) => {
                            e.stopPropagation(); // Mencegah event klik menyebar ke parent
                            e.target.closest('.photo-item').remove();
                        });
                    });
                } else {
                    editPhotoSection.style.display = 'none';
                }
                
                if (category === 'Script') {
                    editScriptMenuSection.style.display = 'block';
                    editScriptMenuContent.value = product.menuContent || '';
                } else {
                    editScriptMenuSection.style.display = 'none';
                }
                
                editModal.classList.add('is-visible');
            });
        });

        // Tutup Modal
        closeEditModalBtn.addEventListener('click', () => editModal.classList.remove('is-visible'));
        window.addEventListener('click', (e) => {
            if (e.target === editModal) {
                editModal.classList.remove('is-visible');
            }
        });
        
        // Tambah Foto dari Modal
        addPhotoBtn.addEventListener('click', () => {
            const newPhotoUrl = addPhotoInput.value.trim();
            if (newPhotoUrl) {
                const newPhotoItem = document.createElement('div');
                newPhotoItem.className = 'photo-item';
                newPhotoItem.innerHTML = `<img src="${newPhotoUrl}" alt="Product Photo"><button type="button" class="delete-photo-btn"><i class="fas fa-times"></i></button>`;
                editPhotoGrid.appendChild(newPhotoItem);
                // Tambahkan event listener untuk tombol hapus foto yang baru ditambahkan
                newPhotoItem.querySelector('.delete-photo-btn').addEventListener('click', (e) => {
                    e.stopPropagation(); // Mencegah event klik menyebar ke parent
                    e.target.closest('.photo-item').remove();
                });
                addPhotoInput.value = '';
            } else {
                showToast('URL foto tidak boleh kosong.', 'error');
            }
        });

        // Simpan Perubahan dari Modal
        saveEditBtn.addEventListener('click', async () => {
            const id = parseInt(editProductId.value);
            const categoryToUpdate = editProductCategory.value;
            const newName = editNameInput.value;
            const newPrice = parseInt(editPriceInput.value, 10);
            const newDesc = editDescInput.value.replace(/\n/g, ' || ');
            
            let newImages = null;
            if (categoryToUpdate === 'Stock Akun' || categoryToUpdate === 'Logo') {
                newImages = [...editPhotoGrid.querySelectorAll('.photo-item img')].map(img => img.src);
            }
            
            let newMenuContent = null;
            if (categoryToUpdate === 'Script') {
                newMenuContent = editScriptMenuContent.value;
            }

            if (isNaN(newPrice) || newPrice < 0 || !newName || !newDesc) {
                return showToast('Data tidak valid (Nama, Harga, Deskripsi harus diisi dan harga harus angka positif).', 'error');
            }
            
            saveEditBtn.textContent = '...';
            saveEditBtn.disabled = true;

            try {
                const res = await fetch(`${API_BASE_URL}/updateProduct`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, category: categoryToUpdate, newName, newPrice, newDesc, newImages, newMenuContent })
                });
                const result = await res.json();

                if (!res.ok) {
                    throw new Error(result.message);
                }
                showToast('Produk berhasil diperbarui.', 'success');
                editModal.classList.remove('is-visible');
                // Setelah menyimpan, perbarui daftar produk di admin panel
                manageCategorySelect.dispatchEvent(new Event('change'));
            } catch (err) {
                showToast(err.message || 'Gagal memperbarui produk.', 'error');
            } finally {
                saveEditBtn.textContent = 'Simpan Perubahan';
                saveEditBtn.disabled = false;
            }
        });
        
        // Geser Produk
        let draggingItem = null;
        manageProductList.addEventListener('dragstart', (e) => {
            draggingItem = e.target.closest('.delete-item');
            if (draggingItem) {
                setTimeout(() => draggingItem.classList.add('dragging'), 0);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', draggingItem.innerHTML); // Data transfer for Firefox compatibility
            }
        });
        manageProductList.addEventListener('dragend', () => {
            if (draggingItem) {
                draggingItem.classList.remove('dragging');
                draggingItem = null;
            }
        });
        manageProductList.addEventListener('dragover', (e) => {
            e.preventDefault(); // Diperlukan untuk memungkinkan drop
            const afterElement = getDragAfterElement(manageProductList, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (draggable === null || draggable === afterElement) return; // Mencegah error jika draggable tidak ada atau sama

            if (afterElement == null) {
                manageProductList.appendChild(draggable);
            } else {
                manageProductList.insertBefore(draggable, afterElement);
            }
        });

        // Event listener untuk dragenter dan dragleave agar visual feedback lebih baik (opsional)
        manageProductList.addEventListener('dragenter', (e) => {
            e.preventDefault();
            manageProductList.classList.add('drag-over');
        });
        manageProductList.addEventListener('dragleave', () => {
            manageProductList.classList.remove('drag-over');
        });
        manageProductList.addEventListener('drop', () => {
            manageProductList.classList.remove('drag-over');
        });


        saveOrderButton.addEventListener('click', async () => {
            const newOrder = [...manageProductList.children].map(item => parseInt(item.dataset.id));
            const category = manageCategorySelect.value;
            if (!category || newOrder.length === 0) {
                return showToast('Tidak ada kategori atau produk untuk diurutkan.', 'error');
            }

            showToast('Menyimpan urutan...', 'info', 5000);
            try {
                const res = await fetch('/api/reorderProducts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category, order: newOrder })
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.message);
                showToast('Urutan berhasil disimpan.', 'success');
                // Setelah menyimpan urutan, muat ulang daftar untuk memastikan tampilan sesuai
                manageCategorySelect.dispatchEvent(new Event('change'));
            } catch (err) {
                console.error("Error saving order:", err); // Log error
                showToast(err.message || 'Gagal menyimpan urutan.', 'error');
            }
        });
    }
    
    function getDragAfterElement(container, y) {
        // Filter elemen yang sedang tidak di-drag
        const draggableElements = [...container.querySelectorAll('.delete-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            // Menghitung offset relatif ke tengah elemen
            const offset = y - box.top - box.height / 2;
            // Jika offset negatif (di atas tengah elemen) dan lebih besar dari offset terdekat saat ini (artinya lebih dekat ke tengah)
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element; // Inisialisasi dengan offset negatif tak hingga
    }

    // Cek status login saat halaman dimuat
    if (sessionStorage.getItem('isAdminAuthenticated')) {
        loginScreen.style.display = 'none';
        productFormScreen.style.display = 'block';
        // Picu pemuatan daftar kategori pertama kali setelah login
        // agar tab "Tambah Produk" aktif secara default
        document.querySelector('.tab-button[data-tab="addProduct"]').click();
    }
});