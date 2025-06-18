document.addEventListener('DOMContentLoaded', function() {
    const cartList = document.getElementById('cartList');
    const cartTotal = document.getElementById('cartTotal');
    const paymentSection = document.getElementById('paymentSection');
    const payStripeBtn = document.getElementById('payStripeBtn');

    let cart = [];
    try { cart = JSON.parse(localStorage.getItem('cart')) || []; } catch(e){}

    if (!cart.length) {
        cartList.innerHTML = '<p>Корзина пуста.</p>';
        cartTotal.textContent = '';
        paymentSection.style.display = 'none';
        return;
    }

    let total = 0;
    cartList.innerHTML = cart.map((item, idx) => {
        let services = item.services && item.services.length
            ? '<ul>' + item.services.map(s => `<li>${s.name} — ${s.price} €</li>`).join('') + '</ul>'
            : '';
        total += item.package.price + (item.services ? item.services.reduce((sum, s) => sum + s.price, 0) : 0);
        return `<div class="cart-item"><b>${item.package.name}</b> — ${item.package.price} €${services}</div>`;
    }).join('<hr>');
    cartTotal.textContent = 'Итого: ' + total + ' €';
    paymentSection.style.display = '';

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