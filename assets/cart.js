// Function to refresh cart contents (both drawer and cart page)
window.refreshCartContents = async (response) => {
    console.log(response);
  
    const cartDrawer = document.querySelector('#CartDrawer');
    const cartPage = document.querySelector('#cart');
  
    cartDrawer?.classList.add('loading');
    cartPage?.classList.add('loading');
  
    const newResponse = await fetch(window.location.href);
    const text = await newResponse.text();
    const newDocument = new DOMParser().parseFromString(text, 'text/html');
  
    // Update offcanvas cart drawer
    const newOffcanvasBody = newDocument.querySelector('#CartDrawer .offcanvas-body');
    if (newOffcanvasBody && cartDrawer) {
      cartDrawer.querySelector('.offcanvas-body').replaceWith(newOffcanvasBody);
    }
  
    // Update cart page
    const newCartPage = newDocument.querySelector('#cart');
    if (newCartPage && cartPage) {
        cartPage.replaceWith(newCartPage);
    }
    // Get new cart total and cart goal from the updated document
    const shippingGoalElement = document.getElementById('shipping-goal');
    if (shippingGoalElement) {
      const cartGoal = parseFloat(shippingGoalElement.getAttribute('data-cart-goal'));
      const cartTotal = parseFloat(shippingGoalElement.getAttribute('data-cart-total'));
  
      // Update the existing shipping goal element on the page
      const currentShippingGoalElement = document.getElementById('shipping-goal');
      if (currentShippingGoalElement) {
        currentShippingGoalElement.setAttribute('data-cart-goal', cartGoal);
        currentShippingGoalElement.setAttribute('data-cart-total', cartTotal);
        currentShippingGoalElement.setAttribute("aria-label", "Add " + (cartGoal - cartTotal ) + " to get free shipping!");

        updateShippingGoal(cartTotal, cartGoal);
      }
    }
    

    // Update cart item count badges
    document.querySelectorAll('.cart-count-badge').forEach((badge) => {
      const newBadgeContent = newDocument.querySelector('.cart-count-badge')?.textContent;
      if (newBadgeContent) {
        badge.textContent = newBadgeContent;
        badge.removeAttribute('hidden');
      }
    });
  
    cartDrawer?.classList.remove('loading');
    cartPage?.classList.remove('loading');
  
    window.dispatchEvent(new Event('updated.cart'));
  
    if (cartDrawer?.querySelector('#CartDrawer-empty')) {
      setTimeout(() => {
        bootstrap.Offcanvas.getOrCreateInstance(cartDrawer).hide();
      }, 1000);
    }
  };
  

  window.onChangeCartQty = async (input) => {
    const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: input.dataset.lineItemKey,
            quantity: input.value
        })
    })
    window.refreshCartContents(response)
}

// Quantity change handler
window.onQuantityChange = async (button) => {
    const input = button.closest('.quantity-control').querySelector('input');
    const lineItemKey = input.dataset.lineItemKey;
    const currentQty = parseInt(input.value);
  
    const isIncreasing = button.querySelector('.bi-plus') !== null;
    const newQty = isIncreasing ? currentQty + 1 : currentQty - 1;
    console.log("new", newQty)
    
    input.value = newQty;
    input.setAttribute('value', newQty);
    
    console.log(input)
    if (!button.closest('#product-template')){
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lineItemKey,
          quantity: newQty
        })
      });
    
      window.refreshCartContents(response);
    }
  };
  // Clear cart button 
  window.clearCart = async () =>{
    const response = await fetch('/cart/clear.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    
      window.refreshCartContents(response);
  }
  // Quantity input change handler (direct input)
  window.onChangeCartQty = async (input) => {
    const lineItemKey = input.dataset.lineItemKey;
    const newQty = parseInt(input.value, 10);
    const minQty = parseInt(input.getAttribute('data-min-qty'), 10) || 0;
  
    if (newQty < minQty) {
      input.value = minQty;
      return;
    }
  
    const response = await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: lineItemKey,
        quantity: newQty
      })
    });
  
    window.refreshCartContents(response);
  };

  
  // Item removal handler
window.onRemoveCartItem = async (button) => {
    const lineItemKey = button.dataset.lineItemKey;
  
    const response = await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: lineItemKey,
        quantity: 0
      })
    });
  
    window.refreshCartContents(response);
  };
  

  function updateShippingGoal(cartTotal, cartGoal) {
    var remainingAmount = cartGoal - cartTotal;
    var progress = (cartTotal / cartGoal) * 100;

    if (remainingAmount > 0) {
      document.getElementById('amount-to-free-shipping').textContent = '$' + remainingAmount.toFixed(2);
    } else {
      document.getElementById('cart-goal-reached?').textContent = 'Congratulations! You have free shipping!';
    }
  
    var progressBar = document.getElementById('progress-bar');
    progressBar.style.width = Math.min(progress, 100) + '%';
    progressBar.setAttribute('aria-valuenow', Math.min(progress, 100));
  
    var progressIcon = document.getElementById('progress-icon');
    progressIcon.style.left = `calc(${Math.min(progress, 100)}% + 12px)`;
  }  

  document.addEventListener('DOMContentLoaded', function() {
    var shippingGoalElement = document.getElementById('shipping-goal');
  
    if (shippingGoalElement) {
      var cartGoal = parseFloat(shippingGoalElement.getAttribute('data-cart-goal'));
      var cartTotal = parseFloat(shippingGoalElement.getAttribute('data-cart-total'));
  
      updateShippingGoal(cartTotal, cartGoal);
    }
  });
  