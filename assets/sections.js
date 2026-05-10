const initImageCarousel = () => {
  document.querySelectorAll('.carousel:not(.initialized)').forEach((element) => {
    element.classList.add('initialized');
    if (!element) return;

    const splideCarousel = element.querySelector('.splide');

    const splideOptions = {
      type: splideCarousel.dataset.loop === 'true' ? 'loop' : 'slide',
      speed: 400,
      easing: 'linear',
      gap: `${splideCarousel.dataset.desktopGap}rem`,
      padding: {
        right: `${splideCarousel.dataset.desktopPaddingRight}rem`,
        left: `${splideCarousel.dataset.desktopPaddingLeft}rem`,
      },
      autoplay: splideCarousel.dataset.autoplay === 'true',
      interval: parseInt(splideCarousel.dataset.interval) * 1000 || 5000,
      pauseOnHover: splideCarousel.dataset.pause === 'true',
      pagination: splideCarousel.dataset.paginationType === 'progress' ? false : true,
      video: {
        loop: true,
      },
      breakpoints: {
        768: {
          gap: `${splideCarousel.dataset.mobileGap}rem`,
          padding: {
            right: `${splideCarousel.dataset.mobilePaddingRight}rem`,
            left: `${splideCarousel.dataset.mobilePaddingLeft}rem`,
          },
        },
      },
    };

    const splideInstance = new Splide(splideCarousel, splideOptions);

    splideInstance.mount({ Video: window.splide.Extensions.Video });
  });
};

document.addEventListener('DOMContentLoaded', initImageCarousel);
document.addEventListener('shopify:section:load', (e) => {
  if (e.target.querySelector('.carousel')) {
    initImageCarousel();
  }
});

/** Media with text carousel */
const initMediaWithTextCarousel = () => {
  document.querySelectorAll('.media-with-text-carousel:not(.initialized)').forEach((element) => {
    element.classList.add('initialized');
    if (!element) return;

    const splideCarousel = element.querySelector('.splide');

    const splideOptions = {
      type: splideCarousel.dataset.loop === 'true' ? 'loop' : 'slide',
      gap: `${splideCarousel.dataset.desktopGap}rem`,
      speed: 400,
      easing: 'linear',
      padding: {
        right: `${splideCarousel.dataset.desktopPaddingRight}rem`,
        left: `${splideCarousel.dataset.desktopPaddingLeft}rem`,
      },
      pagination: splideCarousel.dataset.paginationType === 'progress' ? false : true,
      breakpoints: {
        768: {
          gap: `${splideCarousel.dataset.mobileGap}rem`,
          padding: {
            right: `${splideCarousel.dataset.mobilePaddingRight}rem`,
            left: `${splideCarousel.dataset.mobilePaddingLeft}rem`,
          },
        },
      },
    };

    const splideInstance = new Splide(splideCarousel, splideOptions);
    splideInstance.mount();
  });
};

document.addEventListener('DOMContentLoaded', initMediaWithTextCarousel);
document.addEventListener('shopify:section:load', (e) => {
  if (e.target.querySelector('.media-with-text-carousel')) {
    initMediaWithTextCarousel();
  }
});

