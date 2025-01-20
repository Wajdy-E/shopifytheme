const setupLayoutSelector = () => {
    const layoutButtons = document.querySelectorAll(`#layout-selector .grid-icon`);
    const productList = document.getElementById('product-list');
  
    layoutButtons.forEach(button => {
      button.addEventListener('click', () => {
        layoutButtons.forEach(btn => {
          btn.setAttribute('aria-checked', 'false');
          btn.classList.remove('active');
        });
  
        button.setAttribute('aria-checked', 'true');
        button.classList.add('active');
  
        const selectedLayout = button.getAttribute('data-layout');
        productList.classList.remove(...[...productList.classList].filter(cls => cls.startsWith('row-cols-lg-')));
  
        const [columns] = selectedLayout.split('x');
        productList.classList.add(`row-cols-lg-${columns}`);
      });
  
      button.addEventListener('keydown', (e) => {
        let newButton;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          newButton = button.nextElementSibling || layoutButtons[0];
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          newButton = button.previousElementSibling || layoutButtons[layoutButtons.length - 1];
        }
  
        if (newButton) {
          newButton.focus();
          newButton.click();
        }
      });
    });
  };
  
document.addEventListener('DOMContentLoaded', setupLayoutSelector);

const initImageHover = () => {
  const navLinks = document.querySelectorAll('.nav-link[data-image]');
  navLinks.forEach(link => {
    link.addEventListener('mouseover', async function (event) {
      const imageUrl = event.target.getAttribute('data-image');
      if (imageUrl) {
        let hoverImage;

        // Load the image asynchronously
        try {
          hoverImage = await loadImageAsync(imageUrl);
          hoverImage.className = 'hover-image rounded';
          hoverImage.setAttribute('loading', 'lazy');
          hoverImage.style.position = 'absolute'; // Set position style
          hoverImage.style.top = '-9999px';       // Move off-screen initially
          hoverImage.style.left = '-9999px';
          document.body.appendChild(hoverImage);

          const moveImage = (e) => {
            hoverImage.style.top = e.pageY + 10 + 'px';
            hoverImage.style.left = e.pageX + 10 + 'px';
          };

          document.addEventListener('mousemove', moveImage);

          link.addEventListener('mouseout', function () {
            document.body.removeChild(hoverImage);
            document.removeEventListener('mousemove', moveImage);
          }, { once: true });
        } catch (error) {
          console.error('Failed to load image:', error);
        }
      }
    });
  });
};

// Helper function to load image asynchronously
const loadImageAsync = (src) => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};

document.addEventListener('DOMContentLoaded', initImageHover);
