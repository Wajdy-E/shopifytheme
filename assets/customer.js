document.addEventListener('DOMContentLoaded', function() {
  const recoverLink = document.getElementById('recover-password-link');
  const recoverSection = document.getElementById('recover-section');
  const loginSection = document.getElementById('login-section');
  const cancelRecover = document.getElementById('cancel-recover');

  if (recoverLink) {
      recoverLink.addEventListener('click', function(event) {
          event.preventDefault();
          recoverSection.style.display = 'block';
          loginSection.style.display = 'none';
      });
  }

  if (cancelRecover) {
      cancelRecover.addEventListener('click', function(event) {
          event.preventDefault();
          recoverSection.style.display = 'none';
          loginSection.style.display = 'block';
      });
  }
});

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleButton');
    const icon = document.getElementById('toggleIcon');
    const iconPath = document.getElementById('iconPath');
    
    toggleButton.addEventListener('click', () => {
        const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            icon.classList.remove('rotated');
            iconPath.setAttribute("d", "M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8");
        } else {
            icon.classList.add('rotated');
            iconPath.setAttribute("d", "M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4");
        }
    });
});



document.addEventListener('DOMContentLoaded', () => {
    Shopify.bind = function (fn, scope) {
      return function () {
        return fn.apply(scope, arguments);
      };
    };
  
    Shopify.setSelectorByValue = function (selector, value) {
      for (var i = 0, count = selector.options.length; i < count; i++) {
        var option = selector.options[i];
        if (value == option.value || value == option.innerHTML) {
          selector.selectedIndex = i;
          return i;
        }
      }
    };
  
    Shopify.addListener = function (target, eventName, callback) {
      target.addEventListener
        ? target.addEventListener(eventName, callback, false)
        : target.attachEvent('on' + eventName, callback);
    };
  
    Shopify.postLink = function (path, options) {
      options = options || {};
      var method = options['method'] || 'post';
      var params = options['parameters'] || {};
  
      var form = document.createElement('form');
      form.setAttribute('method', method);
      form.setAttribute('action', path);
  
      for (var key in params) {
        var hiddenField = document.createElement('input');
        hiddenField.setAttribute('type', 'hidden');
        hiddenField.setAttribute('name', key);
        hiddenField.setAttribute('value', params[key]);
        form.appendChild(hiddenField);
      }
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    };
  
    Shopify.CountryProvinceSelector = function (country_domid, province_domid, options) {
      this.countryEl = document.getElementById(country_domid);
      this.provinceEl = document.getElementById(province_domid);
      this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);
  
      if (this.countryEl && this.provinceEl) {
        Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler, this));
  
        this.initCountry();
        this.initProvince();
      } else {
        console.error('Country or Province element not found:', country_domid, province_domid);
      }
    };
  
    Shopify.CountryProvinceSelector.prototype = {
        initCountry: function () {
          var value = this.countryEl.getAttribute('data-default');
          if (value) {
            Shopify.setSelectorByValue(this.countryEl, value);
          }
          this.countryHandler();
        },
      
        initProvince: function () {
          var value = this.provinceEl.getAttribute('data-default');
          if (value && this.provinceEl.options.length > 0) {
            Shopify.setSelectorByValue(this.provinceEl, value);
          }
        },
      
        countryHandler: function (e) {
          var opt = this.countryEl.options[this.countryEl.selectedIndex];
          var raw = opt.getAttribute('data-provinces');
          var provinces = JSON.parse(raw);
      
          this.clearOptions(this.provinceEl);
          if (provinces && provinces.length == 0) {
            this.provinceContainer.style.display = 'none';
          } else {
            for (var i = 0; i < provinces.length; i++) {
              var opt = document.createElement('option');
              opt.value = provinces[i][0];
              opt.innerHTML = provinces[i][1];
              this.provinceEl.appendChild(opt);
            }
            this.provinceContainer.style.display = '';
          }
      
          // Ensure the current province is selected
          this.initProvince();
        },
      
        clearOptions: function (selector) {
          while (selector.firstChild) {
            selector.removeChild(selector.firstChild);
          }
        }
      };
      
  
    // Handle delete confirmation
    document.querySelectorAll('button[data-confirm-message]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const message = event.currentTarget.getAttribute('data-confirm-message');
        if (confirm(message)) {
          Shopify.postLink(event.currentTarget.dataset.target, {
            parameters: { _method: 'delete' }
          });
        }
      });
    });
  
    // Handle address form toggling and updating
    const addressForms = document.querySelectorAll('[data-address]');
    addressForms.forEach((formContainer) => {
      const editButton = formContainer.querySelector('button[aria-expanded]');
      const resetButton = formContainer.querySelector('button[type="reset"]');
  
      // Toggle the edit form
      if (editButton) {
        editButton.addEventListener('click', (event) => {
          const target = document.getElementById(event.currentTarget.getAttribute('aria-controls'));
          const expanded = event.currentTarget.getAttribute('aria-expanded') === 'true';
          event.currentTarget.setAttribute('aria-expanded', (!expanded).toString());
          target.classList.toggle('show', !expanded);
  
          if (!expanded) {
            const formId = target.querySelector('[data-address-country-select]').getAttribute('data-form-id');
            new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
              hideElement: `AddressProvinceContainer_${formId}`,
            });          
          }
        });
      }
  
      // Reset the form and collapse
      if (resetButton) {
        resetButton.addEventListener('click', (event) => {
          const form = event.currentTarget.closest('form');
          form.reset();
          const target = event.currentTarget.closest('.collapse');
          if (target) {
            const button = formContainer.querySelector('button[aria-expanded]');
            button.setAttribute('aria-expanded', 'false');
            target.classList.remove('show');
          }
        });
      }
    });
  
    // Initialize CountryProvinceSelector for the new address form
    if (Shopify && Shopify.CountryProvinceSelector) {
      new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
        hideElement: 'AddressProvinceContainerNew',
      });
    }
    
    document.querySelectorAll('.reset_btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const collapseElement = btn.closest('.collapse.show');
            if (collapseElement) {
                const bsCollapse = new bootstrap.Collapse(collapseElement, {
                    toggle: false
                });
                bsCollapse.hide();
            }
        });
    });
    
    // Force form submission of all fields even if country or province is unchanged
    document.querySelectorAll('form').forEach((form) => {
      form.addEventListener('submit', (event) => {
        const countryEl = form.querySelector('[name="address[country]"]');
        const provinceEl = form.querySelector('[name="address[province]"]');
  
        if (countryEl && !countryEl.value) {
          const defaultCountry = countryEl.getAttribute('data-default');
          if (defaultCountry) {
            countryEl.value = defaultCountry;
          }
        }
  
        if (provinceEl && !provinceEl.value) {
          const defaultProvince = provinceEl.getAttribute('data-default');
          if (defaultProvince) {
            provinceEl.value = defaultProvince;
          }
        }
      });
    });
  });
  
  