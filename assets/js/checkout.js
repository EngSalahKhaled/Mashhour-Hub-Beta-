/* =========================================================================
   CHECKOUT ENGINE — Handles payments and order creation
   Connects Public Storefront to Payment Gateway and Backend
   ========================================================================= */

async function initiateCheckout(productId, influencerId, amount, productTitle) {
    const token = localStorage.getItem('token');
    
    // 1. If not logged in, redirect to login
    if (!token) {
        alert('يرجى تسجيل الدخول أولاً لإتمام عملية الشراء');
        window.location.href = '../login.html?redirect=' + encodeURIComponent(window.location.href);
        return;
    }

    try {
        // Show loading state
        const buyBtn = event.target;
        const originalText = buyBtn.innerText;
        buyBtn.innerText = 'جاري التحويل... 💳';
        buyBtn.disabled = true;

        // 2. Call Backend to create payment session
        const res = await fetch(`${window.location.origin.replace('3000', '5000')}/api/portal/sales/checkout`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                productId, 
                influencerId, 
                amount,
                productTitle
            })
        });

        const data = await res.json();
        
        if (data.success) {
            // In a real production, we'd redirect to data.paymentUrl (MyFatoorah/Stripe)
            // For now, we simulate a successful redirect
            alert('تم إنشاء طلبك بنجاح! سيتم توجيهك الآن لإتمام الدفع.');
            window.location.href = data.paymentUrl || '../thank-you.html';
        } else {
            alert('حدث خطأ أثناء معالجة الطلب: ' + data.message);
            buyBtn.innerText = originalText;
            buyBtn.disabled = false;
        }
    } catch (e) {
        console.error(e);
        alert('حدث خطأ في الاتصال بالسيرفر');
    }
}
