const initEnterView = () => {
  const carouselObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('entered');
          entry.target.classList.remove('enter-view');
          console.log(entry.target)
          entry.target.querySelectorAll('.animate__animated').forEach((el) => {
            el.classList.remove('opacity-0');
            el.classList.add(el.dataset.animateClass);
          });
        } else {
          entry.target.classList.remove('entered');
          entry.target.classList.add('enter-view');

          // Only remove animation classes if the section has the class "carousel"
          entry.target.querySelectorAll('.animate__animated').forEach((el) => {
            el.classList.remove(el.dataset.animateClass);
          });
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -200px 0px' },
  );

  const nonCarouselObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('entered');
          entry.target.classList.remove('enter-view');
          entry.target.querySelectorAll('.animate__animated').forEach((el) => {
            el.classList.remove('opacity-0');
            el.classList.add(el.dataset.animateClass);
          });
        } else {
          entry.target.classList.remove('entered');
          entry.target.classList.add('enter-view');
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px -200px 0px' },
  );

  document.querySelectorAll('.enter-view, .entered').forEach((el) => {
    if (el.closest('.carousel')) {
      carouselObserver.observe(el);
    } else {
      nonCarouselObserver.observe(el);
    }
  });
};

initEnterView();

document.addEventListener('shopify:section:load', () => {
  initEnterView();
});

document.addEventListener('DOMContentLoaded', () => {
  const initPlayButton = () => {
    document.querySelectorAll('.video-wrapper').forEach((wrapper) => {
      const video = wrapper.querySelector('video');
      const playButton = wrapper.querySelector('.custom-play-button');

      if (!video || !playButton) {
        return;
      }

      const pause = playButton.querySelector('.pause');
      const play = playButton.querySelector('.play');
      const btn = playButton.querySelector('.play-button');

      if (!pause || !play || !btn) {
        return;
      }

      const togglePlayPause = () => {
        if (play.classList.contains('active')) {
          play.classList.remove('active');
          pause.classList.add('active');
          video.play();
          playButton.setAttribute('aria-pressed', 'true');
          playButton.setAttribute('aria-label', 'Pause');
        } else {
          pause.classList.remove('active');
          play.classList.add('active');
          video.pause();
          playButton.setAttribute('aria-pressed', 'false');
          playButton.setAttribute('aria-label', 'Play');
        }
      };

      btn.addEventListener('click', togglePlayPause);

      playButton.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          togglePlayPause();
        }
      });

      video.addEventListener('play', () => {
        play.classList.remove('active');
        pause.classList.add('active');
        playButton.setAttribute('aria-pressed', 'true');
        playButton.setAttribute('aria-label', 'Pause');
      });

      video.addEventListener('pause', () => {
        pause.classList.remove('active');
        play.classList.add('active');
        playButton.setAttribute('aria-pressed', 'false');
        playButton.setAttribute('aria-label', 'Play');
      });
    });
  };

  initPlayButton();

  document.addEventListener('shopify:section:load', () => {
    initPlayButton();
  });
});

const initVideoLazyLoad = () => {
  const lazyVideos = [].slice.call(document.querySelectorAll('video.lazy-video'));

  if ('IntersectionObserver' in window) {
    const lazyVideoObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (video) {
          if (video.isIntersecting) {
            for (const source in video.target.children) {
              const videoSource = video.target.children[source];
              if (typeof videoSource.tagName === 'string' && videoSource.tagName === 'SOURCE') {
                videoSource.src = videoSource.dataset.src;
              }
            }

            video.target.load();

            if (video.target.hasAttribute('data-poster')) {
              video.target.poster = video.target.dataset.poster;
            }

            video.target.classList.remove('lazy-video');
            lazyVideoObserver.unobserve(video.target);
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px 200px 0px' },
    );

    lazyVideos.forEach(function (lazyVideo) {
      lazyVideoObserver.observe(lazyVideo);
    });
  }
};
initVideoLazyLoad();

/** Button animation */
const btnAnimation = () => {
  document.querySelectorAll('.btn-outline-primary, .btn-outline-secondary').forEach((button) => {
    button.addEventListener('mouseenter', function (e) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      button.style.setProperty('--x', `${x}px`);
      button.style.setProperty('--y', `${y}px`);
    });

    button.addEventListener('mouseleave', function (e) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      button.style.setProperty('--x', `${x}px`);
      button.style.setProperty('--y', `${y}px`);

      button.classList.add('hovered');

      setTimeout(() => {
        button.classList.remove('hovered');
        button.style.removeProperty('--x');
        button.style.removeProperty('--y');
      }, 400);
    });
  });
};

