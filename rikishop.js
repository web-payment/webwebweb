let youtubePlayer;
let isYouTubeApiReady = false;
function onYouTubeIframeAPIReady() { isYouTubeApiReady = true; }
(function() { const tag = document.createElement('script'); tag.src = "https://www.youtube.com/iframe_api"; const firstScriptTag = document.getElementsByTagName('script')[0]; firstScriptTag.parentNode.insertBefore(tag, firstScriptTag); })();

// --- Konfigurasi ---
const WA_ADMIN_NUMBER = "6285771555374";
const CREATOR_USERNAME = "Riki Shop Real";
const SOSMED_LINK = "https://rikishopreal.vercel.app";
const TESTIMONI_LINK = "https://rikishopreal.vercel.app/testimoni";
const SALURAN_WA_LINK = "https://whatsapp.com/channel/0029VaP4QyV3WHTgYm4pS23Z";

// --- Elemen DOM ---
const welcomeScreen = document.getElementById('welcomeScreen');
const mainContainer = document.getElementById('mainContainer');
const offcanvasMenu = document.getElementById('offcanvasMenu');
const overlay = document.getElementById('overlay');
const openMenuBtn = document.getElementById('openMenu');
const closeMenuBtn = document.getElementById('closeMenu');
const openCartBtn = document.getElementById('openCart');
const cartCountSpan = document.getElementById('cartCount');
const currentDateTimeSpan = document.getElementById('currentDateTime');
const serviceItems = document.querySelectorAll('.service-item');
const productListDiv = document.getElementById('productList');
const productDetailViewDiv = document.getElementById('productDetailView');
const serviceDetailPageTitle = document.getElementById('serviceDetailPageTitle');
const detailProductName = document.getElementById('detailProductName');
const detailProductDescriptionContent = document.getElementById('detailProductDescriptionContent');
const detailProductPrice = document.getElementById('detailProductPrice');
const detailProductActions = document.getElementById('detailProductActions');
const cartItemsList = document.getElementById('cartItems');
const cartTotalSpan = document.getElementById('cartTotal');
const checkoutButton = document.getElementById('checkoutButton');
const backArrows = document.querySelectorAll('.back-arrow');
const cartEmptyMessage = document.getElementById('cartEmptyMessage');
const bannerCarousel = document.getElementById('bannerCarousel');
const bannerPagination = document.getElementById('bannerPagination');
const visitorCountDisplay = document.getElementById('visitorCountDisplay');
const visitorCountSpan = visitorCountDisplay ? visitorCountDisplay.querySelector('.count') : null;
let currentBannerIndex = 0;
let bannerInterval;
const countdownTimerDiv = document.getElementById('countdownTimer');
let countdownInterval = null;
const stockImageSliderContainer = document.getElementById('stockImageSliderContainer');
const stockImageSlider = document.getElementById('stockImageSlider');
const sliderPrevBtn = document.getElementById('sliderPrevBtn');
const sliderNextBtn = document.getElementById('sliderNextBtn');
const imageLightbox = document.getElementById('imageLightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.querySelector('.lightbox-close');
let currentStockImageIndex = 0;
let totalStockImages = 0;
const aboutUsModal = document.getElementById('aboutUsModal');
const openAboutUsModalBtn = document.getElementById('openAboutUsModal');
const closeAboutUsModalBtn = document.getElementById('closeAboutUsModal');
const genericScriptMenuModal = document.getElementById('genericScriptMenuModal');
const closeGenericScriptMenuModalBtn = document.getElementById('closeGenericScriptMenuModal');
const genericScriptMenuTitle = document.getElementById('genericScriptMenuTitle');
const genericScriptMenuContent = document.getElementById('genericScriptMenuContent');
const chatAiModal = document.getElementById('chatAiModal');
const openChatAiModalBtn = document.getElementById('openChatAiModal');
const closeChatAiModalBtn = document.getElementById('closeChatAiModalBtn');
const chatAiMessagesPage = document.getElementById('chatAiMessagesPage');
const chatAiInputPage = document.getElementById('chatAiInputPage');
const sendChatAiBtnPage = document.getElementById('sendChatAiBtnPage');
const chatAiLoadingPage = document.getElementById('chatAiLoadingPage');
const multifunctionFab = document.getElementById('multifunctionFab');
const themeSwitchBtn = document.getElementById('themeSwitchBtn');
const openMusicPopupBtn = document.getElementById('openMusicPopupBtn');
const linktreeBtn = document.getElementById('linktreeBtn');
const muteAudioBtn = document.getElementById('muteAudioBtn');
let isFabFirstClick = true;
const musicPlayerOverlay = document.getElementById('musicPlayerOverlay');
const musicPlayerPopup = document.getElementById('musicPlayerPopup');
const closeMusicPlayer = document.getElementById('closeMusicPlayer');
const mediaLinkInput = document.getElementById('mediaLinkInput');
const loadMediaBtn = document.getElementById('loadMediaBtn');
const mediaPlayerContainer = document.getElementById('mediaPlayerContainer');
const backgroundAudio = document.getElementById('background-audio');
let toastTimeout;
let customMusicMuted = false;

// --- ELEMEN DOM BARU UNTUK FITUR DOMAIN ---
const domainCreatorPage = document.getElementById('domain-creator-page');
const domainHistoryPage = document.getElementById('domain-history-page');
const apikeyPopup = document.getElementById('apikey-popup');
const buyApikeyPopup = document.getElementById('buy-apikey-popup');
const domainSelectPopup = document.getElementById('domain-select-popup');
const successPopup = document.getElementById('success-popup');
const apikeyInput = document.getElementById('apikey-input');
const apikeySubmitBtn = document.getElementById('apikey-submit-btn');
const buyApikeyLink = document.getElementById('buy-apikey-link');
const openDomainSelectPopupBtn = document.getElementById('open-domain-select-popup-btn');
const createDomainBtn = document.getElementById('create-domain-btn');
const recordTypeSelect = document.getElementById('record-type');
const ipInputSection = document.getElementById('ip-input-section');
const cnameInputSection = document.getElementById('cname-input-section');

let validatedApiKey = localStorage.getItem('validatedApiKey_rikishop');
const API_CLOUDFLARE_URL = '/api/cloudflare';

// Variabel Global
let products = {};
let siteSettings = {};
let cart = JSON.parse(localStorage.getItem('rikishop_cart')) || [];
let currentPage = 'home-page';
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-rikishop';

// --- Fungsi Pembantu ---
function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    currentPage = pageId;
    mainContainer.scrollTop = 0;
}

