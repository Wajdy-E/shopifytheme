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

/** before and after */

document.addEventListener('DOMContentLoaded', function () {
  function initializeSlider(container) {
    const slider = container.querySelector('.slider');
    const revealDirection = container.getAttribute('data-reveal-direction');
    const updateSliderPosition = (value) => {
      if (revealDirection === 'vertical') {
        const reversedValue = value; // reverse value for vertical direction
        const currentHeight = slider.offsetHeight;
        const currentWidth = slider.offsetWidth;
        slider.style.width = currentHeight + 'px';
        slider.style.height = currentWidth + 'px';
        container.style.setProperty('--position', `${reversedValue}%`);
      } else {
        container.style.setProperty('--position', `${value}%`);
      }
    };

    slider.addEventListener(
      'input',
      (e) => {
        e.preventDefault();
        updateSliderPosition(e.target.value);
      },
      { passive: true },
    );

    slider.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = slider.getBoundingClientRect();
      let value;
      if (revealDirection === 'vertical') {
        value = ((rect.bottom - touch.clientY) / rect.height) * 100;
      } else {
        value = ((touch.clientX - rect.left) / rect.width) * 100;
      }
      value = Math.max(0, Math.min(100, value)); // ensure value is between 0 and 100
      slider.value = value;
      updateSliderPosition(value);
    });
  }

  const containers = document.querySelectorAll('.image-comparison-section .image-comparison-container');
  containers.forEach((container) => initializeSlider(container));

  document.addEventListener('shopify:section:load', function (e) {
    const newContainers = e.target.querySelectorAll('.image-comparison-section .image-comparison-container');
    newContainers.forEach((container) => initializeSlider(container));
  });
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
