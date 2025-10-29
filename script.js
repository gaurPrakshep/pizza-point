/* script.js for PIZZA POINT Menu
   - Modern cart functionality with animations
   - Enhanced user experience with loading states
   - WhatsApp integration for orders
   - Responsive design optimizations
   - Accessibility improvements
*/

const WA_NUMBER = "918384826808"; // WhatsApp number with country code (no +)
let cart = JSON.parse(localStorage.getItem("cart_v1") || "[]");

// Elements
const cartBtn = document.getElementById("cart-btn");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");
const cartTotal2El = document.getElementById("cart-total-2");
const cartPreview = document.getElementById("cart-preview");
const cartItemsEl = document.getElementById("cart-items");
const checkoutBtn = document.getElementById("checkout-btn");

// Helpers
function getTableFromURL(){
  try {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('table');
    if(t && /^\d+$/.test(t)) return t;
  } catch(e){}
  return null;
}

function saveCart(){
  localStorage.setItem("cart_v1", JSON.stringify(cart));
}

function calcTotals(){
  let total = 0;
  cart.forEach(it => total += it.price * it.qty);
  return total;
}

function renderCart(){
  // update count & totals in header
  cartCountEl.textContent = cart.length;
  const total = calcTotals();
  cartTotalEl.textContent = total;
  cartTotal2El.textContent = total;

  // build preview list
  cartItemsEl.innerHTML = "";
  if(cart.length === 0){
    const li = document.createElement("li");
    li.textContent = "Your order is empty.";
    li.style.padding = "8px 0";
    cartItemsEl.appendChild(li);
    return;
  }

  cart.forEach((it, idx) => {
    const li = document.createElement("li");
    // left meta
    const meta = document.createElement("div");
    meta.className = "meta";
    const name = document.createElement("div");
    name.textContent = `${it.name}`;
    name.style.fontWeight = "600";
    name.style.color = "var(--text)";
    name.style.fontSize = "15px";
    
    const sizeInfo = document.createElement("div");
    sizeInfo.textContent = `Size: ${it.size}`;
    sizeInfo.style.fontSize = "13px";
    sizeInfo.style.color = "var(--accent)";
    sizeInfo.style.fontWeight = "500";
    sizeInfo.style.marginTop = "2px";
    
    const small = document.createElement("small");
    small.textContent = `Qty: ${it.qty} × ₹${it.price} = ₹${it.price * it.qty}`;
    small.style.display = "block";
    small.style.color = "var(--muted)";
    small.style.fontSize = "12px";
    small.style.marginTop = "4px";
    
    meta.appendChild(name);
    meta.appendChild(sizeInfo);
    meta.appendChild(small);

    // remove button
    const right = document.createElement("div");
    right.style.display = "flex";
    right.style.flexDirection = "column";
    right.style.alignItems = "flex-end";
    right.style.gap = "6px";

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "Remove";
    removeBtn.dataset.index = idx;
    removeBtn.style.background = "transparent";
    removeBtn.style.border = "none";
    removeBtn.style.color = "#d84315";
    removeBtn.style.cursor = "pointer";
    removeBtn.style.fontWeight = "700";
    removeBtn.style.fontSize = "12px";
    removeBtn.style.padding = "4px 8px";
    removeBtn.style.borderRadius = "4px";
    removeBtn.style.transition = "all 0.2s ease";

    removeBtn.addEventListener("mouseenter", function() {
      this.style.backgroundColor = "#d84315";
      this.style.color = "white";
    });
    
    removeBtn.addEventListener("mouseleave", function() {
      this.style.backgroundColor = "transparent";
      this.style.color = "#d84315";
    });

    right.appendChild(removeBtn);

    li.appendChild(meta);
    li.appendChild(right);
    cartItemsEl.appendChild(li);
  });
}

// Add item to cart with animation feedback
function addToCart(name, sizeLabel, price, qty){
  // Check if this pizza (any size) already exists in cart
  const existingPizzaIndex = cart.findIndex(it => it.name === name);
  
  if(existingPizzaIndex !== -1) {
    // Replace the existing pizza with new selection
    cart[existingPizzaIndex] = { name, size: sizeLabel, price, qty };
    showNotification(`${name} updated to ${sizeLabel} (${qty} qty)`, "success");
  } else {
    // Add new pizza to cart
    cart.push({ name, size: sizeLabel, price, qty });
    showNotification(`${name} (${sizeLabel}) added to cart!`, "success");
  }
  
  saveCart();
  renderCart();
  
  // Show success animation
  showCartAnimation();
  
  // Mark the item as selected
  markItemAsSelected(name, sizeLabel);
}