function updateDateTime() {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    if(currentDateTimeSpan) currentDateTimeSpan.innerHTML = `<span class="date">${formattedDate}</span><br><span class="time">${formattedTime}</span>`;
}

function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}

function getPhoneNumberForProduct(product, serviceType) {
    if (product && product.nomorWA) return product.nomorWA;
    if (siteSettings.categoryPhoneNumbers && siteSettings.categoryPhoneNumbers[serviceType] && siteSettings.categoryPhoneNumbers[serviceType] !== "") {
        return siteSettings.categoryPhoneNumbers[serviceType];
    }
    if (siteSettings.globalPhoneNumber) return siteSettings.globalPhoneNumber;
    return WA_ADMIN_NUMBER;
}

// --- Logika Carousel ---
function setupBannerCarousel() {
    if (!bannerCarousel) return;
    const bannerItems = bannerCarousel.querySelectorAll(".banner-item");
    if (bannerItems.length === 0) return;
    bannerPagination.innerHTML = '';
    bannerItems.forEach((_, i) => {
        let dot = document.createElement("span");
        if (i === 0) dot.classList.add("active");
        dot.addEventListener("click", () => goToSlide(i));
        bannerPagination.appendChild(dot);
    });
    let currentBannerIndex = 0;
    function goToSlide(index) {
        currentBannerIndex = index;
        bannerCarousel.style.transform = `translateX(-${index * 100}%)`;
        const dots = bannerPagination.querySelectorAll("span");
        dots.forEach(dot => dot.classList.remove("active"));
        dots[index].classList.add("active");
    }
    function nextBanner() {
        let nextIndex = (currentBannerIndex + 1) % bannerItems.length;
        goToSlide(nextIndex);
    }
    if (bannerInterval) clearInterval(bannerInterval);
    bannerInterval = setInterval(nextBanner, 4000);
}

// --- Menu, Modal & Navigasi ---
openMenuBtn.addEventListener('click', () => {
    offcanvasMenu.classList.add('active');
    overlay.classList.add('active');
});

function closeOffcanvas() {
    offcanvasMenu.classList.remove('active');
    overlay.classList.remove('active');
}
closeMenuBtn.addEventListener('click', closeOffcanvas);
overlay.addEventListener('click', closeOffcanvas);

