import PhotoSwipeLightbox from './photoswipe-lightbox.esm.min.js';
import PhotoSwipe from './photoswipe.esm.min.js';

window.onClickBuyBtn = (btn) => {
  btn.innerHTML = `
        <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `;
  const form = btn.closest('form');
  const variantId = form.querySelector('[name="id"]').value;
  const qty = Number(form.querySelector('input[name="quantity"]')?.value || 1);
  window.location.href = `/cart/${variantId}:${qty}`;
};

window.handleVariantChange = async (input, event) => {
  const selectedOptions = [];

  const fieldset = input.closest('fieldset');
  if (fieldset && !fieldset.classList.contains('color-swatch')){
    fieldset.querySelectorAll('.option-values').forEach(function(optionValue) {
      optionValue.classList.remove('btn-primary');
      optionValue.classList.add('btn-outline-primary');
    });

    const selectedOption = input.closest('.option-values');
    selectedOption.classList.remove('btn-outline-primary');
    selectedOption.classList.add('btn-primary');
  }
  input.closest('form').querySelectorAll('.variant-selector select, .variant-selector input[type="radio"]:checked').forEach(function(elem) {
    if (elem.closest('.single_dropdown')) {
        // For select elements, push the variant ID directly
        const selectedVariant = window.productVariants.find(variant => variant.id == elem.value);
        if (selectedVariant) {
            selectedOptions.push(...selectedVariant.options);
        }
    } else {
        selectedOptions.push(elem.value);
    }
  });


  // Find the matching variant from the productVariants array
  const selectedVariant = window.productVariants.find(function(variant) {
    return JSON.stringify(variant.options) === JSON.stringify(selectedOptions);
  });

  if (input.closest('#product-template')) {
    const url = new URL(window.location)
    url.searchParams.set('variant', selectedVariant.id)
    window.history.replaceState({}, '', url)
  }

  // Dispatch the custom event if a matching variant is found
  if (selectedVariant) {
      const variantChangeEvent = new CustomEvent('variant:change', {
          detail: selectedVariant   
      });
      // Update the price
    const priceElement = document.querySelector('.product-price');
    const comparePriceElement = document.querySelector('.product-compare');

    if (priceElement) {
        priceElement.textContent = Shopify.formatMoney(selectedVariant.price, Shopify.money_format);
    }

    if (comparePriceElement) {
        if (selectedVariant.compare_at_price) {
            comparePriceElement.textContent = Shopify.formatMoney(selectedVariant.compare_at_price, Shopify.money_format);
        } else {
            comparePriceElement.textContent = '';
        }
    }
    btnAnimation();

      window.dispatchEvent(variantChangeEvent);
  }
}


window.addEventListener('variant:change', async function(event) {
  const selectedVariant = event.detail;

  document.querySelectorAll('.variant-selector.pills fieldset').forEach(function(fieldset, index) {
    const legend = fieldset.querySelector('legend');
    const optionName = legend.textContent.split(':')[0].trim(); // Get the original option name
    const selectedValue = selectedVariant.options[index]; // Get the selected value

    legend.textContent = `${optionName}: ${selectedValue}`;
  });

});



/*
    Product Gallery
*/
const initProductGallery = () => {
  document.querySelectorAll('.product-gallery:not(.init)').forEach((gallery) => {
    gallery.classList.add('init');

    const mainElement = gallery.querySelector('.main-splide');

    if (!mainElement) return;

    const mainSlider = new Splide(mainElement, {
      start: Number(gallery.dataset.start),
      rewind: true,
      arrows: false,
      speed   : 400, 
      easing  : 'linear',
      gap: '1rem',
      rewindByDrag: true,
      pagination: false,
      noDrag: 'model-viewer',
      perPage: 1,
      mediaQuery: 'min',
      breakpoints: {
        0: { padding: { right: gallery.dataset.showThumbsMobile === 'false' ? '4rem' : 0 } },
        992: { padding: 0 },
      },
      direction: document.documentElement.getAttribute('dir'),
    });

    mainSlider.mount();

    const thumbElement = gallery.querySelector('.thumbs-splide');

    if (thumbElement) {
      const thumbSlider = new Splide(thumbElement, {
        start: Number(gallery.dataset.start),
        arrows: false,
        gap: '.5rem',
        padding: {
          right: mainSlider.length > 5 ? '2rem': '0',
        },
        rewind: true,
        rewindByDrag: true,
        pagination: false,
        isNavigation: true,
        focus: mainSlider.length > 5 ? 'center' : 0,
        perPage: 5,
        direction: document.documentElement.getAttribute('dir'),
      });

      window.addEventListener('variant:change', (event) => {

        const selectedVariant = event.detail
        console.log(selectedVariant)
        if (selectedVariant.featured_media) {
        console.log(selectedVariant.featured_media)
        console.log(selectedVariant.featured_media.position)
          
            mainSlider.go(selectedVariant.featured_media.position - 1)
        }
    }, false)

      thumbSlider.mount();

      mainSlider.sync(thumbSlider);
    }

    const gal = gallery.querySelector('.splide__list')
    const lightbox = new PhotoSwipeLightbox({
      gallery: gal,
      children: '.pswp-link',
      pswpModule: PhotoSwipe,
      arrowPrevSVG:
        '<svg class="pswp__icn icon" stroke="currentColor" fill="none" viewBox="0 0 30 30"><path d="M17.5 7.5L10 15L17.5 22.5"/></svg>',
      arrowNextSVG:
        '<svg class="pswp__icn icon" stroke="currentColor" fill="none" viewBox="0 0 30 30"><path d="M17.5 7.5L10 15L17.5 22.5"/></svg>',
      closeSVG:
        '<svg class="pswp__icn icon" stroke="currentColor" fill="none" viewBox="0 0 30 30"><path d="m7.5 22.5 15-15m-15 0 15 15"/></svg>',
    });

    lightbox.on('contentLoad', (event) => {
      const { content } = event;
      console.log('Content loaded for PhotoSwipeLightbox:', content);

      if (content.type === 'video' || content.type === 'model') {
        event.preventDefault();
        content.element = document.createElement('div');
        content.element.className = 'pswp__video-container';
        content.element.appendChild(content.data.domElement.cloneNode(true));
      }
    });

    lightbox.init();
  });
};

initProductGallery();

document.addEventListener('shopify:section:load', (e) => {
  if (e.target.querySelector('.product-gallery')) {
    initProductGallery();
  }
});


window.onSubmitAtcForm = async (form, event) => {
  event.preventDefault()

  const btn = form.querySelector('.btn-atc')

  btn.innerHTML = `
      <div class="spinner-border spinner-border-sm" role="status">
          <span class="visually-hidden">Loading...</span>
      </div>
  `

  form.classList.add('loading')

  const response = await fetch('/cart/add.js', { method: 'POST', body: new FormData(form) })

  form.classList.remove('loading')
  btn.innerHTML = window.theme.product.addedToCart

  setTimeout(() => {
      btn.innerHTML = btn.dataset.textAddToCart
  }, 2000)

  window.refreshCartContents(response)

  if (document.querySelector('#CartDrawer')) {
      bootstrap.Offcanvas.getOrCreateInstance('#CartDrawer').show()
  }
}
