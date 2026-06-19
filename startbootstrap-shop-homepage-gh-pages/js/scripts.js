let cart = [];

/* =========================
   INIT
========================= */
function initCart() {
    let saved = localStorage.getItem("cart");

    try {
        cart = saved ? JSON.parse(saved) : [];
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
   FIND ITEM (KEY FIX)
========================= */
function findItem(product, weight) {
    return cart.find(i => i.name === product && i.weight === weight);
}

/* =========================
   GET WEIGHT (FIXED)
========================= */
function getWeight(card) {
    let active = card.querySelector(".btn-outline-secondary.active");
    return active ? active.innerText : "1/2 Kg";
}

/* =========================
   SELECT WEIGHT (FIXED RESET BUG)
========================= */
function selectWeight(btn, price) {

    let card = btn.closest(".card");

    card.querySelectorAll(".btn-outline-secondary")
        .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    card.querySelector(".price").innerText = price;

    // reset UI correctly
    let box = card.querySelector(".cart-box");
    box.querySelector(".add-btn").classList.remove("d-none");
    box.querySelector(".qty-box").classList.add("d-none");
    box.querySelector(".qty").innerText = 1;
}

/* =========================
   ADD TO CART (FIXED)
========================= */
function addToCart(product, btn) {

    let card = btn.closest(".card");

    let price = parseInt(card.querySelector(".price").innerText);
    let weight = getWeight(card);

    let item = findItem(product, weight);

    if (!item) {
        item = { name: product, weight, price, qty: 0 };
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
}

/* =========================
   PRODUCT UI SYNC
========================= */
function syncUI() {

    document.querySelectorAll(".card").forEach(card => {

        let product = card.dataset.product;
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

    let msg = "🛒 Order Details:\n\n";
    let total = 0;

    cart.forEach(i => {
        let sum = i.price * i.qty;
        total += sum;

        msg += `${i.name} (${i.weight}) x ${i.qty} = ₹${sum}\n`;
    });

    msg += `\n💰 Total: ₹${total}\n`;
    msg += "\nName:\nAddress:\nPhone:\n";

    let phone = "91XXXXXXXXXX"; // change your number

    let url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

    window.open(url, "_blank");
}

/* =========================
   INIT
========================= */
window.onload = function () {
    initCart();
    updateUI();
};