document.querySelectorAll('#offcanvasMenu a').forEach(link => {
    const pageTarget = link.dataset.page;
    if (pageTarget) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            closeOffcanvas();
            // Pengecekan khusus untuk halaman domain
            if (pageTarget === 'domain-creator-page') {
                 requireApiKey(() => {
                    showPage('domain-creator-page');
                    loadRootDomains();
                });
            } else if (pageTarget === 'domain-history-page') {
                showPage('domain-history-page');
                renderDomainHistory();
            } else {
                 showPage(pageTarget);
            }
        });
    }
});

openAboutUsModalBtn.addEventListener('click', (e) => { e.preventDefault(); aboutUsModal.style.display = 'flex'; closeOffcanvas(); });
closeAboutUsModalBtn.addEventListener('click', () => aboutUsModal.style.display = 'none');
openChatAiModalBtn.addEventListener('click', (e) => { e.preventDefault(); chatAiModal.style.display = 'flex'; closeOffcanvas(); });
closeChatAiModalBtn.addEventListener('click', () => chatAiModal.style.display = 'none');
closeGenericScriptMenuModalBtn.addEventListener('click', () => genericScriptMenuModal.style.display = 'none');
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});
backArrows.forEach(arrow => {
    arrow.addEventListener('click', () => {
        const backToPageId = arrow.dataset.backTo;
        if (currentPage === 'service-detail-page' && productDetailViewDiv.style.display === 'block') {
            productListDiv.style.display = 'block';
            productDetailViewDiv.style.display = 'none';
        } else {
            showPage(backToPageId || 'home-page');
        }
    });
});

// --- Logika Produk ---
serviceItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const serviceType = item.dataset.service;
        loadServiceProducts(serviceType);
        showPage('service-detail-page');
    });
});

function loadServiceProducts(serviceType) {
    serviceDetailPageTitle.textContent = serviceType;
    productListDiv.innerHTML = '';
    productDetailViewDiv.style.display = 'none';
    let productData = products[serviceType];
    
    if (productData && productData.length > 0) {
        productData.forEach(product => {
            const productItem = document.createElement('div');
            productItem.classList.add('product-item');
            let isNew = product.createdAt && (Date.now() - new Date(product.createdAt).getTime() < 24 * 60 * 60 * 1000);
            let finalPrice = product.harga;
            const originalPrice = product.hargaAsli;
            if (product.discountEndDate && new Date(product.discountEndDate) < new Date()) {
                finalPrice = originalPrice;
            }
            let priceDisplay = `<span class="product-price-list">${formatRupiah(finalPrice)}</span>`;
            if (originalPrice && originalPrice > finalPrice) {
                priceDisplay = `<span class="original-price"><del>${formatRupiah(originalPrice)}</del></span> <span class="discounted-price">${formatRupiah(finalPrice)}</span>`;
            }
            productItem.innerHTML = `
                <div>
                    <span class="product-name">${product.nama} ${isNew ? '<span class="new-badge">NEW</span>' : ''}</span>
                    <p class="product-short-desc">${product.deskripsiPanjang ? product.deskripsiPanjang.split('||')[0].trim() + '...' : ''}</p>
                    ${priceDisplay}
                </div>
                <i class="fas fa-chevron-right"></i>`;
            productItem.addEventListener('click', () => showProductDetail(product, serviceType));
            productListDiv.appendChild(productItem);
        });
        productListDiv.style.display = 'block';
    } else {
        productListDiv.innerHTML = '<p style="text-align: center; color: var(--light-text-color); padding: 20px;">Produk akan segera hadir.</p>';
    }
}

