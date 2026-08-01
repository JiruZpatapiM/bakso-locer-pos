// --- Data Menu ---
const menuData = [
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

// --- State Management ---
let cart = [];
let currentCategory = 'all';
let transactionHistory = JSON.parse(localStorage.getItem('baksoLocerHistory')) || [];
let currentReceiptTrx = null;

// --- DOM Elements ---
const menuGrid = document.getElementById('menu-grid');
const cartItemsContainer = document.getElementById('cart-items');
const emptyCartState = document.getElementById('empty-cart-state');
const cartCount = document.getElementById('cart-count');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const categoryBtns = document.querySelectorAll('.category-btn');
const navLinks = document.querySelectorAll('.nav-links li');
const views = document.querySelectorAll('.view');
const currentDateEl = document.getElementById('current-date');

// Modals
const checkoutModal = document.getElementById('checkout-modal');
const receiptModal = document.getElementById('receipt-modal');
const closeCheckoutBtn = document.getElementById('close-checkout-modal');
const closeReceiptBtn = document.getElementById('close-receipt-modal');
const modalTotal = document.getElementById('modal-total');
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

// --- Initialization ---
const init = () => {
    currentDateEl.textContent = formatDate(new Date());
    renderMenu();
    updateCartUI();
    renderHistory();
    setupEventListeners();
};

// --- Render Logic ---
const renderMenu = () => {
    menuGrid.innerHTML = '';
    const filteredMenu = currentCategory === 'all' 
        ? menuData 
        : menuData.filter(item => item.category === currentCategory);

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
        
        card.innerHTML = `
            <div class="history-header">
                <span class="history-id">#${trx.id}</span>
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

// --- Cart Logic ---
const addToCart = (product) => {
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    if (existingItemIndex > -1) {
        cart[existingItemIndex].qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    updateCartUI();
    
    // Add small animation feedback to the cart panel
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

// --- Checkout Logic ---
const openCheckoutModal = () => {
    const total = getCartTotal();
    modalTotal.textContent = formatCurrency(total);
    amountPaidInput.value = '';
    changeDisplay.style.display = 'none';
    confirmPaymentBtn.disabled = true;
    
    // Generate Quick Amount buttons
    quickAmountsContainer.innerHTML = '';
    const amounts = [total, Math.ceil(total / 50000) * 50000, Math.ceil(total / 100000) * 100000];
    const uniqueAmounts = [...new Set(amounts)].filter(a => a >= total);
    
    // Add exact amount if not present
    if(!uniqueAmounts.includes(total)) uniqueAmounts.unshift(total);
    
    // Add specific common bills
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
    setTimeout(() => amountPaidInput.focus(), 100);
};

const calculateChange = () => {
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
    const paid = parseFloat(amountPaidInput.value) || 0;
    const change = paid - total;

    const transaction = {
        id: generateId(),
        date: new Date().toISOString(),
        items: [...cart],
        total: total,
        paid: paid,
        change: change
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
                    <span>Tunai</span>
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

// --- Event Listeners ---
const setupEventListeners = () => {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            const targetId = link.getAttribute('data-target');
            views.forEach(view => view.classList.remove('active-view'));
            document.getElementById(targetId).classList.add('active-view');
        });
    });

    // Categories
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-category');
            renderMenu();
        });
    });

    // Checkout
    checkoutBtn.addEventListener('click', openCheckoutModal);
    closeCheckoutBtn.addEventListener('click', () => checkoutModal.classList.remove('show'));
    amountPaidInput.addEventListener('input', calculateChange);
    confirmPaymentBtn.addEventListener('click', processPayment);

const getReceiptText = (trx) => {
    let text = `*Bakso Locer*\nJl. Citra Garden (081355671800)\n${new Date(trx.date).toLocaleString('id-ID')}\nNo: ${trx.id}\n------------------------\n`;
    trx.items.forEach(item => {
        text += `${item.qty}x ${item.name}\n${formatCurrency(item.qty * item.price)}\n`;
    });
    text += `------------------------\n`;
    text += `Total   : ${formatCurrency(trx.total)}\n`;
    text += `Tunai   : ${formatCurrency(trx.paid)}\n`;
    text += `Kembali : ${formatCurrency(trx.change)}\n`;
    text += `\nTerima kasih atas kunjungan Anda!\n100% Halal`;
    return text;
};

    // Receipt
    const finalizeTransaction = () => {
        receiptModal.classList.remove('show');
        cart = [];
        updateCartUI();
        showToast('Transaksi Berhasil Disimpan!');
    };

    closeReceiptBtn.addEventListener('click', finalizeTransaction);
    finishTransactionBtn.addEventListener('click', finalizeTransaction);
    
    printReceiptBtn.addEventListener('click', async () => {
        if (!currentReceiptTrx) return;
        
        const receiptText = getReceiptText(currentReceiptTrx);
        
        try {
            // 1. Coba gunakan Web Share API (jika didukung)
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

        // 2. Fallback: Copy to Clipboard & Tawarkan WhatsApp
        try {
            await navigator.clipboard.writeText(receiptText);
            showToast('Struk disalin! Bisa ditempel di Aplikasi Printer Anda.');
            
            // Beri jeda sedikit, lalu tawarkan buka WhatsApp
            setTimeout(() => {
                if(confirm('Struk sudah disalin. Ingin langsung bagikan via WhatsApp?')) {
                    const encodedText = encodeURIComponent(receiptText);
                    window.open(`https://wa.me/?text=${encodedText}`, '_system');
                }
            }, 500);
        } catch (e) {
            // Jika clipboard gagal
            showToast('Gagal menyalin struk.');
        }
    });

    printBluetoothBtn.addEventListener('click', () => {
        if (!currentReceiptTrx) return;
        const receiptText = getReceiptText(currentReceiptTrx);
        const encodedText = encodeURIComponent(receiptText);
        // Buka RawBT via Android Intent
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
            if (checkoutModal.classList.contains('show')) {
                checkoutModal.classList.remove('show');
            }
            if (receiptModal.classList.contains('show')) {
                // If they escape the receipt, treat it as finalize
                const finalizeTransaction = () => {
                    receiptModal.classList.remove('show');
                    cart = [];
                    updateCartUI();
                    showToast('Transaksi Berhasil Disimpan!');
                };
                finalizeTransaction();
            }
        }
    });
};

// Start app
init();