/** Image comparison */
const initImageCompare = (rootElement) => {
  const scope = rootElement || document;

  function syncCompare(root, input) {
    const v = String(input.value);
    root.style.setProperty('--compare', `${v}%`);
    root.style.setProperty('--compare-num', v);
    input.setAttribute('aria-valuenow', v);
  }

  function valueFromPointer(root, clientX, clientY) {
    const media = root.querySelector('.image-compare__media');
    if (!media) return 50;
    const rect = media.getBoundingClientRect();
    const h = rect.height;
    const w = rect.width;
    if (w <= 0 || h <= 0) return 50;
    const vertical = root.dataset.compareOrientation === 'vertical';
    let t = vertical ? (clientY - rect.top) / h : (clientX - rect.left) / w;
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    return Math.round(t * 100);
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function bind(root) {
    if (root.dataset.imageCompareReady === 'true') return;
    root.dataset.imageCompareReady = 'true';
    const input = root.querySelector('[data-image-compare-input]');
    const hit = root.querySelector('[data-image-compare-hit]');
    if (!input || !hit) return;

    let introRaf = 0;
    let introCancelled = false;

    function cancelIntro() {
      introCancelled = true;
      if (introRaf) {
        cancelAnimationFrame(introRaf);
        introRaf = 0;
      }
    }

    function markIntroFinished() {
      root.dataset.imageCompareIntro = 'done';
    }

    function runScrollIntro() {
      if (root.dataset.imageCompareIntro === 'done' || root.dataset.imageCompareIntro === 'playing') return;
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        input.value = '50';
        syncCompare(root, input);
        markIntroFinished();
        return;
      }
      root.dataset.imageCompareIntro = 'playing';
      introCancelled = false;
      const from = 0;
      const to = 50;
      const duration = 1000;
      const start = performance.now();

      function tick(now) {
        if (introCancelled) {
          introRaf = 0;
          return;
        }
        const elapsed = now - start;
        const t = Math.min(1, elapsed / duration);
        const v = Math.round(from + (to - from) * easeOutCubic(t));
        input.value = String(v);
        syncCompare(root, input);
        if (t < 1) {
          introRaf = requestAnimationFrame(tick);
        } else {
          introRaf = 0;
          markIntroFinished();
        }
      }

      introRaf = requestAnimationFrame(tick);
    }

    const onInput = () => {
      cancelIntro();
      markIntroFinished();
      syncCompare(root, input);
    };
    input.addEventListener('input', onInput);
    input.addEventListener('change', onInput);

    const setFromPointer = (e) => {
      const v = valueFromPointer(root, e.clientX, e.clientY);
      input.value = String(v);
      syncCompare(root, input);
    };

    const onPointerDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      cancelIntro();
      markIntroFinished();
      hit.setPointerCapture(e.pointerId);
      setFromPointer(e);
      e.preventDefault();
    };

    const onPointerMove = (e) => {
      if (!hit.hasPointerCapture(e.pointerId)) return;
      setFromPointer(e);
    };

    const onPointerUp = (e) => {
      if (hit.hasPointerCapture(e.pointerId)) {
        hit.releasePointerCapture(e.pointerId);
      }
    };

    hit.addEventListener('pointerdown', onPointerDown);
    hit.addEventListener('pointermove', onPointerMove);
    hit.addEventListener('pointerup', onPointerUp);
    hit.addEventListener('pointercancel', onPointerUp);

    syncCompare(root, input);

    const sectionEl = root.closest('section.image-compare');
    if (sectionEl && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              runScrollIntro();
            }
          });
        },
        { threshold: 0, rootMargin: '0px 0px -200px 0px' },
      );
      io.observe(sectionEl);
    } else {
      runScrollIntro();
    }
  }

  scope.querySelectorAll('[data-image-compare]').forEach((el) => bind(el));
};

document.addEventListener('DOMContentLoaded', () => initImageCompare());
document.addEventListener('shopify:section:load', (e) => {
  if (e.target && e.target.querySelector && e.target.querySelector('[data-image-compare]')) {
    initImageCompare(e.target);
  }
});

// Social media feed
/**
const initFeed = () => {
  document.querySelectorAll('.social-media-feed').forEach((element) => {
    if(!element) return
    const splideCarousel = element.querySelector('.splide')
    
    const splideOptions = {
      type: 'loop',
      drag: 'free',
      focus: 'center',
      arrows: false,
      pagination: false,
      gap: `${splideCarousel.dataset.gap}rem`,
      perPage: splideCarousel.dataset.desktopPerpage,
      pauseOnHover: true,
      autoWidth: splideCarousel.dataset.autoWidth === 'true',
      autoScroll: {
        speed: 1
    },
      breakpoints: {
        768: {
          gap: `${splideCarousel.dataset.mobileGap}rem`,
        }
      }
    };

    const splideInstance = new Splide(splideCarousel, splideOptions);

    splideInstance.mount(window.splide.Extensions);
  });
};

document.addEventListener('DOMContentLoaded', initFeed);
window.addEventListener('resize', initFeed)
document.addEventListener('shopify:section:load', (e) => {
  if (e.target.querySelector('.social-media-feed')) {
    initFeed();
  }
});

*/
const initInstagramGallery = () => {
  document.querySelectorAll('.instagram-gallery').forEach(async (section, index) => {
    if (index === 0) {
      const splideScrollScript = document.createElement('script');
      splideScrollScript.src = section.dataset.vendorSplideScrollScript;
      document.head.appendChild(splideScrollScript);

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const element = section.querySelector('.splide');

    let speed = Number(element.dataset.speed);

    if (element.dataset.direction === 'right') {
      speed = -Math.abs(speed);
    }

    const mySplide = new Splide(element, {
      type: 'loop',
      drag: 'free',
      focus: 'center',
      arrows: false,
      pagination: false,
      easing: element.dataset.easing,
      gap: Number(element.dataset.gap),
      autoWidth: true,
      autoScroll: {
        speed,
      },
      direction: document.documentElement.getAttribute('dir'),
    });
    mySplide.mount(window.splide.Extensions);
  });
};
initInstagramGallery();

document.addEventListener('shopify:section:load', (e) => {
  if (e.target.querySelector('.instagram-gallery')) {
    initInstagramGallery();
  }
});

const initStatistics = () => {
  const counters = document.querySelectorAll('.counter span');

  const startCounterAnimation = (counter, target) => {
    let count = 0;
    const step = Math.ceil(target / 100);

    const timer = setInterval(() => {
      count += step;
      if (count >= target) {
        counter.textContent = target;
        clearInterval(timer);
      } else {
        counter.textContent = count;
      }
    }, 15);
  };
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counter = entry.target.querySelector('span');
          const target = +counter.dataset.count;
          startCounterAnimation(counter, target);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    },
  );

  counters.forEach((counter) => {
    observer.observe(counter.closest('.col'));
  });
};