// Remove item by index with animation
function removeFromCart(index){
  if(index >= 0 && index < cart.length){
    const removedItem = cart[index];
    cart.splice(index, 1);
    saveCart();
    renderCart();
    
    // Show removal animation
    showRemovalAnimation();
    
    // Update visual indicators
    updateItemSelectionIndicators();
  }
}

// Visual selection indicators
function markItemAsSelected(name, sizeLabel) {
  // Find the menu item by name
  const menuItems = document.querySelectorAll(".menu-item");
  menuItems.forEach(item => {
    const itemName = item.querySelector(".item-name").textContent.trim();
    if (itemName === name) {
      // Add selected class
      item.classList.add("item-selected");
      
      // Update the button text to show selected state
      const addBtn = item.querySelector(".add-btn");
      if (addBtn) {
        addBtn.textContent = "✓ Selected";
        addBtn.style.backgroundColor = "#28a745";
        addBtn.style.color = "white";
      }
      
      // Add size indicator with updated info
      addSizeIndicator(item, sizeLabel);
    }
  });
}

function markItemAsSelectedWithQuantity(name, sizeLabel, quantity) {
  // Find the menu item by name
  const menuItems = document.querySelectorAll(".menu-item");
  menuItems.forEach(item => {
    const itemName = item.querySelector(".item-name").textContent.trim();
    if (itemName === name) {
      // Add selected class
      item.classList.add("item-selected");
      
      // Update the button text to show selected state
      const addBtn = item.querySelector(".add-btn");
      if (addBtn) {
        addBtn.textContent = "✓ Selected";
        addBtn.style.backgroundColor = "#28a745";
        addBtn.style.color = "white";
      }
      
      // Add size indicator with quantity info
      addSizeIndicatorWithQuantity(item, sizeLabel, quantity);
    }
  });
}

function addSizeIndicator(menuItem, sizeLabel) {
  // Remove existing indicator if any
  const existingIndicator = menuItem.querySelector(".size-indicator");
  if (existingIndicator) {
    existingIndicator.remove();
  }
  
  // Find the current quantity from the input
  const qtyInput = menuItem.querySelector(".qty-input");
  const quantity = qtyInput ? qtyInput.value : "1";
  
  // Create new size indicator
  const sizeIndicator = document.createElement("div");
  sizeIndicator.className = "size-indicator";
  sizeIndicator.textContent = `Selected: ${sizeLabel} (${quantity} qty)`;
  sizeIndicator.style.cssText = `
    background: #28a745;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    margin-top: 8px;
    display: inline-block;
  `;
  
  const itemLeft = menuItem.querySelector(".item-left");
  itemLeft.appendChild(sizeIndicator);
}

function addSizeIndicatorWithQuantity(menuItem, sizeLabel, quantity) {
  // Remove existing indicator if any
  const existingIndicator = menuItem.querySelector(".size-indicator");
  if (existingIndicator) {
    existingIndicator.remove();
  }
  
  // Create new size indicator
  const sizeIndicator = document.createElement("div");
  sizeIndicator.className = "size-indicator";
  sizeIndicator.textContent = `Selected: ${sizeLabel} (${quantity} qty)`;
  sizeIndicator.style.cssText = `
    background: #28a745;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    margin-top: 8px;
    display: inline-block;
  `;
  
  const itemLeft = menuItem.querySelector(".item-left");
  itemLeft.appendChild(sizeIndicator);
}

function updateItemSelectionIndicators() {
  // Clear all selection indicators
  document.querySelectorAll(".menu-item").forEach(item => {
    item.classList.remove("item-selected");
    const addBtn = item.querySelector(".add-btn");
    if (addBtn) {
      addBtn.textContent = "Select";
      addBtn.style.backgroundColor = "";
      addBtn.style.color = "";
    }
    const sizeIndicator = item.querySelector(".size-indicator");
    if (sizeIndicator) {
      sizeIndicator.remove();
    }
  });
  
  // Re-apply indicators based on current cart
  cart.forEach(item => {
    markItemAsSelectedWithQuantity(item.name, item.size, item.qty);
  });
}

