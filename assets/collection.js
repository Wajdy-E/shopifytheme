const setupLayoutSelector = () => {
	const layoutButtons = document.querySelectorAll(`#layout-selector .layout-icon`);
	const productList = document.getElementById('collection-product-list');

	layoutButtons.forEach((button) => {
		button.addEventListener('click', () => {
			layoutButtons.forEach((btn) => {
				btn.setAttribute('aria-checked', 'false');
				btn.classList.remove('active');
			});

			button.setAttribute('aria-checked', 'true');
			button.classList.add('active');

			const selectedLayout = button.getAttribute('data-layout');
			const columns = button.getAttribute('data-columns');

			if (selectedLayout === 'list') {
				productList.classList.remove(...[...productList.classList].filter((cls) => cls.startsWith('row-cols-lg-')));
			} else if (selectedLayout === 'grid' && columns) {
				productList.classList.add(`row-cols-lg-${columns}`);
			}

			productList.classList.add(`${selectedLayout}-layout`);
		});
	});
};

document.addEventListener('DOMContentLoaded', setupLayoutSelector);