function showProductDetail(product, serviceType) {
    productListDiv.style.display = 'none';
    productDetailViewDiv.style.display = 'block';
    detailProductName.textContent = product.nama;
    let finalPrice = product.harga;
    let originalPrice = product.hargaAsli;
    if (product.discountEndDate && new Date(product.discountEndDate) < new Date()) {
        finalPrice = originalPrice; 
    }
    const priceHtml = (originalPrice && originalPrice > finalPrice)
        ? `<span class="original-price"><del>${formatRupiah(originalPrice)}</del></span> <span class="discounted-price">${formatRupiah(finalPrice)}</span>`
        : `${formatRupiah(finalPrice)}`;
    detailProductPrice.innerHTML = priceHtml;
    detailProductActions.innerHTML = '';
    
    if (countdownInterval) clearInterval(countdownInterval);
    if (product.discountEndDate && new Date(product.discountEndDate) > new Date()) {
        countdownTimerDiv.style.display = 'block';
        const endTime = new Date(product.discountEndDate).getTime();
        const updateTimer = () => {
            const distance = endTime - new Date().getTime();
            if (distance < 0) {
                clearInterval(countdownInterval);
                countdownTimerDiv.innerHTML = '<div class="timer-title">Diskon Berakhir</div>';
                detailProductPrice.innerHTML = `${formatRupiah(originalPrice)}`;
                return;
            }
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            document.getElementById('countdown-display').textContent = `${days}h ${hours}j ${minutes}m ${seconds}d`;
        };
        updateTimer();
        countdownInterval = setInterval(updateTimer, 1000);
    } else {
        countdownTimerDiv.style.display = 'none';
    }

    if ((serviceType === 'Stock Akun' || serviceType === 'Logo') && product.images && product.images.length > 0) {
        stockImageSliderContainer.style.display = 'block';
        stockImageSlider.innerHTML = '';
        product.images.forEach((imgUrl) => {
            const slide = document.createElement('div');
            slide.className = 'image-slide';
            slide.style.backgroundImage = `url('${imgUrl}')`;
            slide.addEventListener('click', () => openLightbox(imgUrl));
            stockImageSlider.appendChild(slide);
        });
        totalStockImages = product.images.length;
        currentStockImageIndex = 0;
        updateSliderPosition();
    } else {
        stockImageSliderContainer.style.display = 'none';
    }
    detailProductDescriptionContent.innerHTML = product.deskripsiPanjang ? product.deskripsiPanjang.replace(/\|\|/g, '<br>') : 'Tidak ada deskripsi.';

    const addToCartBtn = document.createElement('button');
    addToCartBtn.className = 'add-to-cart';
    addToCartBtn.textContent = 'Tambah ke Keranjang';
    Object.assign(addToCartBtn.dataset, { productId: product.id, productName: product.nama, productPrice: finalPrice, serviceType: serviceType });
    addToCartBtn.addEventListener('click', addToCart);
    detailProductActions.appendChild(addToCartBtn);

    const buyNowLink = document.createElement('a');
    buyNowLink.className = 'buy-now';
    buyNowLink.textContent = 'Beli Sekarang';
    const targetPhoneNumber = getPhoneNumberForProduct(product, serviceType);
    let buyNowMessage = `Halo Kak, saya tertarik memesan produk:\n\nProduk: *${product.nama}*\nHarga: *${formatRupiah(finalPrice)}*\n\nMohon info selanjutnya. Terima kasih! 🙏`;
    buyNowLink.href = `https://wa.me/${targetPhoneNumber}?text=${encodeURIComponent(buyNowMessage)}`;
    buyNowLink.target = "_blank";
    detailProductActions.appendChild(buyNowLink);

    if (serviceType === 'Script' && product.menuContent) {
        const cekMenuBtn = document.createElement('button');
        cekMenuBtn.className = 'cek-menu';
        cekMenuBtn.textContent = 'Cek Menu';
        cekMenuBtn.addEventListener('click', () => {
            genericScriptMenuTitle.textContent = `Menu ${product.nama}`;
            genericScriptMenuContent.innerHTML = product.menuContent.replace(/\n/g, '<br>');
            genericScriptMenuModal.style.display = 'flex';
        });
        detailProductActions.appendChild(cekMenuBtn);
    }
}

// --- Slider & Lightbox ---
function updateSliderPosition() { if(stockImageSlider) stockImageSlider.style.transform = `translateX(-${currentStockImageIndex * 100}%)`; }
function showNextImage() { currentStockImageIndex = (currentStockImageIndex + 1) % totalStockImages; updateSliderPosition(); }
function showPrevImage() { currentStockImageIndex = (currentStockImageIndex - 1 + totalStockImages) % totalStockImages; updateSliderPosition(); }
function openLightbox(imageUrl) { lightboxImage.src = imageUrl; imageLightbox.style.display = 'flex'; }
function closeLightbox() { imageLightbox.style.display = 'none'; }
sliderNextBtn.addEventListener('click', showNextImage);
sliderPrevBtn.addEventListener('click', showPrevImage);
lightboxClose.addEventListener('click', closeLightbox);
imageLightbox.addEventListener('click', (e) => { if (e.target === imageLightbox) closeLightbox(); });

