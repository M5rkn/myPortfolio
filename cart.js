document.addEventListener('DOMContentLoaded', function() {
    const cartList = document.getElementById('cartList');
    const cartTotal = document.getElementById('cartTotal');
    const paymentSection = document.getElementById('paymentSection');
    const payStripeBtn = document.getElementById('payStripeBtn');

    let cart = [];
    try { cart = JSON.parse(localStorage.getItem('cart')) || []; } catch(e){}

    if (!cart.length) {
        cartList.innerHTML = `
        <div class="cart-empty">
            <div class="cart-empty-icon">🛒</div>
            <div class="cart-empty-title">Ваша корзина пуста</div>
            <div class="cart-empty-text">Добавьте товары из калькулятора или каталога.</div>
            <a href="index.html" class="btn btn-primary cart-empty-btn"><span>На главную</span></a>
        </div>`;
        cartTotal.textContent = '';
        paymentSection.style.display = 'none';
        return;
    }

    let total = 0;
    cartList.innerHTML = `<div class="cart-grid">` + cart.map((item, idx) => {
        let services = item.services && item.services.length
            ? `<ul class="cart-services">` + item.services.map(s => `<li><span class="cart-service-name">${s.name}</span> <span class="cart-service-price">+${s.price} €</span></li>`).join('') + `</ul>`
            : '';
        const itemTotal = item.package.price + (item.services ? item.services.reduce((sum, s) => sum + s.price, 0) : 0);
        total += itemTotal;
        return `
        <div class="cart-card">
            <div class="cart-card-header">
                <div class="cart-package-name">${item.package.name}</div>
                <button class="cart-remove-btn" data-idx="${idx}" title="Удалить">×</button>
            </div>
            <div class="cart-package-price">${item.package.price} €</div>
            ${services}
            <div class="cart-item-total">Итого: <b>${itemTotal} €</b></div>
        </div>`;
    }).join('') + `</div>`;
    cartTotal.innerHTML = `<span class="cart-total-label">Итого:</span> <span class="cart-total-value">${total} €</span>`;
    paymentSection.style.display = '';

    // Удаление товара из корзины
    cartList.querySelectorAll('.cart-remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = parseInt(this.dataset.idx);
            cart.splice(idx, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            location.reload();
        });
    });

    // Stripe.js
    (function addStripeScript() {
        if (document.getElementById('stripe-js')) return;
        const script = document.createElement('script');
        script.id = 'stripe-js';
        script.src = 'https://js.stripe.com/v3/';
        document.body.appendChild(script);
    })();

    payStripeBtn.addEventListener('click', async function() {
        if (!total || total < 1) {
            alert('Корзина пуста!');
            return;
        }
        try {
            const res = await fetch('/api/payment/stripe/create-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: total, cart })
            });
            const data = await res.json();
            if (data && data.sessionId) {
                if (window.Stripe) {
                    const stripe = window.Stripe('YOUR_STRIPE_PUBLISHABLE_KEY');
                    stripe.redirectToCheckout({ sessionId: data.sessionId });
                } else {
                    window.location.href = data.url;
                }
                // Очищаем корзину после оплаты (будет корректно после webhook)
                // localStorage.removeItem('cart');
            } else {
                alert('Ошибка создания платежа.');
            }
        } catch (e) {
            alert('Ошибка оплаты: ' + e.message);
        }
    });
}); 