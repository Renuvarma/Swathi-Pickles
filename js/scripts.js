let cart = [];

/* =========================
   INIT
========================= */
function initCart() {
    let saved = localStorage.getItem("cart");
    try {
        cart = saved? JSON.parse(saved) : [];
    } catch {
        cart = [];
    }
}

/* =========================
   SAVE
========================= */
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

/* =========================
   FIND ITEM - Uses exact weight match
========================= */
function findItem(product, weight) {
    return cart.find(i => i.name === product && i.weight === weight);
}

/* =========================
   GET WEIGHT - FIXED: Uses data-weight
========================= */
function getWeight(card) {
    let active = card.querySelector(".btn-outline-secondary.active");
    return active? active.dataset.weight : "1/2 Kg";
}

/* =========================
   SELECT WEIGHT - FINAL WORKING
========================= */
function selectWeight(btn, price) {
    let card = btn.closest(".card");
    let product = card.dataset.product;

    // 1. Active class update
    card.querySelectorAll(".btn-outline-secondary").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // 2. Price update
    card.querySelector(".price").innerText = price;

    // 3. FIX: data-weight nundi direct teesko. innerText vaddu.
    let weight = btn.dataset.weight;
    let item = findItem(product, weight);

    let box = card.querySelector(".cart-box");
    let addBtn = box.querySelector(".add-btn");
    let qtyBox = box.querySelector(".qty-box");
    let qtySpan = box.querySelector(".qty");

    if (item && item.qty > 0) {
        // Ee weight ki already cart lo unte + - show
        addBtn.classList.add("d-none");
        qtyBox.classList.remove("d-none");
        qtySpan.innerText = item.qty;
    } else {
        // Ee weight ki leka pothe Add To Cart show
        addBtn.classList.remove("d-none");
        qtyBox.classList.add("d-none");
        qtySpan.innerText = 1;
    }
}

/* =========================
   ADD TO CART
========================= */
function addToCart(product, btn) {
    let card = btn.closest(".card");
    let price = parseInt(card.querySelector(".price").innerText);
    let weight = getWeight(card); // Ippudu data-weight nundi vastadi

    let item = findItem(product, weight);

    if (!item) {
        item = { name: product, weight: weight, price: price, qty: 0 };
        cart.push(item);
    }

    item.qty++;
    saveCart();
    updateUI();
}

/* =========================
   CARD +
========================= */
function increaseQtyCard(btn) {
    let card = btn.closest(".card");
    let product = card.dataset.product;
    let weight = getWeight(card);

    let item = findItem(product, weight);
    if (!item) return;

    item.qty++;
    saveCart();
    updateUI();
}

/* =========================
   CARD -
========================= */
function decreaseQtyCard(btn) {
    let card = btn.closest(".card");
    let product = card.dataset.product;
    let weight = getWeight(card);

    let index = cart.findIndex(i => i.name === product && i.weight === weight);
    if (index === -1) return;

    cart[index].qty--;

    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }

    saveCart();
    updateUI();
}

/* =========================
   CART RENDER
========================= */
function renderCart() {
    let box = document.getElementById("cart-items");
    if (!box) return;

    let total = 0;
    let html = "";

    if (cart.length === 0) {
        box.innerHTML = '<p class="text-center text-muted">Your cart is empty</p>';
        let t = document.getElementById("total");
        if (t) t.innerText = 0;
        return;
    }

    cart.forEach((item, i) => {
        let sum = item.price * item.qty;
        total += sum;

        html += `
        <div class="border p-3 mb-3 d-flex justify-content-between align-items-center">
            <div>
                <h5>${item.name}</h5>
                <p>${item.weight}</p>
                <p>₹${item.price} × ${item.qty} = <b>₹${sum}</b></p>
            </div>
            <div>
                <button class="btn btn-dark btn-sm" onclick="cartMinus(${i})">-</button>
                <span class="mx-2">${item.qty}</span>
                <button class="btn btn-dark btn-sm" onclick="cartPlus(${i})">+</button>
            </div>
        </div>`;
    });

    box.innerHTML = html;
    let t = document.getElementById("total");
    if (t) t.innerText = total;
}

/* =========================
   CART + -
========================= */
function cartPlus(i) {
    cart[i].qty++;
    saveCart();
    updateUI();
}

function cartMinus(i) {
    cart[i].qty--;
    if (cart[i].qty <= 0) cart.splice(i, 1);
    saveCart();
    updateUI();
}

/* =========================
   BADGE
========================= */
function updateBadge() {
    let badge = document.getElementById("cart-count");
    if (!badge) return;
    let count = cart.reduce((s, i) => s + i.qty, 0);
    badge.innerText = count;
    badge.style.display = count > 0? 'inline-block' : 'none';
}

/* =========================
   PRODUCT UI SYNC
========================= */
function syncUI() {
    document.querySelectorAll(".card").forEach(card => {
        let product = card.dataset.product;
        if (!product) return;

        let weight = getWeight(card);
        let item = findItem(product, weight);

        let box = card.querySelector(".cart-box");
        if (!box) return;

        let add = box.querySelector(".add-btn");
        let qty = box.querySelector(".qty-box");
        let span = box.querySelector(".qty");

        if (item && item.qty > 0) {
            add.classList.add("d-none");
            qty.classList.remove("d-none");
            span.innerText = item.qty;
        } else {
            add.classList.remove("d-none");
            qty.classList.add("d-none");
            span.innerText = 1;
        }
    });
}

/* =========================
   MASTER UPDATE
========================= */
function updateUI() {
    renderCart();
    updateBadge();
    syncUI();
}
/* =========================
   WHATSAPP ORDER
========================= */
function whatsappOrder() {
    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }

    let msg = "🛒 *Swathi Pickles Order* 🛒\n\n";
    let total = 0;

    cart.forEach(i => {
        let sum = i.price * i.qty;
        total += sum;
        msg += `*${i.name}* (${i.weight}) x ${i.qty} = ₹${sum}\n`;
    });

    msg += `\n💰 *Total: ₹${total}*\n\n`;
    msg += "Please confirm order:\n";
    msg += "Name: \nAddress: \nPhone: \n";

    let phone = "917981460555";
    let url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
}

/* =========================
   FILTER PRODUCTS - UPDATED
========================= */
function filterProducts(category) {
    // 1. Sections hide/show based on data-category
    document.querySelectorAll('section[data-category]').forEach(section => {
        if(category === 'all') {
            section.style.display = '';
        } else {
            section.style.display = section.dataset.category.includes(category)? '' : 'none';
        }
    });

    // 2. Navbar active class update
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    let navId = 'navAll';
    if(category === 'veg') navId = 'navVeg';
    else if(category === 'nonveg') navId = 'navNonVeg';
    else if(category === 'masala') navId = 'navMasala';

    document.getElementById(navId)?.classList.add('active');
}

/* =========================
   INIT
========================= */
window.onload = function () {
    initCart();
    updateUI();
    filterProducts('all'); // Page load lo anni chupinchu
};