initStatistics();

document.addEventListener('shopify:section:load', (e) => {
  if (e.target.querySelector('.counter')) {
    initStatistics();
  }
});
/** Logo list
document.addEventListener('DOMContentLoaded', () => {
  const logoSlide = document.querySelector(".logos-slide");
  if (logoSlide) {
    const images = logoSlide.querySelectorAll("img");
    if (images.length > 0) {
      images.forEach((img) => {
        const copy = img.cloneNode(true);
        logoSlide.appendChild(copy);
      });
    } else {
      console.error("No images found inside .logos-slide.");
    }
  } else {
    console.error(".logos-slide element not found.");
  }
});

*/

// Init Bootstrap tooltips
document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => new bootstrap.Tooltip(el));

// Init Bootstrap popovers
document.querySelectorAll('[data-bs-toggle="popover"]').forEach((el) => new bootstrap.Popover(el));

class ProductRecommendations extends HTMLElement {
  observer = undefined;

  constructor() {
    super();
  }

  connectedCallback() {
    this.initializeRecommendations(this.dataset.productId);
  }

  initializeRecommendations(productId) {
    this.observer?.unobserve(this);
    this.observer = new IntersectionObserver(
      (entries, observer) => {
        if (!entries[0].isIntersecting) return;
        observer.unobserve(this);
        this.loadRecommendations(productId);
      },
      { rootMargin: '0px 0px 400px 0px' },
    );
    this.observer.observe(this);
  }

