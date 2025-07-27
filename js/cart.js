document.addEventListener('DOMContentLoaded', function() {
    // Quantity controls
    document.querySelectorAll('.qty-btn').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('.qty-input');
            let value = parseInt(input.value);
            
            if (this.classList.contains('minus') && value > 1) {
                input.value = value - 1;
            } else if (this.classList.contains('plus')) {
                input.value = value + 1;
            }
            
            updatePrices();
        });
    });

    // Remove items
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.cart-item').style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => {
                this.closest('.cart-item').remove();
                updateCartCount();
            }, 300);
        });
    });

    // Update cart count
    function updateCartCount() {
        const count = document.querySelectorAll('.cart-item').length;
        document.querySelector('.cart-count').textContent = count;
    }

    // Toast notification
    function showToast(message) {
        const toast = document.querySelector('.toast-notification');
        toast.querySelector('.toast-message').textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
});

// Add this to your cart.css
