document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("cart-overlay")) {
        document.body.insertAdjacentHTML("beforeend", `
            <div id="cart-overlay" class="cart-overlay" aria-hidden="true">
                <aside class="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cart-title">
                    <div class="cart-header">
                        <h2 id="cart-title">Tu bolsa</h2>
                        <button id="cart-close" class="cart-close" type="button" aria-label="Cerrar carrito">&times;</button>
                    </div>
                    <div id="cart-items" class="cart-items"></div>
                    <div class="cart-footer">
                        <div class="cart-total"><span>Total</span><strong id="cart-total">$0 USD</strong></div>
                        <button id="checkout-button" class="checkout-button" type="button">Finalizar compra</button>
                        <p class="cart-disclaimer">Compra de demostración. No se realizará ningún cobro.</p>
                    </div>
                </aside>
            </div>
        `);
    }

    const productGrid = document.getElementById("product-grid");
    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.getElementById("primary-navigation");
    const cartButton = document.querySelector(".cart-button");
    const cartOverlay = document.getElementById("cart-overlay");
    const cartClose = document.getElementById("cart-close");
    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cart-total");
    const checkoutButton = document.getElementById("checkout-button");

    let cart = JSON.parse(localStorage.getItem("apple-demo-cart") || "[]");

    const formatPrice = value => `$${Number(value).toLocaleString("en-US")} USD`;

    const detailPage = document.getElementById("product-detail");
    if (detailPage) {
        const params = new URLSearchParams(window.location.search);
        const product = {
            id: Number(params.get("id")) || 121,
            title: params.get("title") || "iPad Air",
            price: Number(params.get("price")) || 599,
            image: params.get("image") || "img/products/121.webp",
            description: params.get("description") || "Combina diseño elegante con potencia para estudiar, trabajar y disfrutar."
        };

        detailPage.innerHTML = `
            <div class="apple-buy-layout">
                <aside class="apple-buy-gallery" aria-label="Galería del producto">
                    <div class="apple-gallery-frame"><img id="detail-main-image" src="${product.image}" alt="${product.title}"></div>
                    <div class="apple-dotnav" aria-label="Imágenes">
                        <button type="button" class="is-selected" data-image="${product.image}" aria-label="Imagen principal"></button>
                        <button type="button" data-image="img/products/123.webp" aria-label="Vista alternativa"></button>
                        <button type="button" data-image="img/products/124.webp" aria-label="Vista trasera"></button>
                    </div>
                </aside>
                <section class="apple-buy-options">
                    <span class="apple-new-badge">Nuevo</span>
                    <h1>Comprar <span>${product.title}</span></h1>
                    <p class="apple-buy-description">${product.description}</p>
                    <p class="apple-buy-price" id="apple-buy-price">Desde ${formatPrice(product.price)}</p>
                    <p class="apple-monthly" id="apple-monthly">o $${(product.price / 24).toFixed(2)} al mes por 24 meses.</p>
                    <div class="apple-promo-row">
                        <p><strong>Envío gratis.</strong><br><span>Entrega disponible.</span></p>
                        <p><strong>Retiro gratis.</strong><br><span>Disponible en Apple Store.</span></p>
                    </div>
                    <fieldset class="apple-option-group">
                        <legend>Elige una versión.</legend>
                        <label class="apple-option-card is-selected"><input type="radio" name="model" value="0" checked><span><strong>${product.title}</strong><small>Pantalla de última generación</small></span><span>${formatPrice(product.price)}</span></label>
                        <label class="apple-option-card"><input type="radio" name="model" value="200"><span><strong>${product.title} Pro</strong><small>Más rendimiento y almacenamiento</small></span><span>${formatPrice(product.price + 200)}</span></label>
                    </fieldset>
                    <fieldset class="apple-option-group apple-colors">
                        <legend>Elige tu acabado.</legend>
                        <div class="apple-color-options">
                            <label><input type="radio" name="color" value="Azul" checked><span class="color-swatch blue"></span><small>Azul</small></label>
                            <label><input type="radio" name="color" value="Negro"><span class="color-swatch black"></span><small>Negro</small></label>
                            <label><input type="radio" name="color" value="Plateado"><span class="color-swatch silver"></span><small>Plateado</small></label>
                        </div>
                    </fieldset>
                    <fieldset class="apple-option-group">
                        <legend>Elige el almacenamiento.</legend>
                        <label class="apple-option-card is-selected"><input type="radio" name="storage" value="0" checked><span><strong>256 GB</strong></span><span>Desde ${formatPrice(product.price)}</span></label>
                        <label class="apple-option-card"><input type="radio" name="storage" value="200"><span><strong>512 GB</strong></span><span>${formatPrice(product.price + 200)}</span></label>
                        <label class="apple-option-card"><input type="radio" name="storage" value="400"><span><strong>1 TB</strong></span><span>${formatPrice(product.price + 400)}</span></label>
                    </fieldset>
                    <div class="apple-summary">
                        <p>Tu ${product.title}</p>
                        <strong id="apple-summary-price">${formatPrice(product.price)}</strong>
                        <button type="button" id="detail-buy" class="apple-add-bag">Agregar a la bolsa</button>
                        <button type="button" id="detail-now" class="apple-buy-now">Comprar ahora</button>
                    </div>
                </section>
            </div>
        `;

        let configuredPrice = product.price;
        document.querySelectorAll(".apple-dotnav button").forEach(button => {
            button.addEventListener("click", () => {
                document.querySelectorAll(".apple-dotnav button").forEach(item => item.classList.remove("is-selected"));
                button.classList.add("is-selected");
                document.getElementById("detail-main-image").src = button.dataset.image;
            });
        });
        document.querySelectorAll(".apple-option-card").forEach(card => {
            card.addEventListener("click", () => {
                const group = card.closest("fieldset");
                group.querySelectorAll(".apple-option-card").forEach(item => item.classList.remove("is-selected"));
                card.classList.add("is-selected");
            });
        });
        const updateConfiguredPrice = () => {
            const modelExtra = Number(document.querySelector('input[name="model"]:checked').value);
            const storageExtra = Number(document.querySelector('input[name="storage"]:checked').value);
            configuredPrice = product.price + modelExtra + storageExtra;
            document.getElementById("apple-buy-price").textContent = `Desde ${formatPrice(configuredPrice)}`;
            document.getElementById("apple-monthly").textContent = `o $${(configuredPrice / 24).toFixed(2)} al mes por 24 meses.`;
            document.getElementById("apple-summary-price").textContent = formatPrice(configuredPrice);
        };
        document.querySelectorAll('input[name="model"], input[name="storage"]').forEach(input => {
            input.addEventListener("change", updateConfiguredPrice);
        });
        document.getElementById("detail-buy").addEventListener("click", () => addToCart({ ...product, price: configuredPrice }));
        document.getElementById("detail-now").addEventListener("click", () => {
            addToCart({ ...product, price: configuredPrice });
            setTimeout(() => document.getElementById("checkout-button").click(), 50);
        });
    }

    const saveCart = () => {
        localStorage.setItem("apple-demo-cart", JSON.stringify(cart));
        renderCart();
    };

    const openCart = () => {
        cartOverlay.classList.add("is-open");
        cartOverlay.setAttribute("aria-hidden", "false");
        document.body.classList.add("cart-open");
        cartClose.focus();
    };

    const closeCart = () => {
        cartOverlay.classList.remove("is-open");
        cartOverlay.setAttribute("aria-hidden", "true");
        document.body.classList.remove("cart-open");
        cartButton.focus();
    };

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart();
        openCart();
    };

    const renderCart = () => {
        const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
        const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

        cartCount.textContent = totalQuantity;
        cartCount.classList.toggle("has-items", totalQuantity > 0);
        cartTotal.textContent = formatPrice(totalPrice);
        checkoutButton.disabled = cart.length === 0;

        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <p>Tu bolsa está vacía.</p>
                    <button type="button" class="cart-continue">Seguir comprando</button>
                </div>
            `;
            cartItems.querySelector(".cart-continue").addEventListener("click", closeCart);
            return;
        }

        cartItems.innerHTML = cart.map(item => `
            <article class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-info">
                    <h3>${item.title}</h3>
                    <p>${formatPrice(item.price)}</p>
                    <div class="cart-quantity">
                        <button type="button" data-action="decrease" aria-label="Reducir cantidad">−</button>
                        <span>${item.quantity}</span>
                        <button type="button" data-action="increase" aria-label="Aumentar cantidad">+</button>
                    </div>
                </div>
                <button type="button" class="cart-remove" data-action="remove" aria-label="Eliminar ${item.title}">&times;</button>
            </article>
        `).join("");
    };

    cartButton.addEventListener("click", openCart);
    cartClose.addEventListener("click", closeCart);
    cartOverlay.addEventListener("click", event => {
        if (event.target === cartOverlay) closeCart();
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && cartOverlay.classList.contains("is-open")) closeCart();
    });

    cartItems.addEventListener("click", event => {
        const actionButton = event.target.closest("[data-action]");
        if (!actionButton) return;

        const itemElement = actionButton.closest(".cart-item");
        const id = Number(itemElement.dataset.id);
        const item = cart.find(product => product.id === id);
        if (!item) return;

        if (actionButton.dataset.action === "increase") item.quantity += 1;
        if (actionButton.dataset.action === "decrease") item.quantity -= 1;
        if (actionButton.dataset.action === "remove") cart = cart.filter(product => product.id !== id);
        if (item.quantity <= 0) cart = cart.filter(product => product.id !== id);
        saveCart();
    });

    checkoutButton.addEventListener("click", () => {
        if (cart.length === 0) return;
        alert("¡Compra simulada realizada!\nNo se realizó ningún cobro.");
        cart = [];
        saveCart();
        closeCart();
    });

    const supportForm = document.getElementById("support-form");
    if (supportForm) {
        supportForm.addEventListener("submit", event => {
            event.preventDefault();
            const status = document.getElementById("support-status");
            status.textContent = "Consulta enviada. Te responderemos a la brevedad.";
            supportForm.reset();
        });
    }

    navToggle.addEventListener("click", () => {
        const isExpanded = navToggle.getAttribute("aria-expanded") === "true";
        navToggle.setAttribute("aria-expanded", String(!isExpanded));
        navToggle.querySelector(".sr-only").textContent = isExpanded ? "Abrir menú" : "Cerrar menú";
        navMenu.classList.toggle("is-open", !isExpanded);
    });

    navMenu.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navToggle.setAttribute("aria-expanded", "false");
            navToggle.querySelector(".sr-only").textContent = "Abrir menú";
            navMenu.classList.remove("is-open");
            document.querySelector(".nav-item-store")?.classList.remove("is-open");
        });
    });

    const storeMenuTrigger = document.querySelector(".store-menu-trigger");
    const storeMenuItem = document.querySelector(".nav-item-store");
    if (storeMenuTrigger && storeMenuItem) {
        storeMenuTrigger.addEventListener("click", event => {
            event.stopPropagation();
            const isOpen = storeMenuItem.classList.toggle("is-open");
            storeMenuTrigger.setAttribute("aria-expanded", String(isOpen));
        });
        document.addEventListener("click", event => {
            if (!storeMenuItem.contains(event.target)) {
                storeMenuItem.classList.remove("is-open");
                storeMenuTrigger.setAttribute("aria-expanded", "false");
            }
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                storeMenuItem.classList.remove("is-open");
                storeMenuTrigger.setAttribute("aria-expanded", "false");
                storeMenuTrigger.focus();
            }
        });
    }

    const megaMenus = {
        "Mac": {
            columns: [
                ["Explore Mac", "Explore All Mac", "MacBook Neo", "MacBook Air", "MacBook Pro", "iMac", "Mac mini", "Mac Studio", "Displays", "Compare Mac", "Switch from PC to Mac"],
                ["Shop Mac", "Shop Mac", "Apple Store Black Friday Event", "Help Me Choose", "Mac Accessories", "Apple Upgrade", "Apple Trade In", "Financing", "Personal Setup"],
                ["More from Mac", "Mac Support", "AppleCare", "macOS 27", "Apple Intelligence and Siri", "Apps by Apple", "Apple Creator Studio", "Better with iPhone", "iCloud+", "Mac for Business", "Education", "Apple at Work"]
            ]
        },
        "iPad": {
            columns: [
                ["Explore iPad", "Explore All iPad", "iPad Pro", "iPad Air", "iPad", "iPad mini", "Apple Pencil", "Keyboards", "Compare iPad"],
                ["Shop iPad", "Shop iPad", "Apple Store Black Friday Event", "iPad Accessories", "Apple Upgrade", "Apple Trade In", "Financing", "Personal Setup"],
                ["More from iPad", "iPad Support", "AppleCare", "iPadOS 27", "Apple Intelligence and Siri", "Apps by Apple", "Apple Creator Studio", "iCloud+", "Education", "Apple at Work"]
            ]
        },
        "iPhone": {
            columns: [
                ["Explore iPhone", "Explore All iPhone", "iPhone 18 Pro", "iPhone 18", "iPhone Air", "iPhone Duo", "Compare iPhone", "Switch to iPhone"],
                ["Shop iPhone", "Shop iPhone", "Apple Store Black Friday Event", "iPhone Accessories", "Apple Upgrade", "Apple Trade In", "Financing", "Personal Setup"],
                ["More from iPhone", "iPhone Support", "AppleCare", "iOS 27", "Apple Intelligence and Siri", "Apps by Apple", "iCloud+", "Apple at Work"]
            ]
        },
        "Watch": {
            columns: [
                ["Explore Watch", "Explore All Apple Watch", "Apple Watch Series 12", "Apple Watch Ultra 4", "Apple Watch SE 3", "Apple Watch Nike", "Apple Watch Hermès", "Compare Watch", "Why Apple Watch"],
                ["Shop Watch", "Shop Apple Watch", "Apple Store Black Friday Event", "Apple Watch Bands", "Apple Watch Accessories", "Apple Upgrade", "Apple Trade In", "Financing", "Personal Setup"],
                ["More from Watch", "Apple Watch Support", "AppleCare", "watchOS 27", "Apple Watch for Your Kids", "Apps by Apple", "Apple Fitness+", "Education"]
            ]
        },
        "Vision": {
            columns: [
                ["Explore Vision", "Explore Apple Vision Pro", "Tech Specs"],
                ["Shop Vision", "Shop Apple Vision Pro", "Apple Vision Pro Accessories", "Book a Demo", "Financing", "Personal Setup"],
                ["More from Vision", "Apple Vision Pro Support", "AppleCare", "visionOS 27", "Apple Vision Pro for Enterprise"]
            ]
        },
        "AirPods": {
            columns: [
                ["Explore AirPods", "Explore All AirPods", "AirPods 5", "AirPods Pro 3", "AirPods Max 2", "Compare AirPods"],
                ["Shop AirPods", "Apple Store Black Friday Event", "Shop AirPods 5", "Shop AirPods Pro 3", "Shop AirPods Max 2", "AirPods Accessories"],
                ["More from AirPods", "AirPods Support", "AppleCare", "Hearing Health", "Apple Music", "Apple Fitness+"]
            ]
        },
        "Home": {
            columns: [
                ["Explore Home", "Explore Home", "Apple HomeView", "Apple TV 4K", "HomePod", "HomePod mini 2"],
                ["Shop Home", "Shop Home", "Apple Store Black Friday Event", "Shop Apple Home Collection", "Shop Home Accessories", "Personal Setup"],
                ["More from Home", "Home Support", "AppleCare for Apple TV", "AppleCare for HomePod", "Apple TV app", "Apple TV", "Home app", "Apple Music", "AirPlay"]
            ]
        },
        "Entertainment": {
            columns: [
                ["Explore Entertainment", "Explore Entertainment", "Apple One", "Apple TV", "Apple Music", "Apple Arcade", "Apple Fitness+", "Apple News+", "Apple Podcasts", "Apple Books", "App Store"],
                ["Support", "Apple TV Support", "Apple Music Support"]
            ]
        },
        "Accessories": {
            columns: [
                ["Shop by Product", "Shop All Accessories", "iPhone", "iPad", "Mac", "Apple Watch", "Apple Vision Pro", "AirPods", "Home", "AirTag", "Beats"],
                ["Shop by Category", "Apple Store Black Friday Event", "Headphones & Speakers", "Chargers & Adapters", "Smart Home Essentials", "Cases & Protection", "Content Creation", "Gaming", "Hard Drives & Storage", "Mice & Keyboards", "Health & Fitness", "Office Accessories", "Software"],
                ["More to Explore", "New Arrivals", "Made by Apple", "Accessibility", "Assistive Technologies"]
            ]
        },
        "Soporte": {
            columns: [
                ["Explore Support", "iPhone", "Mac", "iPad", "Watch", "Apple Vision Pro", "AirPods", "Music", "TV", "Explore Support"],
                ["Get Help", "Check Coverage", "Genius Bar", "Repair"],
                ["Helpful Topics", "Get AppleCare", "Apple Account and Password", "Billing & Subscriptions", "Accessibility"]
            ]
        }
    };

    const getMegaMenuUrl = (menuName, itemName) => {
        if (menuName === "Soporte") return "soporte.html";

        let category = menuName === "Accessories" ? "Accesorios" : menuName;
        const lowerItem = itemName.toLowerCase();

        if (lowerItem.includes("mac accessories") || lowerItem.includes("iphone accessories") ||
            lowerItem.includes("ipad accessories") || lowerItem.includes("watch accessories") ||
            lowerItem.includes("airpods accessories") || lowerItem.includes("home accessories") ||
            lowerItem.includes("accessories")) category = "Accesorios";
        else if (lowerItem.includes("iphone")) category = "iPhone";
        else if (lowerItem.includes("ipad")) category = "iPad";
        else if (lowerItem.includes("mac")) category = "Mac";
        else if (lowerItem.includes("watch")) category = "Watch";
        else if (lowerItem.includes("vision")) category = "Vision";
        else if (lowerItem.includes("airpods")) category = "AirPods";
        else if (lowerItem.includes("homepod") || lowerItem.includes("home")) category = "Home";
        else if (lowerItem.includes("apple tv") || lowerItem.includes("entertainment")) category = "Entertainment";
        else if (lowerItem.includes("accessories") || lowerItem.includes("accesorios")) category = "Accesorios";

        const url = new URL("catalogo.html", window.location.href);
        url.searchParams.set("category", category);

        const modelNames = [
            "MacBook Neo", "MacBook Air", "MacBook Pro", "iMac", "Mac mini", "Mac Studio",
            "iPad Pro", "iPad Air", "iPad mini",
            "iPhone 18 Pro", "iPhone 18", "iPhone Air", "iPhone Duo",
            "Apple Watch Series 12", "Apple Watch Ultra 4", "Apple Watch SE 3",
            "Apple Vision Pro", "AirPods 5", "AirPods Pro 3", "AirPods Max 2", "HomePod mini 2",
            "Apple TV 4K"
        ];
        const model = modelNames.find(name => itemName.toLowerCase().includes(name.toLowerCase()));
        if (model) url.searchParams.set("search", model);

        return `${url.pathname.split("/").pop()}${url.search}`;
    };

    document.querySelectorAll(".nav-menu > a").forEach(link => {
        const menuName = link.textContent.trim();
        const menu = megaMenus[menuName];
        if (!menu) return;

        const wrapper = document.createElement("div");
        wrapper.className = "nav-link-wrap";
        link.replaceWith(wrapper);
        wrapper.appendChild(link);
        if (["Mac", "iPad", "iPhone", "Watch", "Vision", "AirPods", "Home", "Entertainment", "Accessories"].includes(menuName)) {
            const category = menuName === "Accessories" ? "Accesorios" : menuName;
            link.href = `catalogo.html?category=${encodeURIComponent(category)}`;
        }

        const panel = document.createElement("div");
        panel.className = "nav-mega-menu";
        panel.innerHTML = `
            <div class="nav-mega-inner">
                ${menu.columns.map(column => `
                    <div class="mega-column">
                        ${column.map((text, index) => index === 0
                            ? `<p class="mega-heading">${text}</p>`
                            : `<a href="${getMegaMenuUrl(menuName, text)}">${text}</a>`).join("")}
                    </div>
                `).join("")}
            </div>
        `;
        wrapper.appendChild(panel);

        wrapper.addEventListener("mouseenter", () => wrapper.classList.add("is-open"));
        wrapper.addEventListener("mouseleave", () => wrapper.classList.remove("is-open"));
        link.addEventListener("click", event => {
            if (window.matchMedia("(max-width: 480px)").matches) return;
            event.preventDefault();
            const isOpen = wrapper.classList.toggle("is-open");
            link.setAttribute("aria-expanded", String(isOpen));
        });
    });

    const catalogProducts = [
        { id: 122, category: "iPhone", title: "iPhone", price: 999, image: "img/official/iphone.webp", description: "Toda la familia iPhone, con potencia profesional y cámaras avanzadas." },
        { id: 141, category: "iPhone", title: "iPhone 18 Pro", price: 999, image: "img/official/iphone.webp", description: "iPhone profesional con titanio y cámara avanzada." },
        { id: 142, category: "iPhone", title: "iPhone 18", price: 799, image: "img/official/iphone.webp", description: "iPhone potente con diseño moderno y gran autonomía." },
        { id: 143, category: "iPhone", title: "iPhone Air", price: 899, image: "img/official/iphone.webp", description: "iPhone ultradelgado con una experiencia de alto nivel." },
        { id: 144, category: "iPhone", title: "iPhone Duo", price: 699, image: "img/official/iphone.webp", description: "iPhone versátil diseñado para el día a día." },
        { id: 121, category: "iPad", title: "iPad", price: 599, image: "img/official/ipad.webp", description: "iPad con Apple Pencil y Magic Keyboard para crear y estudiar." },
        { id: 145, category: "iPad", title: "iPad Pro", price: 799, image: "img/official/ipad.webp", description: "iPad profesional con máximo rendimiento." },
        { id: 146, category: "iPad", title: "iPad Air", price: 599, image: "img/official/ipad.webp", description: "iPad ligero y versátil para estudiar y crear." },
        { id: 147, category: "iPad", title: "iPad mini", price: 499, image: "img/official/ipad.webp", description: "iPad compacto con gran potencia y movilidad." },
        { id: 130, category: "Mac", title: "MacBook Neo", price: 699, image: "img/official/mac.webp", description: "Mac ligero y versátil con una sorprendente relación entre potencia y precio." },
        { id: 136, category: "Mac", title: "MacBook Air", price: 999, image: "img/official/mac.webp", description: "Mac ultradelgado y liviano con gran autonomía." },
        { id: 137, category: "Mac", title: "MacBook Pro", price: 1599, image: "img/official/mac.webp", description: "Mac profesional con máximo rendimiento para trabajar y crear." },
        { id: 138, category: "Mac", title: "iMac", price: 1299, image: "img/official/mac.webp", description: "Computadora todo en uno con una pantalla inmersiva." },
        { id: 139, category: "Mac", title: "Mac mini", price: 599, image: "img/official/mac.webp", description: "Mac compacto con gran potencia en un diseño reducido." },
        { id: 140, category: "Mac", title: "Mac Studio", price: 1999, image: "img/official/mac.webp", description: "Estación profesional diseñada para cargas de trabajo exigentes." },
        { id: 131, category: "Watch", title: "Apple Watch Series 12", price: 399, image: "img/official/watch.webp", description: "Monitorización avanzada de salud y actividad en una carcasa elegante." },
        { id: 148, category: "Watch", title: "Apple Watch Ultra 4", price: 799, image: "img/official/watch.webp", description: "Apple Watch resistente y avanzado para actividad extrema." },
        { id: 149, category: "Watch", title: "Apple Watch SE 3", price: 249, image: "img/official/watch.webp", description: "Apple Watch esencial con funciones de salud y actividad." },
        { id: 132, category: "Vision", title: "Apple Vision Pro", price: 3499, image: "img/official/vision.webp", description: "Experiencia espacial que integra contenido digital con el entorno físico." },
        { id: 133, category: "AirPods", title: "AirPods Pro 3", price: 249, image: "img/official/airpods.webp", description: "Auriculares inalámbricos con cancelación activa y sonido inmersivo." },
        { id: 150, category: "AirPods", title: "AirPods 5", price: 179, image: "img/official/airpods.webp", description: "AirPods con sonido envolvente y conexión inalámbrica." },
        { id: 151, category: "AirPods", title: "AirPods Max 2", price: 549, image: "img/official/airpods.webp", description: "Auriculares over-ear con audio de alta fidelidad." },
        { id: 134, category: "Home", title: "HomePod", price: 299, image: "img/official/homepod.webp", description: "Altavoz inteligente con audio de alta fidelidad y control del hogar." },
        { id: 152, category: "Home", title: "HomePod mini 2", price: 99, image: "img/official/homepod.webp", description: "Altavoz compacto con control inteligente del hogar." },
        { id: 135, category: "Entertainment", title: "Apple TV 4K", price: 129, image: "img/official/appletv.webp", description: "Dispositivo de entretenimiento con Apple TV y contenido en 4K." },
        { id: 108, category: "Accesorios", title: "Funda roja para iPhone", price: 49, image: "img/products/108.webp", description: "Funda trasera roja con recortes para cámara y botones." },
        { id: 104, category: "Accesorios", title: "Kit de carga y conectividad", price: 79, image: "img/products/104.webp", description: "Adaptador compacto blanco con cables de conexión." },
        { id: 110, category: "Accesorios", title: "Aro de luz con trípode", price: 149, image: "img/products/110.webp", description: "Aro luminoso con soporte ajustable para contenido y videollamadas." }
    ];

    if (productGrid) {
        let activeCategory = "Todos";
        let apiProducts = [];
        const requestedCategory = new URLSearchParams(window.location.search).get("category");
        let requestedSearch = new URLSearchParams(window.location.search).get("search")?.trim();
        const validCategories = ["Todos", "iPhone", "iPad", "Mac", "Watch", "Vision", "AirPods", "Home", "Entertainment", "Accesorios"];
        if (requestedCategory && validCategories.includes(requestedCategory)) {
            activeCategory = requestedCategory;
        }

        const inferCategory = product => {
            const text = `${product.title} ${product.category} ${product.description} ${product.tags?.join(" ") || ""}`.toLowerCase();
            if (text.includes("ipad") || text.includes("tablet")) return "iPad";
            if (text.includes("iphone") || text.includes("smartphone") || text.includes("phone")) return "iPhone";
            if (text.includes("laptop") || text.includes("macbook")) return "Mac";
            if (text.includes("watch")) return "Watch";
            if (text.includes("vision")) return "Vision";
            if (text.includes("airpod")) return "AirPods";
            if (text.includes("homepod")) return "Home";
            if (text.includes("apple tv") || text.includes("tv")) return "Entertainment";
            return "Accesorios";
        };

        const apiImageFallback = product => {
            const category = inferCategory(product);
            const officialImages = {
                iPhone: "img/official/iphone.webp",
                iPad: "img/official/ipad.webp",
                Mac: "img/official/mac.webp",
                Watch: "img/official/watch.webp",
                Vision: "img/official/vision.webp",
                AirPods: "img/official/airpods.webp",
                Home: "img/official/homepod.webp",
                Entertainment: "img/official/appletv.webp",
                Accesorios: "img/products/104.webp"
            };
            return officialImages[category];
        };

        const renderCatalog = category => {
            activeCategory = category;
            const combinedProducts = [...catalogProducts, ...apiProducts];
            let products = category === "Todos"
                ? combinedProducts
                : combinedProducts.filter(product => product.category === category);
            if (requestedSearch) {
                const search = requestedSearch.toLowerCase();
                products = products.filter(product =>
                    `${product.title} ${product.description}`.toLowerCase().includes(search)
                );
            }

            document.querySelectorAll(".catalog-filter").forEach(button => {
                const isActive = button.dataset.category === category;
                button.classList.toggle("is-active", isActive);
                button.setAttribute("aria-pressed", String(isActive));
            });

            const catalogHeading = document.querySelector(".shop-page .section-header h2");
            if (catalogHeading) {
                catalogHeading.textContent = requestedSearch
                    ? `${requestedSearch} disponibles`
                    : category === "Todos" ? "Catálogo general" : `${category} disponibles`;
            }

            productGrid.innerHTML = "";
            products.forEach(product => {
                const card = document.createElement("article");
                card.classList.add("apple-card", "catalog-card");
                card.innerHTML = `
                    <span class="catalog-category">${product.category}</span>
                    <img src="${product.image}" alt="${product.title}" loading="lazy">
                    <h3>${product.title}</h3>
                    <p class="catalog-description">${product.description}</p>
                    <p class="price">${product.fromApi ? "" : "Desde "}${formatPrice(product.price)}</p>
                    <button type="button" class="btn btn-secondary add-to-cart">Agregar a la bolsa</button>
                    <a class="card-detail-link" href="detalle.html?id=${product.id}&title=${encodeURIComponent(product.title)}&price=${product.price}&image=${encodeURIComponent(product.image)}&description=${encodeURIComponent(product.description)}">Ver detalles</a>
                `;
                card.querySelector(".add-to-cart").addEventListener("click", () => addToCart(product));
                productGrid.appendChild(card);
            });

            if (products.length === 0) {
                productGrid.innerHTML = "<p>No hay productos disponibles en esta categoría.</p>";
            }
        };

        renderCatalog(activeCategory);
        document.querySelectorAll(".catalog-filter").forEach(button => {
            button.addEventListener("click", () => {
                document.querySelectorAll(".catalog-filter").forEach(item => item.classList.remove("is-active"));
                button.classList.add("is-active");
                const category = button.dataset.category;
                const url = new URL(window.location.href);
                if (category === "Todos") {
                    url.searchParams.delete("category");
                } else {
                    url.searchParams.set("category", category);
                }
                url.searchParams.delete("search");
                requestedSearch = null;
                window.history.replaceState({}, "", url);
                renderCatalog(category);
            });
        });

        const API_ENDPOINTS = [
            "https://dummyjson.com/products/category/smartphones",
            "https://dummyjson.com/products/category/mobile-accessories",
            "https://dummyjson.com/products/category/laptops"
        ];

        Promise.allSettled(API_ENDPOINTS.map(endpoint =>
            fetch(endpoint).then(response => {
                if (!response.ok) throw new Error(`API ${response.status}`);
                return response.json();
            })
        ))
            .then(results => {
                const seen = new Set();
                apiProducts = results
                    .filter(result => result.status === "fulfilled")
                    .flatMap(result => result.value.products)
                    .map(product => {
                    const category = inferCategory(product);
                    return {
                        id: product.id,
                        category,
                        title: product.title,
                        price: product.price,
                        image: apiImageFallback(product),
                        description: product.description,
                        stock: product.stock,
                        rating: product.rating,
                        fromApi: true
                    };
                }).filter(product => {
                    const key = `${product.category}-${product.title}`;
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });

                const apiStatus = document.getElementById("api-status");
                if (apiStatus) {
                    if (apiProducts.length > 0) {
                        apiStatus.textContent = `API REST conectada: ${apiProducts.length} productos sincronizados.`;
                    } else {
                        apiStatus.textContent = "API REST no disponible. Se muestra el catálogo local.";
                    }
                }
                renderCatalog(activeCategory);
            })
            .catch(error => {
                console.error("Error al consumir la API REST:", error);
                const apiStatus = document.getElementById("api-status");
                if (apiStatus) {
                    apiStatus.textContent = "API REST no disponible. Se muestra el catálogo local.";
                }
            });
    }

    renderCart();
});