  loadRecommendations(productId) {
    fetch(`${this.dataset.url}&product_id=${productId}&section_id=${this.dataset.sectionId}`)
      .then((response) => response.text())
      .then((text) => {
        const html = document.createElement('div');
        html.innerHTML = text;
        const recommendations = html.querySelector('product-recommendations');

        if (recommendations?.innerHTML.trim().length) {
          this.innerHTML = recommendations.innerHTML;
        }

        if (!this.querySelector('slideshow-component') && this.classList.contains('complementary-products')) {
          this.remove();
        }

        if (html.querySelector('.grid__item')) {
          this.classList.add('product-recommendations--loaded');
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }
}

customElements.define('product-recommendations', ProductRecommendations);

/** Pickup availability */
if (!customElements.get('pickup-availability')) {
  customElements.define(
    'pickup-availability',
    class PickupAvailability extends HTMLElement {
      constructor() {
        super();

        if (!this.hasAttribute('available')) return;

        this.errorHtml = this.querySelector('template').content.firstElementChild.cloneNode(true);
        this.onClickRefreshList = this.onClickRefreshList.bind(this);
        this.fetchAvailability(this.dataset.variantId);
      }

      fetchAvailability(variantId) {
        if (!variantId) return;

        let rootUrl = this.dataset.rootUrl;
        if (!rootUrl.endsWith('/')) {
          rootUrl = rootUrl + '/';
        }
        const variantSectionUrl = `${rootUrl}variants/${variantId}/?section_id=pickup-availability`;

        fetch(variantSectionUrl)
          .then((response) => {
            return response.text();
          })
          .then((text) => {
            const sectionInnerHTML = new DOMParser()
              .parseFromString(text, 'text/html')
              .querySelector('.shopify-section');
            this.renderPreview(sectionInnerHTML);
          })
          .catch((e) => {
            this.renderError();
          });
      }

      onClickRefreshList() {
        this.fetchAvailability(this.dataset.variantId);
      }

      update(variant) {
        if (variant?.available) {
          this.fetchAvailability(variant.id);
        } else {
          this.removeAttribute('available');
          this.innerHTML = '';
        }
      }

      renderError() {
        this.innerHTML = '';
        this.appendChild(this.errorHtml);

        this.querySelector('button').addEventListener('click', this.onClickRefreshList);
      }

      renderPreview(sectionInnerHTML) {
        const drawer = document.getElementById('pickupAvailabilityDrawer');
        if (drawer) drawer.remove();
        const previewElement = sectionInnerHTML.querySelector('pickup-availability-preview');

        if (!previewElement) {
          this.innerHTML = '';
          this.removeAttribute('available');
          return;
        }

        this.innerHTML = previewElement.outerHTML;
        this.setAttribute('available', '');

        const newDrawer = sectionInnerHTML.querySelector('.offcanvas');
        document.body.appendChild(newDrawer);
      }
    },
  );
}
class PickupAvailabilityDrawer extends HTMLElement {
  constructor() {
    super();
  }
}

// Define the custom element
customElements.define('pickup-availability-drawer', PickupAvailabilityDrawer);

/** Stacked cards */
class StackedCard extends HTMLElement {
  constructor() {
    super();
    this.index = parseInt(this.getAttribute('data-index'));
  }

  connectedCallback() {
    this.style.setProperty('--index', this.index);
  }
}

customElements.define('stacked-card', StackedCard);

class StackedCards extends HTMLElement {
  constructor() {
    super();
    this.sectionId = this.getAttribute('data-section-id');
    this.totalBlocks = parseInt(this.getAttribute('data-total-blocks'));
    this.scaleStyle = this.getAttribute('data-scale-style');
    this.initializeObserver();
  }

  initializeObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.9,
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        const nextIndex = entry.target.index + 1;
        const nextCard = this.querySelector(`stacked-card[data-index="${nextIndex}"]`);

        if (entry.isIntersecting) {
          if (nextCard) {
            entry.target.classList.add('overlapped');
            entry.target.setAttribute('inert', '');
            entry.target.removeAttribute('tabindex');
            if (entry.target.classList.contains('normal-overlapped')) {
              entry.target.classList.remove('normal-overlapped');
            }
          }
        } else {
          entry.target.classList.remove('overlapped');
          entry.target.removeAttribute('inert');
          entry.target.setAttribute('tabindex', '0');
          if (entry.target.index < this.totalBlocks && entry.target.index > 1) {
            entry.target.classList.add('normal-overlapped');
          }
        }
      });
    }, observerOptions);

    this.querySelectorAll('stacked-card').forEach((card) => {
      observer.observe(card);
    });
  }
}

customElements.define('stacked-cards', StackedCards);


class PredictiveSearch extends HTMLElement {
  constructor () {
      super()

      this.input = this.querySelector('input[type="search"]')
      this.results = this.querySelector('#predictive-search')
      this.alert = this.querySelector('#predictive-search-alert')
      this.footer = this.closest('#offcanvas-search').querySelector('.offcanvas-footer')
      this.popularProducts = this.closest('#offcanvas-search').querySelector('#search-popular-products-wrapper')
      this.speechBtn = this.querySelector('.btn-search-by-voice')

      this.input.addEventListener('input', this.debounce((event) => {
          this.onChange()
      }, 300).bind(this))

      document.querySelector('#offcanvas-search')?.addEventListener('shown.bs.offcanvas', () => {
          this.input.focus()
      })

      if (window.SpeechRecognition || window.webkitSpeechRecognition) {
          this.speechBtn?.addEventListener('click', () => {
              this.speechRecognition()
          })
      } else {
          this.speechBtn.remove()
      }

      document.querySelectorAll('#offcanvas-search .btn-atc').forEach(btn => {
          btn.addEventListener('click', () => {
              setTimeout(() => {
                  bootstrap.Offcanvas.getOrCreateInstance('#offcanvas-search').hide()
              }, 300)
          })
      })
  }

  onChange () {
      const searchTerm = this.input.value.trim()
      // console.log(searchTerm)

      this.footer.querySelector('[name="q"]').value = searchTerm
      this.footer.querySelector('.btn').textContent =
          `${this.footer.querySelector('.btn').dataset.textSearchFor} "${searchTerm}"`

      if (!searchTerm.length) {
          this.close()
          return
      }

      this.getSearchResults(searchTerm)
  }