// --- Keranjang & Notifikasi ---
function showToastNotification(message, iconClass = 'fa-check-circle') {
    const toast = document.getElementById('toast-notification');
    if (toastTimeout) clearTimeout(toastTimeout);
    toast.innerHTML = `<i class="fas ${iconClass}"></i> ${message}`;
    toast.classList.add('show');
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 3000);
}
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountSpan.textContent = count;
    cartCountSpan.style.display = count > 0 ? 'flex' : 'none';
}
function addToCart(event) {
    const { productId, productName, productPrice, serviceType } = event.target.dataset;
    const id = parseInt(productId), price = parseInt(productPrice);
    const existingItem = cart.find(item => item.id === id);

    if (serviceType === 'Stock Akun') {
        if (existingItem) {
            showToastNotification('Stok Akun hanya bisa dibeli 1 kali.', 'fa-exclamation-circle');
            return;
        }
        cart.push({ id, name: productName, price, quantity: 1, serviceType });
    } else {
        if (existingItem) existingItem.quantity++;
        else cart.push({ id, name: productName, price, quantity: 1, serviceType });
    }
    localStorage.setItem('rikishop_cart', JSON.stringify(cart));
    updateCartCount();
    showToastNotification(`<b>${productName}</b> ditambahkan ke keranjang.`);
}
function renderCart() {
    cartItemsList.innerHTML = '';
    let total = 0;
    if (cart.length === 0) {
        cartEmptyMessage.style.display = 'block';
        document.querySelector('.cart-summary').style.display = 'none';
        checkoutButton.style.display = 'none';
    } else {
        cartEmptyMessage.style.display = 'none';
        document.querySelector('.cart-summary').style.display = 'flex';
        checkoutButton.style.display = 'block';
        cart.forEach(item => {
            const cartItemCard = document.createElement('div');
            cartItemCard.className = 'cart-item-card';
            let itemActionsHTML = (item.serviceType === 'Stock Akun') ? `
                <div class="item-actions">
                    <span class="stock-info">Hanya 1 Stok</span>
                    <button type="button" class="remove-item-btn" onclick="removeFromCart(${item.id})"><i class="fas fa-trash-alt"></i> Hapus</button>
                </div>` : `
                <div class="item-actions">
                    <div class="quantity-controls">
                        <button type="button" class="quantity-btn" onclick="decreaseQuantity(${item.id})">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button type="button" class="quantity-btn" onclick="increaseQuantity(${item.id})">+</button>
                    </div>
                    <button type="button" class="remove-item-btn" onclick="removeFromCart(${item.id})"><i class="fas fa-trash-alt"></i> Hapus</button>
                </div>`;
            cartItemCard.innerHTML = `
                <div class="item-image"><i class="fas fa-box-open"></i></div>
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">${formatRupiah(item.price)}</div>
                </div>
                ${itemActionsHTML}`;
            cartItemsList.appendChild(cartItemCard);
            total += item.price * item.quantity;
        });
    }
    cartTotalSpan.textContent = formatRupiah(total);
}
function increaseQuantity(productId) {
    const item = cart.find(p => p.id === productId);
    if (item) {
        item.quantity++;
        localStorage.setItem('rikishop_cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
    }
}
function decreaseQuantity(productId) {
    const item = cart.find(p => p.id === productId);
    if (item && item.quantity > 1) {
        item.quantity--;
        localStorage.setItem('rikishop_cart', JSON.stringify(cart));
        updateCartCount();
        renderCart();
    } else if (item && item.quantity === 1) {
        removeFromCart(productId);
    }
}
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('rikishop_cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}
openCartBtn.addEventListener('click', () => { showPage('cart-page'); renderCart(); });
checkoutButton.addEventListener('click', () => {
    if (cart.length === 0) return;
    let itemsText = cart.map((item, index) => `*${index + 1}. ${item.name}*\n   (${formatRupiah(item.price)}) x ${item.quantity}`).join('\n');
    let totalOrder = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let message = `Halo Kak, saya ingin mengonfirmasi pesanan:\n\n--- PESANAN ---\n${itemsText}\n--------------------\n\n*Total: ${formatRupiah(totalOrder)}*\n\nMohon konfirmasinya. Terima kasih! 🙏`;
    const checkoutNumber = siteSettings.globalPhoneNumber || WA_ADMIN_NUMBER;
    window.open(`https://wa.me/${checkoutNumber}?text=${encodeURIComponent(message)}`, '_blank');
});

// --- LOGIKA UTAMA FITUR DOMAIN (BARU) ---
function requireApiKey(callback) {
    if (validatedApiKey) {
        callback();
    } else {
        apikeyPopup.style.display = 'flex';
        setTimeout(() => apikeyPopup.classList.add('visible'), 10);
    }
}
apikeySubmitBtn.addEventListener('click', async () => {
    const key = apikeyInput.value.trim();
    if (!key) return showToastNotification('API Key tidak boleh kosong.', 'fa-exclamation-circle');
    apikeySubmitBtn.textContent = 'Memverifikasi...';
    apikeySubmitBtn.disabled = true;
    try {
        const res = await fetch(API_CLOUDFLARE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'validateApiKey', data: { apikey: key } })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        validatedApiKey = key;
        localStorage.setItem('validatedApiKey_rikishop', key);
        showToastNotification('API Key valid! Selamat datang.', 'fa-check-circle');
        apikeyPopup.classList.remove('visible');
        setTimeout(() => {
            apikeyPopup.style.display = 'none';
            showPage('domain-creator-page');
            loadRootDomains();
        }, 300);
    } catch (err) {
        if (err.message.includes('kadaluwarsa') || err.message.includes('tidak valid')) {
             showToastNotification('API Key tidak valid atau sudah kadaluwarsa.', 'fa-times-circle');
        } else {
             showToastNotification('Terjadi masalah koneksi. Coba lagi nanti.', 'fa-server');
        }
    } finally {
        apikeySubmitBtn.textContent = 'Verifikasi';
        apikeySubmitBtn.disabled = false;
    }
});
buyApikeyLink.addEventListener('click', (e) => {
    e.preventDefault();
    const waNumber = siteSettings.globalPhoneNumber || WA_ADMIN_NUMBER;
    document.getElementById('purchase-link').href = `https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Kak, saya ingin membeli API Key untuk layanan subdomain.')}`;
    buyApikeyPopup.style.display = 'flex';
    setTimeout(() => buyApikeyPopup.classList.add('visible'), 10);
});
async function loadRootDomains() {
    if (!validatedApiKey) return;
    try {
        const res = await fetch(API_CLOUDFLARE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getRootDomains', data: { apikey: validatedApiKey } })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        const optionsList = document.getElementById('domain-options-list');
        optionsList.innerHTML = '';
        result.domains.forEach(domain => {
            const item = document.createElement('div');
            item.className = 'option-item';
            item.textContent = domain;
            item.dataset.value = domain;
            item.addEventListener('click', () => {
                document.getElementById('root-domain-hidden').value = domain;
                openDomainSelectPopupBtn.textContent = domain;
                closeAnyPopup();
            });
            optionsList.appendChild(item);
        });
    } catch (err) {
        showToastNotification(err.message || 'Gagal memuat daftar domain.', 'fa-times-circle');
    }
}
openDomainSelectPopupBtn.addEventListener('click', () => {
    domainSelectPopup.style.display = 'flex';
    setTimeout(() => domainSelectPopup.classList.add('visible'), 10);
});
recordTypeSelect.addEventListener('change', () => {
    ipInputSection.style.display = recordTypeSelect.value === 'A' ? 'block' : 'none';
    cnameInputSection.style.display = recordTypeSelect.value === 'CNAME' ? 'block' : 'none';
});
createDomainBtn.addEventListener('click', async () => {
    const subDomain = document.getElementById('subdomain-name').value.trim().toLowerCase();
    const rootDomain = document.getElementById('root-domain-hidden').value;
    const type = recordTypeSelect.value;
    const content = (type === 'A') ? document.getElementById('ip-address').value.trim() : document.getElementById('cname-target').value.trim();
    const proxied = document.getElementById('proxy-status').checked;
    if (!subDomain || !content || !rootDomain) {
        return showToastNotification('Semua kolom wajib diisi.', 'fa-exclamation-circle');
    }
    const domainData = { apikey: validatedApiKey, subdomain: subDomain, domain: rootDomain, type, content, proxied };
    createDomainBtn.textContent = 'Memproses...';
    createDomainBtn.disabled = true;
    try {
        const res = await fetch(API_CLOUDFLARE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'createSubdomain', data: domainData })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        showToastNotification('Subdomain berhasil dibuat!', 'fa-check-circle');
        displaySuccessPopup(result.created_domains, content);
        saveDomainsToHistory(result.created_domains, content);
        document.getElementById('createDomainForm').reset();
        openDomainSelectPopupBtn.textContent = "Pilih Domain";
    } catch (err) {
        showToastNotification(err.message || 'Gagal membuat subdomain.', 'fa-times-circle');
    } finally {
        createDomainBtn.textContent = 'Buat Domain';
        createDomainBtn.disabled = false;
    }
});
function displaySuccessPopup(domains, node) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = '';
    domains.forEach(domain => {
        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `<div><span class="domain-name">${domain}</span><span class="node-info">Node: ${node}</span></div><button type="button" class="copy-btn">Salin</button>`;
        resultContainer.appendChild(item);
    });
    successPopup.style.display = 'flex';
    setTimeout(() => successPopup.classList.add('visible'), 10);
}
function closeAnyPopup() {
    document.querySelectorAll('.popup-overlay.visible').forEach(popup => {
        popup.classList.remove('visible');
        setTimeout(() => popup.style.display = 'none', 300);
    });
}
document.body.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('close-popup-btn') || target.parentElement.classList.contains('close-popup-btn')) {
        closeAnyPopup();
    } else if (target.id === 'view-history-btn') {
        closeAnyPopup();
        showPage('domain-history-page');
        renderDomainHistory();
    } else if (target.id === 'close-popup-btn') {
        closeAnyPopup();
    }
});
document.getElementById('result-container').addEventListener('click', (e) => {
    if (e.target.classList.contains('copy-btn')) {
        const domainText = e.target.parentElement.querySelector('.domain-name').textContent;
        navigator.clipboard.writeText(domainText).then(() => showToastNotification('Domain disalin!', 'fa-copy'));
    }
});
function saveDomainsToHistory(domains, node) {
    let history = JSON.parse(localStorage.getItem('domainHistory_rikishop')) || [];
    const newEntries = domains.map(domain => ({ domain, node, date: new Date().toISOString() }));
    history = [...newEntries, ...history].slice(0, 50);
    localStorage.setItem('domainHistory_rikishop', JSON.stringify(history));
}
function renderDomainHistory() {
    const historyList = document.getElementById('domain-history-list');
    const history = JSON.parse(localStorage.getItem('domainHistory_rikishop')) || [];
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-message">Anda belum membuat subdomain.</p>';
        return;
    }
    historyList.innerHTML = '';
    history.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'result-item';
        itemEl.innerHTML = `<div><span class="domain-name">${item.domain}</span><span class="node-info">Node: ${item.node}</span><span class="date-info">${new Date(item.date).toLocaleString('id-ID')}</span></div><button type="button" class="copy-btn">Salin</button>`;
        historyList.appendChild(itemEl);
    });
}
document.getElementById('domain-history-list').addEventListener('click', (e) => {
    if (e.target.classList.contains('copy-btn')) {
        const domainText = e.target.parentElement.querySelector('.domain-name').textContent;
        navigator.clipboard.writeText(domainText).then(() => showToastNotification('Domain disalin!', 'fa-copy'));
    }
});


