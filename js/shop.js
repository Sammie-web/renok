document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navContent = document.querySelector('.nav-content');
    const filterToggle = document.getElementById('filterToggle');
    const shopSidebar = document.getElementById('shopSidebar');
    const productGrid = document.getElementById('productGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const cartCount = document.getElementById('cartCount');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalSpan = document.getElementById('cartTotal');
    const priceRange = document.getElementById('priceRange');
    const priceValueSpan = document.getElementById('priceValue');
    const displayedProductCountSpan = document.getElementById('displayedProductCount');
    const totalProductCountSpan = document.getElementById('totalProductCount');

    // --- Product Data with Real Images (Replace with your actual image paths!) ---
    const allProducts = [
        { id: 1, name: 'RENK Classic Hemp', price: 12.99, image: 'images/hemp-rolls-classic.jpg', brand: 'renk', description: 'Our signature unbleached hemp rolling papers for a pure taste.' },
        { id: 2, name: 'RENK Ultra-Thin King Size', price: 9.50, image: 'images/ultra-thin-king-size.jpg', brand: 'renk', description: 'Experience the perfect burn with our ultra-thin, slow-burning papers.' },
        { id: 3, name: 'RENK Organic Rice Papers', price: 15.75, image: 'images/organic-rice-papers.jpg', brand: 'organic', description: 'Sustainably sourced organic rice papers for the eco-conscious consumer.' },
        { id: 4, name: 'RENK Sweet Berry Infusion', price: 18.25, image: 'images/flavored-berry.jpg', brand: 'infused', description: 'A delightful blend of sweet berry flavors for an aromatic experience.' },
        { id: 5, name: 'RENK Pre-Rolled Cones (50-pack)', price: 29.99, image: 'images/pre-rolled-cones-50pack.jpg', brand: 'renk', description: 'Convenience meets quality. Ready-to-fill cones for quick enjoyment.' },
        { id: 6, name: 'RENK Rolling Machine Kit', price: 22.00, image: 'images/rolling-machine-kit.jpg', brand: 'accessories', description: 'Everything you need: rolling machine, papers, and filter tips in one kit.' },
        { id: 7, name: 'RENK Eco-Friendly Filters', price: 7.99, image: 'images/eco-filters.jpg', brand: 'filters', description: 'Biodegradable filter tips for a cleaner and greener roll.' },
        { id: 8, name: 'RENK Luxury Gold Collection', price: 35.00, image: 'images/luxury-gold-papers.jpg', brand: 'premium', description: 'Indulge in the luxury of 24K edible gold rolling papers. For special occasions.' },
        { id: 9, name: 'RENK Precision Grinder', price: 45.00, image: 'images/precision-grinder.jpg', brand: 'accessories', description: 'Aircraft-grade aluminum grinder with razor-sharp teeth for a perfect grind.' },
        { id: 10, name: 'RENK Tropical Mango Burst', price: 10.50, image: 'images/flavored-mango.jpg', brand: 'infused', description: 'Escape to the tropics with the sweet and tangy flavor of mango.' },
        { id: 11, name: 'RENK Natural Brown Unbleached', price: 11.99, image: 'images/natural-brown-unbleached.jpg', brand: 'renk', description: 'For those who prefer a natural and unbleached aesthetic.' },
        { id: 12, name: 'RENK Activated Charcoal Filters', price: 10.00, image: 'images/charcoal-filters.jpg', brand: 'filters', description: 'Advanced activated charcoal filters for a smoother, cleaner draw.' },
        // Add more products as needed!
        { id: 13, name: 'RENK Large Rolling Tray', price: 25.00, image: 'images/rolling-tray.jpg', brand: 'accessories', description: 'Keep your rolling area tidy with our spacious metal rolling tray.' },
        { id: 14, name: 'RENK Limited Edition Art Papers', price: 19.99, image: 'images/limited-edition.jpg', brand: 'premium', description: 'Exclusive collection featuring unique artist designs.' },
        { id: 15, name: 'RENK Cedar Humidor', price: 75.00, image: 'images/cedar-humidor.jpg', brand: 'accessories', description: 'Preserve your materials in optimal conditions with our premium cedar humidor.' },
    ];

    let displayedProducts = [];
    const productsPerPage = 6; // Number of products to show initially and on "Load More"
    let currentPage = 1;
    let cart = JSON.parse(localStorage.getItem('renkCart')) || []; // Load cart from localStorage

    // --- Functions ---

    // Render Products
    const renderProducts = (productsToRender, append = false) => {
        if (!append) {
            productGrid.innerHTML = ''; // Clear existing products if not appending
            // Only scroll to top if not appending (i.e., new filter/sort)
            if (!append) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        productsToRender.forEach((product, index) => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            // Stagger animation delay for newly added items
            // Adjust index for animation if appending to maintain visual flow
            const actualIndex = append ? productGrid.children.length + index : index;
            productCard.style.animationDelay = `${(actualIndex % productsPerPage) * 0.1}s`;

            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/200x180/D3D3D3/000000?text=Image+Missing';">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
            `;
            productGrid.appendChild(productCard);
        });

        // Update displayed count
        displayedProductCountSpan.textContent = productGrid.children.length;
        totalProductCountSpan.textContent = displayedProducts.length; // Total *filtered* products

        // Manage Load More button visibility
        if (productGrid.children.length >= displayedProducts.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }

        // Attach event listeners to new Add to Cart buttons
        productGrid.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.onclick = (event) => addToCart(event.target.dataset.productId);
        });
    };

    // Filter and Sort Products
    const filterAndSortProducts = () => {
        let filtered = [...allProducts]; // Start with all products

        // Price Range Filter
        const maxPrice = parseFloat(priceRange.value);
        filtered = filtered.filter(p => p.price <= maxPrice);

        // Brand Filter (using 'brand' property for categories as per wireframe categories)
        const selectedBrands = Array.from(document.querySelectorAll('.filter-group input[type="checkbox"]:checked'))
                                   .map(cb => cb.value);
        if (selectedBrands.length > 0) {
            filtered = filtered.filter(p => selectedBrands.includes(p.brand));
        }

        // Sorting
        const sortOrder = document.getElementById('sortOrder').value;
        if (sortOrder === 'price-asc') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortOrder === 'price-desc') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortOrder === 'newest') {
            // Assuming higher ID means newer, or add a 'dateAdded' property
            filtered.sort((a, b) => b.id - a.id);
        }
        // 'featured' implies no specific sort, original order or a predefined featured order

        displayedProducts = filtered; // Update products that match current filters/sort
        currentPage = 1; // Reset to first page
        const productsToDisplay = displayedProducts.slice(0, productsPerPage * currentPage);
        renderProducts(productsToDisplay, false); // Render from scratch
    };

    // Load More Products
    const loadMoreProducts = () => {
        currentPage++;
        const startIndex = productsPerPage * (currentPage - 1);
        const endIndex = startIndex + productsPerPage;
        const productsToAppend = displayedProducts.slice(startIndex, endIndex);
        renderProducts(productsToAppend, true); // Append products
    };

    // Add to Cart
    const addToCart = (productId) => {
        const product = allProducts.find(p => p.id === parseInt(productId));
        if (product) {
            const existingItem = cart.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            updateCartDisplay();
            saveCart(); // Save cart to local storage
            // Optional: A more subtle notification could be implemented
            // For now, keeping the alert for clear feedback
            // alert(`${product.name} added to cart!`);
            const button = document.querySelector(`.add-to-cart-btn[data-product-id="${productId}"]`);
            if (button) {
                button.textContent = 'Added!';
                button.style.backgroundColor = '#4CAF50'; // Green color
                setTimeout(() => {
                    button.textContent = 'Add to Cart';
                    button.style.backgroundColor = ''; // Revert
                }, 1000);
            }
        }
    };

    // Remove from Cart
    const removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== parseInt(productId));
        updateCartDisplay();
        saveCart(); // Save cart to local storage
    };

    // Update Cart Display
    const updateCartDisplay = () => {
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>No items in cart.</p>';
        } else {
            cart.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'cart-item';
                itemDiv.innerHTML = `
                    <span class="cart-item-name">${item.name} x ${item.quantity}</span>
                    <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="cart-item-remove" data-product-id="${item.id}">Remove</button>
                `;
                cartItemsContainer.appendChild(itemDiv);
                total += item.price * item.quantity;
            });
        }
        cartTotalSpan.textContent = total.toFixed(2);

        // Attach remove listeners
        cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(button => {
            button.onclick = (event) => removeFromCart(event.target.dataset.productId);
        });
    };

    // Save cart to localStorage
    const saveCart = () => {
        localStorage.setItem('renkCart', JSON.stringify(cart));
    };

    // --- Event Listeners ---

    // Mobile Menu Toggle
    mobileMenuToggle.addEventListener('click', () => {
        navContent.classList.toggle('active'); // Use 'active' class for showing/hiding
    });

    // Filter Sidebar Toggle (for mobile/tablet)
    filterToggle.addEventListener('click', () => {
        shopSidebar.classList.toggle('active');
        // Add a class to body to prevent scroll when sidebar is open
        document.body.classList.toggle('no-scroll', shopSidebar.classList.contains('active'));
    });

    // Close sidebar if clicking outside (on desktop where it's not sticky, or mobile overlay)
    // Only close if it's currently active and click is outside sidebar and not on the toggle button
    document.addEventListener('click', (event) => {
        if (shopSidebar.classList.contains('active') &&
            !shopSidebar.contains(event.target) &&
            !filterToggle.contains(event.target) &&
            !mobileMenuToggle.contains(event.target) && // Also check mobile menu toggle
            window.innerWidth < 1024) { // Only for mobile/tablet where it's an overlay
            shopSidebar.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });

    // Close sidebar on ESC key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && shopSidebar.classList.contains('active')) {
            shopSidebar.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });


    // Price Range Slider
    priceRange.addEventListener('input', () => {
        priceValueSpan.textContent = `$${parseFloat(priceRange.value).toFixed(2)}`;
    });
    // Apply filters when slider value changes (debounced for performance)
    let priceFilterTimeout;
    priceRange.addEventListener('change', () => {
        clearTimeout(priceFilterTimeout);
        priceFilterTimeout = setTimeout(filterAndSortProducts, 300);
    });

    // Brand Filter Checkboxes & Apply Button
    document.querySelectorAll('.filter-group input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', filterAndSortProducts);
    });
    document.querySelector('.apply-filters-btn').addEventListener('click', () => {
        filterAndSortProducts();
        // Close sidebar on mobile after applying filters
        if (window.innerWidth < 1024) {
            shopSidebar.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });

    // Sorting Dropdown
    document.getElementById('sortOrder').addEventListener('change', filterAndSortProducts);

    // Load More Button
    loadMoreBtn.addEventListener('click', loadMoreProducts);

    // Set max value for price range dynamically based on products
    const maxProductPrice = Math.max(...allProducts.map(p => p.price));
    priceRange.max = Math.ceil(maxProductPrice); // Round up to nearest whole number
    priceRange.value = Math.ceil(maxProductPrice); // Set initial value to max
    priceValueSpan.textContent = `$${priceRange.value}`;


    // Initial load
    filterAndSortProducts(); // This will render the first set of products
    updateCartDisplay(); // Initialize cart display from localStorage
});