  async getSearchResults (searchTerm) {
      let resourcesType = 'product'

      if (this.input.dataset.searchCollections === 'true') {
          resourcesType = `${resourcesType},collection`
      }
      if (this.input.dataset.searchPages === 'true') {
          resourcesType = `${resourcesType},page`
      }
      if (this.input.dataset.searchArticles === 'true') {
          resourcesType = `${resourcesType},article`
      }

      const response = await fetch(`/search/suggest?q=${searchTerm}&resources[type]=${resourcesType}&resources[limit]=10&section_id=predictive-search`)

      if (!response.ok) {
          const error = new Error(response.status)
          this.close()
          throw error
      }

      const text = await response.text()
      const resultsMarkup = new DOMParser().parseFromString(text, 'text/html').querySelector('#shopify-section-predictive-search').innerHTML
      this.results.innerHTML = resultsMarkup

      this.open()
  }

  open () {
      this.results.style.display = 'block'

      const countResults = this.results.querySelectorAll('.product-item').length

      switch (countResults) {
      case 0:
          this.alert.textContent = this.alert.dataset.textNoResults
          break
      case 1:
          this.alert.textContent = this.alert.dataset.textResultFound
          break
      default:
          this.alert.textContent = this.alert.dataset.textResultsFound.replace('[count]', countResults)
          break
      }

      this.footer.removeAttribute('hidden')

      window.SPR?.initDomEls()
      window.SPR?.loadBadges()

      this.popularProducts?.setAttribute('hidden', 'hidden')
  }

  close () {
      this.results.style.display = 'none'
      this.alert.textContent = ''
      this.footer.setAttribute('hidden', 'hidden')

      this.popularProducts?.removeAttribute('hidden')
  }

  speechRecognition () {
      // eslint-disable-next-line no-undef, no-use-before-define, no-var
      var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.onstart = () => {
          console.log('on speech start')
          this.speechBtn.classList.add('speech-started')

          setTimeout(() => {
              this.speechBtn.classList.remove('speech-started')
          }, 5000)
      }

      recognition.onspeechend = (event) => {
          console.log('on speech end', event)
          this.speechBtn.classList.remove('speech-started')
      }

      recognition.onresult = (event) => {
          console.log('on speech result', event)

          if (event.results) {
              this.input.value = event.results[0][0].transcript
              this.onChange()
          }
      }

      recognition.start()
  }

  debounce (fn, wait) {
      let t
      return (...args) => {
          clearTimeout(t)
          t = setTimeout(() => fn.apply(this, args), wait)
      }
  }
}

customElements.define('predictive-search', PredictiveSearch)

window.closeSearchOffcanvas = (btn, event) => {
  setTimeout(() => {
      bootstrap.Offcanvas.getOrCreateInstance('#offcanvas-search').hide()
  }, 300)
}

/** Shoppable lookbook — hotspot pins */
const initShoppableLookbook = (rootElement) => {
  const root = rootElement || document;
  root.querySelectorAll('[data-lookbook-section]').forEach((section) => {
    if (section.dataset.lookbookInit === 'true') return;
    section.dataset.lookbookInit = 'true';

    section.addEventListener('click', (e) => {
      const pin = e.target.closest('[data-lookbook-pin]');
      if (pin && section.contains(pin)) {
        setLookbookOpen(section, pin.dataset.lookbookBlock, pin);
        return;
      }

      const closeBtn = e.target.closest('[data-lookbook-close]');
      if (closeBtn && section.contains(closeBtn)) {
        closeLookbook(section, { restoreFocus: true });
      }
    });
  });
};

const lookbookIsMobileMq = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 767.98px)').matches;

const getLookbookTrigger = (section, blockId) =>
  section.querySelector(`[data-lookbook-pin][data-lookbook-block="${CSS.escape(blockId)}"]`);
const getLookbookPopover = (section, blockId) =>
  section.querySelector(`[data-lookbook-popover][data-lookbook-block="${CSS.escape(blockId)}"]`);