// --- FAB, Tema, Musik & AI (Kode Lama) ---
multifunctionFab.addEventListener('click', (e) => {
    if (e.target.closest('.main-fab-icon')) {
        multifunctionFab.classList.toggle('active');
        if (isFabFirstClick) { playBackgroundMusic(); isFabFirstClick = false; }
    }
});
themeSwitchBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    document.body.classList.toggle('dark-mode');
    const icon = themeSwitchBtn.querySelector('i');
    icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';
});
linktreeBtn.addEventListener('click', (e) => { e.stopPropagation(); window.open(SOSMED_LINK, '_blank'); });
muteAudioBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const icon = muteAudioBtn.querySelector('i');
    if (youtubePlayer && typeof youtubePlayer.isMuted === 'function') {
        if (youtubePlayer.isMuted()) {
            youtubePlayer.unMute();
            icon.className = 'fas fa-volume-up';
        } else {
            youtubePlayer.mute();
            icon.className = 'fas fa-volume-mute';
        }
    } else {
        backgroundAudio.muted = !backgroundAudio.muted;
        icon.className = backgroundAudio.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
    }
});
openMusicPopupBtn.addEventListener('click', (e) => { e.stopPropagation(); musicPlayerPopup.classList.add('active'); musicPlayerOverlay.classList.add('active'); });
function closeMusicPlayerPopup() { musicPlayerPopup.classList.remove('active'); musicPlayerOverlay.classList.remove('active'); }
closeMusicPlayer.addEventListener('click', closeMusicPlayerPopup);
musicPlayerOverlay.addEventListener('click', closeMusicPlayerPopup);
loadMediaBtn.addEventListener('click', () => {
    const mediaLink = mediaLinkInput.value.trim();
    if (!mediaLink) return;
    backgroundAudio.pause();
    if (youtubePlayer) youtubePlayer.destroy();
    try {
        const url = new URL(mediaLink);
        const videoId = url.hostname === 'youtu.be' ? url.pathname.substring(1) : url.searchParams.get('v');
        if (videoId) createYouTubePlayer(videoId);
    } catch (error) { console.error("Error parsing link:", error); }
});
function createYouTubePlayer(videoId) {
    if (!isYouTubeApiReady) { setTimeout(() => createYouTubePlayer(videoId), 100); return; }
    mediaPlayerContainer.innerHTML = '<div id="youtube-player-embed"></div>';
    youtubePlayer = new YT.Player('youtube-player-embed', {
        videoId: videoId,
        playerVars: { 'autoplay': 1, 'controls': 0, 'rel': 0, 'showinfo': 0, 'iv_load_policy': 3 },
        events: { 'onReady': (e) => e.target.playVideo(), 'onStateChange': (e) => { if (e.data === YT.PlayerState.PLAYING) closeMusicPlayerPopup(); } }
    });
}
function playBackgroundMusic() { if (backgroundAudio.src && !backgroundAudio.muted && backgroundAudio.paused) backgroundAudio.play().catch(e => console.log("Autoplay dicegah.")); }

