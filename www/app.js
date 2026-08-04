// --- Initial Default Menu Data ---
const initialDefaultMenu = [
    { id: 1, name: "MIE BAKSO KOMPLIT", price: 20000, category: "makanan" },
    { id: 2, name: "BAKSO KOMPLIT", price: 18000, category: "makanan" },
    { id: 3, name: "INDOMIE GORENG TELUR", price: 15000, category: "makanan" },
    { id: 4, name: "INDOMIE KUAH TELUR", price: 15000, category: "makanan" },
    { id: 5, name: "TELUR REBUS", price: 5000, category: "makanan" },
    { id: 6, name: "BURAS", price: 5000, category: "makanan" },
    { id: 7, name: "UBI GORENG", price: 5000, category: "makanan" },
    { id: 8, name: "AIR MINERAL", price: 5000, category: "minuman" },
    { id: 9, name: "ES TEH", price: 5000, category: "minuman" },
    { id: 10, name: "ES CINCAU", price: 15000, category: "minuman" },
    { id: 11, name: "ES PISANG IJO", price: 15000, category: "minuman" }
];

// --- Persistent State Management ---
let menuData = JSON.parse(localStorage.getItem('baksoLocerMenu')) || initialDefaultMenu;
let cart = [];
let currentCategory = 'all';
let transactionHistory = JSON.parse(localStorage.getItem('baksoLocerHistory')) || [];
let currentReceiptTrx = null;
let selectedPaymentMethod = 'tunai'; // 'tunai' | 'qris'

// Manage Menu Filter State
let manageCategoryFilter = 'all';
let manageSearchQuery = '';

// --- DOM Elements ---
const menuGrid = document.getElementById('menu-grid');
const cartItemsContainer = document.getElementById('cart-items');
const emptyCartState = document.getElementById('empty-cart-state');
const cartCount = document.getElementById('cart-count');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const categoryBtns = document.querySelectorAll('#category-filters .category-btn');
const navLinks = document.querySelectorAll('.nav-links li');
const views = document.querySelectorAll('.view');
const currentDateEl = document.getElementById('current-date');

// Manage Menu DOM
const quickManageMenuBtn = document.getElementById('quick-manage-menu-btn');
const addMenuBtn = document.getElementById('add-menu-btn');
const manageMenuTbody = document.getElementById('manage-menu-tbody');
const manageMenuSearch = document.getElementById('manage-menu-search');
const manageCategoryBtns = document.querySelectorAll('#manage-category-filters .category-btn');
const menuFormModal = document.getElementById('menu-form-modal');
const closeMenuModalBtn = document.getElementById('close-menu-modal');
const cancelMenuBtn = document.getElementById('cancel-menu-btn');
const menuForm = document.getElementById('menu-form');
const menuModalTitle = document.getElementById('menu-modal-title');
const menuItemIdInput = document.getElementById('menu-item-id');
const menuNameInput = document.getElementById('menu-name');
const menuPriceInput = document.getElementById('menu-price');
const menuCategorySelect = document.getElementById('menu-category');

// Checkout Modals & Payment DOM
const checkoutModal = document.getElementById('checkout-modal');
const receiptModal = document.getElementById('receipt-modal');
const closeCheckoutBtn = document.getElementById('close-checkout-modal');
const closeReceiptBtn = document.getElementById('close-receipt-modal');
const modalTotal = document.getElementById('modal-total');
const methodTunaiBtn = document.getElementById('method-tunai-btn');
const methodQrisBtn = document.getElementById('method-qris-btn');
const cashPaymentSection = document.getElementById('cash-payment-section');
const qrisPaymentSection = document.getElementById('qris-payment-section');
const qrisAmountDisplay = document.getElementById('qris-amount-display');
const amountPaidInput = document.getElementById('amount-paid');
const quickAmountsContainer = document.getElementById('quick-amounts');
const changeDisplay = document.getElementById('change-display');
const modalChange = document.getElementById('modal-change');
const confirmPaymentBtn = document.getElementById('confirm-payment-btn');
const printReceiptBtn = document.getElementById('print-receipt-btn');
const printBluetoothBtn = document.getElementById('print-bluetooth-btn');
const finishTransactionBtn = document.getElementById('finish-transaction-btn');
const receiptContent = document.getElementById('receipt-content');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history-btn');

// --- Utility Functions ---
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const generateId = () => {
    return 'TRX-' + Date.now().toString().slice(-6);
};

const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('id-ID', options);
};

const showToast = (message) => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
};

const saveMenuData = () => {
    localStorage.setItem('baksoLocerMenu', JSON.stringify(menuData));
};