const closeLookbook = (section, { restoreFocus } = {}) => {
  const openBlockId = section.dataset.lookbookOpenBlock;
  if (openBlockId) {
    const trigger = getLookbookTrigger(section, openBlockId);
    const popover = getLookbookPopover(section, openBlockId);
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (popover) popover.hidden = true;
  }

  const sheet = section.querySelector('[data-lookbook-sheet]');
  const sheetContent = section.querySelector('[data-lookbook-sheet-content]');
  if (sheet) sheet.hidden = true;
  if (sheetContent) sheetContent.innerHTML = '';

  section.dataset.lookbookOpenBlock = '';

  if (restoreFocus && section.dataset.lookbookLastTriggerId) {
    section.querySelector(`#${CSS.escape(section.dataset.lookbookLastTriggerId)}`)?.focus?.({ preventScroll: true });
  }
};

const setLookbookOpen = (section, blockId, trigger) => {
  if (!blockId) return;

  const current = section.dataset.lookbookOpenBlock;
  if (current && current === blockId) {
    closeLookbook(section, { restoreFocus: true });
    return;
  }

  // Close any other open lookbook on the page.
  document.querySelectorAll('[data-lookbook-section][data-lookbook-open-block]:not([data-lookbook-open-block=""])').forEach((other) => {
    if (other !== section) closeLookbook(other);
  });

  closeLookbook(section);
  section.dataset.lookbookOpenBlock = blockId;

  if (trigger) {
    if (!trigger.id) trigger.id = `LookbookPin-${section.dataset.lookbookSection}-${blockId}`;
    section.dataset.lookbookLastTriggerId = trigger.id;
  }

  const popover = getLookbookPopover(section, blockId);
  const sheet = section.querySelector('[data-lookbook-sheet]');
  const sheetContent = section.querySelector('[data-lookbook-sheet-content]');
  const shouldUseSheet = section.dataset.lookbookMobileBehavior === 'bottom_sheet' && lookbookIsMobileMq();

  if (!popover) return;
  trigger?.setAttribute?.('aria-expanded', 'true');

  if (shouldUseSheet && sheet && sheetContent) {
    const content = popover.querySelector('.lookbook-popover__content');
    sheetContent.innerHTML = content ? content.innerHTML : popover.innerHTML;
    sheet.hidden = false;
    sheet.querySelector('[data-lookbook-close]')?.focus({ preventScroll: true });
  } else {
    popover.hidden = false;
    popover.querySelector('[data-lookbook-close]')?.focus({ preventScroll: true });
  }
};

if (!window.__shoppableLookbookGlobalBound) {
  window.__shoppableLookbookGlobalBound = true;

  document.addEventListener(
    'pointerdown',
    (e) => {
      const openSections = document.querySelectorAll(
        '[data-lookbook-section][data-lookbook-open-block]:not([data-lookbook-open-block=""])',
      );
      openSections.forEach((section) => {
        const openBlockId = section.dataset.lookbookOpenBlock;
        const popover = openBlockId ? getLookbookPopover(section, openBlockId) : null;
        const trigger = openBlockId ? getLookbookTrigger(section, openBlockId) : null;
        const sheet = section.querySelector('[data-lookbook-sheet]');

        const withinPopover = popover && popover.contains(e.target);
        const withinSheet = sheet && !sheet.hidden && sheet.contains(e.target);
        const withinTrigger = trigger && trigger.contains(e.target);
        if (!withinPopover && !withinSheet && !withinTrigger) {
          closeLookbook(section, { restoreFocus: true });
        }
      });
    },
    { passive: true },
  );

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document
        .querySelectorAll('[data-lookbook-section][data-lookbook-open-block]:not([data-lookbook-open-block=""])')
        .forEach((section) => closeLookbook(section, { restoreFocus: true }));
      return;
    }

    if (e.key === 'Tab') {
      document
        .querySelectorAll('[data-lookbook-section][data-lookbook-open-block]:not([data-lookbook-open-block=""])')
        .forEach((section) => {
          const sheet = section.querySelector('[data-lookbook-sheet]');
          if (!sheet || sheet.hidden) return;
          const focusables = sheet.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          );
          if (!focusables.length) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        });
    }
  });

  window.addEventListener('resize', () => {
    document
      .querySelectorAll('[data-lookbook-section][data-lookbook-open-block]:not([data-lookbook-open-block=""])')
      .forEach((section) => {
        const openBlockId = section.dataset.lookbookOpenBlock;
        const trigger = openBlockId ? getLookbookTrigger(section, openBlockId) : null;
        if (!openBlockId) return;
        setLookbookOpen(section, openBlockId, trigger);
      });
  });
}

document.addEventListener('DOMContentLoaded', () => initShoppableLookbook());
document.addEventListener('shopify:section:load', (e) => initShoppableLookbook(e.target));