async function handleSendChatMessagePage() {
    const userInput = chatAiInputPage.value.trim();
    if (userInput === '') return;
    appendMessageToChatPage(userInput, 'user-message');
    chatAiInputPage.value = '';
    chatAiLoadingPage.style.display = 'flex';
    setTimeout(() => {
        const response = getAiResponse(userInput);
        appendMessageToChatPage(response, 'ai-message');
        chatAiLoadingPage.style.display = 'none';
    }, 1000);
}
function getAiResponse(input) {
    const i = input.toLowerCase();
    if (i.includes('siapa') && i.includes('kamu')) return `Saya Toko Riki AI, asisten virtual Anda.`;
    if (i.includes('jual') || i.includes('produk')) return `Kami menjual Panel, VPS, Script, dan layanan digital lainnya. Silakan cek di Beranda.`;
    if (i.includes('aman') || i.includes('terpercaya')) return `Tentu! Keamanan dan kepercayaan pelanggan adalah prioritas kami.`;
    return `Maaf, saya belum mengerti. Coba tanyakan tentang produk atau keamanan toko.`;
}
function appendMessageToChatPage(text, className) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${className}`;
    messageDiv.innerHTML = text;
    chatAiMessagesPage.appendChild(messageDiv);
    chatAiMessagesPage.scrollTop = chatAiMessagesPage.scrollHeight;
}
sendChatAiBtnPage.addEventListener('click', handleSendChatMessagePage);
chatAiInputPage.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChatMessagePage(); } });

// --- Inisialisasi Aplikasi ---
async function initializeApp() {
    mainContainer.style.display = 'none';
    try {
        const timestamp = new Date().getTime();
        const [productsResponse, settingsResponse] = await Promise.all([
            fetch(`products.json?v=${timestamp}`),
            fetch(`settings.json?v=${timestamp}`)
        ]);
        if (!productsResponse.ok) throw new Error('Gagal memuat produk.');
        products = await productsResponse.json();
        if (settingsResponse.ok) siteSettings = await settingsResponse.json();
    } catch (error) {
        console.error("Gagal memuat data awal:", error);
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);
    updateCartCount();

    let progress = 0;
    let progressBar = document.getElementById("progressBar");
    let progressText = document.getElementById("progress-text");
    let interval = setInterval(() => {
        progress += 5;
        if(progressBar) progressBar.style.width = progress + "%";
        if(progressText) progressText.textContent = progress + "%";
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                welcomeScreen.classList.add("fade-out");
                welcomeScreen.addEventListener('transitionend', () => {
                    welcomeScreen.style.display = "none";
                    mainContainer.style.display = "flex";
                    showPage('home-page');
                    setupBannerCarousel();
                }, { once: true });
            }, 400);
        }
    }, 80);
}

// Inisialisasi setelah semua dimuat
document.addEventListener('DOMContentLoaded', initializeApp);