// --- Initialization ---
const init = () => {
    currentDateEl.textContent = formatDate(new Date());
    renderMenu();
    renderManageMenu();
    updateCartUI();
    renderHistory();
    setupEventListeners();
};

// --- Render Logic for POS ---
const renderMenu = () => {
    menuGrid.innerHTML = '';
    const filteredMenu = currentCategory === 'all' 
        ? menuData 
        : menuData.filter(item => item.category === currentCategory);

    if (filteredMenu.length === 0) {
        menuGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
                <p style="font-size: 1.1rem; font-weight: 500;">Belum ada menu di kategori ini.</p>
                <button class="btn btn-secondary-outline" style="margin-top: 1rem;" onclick="switchView('manage-menu-view')">
                    + Kelola Menu
                </button>
            </div>
        `;
        return;
    }

    filteredMenu.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.innerHTML = `
            <div>
                <h3>${item.name}</h3>
                <div class="price">${formatCurrency(item.price)}</div>
            </div>
            <div class="add-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </div>
        `;
        card.addEventListener('click', () => addToCart(item));
        menuGrid.appendChild(card);
    });
};

// --- Manage Menu (CRUD) Logic ---
const renderManageMenu = () => {
    manageMenuTbody.innerHTML = '';
    
    let filtered = menuData;
    if (manageCategoryFilter !== 'all') {
        filtered = filtered.filter(item => item.category === manageCategoryFilter);
    }
    if (manageSearchQuery.trim() !== '') {
        const query = manageSearchQuery.toLowerCase();
        filtered = filtered.filter(item => item.name.toLowerCase().includes(query));
    }

    if (filtered.length === 0) {
        manageMenuTbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2.5rem 1rem;">
                    Tidak ada menu yang cocok dengan pencarian.
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(item => {
        const tr = document.createElement('tr');
        const isMakanan = item.category === 'makanan';
        const badgeClass = isMakanan ? 'badge-makanan' : 'badge-minuman';
        const catLabel = isMakanan ? 'Makanan' : 'Minuman';

        tr.innerHTML = `
            <td style="font-weight: 600;">${item.name}</td>
            <td><span class="badge-cat ${badgeClass}">${catLabel}</span></td>
            <td style="font-weight: 700; color: var(--brand-green);">${formatCurrency(item.price)}</td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon btn-edit" title="Edit Menu" onclick="editMenuItem(${item.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn-icon btn-delete" title="Hapus Menu" onclick="deleteMenuItem(${item.id})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            </td>
        `;
        manageMenuTbody.appendChild(tr);
    });
};

const openAddMenuModal = () => {
    menuModalTitle.textContent = "Tambah Menu Baru";
    menuItemIdInput.value = '';
    menuNameInput.value = '';
    menuPriceInput.value = '';
    menuCategorySelect.value = 'makanan';
    menuFormModal.classList.add('show');
    setTimeout(() => menuNameInput.focus(), 100);
};

window.editMenuItem = (id) => {
    const item = menuData.find(m => m.id === id);
    if (!item) return;

    menuModalTitle.textContent = "Edit Menu";
    menuItemIdInput.value = item.id;
    menuNameInput.value = item.name;
    menuPriceInput.value = item.price;
    menuCategorySelect.value = item.category;
    menuFormModal.classList.add('show');
    setTimeout(() => menuNameInput.focus(), 100);
};

window.deleteMenuItem = (id) => {
    const item = menuData.find(m => m.id === id);
    if (!item) return;

    if (confirm(`Apakah Anda yakin ingin menghapus menu "${item.name}"?`)) {
        menuData = menuData.filter(m => m.id !== id);
        saveMenuData();
        
        // Remove from current active cart if present
        cart = cart.filter(c => c.id !== id);
        
        renderMenu();
        renderManageMenu();
        updateCartUI();
        showToast(`Menu "${item.name}" berhasil dihapus.`);
    }
};

const handleSaveMenu = (e) => {
    e.preventDefault();
    const idStr = menuItemIdInput.value;
    const name = menuNameInput.value.trim().toUpperCase();
    const price = parseFloat(menuPriceInput.value) || 0;
    const category = menuCategorySelect.value;

    if (!name || price <= 0) {
        alert('Mohon isi nama menu dan harga yang valid!');
        return;
    }

    if (idStr) {
        // Edit existing menu
        const id = parseInt(idStr);
        const index = menuData.findIndex(m => m.id === id);
        if (index > -1) {
            menuData[index] = { ...menuData[index], name, price, category };
            
            // Also update any matching item in cart
            cart = cart.map(c => c.id === id ? { ...c, name, price, category } : c);
            
            showToast(`Menu "${name}" berhasil diperbarui.`);
        }
    } else {
        // Add new menu
        const newId = Date.now();
        menuData.push({ id: newId, name, price, category });
        showToast(`Menu "${name}" berhasil ditambahkan.`);
    }

    saveMenuData();
    renderMenu();
    renderManageMenu();
    updateCartUI();
    menuFormModal.classList.remove('show');
};

// --- Cart Logic ---
const updateCartUI = () => {
    cartItemsContainer.innerHTML = '';
    let totalQty = 0;
    let totalPrice = 0;

    const cartPanel = document.querySelector('.cart-panel');
    
    if (cart.length === 0) {
        cartItemsContainer.appendChild(emptyCartState);
        emptyCartState.style.display = 'flex';
        checkoutBtn.disabled = true;
        cartPanel.style.display = 'none';
    } else {
        emptyCartState.style.display = 'none';
        checkoutBtn.disabled = false;
        cartPanel.style.display = 'flex';

        cart.forEach((item, index) => {
            totalQty += item.qty;
            const itemTotal = item.qty * item.price;
            totalPrice += itemTotal;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">${formatCurrency(item.price)}</span>
                </div>
                <div class="item-controls">
                    <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                    <span class="item-qty">${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                    <span class="item-total">${formatCurrency(itemTotal)}</span>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
    }

    cartCount.textContent = totalQty;
    cartSubtotal.textContent = formatCurrency(totalPrice);
    cartTotal.textContent = formatCurrency(totalPrice);
};

const addToCart = (product) => {
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    if (existingItemIndex > -1) {
        cart[existingItemIndex].qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    updateCartUI();
    
    const aside = document.querySelector('.cart-panel');
    aside.style.transform = 'scale(1.02)';
    setTimeout(() => {
        aside.style.transform = 'scale(1)';
    }, 150);
};

window.updateQty = (index, delta) => {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    updateCartUI();
};

const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.qty), 0);
};

// --- History Logic ---
const renderHistory = () => {
    historyList.innerHTML = '';
    
    if (transactionHistory.length === 0) {
        historyList.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 2rem;">Belum ada riwayat transaksi.</div>';
        return;
    }

    // Sort descending by date
    const sortedHistory = [...transactionHistory].reverse();

    sortedHistory.forEach(trx => {
        const card = document.createElement('div');
        card.className = 'history-card';
        
        let itemsHtml = trx.items.map(i => `${i.qty}x ${i.name}`).join('<br>');
        const method = trx.paymentMethod || 'tunai';
        const badgeClass = method === 'qris' ? 'badge-payment-qris' : 'badge-payment-tunai';
        const methodLabel = method === 'qris' ? 'QRIS' : 'TUNAI';

        card.innerHTML = `
            <div class="history-header">
                <div>
                    <span class="history-id">#${trx.id}</span>
                    <span class="badge-payment ${badgeClass}">${methodLabel}</span>
                </div>
                <span class="history-time">${new Date(trx.date).toLocaleString('id-ID')}</span>
            </div>
            <div class="history-items">${itemsHtml}</div>
            <div class="history-footer">
                <span>Total Belanja</span>
                <span class="history-total">${formatCurrency(trx.total)}</span>
            </div>
        `;
        historyList.appendChild(card);
    });
};

// --- Checkout & Payment Logic ---
const setPaymentMethod = (method) => {
    selectedPaymentMethod = method;
    const total = getCartTotal();

    if (method === 'tunai') {
        methodTunaiBtn.classList.add('active');
        methodQrisBtn.classList.remove('active');
        cashPaymentSection.style.display = 'block';
        qrisPaymentSection.style.display = 'none';
        calculateChange();
    } else {
        methodTunaiBtn.classList.remove('active');
        methodQrisBtn.classList.add('active');
        cashPaymentSection.style.display = 'none';
        qrisPaymentSection.style.display = 'block';
        qrisAmountDisplay.textContent = formatCurrency(total);
        confirmPaymentBtn.disabled = false;
    }
};

const openCheckoutModal = () => {
    const total = getCartTotal();
    modalTotal.textContent = formatCurrency(total);
    amountPaidInput.value = '';
    changeDisplay.style.display = 'none';
    
    // Default to Tunai
    setPaymentMethod('tunai');
    
    // Generate Quick Amount buttons
    quickAmountsContainer.innerHTML = '';
    const amounts = [total, Math.ceil(total / 50000) * 50000, Math.ceil(total / 100000) * 100000];
    const uniqueAmounts = [...new Set(amounts)].filter(a => a >= total);
    
    if(!uniqueAmounts.includes(total)) uniqueAmounts.unshift(total);
    if (total <= 50000 && !uniqueAmounts.includes(50000)) uniqueAmounts.push(50000);
    if (total <= 100000 && !uniqueAmounts.includes(100000)) uniqueAmounts.push(100000);

    uniqueAmounts.sort((a,b) => a-b).forEach(amount => {
        const btn = document.createElement('button');
        btn.className = 'quick-btn';
        btn.textContent = amount === total ? 'Uang Pas' : formatCurrency(amount);
        btn.onclick = () => {
            amountPaidInput.value = amount;
            calculateChange();
        };
        quickAmountsContainer.appendChild(btn);
    });

    checkoutModal.classList.add('show');
    setTimeout(() => {
        if (selectedPaymentMethod === 'tunai') {
            amountPaidInput.focus();
        }
    }, 100);
};

const calculateChange = () => {
    if (selectedPaymentMethod !== 'tunai') return;
    
    const total = getCartTotal();
    const paid = parseFloat(amountPaidInput.value) || 0;
    
    if (paid >= total) {
        const change = paid - total;
        modalChange.textContent = formatCurrency(change);
        changeDisplay.style.display = 'block';
        confirmPaymentBtn.disabled = false;
    } else {
        changeDisplay.style.display = 'none';
        confirmPaymentBtn.disabled = true;
    }
};

const processPayment = () => {
    const total = getCartTotal();
    let paid = total;
    let change = 0;

    if (selectedPaymentMethod === 'tunai') {
        paid = parseFloat(amountPaidInput.value) || 0;
        change = paid - total;
    }

    const transaction = {
        id: generateId(),
        date: new Date().toISOString(),
        items: [...cart],
        total: total,
        paid: paid,
        change: change,
        paymentMethod: selectedPaymentMethod
    };

    // Save to history
    transactionHistory.push(transaction);
    localStorage.setItem('baksoLocerHistory', JSON.stringify(transactionHistory));
    renderHistory();

    // Show Receipt
    checkoutModal.classList.remove('show');
    showReceipt(transaction);
};

const showReceipt = (trx) => {
    currentReceiptTrx = trx;
    const isQris = trx.paymentMethod === 'qris';
    const methodLabel = isQris ? 'QRIS' : 'TUNAI';

    let itemsHtml = trx.items.map(item => `
        <div class="receipt-item">
            <div>${item.qty}x ${item.name}</div>
            <div>${formatCurrency(item.qty * item.price)}</div>
        </div>
    `).join('');

    receiptContent.innerHTML = `
        <div class="receipt">
            <div class="receipt-header">
                <h3>Bakso Locer</h3>
                <div>Jl. Citra Garden (081355671800)</div>
                <div>${new Date(trx.date).toLocaleString('id-ID')}</div>
                <div>No: ${trx.id}</div>
            </div>
            <div class="receipt-items">
                ${itemsHtml}
            </div>
            <div class="receipt-totals">
                <div class="receipt-row bold">
                    <span>Total</span>
                    <span>${formatCurrency(trx.total)}</span>
                </div>
                <div class="receipt-row">
                    <span>Metode</span>
                    <span style="font-weight: 600;">${methodLabel}</span>
                </div>
                <div class="receipt-row">
                    <span>${isQris ? 'Bayar (QRIS)' : 'Tunai'}</span>
                    <span>${formatCurrency(trx.paid)}</span>
                </div>
                <div class="receipt-row">
                    <span>Kembali</span>
                    <span>${formatCurrency(trx.change)}</span>
                </div>
            </div>
            <div class="receipt-footer">
                Terima kasih atas kunjungan Anda!<br>
                100% Halal
            </div>
        </div>
    `;
    receiptModal.classList.add('show');
};

const getReceiptText = (trx) => {
    const isQris = trx.paymentMethod === 'qris';
    const methodLabel = isQris ? 'QRIS' : 'TUNAI';

    let text = `*Bakso Locer*\nJl. Citra Garden (081355671800)\n${new Date(trx.date).toLocaleString('id-ID')}\nNo: ${trx.id}\nMetode: ${methodLabel}\n------------------------\n`;
    trx.items.forEach(item => {
        text += `${item.qty}x ${item.name}\n${formatCurrency(item.qty * item.price)}\n`;
    });
    text += `------------------------\n`;
    text += `Total   : ${formatCurrency(trx.total)}\n`;
    text += `Metode  : ${methodLabel}\n`;
    if (isQris) {
        text += `Bayar   : ${formatCurrency(trx.paid)} (QRIS)\n`;
    } else {
        text += `Tunai   : ${formatCurrency(trx.paid)}\n`;
        text += `Kembali : ${formatCurrency(trx.change)}\n`;
    }
    text += `\nTerima kasih atas kunjungan Anda!\n100% Halal`;
    return text;
};

// --- View Switcher Helper ---
window.switchView = (targetViewId) => {
    navLinks.forEach(l => {
        if (l.getAttribute('data-target') === targetViewId) {
            l.classList.add('active');
        } else {
            l.classList.remove('active');
        }
    });

    views.forEach(view => view.classList.remove('active-view'));
    const targetEl = document.getElementById(targetViewId);
    if (targetEl) {
        targetEl.classList.add('active-view');
        if (targetViewId === 'manage-menu-view') {
            renderManageMenu();
        }
    }
};

// --- Event Listeners ---
const setupEventListeners = () => {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetId = link.getAttribute('data-target');
            window.switchView(targetId);
        });
    });

    // Quick Button to Kelola Menu
    if (quickManageMenuBtn) {
        quickManageMenuBtn.addEventListener('click', () => {
            window.switchView('manage-menu-view');
        });
    }

    // POS Categories
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category');
            renderMenu();
        });
    });

    // Manage Menu Filter & Search
    manageCategoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            manageCategoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            manageCategoryFilter = btn.getAttribute('data-manage-cat');
            renderManageMenu();
        });
    });

    if (manageMenuSearch) {
        manageMenuSearch.addEventListener('input', (e) => {
            manageSearchQuery = e.target.value;
            renderManageMenu();
        });
    }

    // Manage Menu Modals
    if (addMenuBtn) {
        addMenuBtn.addEventListener('click', openAddMenuModal);
    }
    if (closeMenuModalBtn) {
        closeMenuModalBtn.addEventListener('click', () => menuFormModal.classList.remove('show'));
    }
    if (cancelMenuBtn) {
        cancelMenuBtn.addEventListener('click', () => menuFormModal.classList.remove('show'));
    }
    if (menuForm) {
        menuForm.addEventListener('submit', handleSaveMenu);
    }

    // Checkout & Payment Methods
    methodTunaiBtn.addEventListener('click', () => setPaymentMethod('tunai'));
    methodQrisBtn.addEventListener('click', () => setPaymentMethod('qris'));
    checkoutBtn.addEventListener('click', openCheckoutModal);
    closeCheckoutBtn.addEventListener('click', () => checkoutModal.classList.remove('show'));
    amountPaidInput.addEventListener('input', calculateChange);
    confirmPaymentBtn.addEventListener('click', processPayment);

    // Receipt Finalize
    const finalizeTransaction = () => {
        receiptModal.classList.remove('show');
        cart = [];
        updateCartUI();
        showToast('Transaksi Berhasil Disimpan!');
    };

    closeReceiptBtn.addEventListener('click', finalizeTransaction);
    finishTransactionBtn.addEventListener('click', finalizeTransaction);
    
    // WhatsApp Share
    printReceiptBtn.addEventListener('click', async () => {
        if (!currentReceiptTrx) return;
        const receiptText = getReceiptText(currentReceiptTrx);
        
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Struk Bakso Locer',
                    text: receiptText
                });
                return;
            }
        } catch (err) {
            console.log('Share API dibatalkan atau gagal');
        }

        try {
            await navigator.clipboard.writeText(receiptText);
            showToast('Struk disalin! Membuka WhatsApp...');
            setTimeout(() => {
                const encodedText = encodeURIComponent(receiptText);
                window.open(`https://wa.me/?text=${encodedText}`, '_system');
            }, 400);
        } catch (e) {
            showToast('Gagal menyalin struk.');
        }
    });

    // Thermal Bluetooth Print
    printBluetoothBtn.addEventListener('click', () => {
        if (!currentReceiptTrx) return;
        const receiptText = getReceiptText(currentReceiptTrx);
        const encodedText = encodeURIComponent(receiptText);
        window.location.href = `intent:${encodedText}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;`;
    });

    // History
    clearHistoryBtn.addEventListener('click', () => {
        if(confirm('Apakah Anda yakin ingin menghapus semua riwayat transaksi? Data tidak bisa dikembalikan.')) {
            transactionHistory = [];
            localStorage.removeItem('baksoLocerHistory');
            renderHistory();
            showToast('Riwayat berhasil dihapus');
        }
    });

    // Global Keydowns (Esc to close modals)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (menuFormModal.classList.contains('show')) {
                menuFormModal.classList.remove('show');
            }
            if (checkoutModal.classList.contains('show')) {
                checkoutModal.classList.remove('show');
            }
            if (receiptModal.classList.contains('show')) {
                finalizeTransaction();
            }
        }
    });
};

// Start app
init();