document.addEventListener('DOMContentLoaded', btnAnimation);
document.addEventListener('shopify:section:load', () => {
  btnAnimation();
});


document.querySelectorAll('.move-on-hover').forEach(element => {
  element.addEventListener('mouseenter', () => {
    element.classList.add('hovering');
  });

  element.addEventListener('mousemove', (e) => {
    const rect = element.getBoundingClientRect();
    const offsetX = (e.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (e.clientY - rect.top) / rect.height - 0.5;

    const moveX = offsetX * 10;
    const moveY = offsetY * 10;

    element.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });

  element.addEventListener('mouseleave', () => {
    element.classList.remove('move-on-hover');
    element.style.transform = 'translate(0, 0)';
  });
});


Shopify.formatMoney = function(cents, format) {
  if (typeof cents == 'string') { cents = cents.replace('.',''); }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || this.money_format);

  function defaultOption(opt, def) {
     return (typeof opt == 'undefined' ? def : opt);
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ',');
    decimal   = defaultOption(decimal, '.');

    if (isNaN(number) || number == null) { return 0; }

    number = (number/100.0).toFixed(precision);

    var parts   = number.split('.'),
        dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
        cents   = parts[1] ? (decimal + parts[1]) : '';

    return dollars + cents;
  }

  switch(formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }

  return formatString.replace(placeholderRegex, value);
};



   const initSharebtn = () =>{
    const shareButtons = document.querySelectorAll('.share-button');
  
    shareButtons.forEach((shareButtonElement) => {
      const elements = {
        shareButton: shareButtonElement.querySelector('button'),
        shareSummary: shareButtonElement.querySelector('summary'),
        closeButton: shareButtonElement.querySelector('.share-button__close'),
        successMessage: shareButtonElement.querySelector('[id^="ShareMessage"]'),
        urlInput: shareButtonElement.querySelector('input'),
      };
  
      let urlToShare = elements.urlInput ? elements.urlInput.value : document.location.href;
  
      if (navigator.share) {
        shareButtonElement.querySelector('details').setAttribute('hidden', '');
        elements.shareButton.classList.remove('hidden');
        elements.shareButton.addEventListener('click', () => {
          navigator.share({ url: urlToShare, title: document.title });
        });
      } else {
        const detailsToggle = shareButtonElement.querySelector('details');
  
        detailsToggle.addEventListener('toggle', () => {
          if (!detailsToggle.open) {
            elements.successMessage.classList.add('hidden');
            elements.successMessage.textContent = '';
            elements.closeButton.classList.add('hidden');
            elements.shareSummary.focus();
          }
        });
  
        shareButtonElement.querySelector('.share-button__copy').addEventListener('click', () => {
          navigator.clipboard.writeText(elements.urlInput.value).then(() => {
            elements.successMessage.classList.remove('hidden');
            elements.successMessage.textContent = window.accessibilityStrings.shareSuccess;
            elements.closeButton.classList.remove('hidden');
            elements.closeButton.focus();
          });
        });
  
        elements.closeButton.addEventListener('click', () => {
          detailsToggle.removeAttribute('open');
        });
      }
  
      function updateUrl(url) {
        urlToShare = url;
        elements.urlInput.value = url;
      }
    });

  }
  document.addEventListener('DOMContentLoaded', initSharebtn)
  document.addEventListener('shopify:section:load', () => {
    initSharebtn();
  });

  document.addEventListener('DOMContentLoaded', function () {
    var cartDrawer = document.getElementById('CartDrawer');
    var cartBackdrop = document.getElementById('CartBackdrop');

    cartDrawer.addEventListener('show.bs.offcanvas', function () {
        cartBackdrop.style.display = 'block';
    });

    cartDrawer.addEventListener('hide.bs.offcanvas', function () {
        cartBackdrop.style.display = 'none';
    });
});


