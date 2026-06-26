document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Custom Cursor ---
    const cursor = document.getElementById('custom-cursor');
    const follower = document.getElementById('cursor-follower');
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        // slight delay for follower
        setTimeout(() => {
            follower.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        }, 50);
    });

    const magnetics = document.querySelectorAll('.magnetic, button, a');
    magnetics.forEach(elem => {
        elem.addEventListener('mouseenter', () => {
            follower.classList.add('hover-active');
        });
        elem.addEventListener('mouseleave', () => {
            follower.classList.remove('hover-active');
            elem.style.transform = '';
        });
        
        // Magnetic effect for elements specifically marked with .magnetic
        if(elem.classList.contains('magnetic')) {
            elem.addEventListener('mousemove', (e) => {
                const rect = elem.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                elem.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });
        }
    });

    // --- 2. 3D Card Hover ---
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element.
            const y = e.clientY - rect.top;  // y position within the element.
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -15; // Max 15deg
            const rotateY = ((x - centerX) / centerX) * 15;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
        });
    });

    // --- 3. Scroll Reveal ---
    const revealElements = document.querySelectorAll('.reveal-up');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
    
    revealElements.forEach(el => revealObserver.observe(el));

    // --- 4. Cart Engine ---
    let cart = [];
    const cartIcon = document.getElementById('cart-icon');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartBadge = document.getElementById('cart-badge');

    function toggleCart() {
        cartSidebar.classList.toggle('open');
        cartOverlay.classList.toggle('active');
    }

    cartIcon.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;
        let count = 0;

        cart.forEach((item, index) => {
            subtotal += item.price * item.quantity;
            count += item.quantity;

            const itemEl = document.createElement('div');
            itemEl.classList.add('cart-item');
            itemEl.innerHTML = `
                <img src="${item.img}" alt="${item.name}">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">$${item.price}</div>
                    <div class="qty-controls">
                        <button class="qty-btn minus" data-index="${index}">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn plus" data-index="${index}">+</button>
                    </div>
                </div>
                <button class="remove-item" data-index="${index}">&times;</button>
            `;
            cartItemsContainer.appendChild(itemEl);
        });

        cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        cartBadge.textContent = count;

        // Re-bind listeners for dynamic cart buttons
        document.querySelectorAll('.qty-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                cart[idx].quantity += 1;
                updateCartUI();
            });
        });
        document.querySelectorAll('.qty-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                if(cart[idx].quantity > 1) {
                    cart[idx].quantity -= 1;
                } else {
                    cart.splice(idx, 1);
                }
                updateCartUI();
            });
        });
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                cart.splice(idx, 1);
                updateCartUI();
            });
        });
    }

    function addToCart(product, buttonEl) {
        const existing = cart.find(item => item.id === product.id);
        if(existing) {
            existing.quantity += 1;
        } else {
            cart.push({...product, quantity: 1});
        }
        updateCartUI();
        animateGhostIcon(product.img, buttonEl);
    }

    // --- 5. Ghost Icon Animation (Add to Cart Blast) ---
    function animateGhostIcon(imgSrc, buttonEl) {
        const rect = buttonEl.getBoundingClientRect();
        const targetRect = cartIcon.getBoundingClientRect();
        
        const ghost = document.createElement('img');
        ghost.src = imgSrc;
        ghost.classList.add('ghost-icon');
        ghost.style.left = `${rect.left}px`;
        ghost.style.top = `${rect.top}px`;
        document.body.appendChild(ghost);

        // trigger reflow
        ghost.getBoundingClientRect();

        ghost.style.left = `${targetRect.left}px`;
        ghost.style.top = `${targetRect.top}px`;
        ghost.style.transform = 'scale(0.2)';
        ghost.style.opacity = '0.5';

        setTimeout(() => {
            ghost.remove();
            cartIcon.style.transform = 'scale(1.2)';
            setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
        }, 800);
    }

    // --- 6. Modal Engine ---
    const modal = document.getElementById('product-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modalImg = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalPrice = document.getElementById('modal-price');
    const modalDesc = document.getElementById('modal-desc');
    const modalAddCartBtn = document.getElementById('modal-add-cart');
    let currentModalProduct = null;

    function openModal(product) {
        currentModalProduct = product;
        modalImg.src = product.img;
        modalTitle.textContent = product.name;
        modalPrice.textContent = `$${product.price}`;
        modalDesc.textContent = product.desc;
        modal.classList.add('active');
        
        // Reset sizes
        document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if(e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });

    modalAddCartBtn.addEventListener('click', (e) => {
        if(currentModalProduct) {
            addToCart(currentModalProduct, e.target);
            setTimeout(closeModal, 600);
        }
    });

    // --- 7. Bind Product Card Buttons ---
    document.querySelectorAll('.product-card').forEach(card => {
        const product = {
            id: card.getAttribute('data-id'),
            name: card.getAttribute('data-name'),
            price: parseFloat(card.getAttribute('data-price')),
            img: card.getAttribute('data-img'),
            desc: card.getAttribute('data-desc')
        };

        card.querySelector('.explore-btn').addEventListener('click', () => {
            openModal(product);
        });

        card.querySelector('.add-cart-btn').addEventListener('click', (e) => {
            addToCart(product, e.target);
        });
    });
});