// Animation functions
function showCartAnimation() {
  const cartBtn = document.getElementById("cart-btn");
  cartBtn.style.transform = "scale(1.1)";
  cartBtn.style.backgroundColor = "#28a745";
  setTimeout(() => {
    cartBtn.style.transform = "scale(1)";
    cartBtn.style.backgroundColor = "";
  }, 200);
}

function showRemovalAnimation() {
  const cartBtn = document.getElementById("cart-btn");
  cartBtn.style.transform = "scale(0.95)";
  cartBtn.style.backgroundColor = "#ffc107";
  setTimeout(() => {
    cartBtn.style.transform = "scale(1)";
    cartBtn.style.backgroundColor = "";
  }, 200);
}

// Build WhatsApp message and open chat with enhanced formatting
function checkoutToWhatsApp(){
  if(cart.length === 0){
    showNotification("Your order is empty! Add some delicious pizzas first.", "warning");
    return;
  }

  const table = getTableFromURL();
  const customerName = document.getElementById("customer-name").value.trim();
  
  let message = `🍕 *PIZZA POINT Order*${table ? ` - Table ${table}` : ""}\n\n`;
  
  if (customerName) {
    message += `Hello! ${customerName} here. I would like to place an order:\n\n`;
  } else {
    message += `Hello! I would like to place an order:\n\n`;
  }
  
  let total = 0;
  cart.forEach((it, i) => {
    message += `${i+1}. *${it.name}* — ${it.size} × ${it.qty} = ₹${it.price * it.qty}\n`;
    total += it.price * it.qty;
  });
  
  message += `\n💰 *Total: ₹${total}*`;
  if(table) message += `\n📍 *Table: ${table}*`;
  if(customerName) message += `\n👤 *Customer: ${customerName}*`;
  message += `\n\nPlease confirm the order and estimated delivery time. Thank you! 🙏`;

  const encoded = encodeURIComponent(message);
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encoded}`;
  
  // Show loading state
  const checkoutBtn = document.getElementById("checkout-btn");
  const originalText = checkoutBtn.textContent;
  checkoutBtn.textContent = "Opening WhatsApp...";
  checkoutBtn.disabled = true;
  
  setTimeout(() => {
    window.open(waUrl, "_blank");
    checkoutBtn.textContent = originalText;
    checkoutBtn.disabled = false;
  }, 500);
}

// Notification system
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "warning" ? "#ffc107" : type === "success" ? "#28a745" : "#17a2b8"};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-weight: 600;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);
  
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Wire up "Select" buttons
function initAddButtons(){
  document.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const itemName = btn.dataset.name || btn.getAttribute("data-name") || btn.closest(".menu-item")?.querySelector(".item-name")?.textContent?.trim();
      const parent = btn.closest(".item-right") || btn.closest(".menu-item");
      if(!parent) return;

      const select = parent.querySelector(".size-select");
      const qtyInput = parent.querySelector(".qty-input");
      if(!select || !qtyInput){
        showNotification("Something went wrong. Please refresh the page.", "warning");
        return;
      }

      const val = select.value;
      if(!val){
        showNotification("Please select a pizza size first", "warning");
        return;
      }
      const price = Number(val);
      const sizeLabel = select.options[select.selectedIndex]?.getAttribute("data-size") || select.options[select.selectedIndex]?.text || "";
      let qty = Number(qtyInput.value) || 1;
      if(qty <= 0) { 
        showNotification("Please enter a valid quantity (minimum 1)", "warning");
        return; 
      }

      addToCart(itemName, sizeLabel, price, qty);
      
      // Show success notification
      showNotification(`${itemName} (${sizeLabel}) added to cart!`, "success");
    });
  });
}

// Cart button toggle
cartBtn.addEventListener("click", (e) => {
  const expanded = cartBtn.getAttribute("aria-expanded") === "true";
  if(expanded){
    cartPreview.hidden = true;
    cartBtn.setAttribute("aria-expanded", "false");
  } else {
    renderCart();
    cartPreview.hidden = false;
    cartBtn.setAttribute("aria-expanded", "true");
  }
});

// Delegate remove button clicks
cartItemsEl.addEventListener("click", (e) => {
  const rem = e.target.closest(".remove-btn");
  if(!rem) return;
  const idx = Number(rem.dataset.index);
  removeFromCart(idx);
});

// Checkout
checkoutBtn.addEventListener("click", () => {
  checkoutToWhatsApp();
});

// Close preview when clicking outside
document.addEventListener("click", (e) => {
  if(!cartPreview) return;
  const inside = e.target.closest(".cart-area");
  if(!inside && !cartPreview.hidden){
    cartPreview.hidden = true;
    cartBtn.setAttribute("aria-expanded", "false");
  }
});

// Smooth scroll for index links
document.querySelectorAll(".menu-index a").forEach(a => {
  a.addEventListener("click", (ev) => {
    ev.preventDefault();
    const id = a.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Loading state management
function showLoading() {
  const loadingIndicator = document.getElementById("loading-indicator");
  if (loadingIndicator) {
    loadingIndicator.style.display = "flex";
  }
}

function hideLoading() {
  const loadingIndicator = document.getElementById("loading-indicator");
  if (loadingIndicator) {
    loadingIndicator.style.display = "none";
  }
}

// Debounced search for better performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Search functionality with debouncing
function initSearch() {
  const searchInput = document.getElementById("search-input");
  const menuItems = document.querySelectorAll(".menu-item");
  
  const debouncedSearch = debounce((searchTerm) => {
    let hasResults = false;
    
    menuItems.forEach(item => {
      const itemName = item.querySelector(".item-name").textContent.toLowerCase();
      const itemDesc = item.querySelector(".item-desc").textContent.toLowerCase();
      
      if (searchTerm === "" || itemName.includes(searchTerm) || itemDesc.includes(searchTerm)) {
        item.style.display = "flex";
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
        hasResults = true;
      } else {
        item.style.display = "none";
        item.style.opacity = "0";
        item.style.transform = "translateY(-10px)";
      }
    });
    
    // Hide empty sections
    document.querySelectorAll(".menu-section").forEach(section => {
      const visibleItems = section.querySelectorAll(".menu-item[style*='display: flex'], .menu-item:not([style*='display: none'])");
      if (visibleItems.length === 0 && searchTerm !== "") {
        section.style.display = "none";
      } else {
        section.style.display = "block";
      }
    });
    
    // Show/hide no results message
    const noResults = document.getElementById("no-results");
    if (noResults) {
      if (searchTerm !== "" && !hasResults) {
        noResults.style.display = "flex";
      } else {
        noResults.style.display = "none";
      }
    }
  }, 150);
  
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    debouncedSearch(searchTerm);
  });
  
  // Clear search on escape
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input"));
      searchInput.blur();
    }
  });
}

// Quantity validation to prevent zero quantities
function validateQuantity(input) {
  if (input.value < 1 || input.value === '' || input.value === '0') {
    input.value = 1;
    showNotification("Quantity cannot be zero. Set to minimum 1.", "warning");
  }
}

// Initialize quantity validation for all inputs
function initQuantityValidation() {
  document.querySelectorAll(".qty-input").forEach(input => {
    input.addEventListener("input", function() {
      if (this.value < 1 || this.value === '' || this.value === '0') {
        this.value = 1;
        showNotification("Quantity cannot be zero. Set to minimum 1.", "warning");
      }
    });
    
    input.addEventListener("blur", function() {
      if (this.value < 1 || this.value === '' || this.value === '0') {
        this.value = 1;
        showNotification("Quantity cannot be zero. Set to minimum 1.", "warning");
      }
    });
  });
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  // Show loading initially
  showLoading();
  
  // Simulate loading time for better UX
  setTimeout(() => {
    // 🧹 Clear cart whenever page is loaded (new QR scan)
    cart = [];
    saveCart();
    
    initAddButtons();
    initSearch();
    initQuantityValidation();
    renderCart();
    updateItemSelectionIndicators();
    
    // Hide loading after everything is initialized
    hideLoading();
  }, 500);
});
