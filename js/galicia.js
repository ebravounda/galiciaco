/*
* Constructora Galicia - galería de obras (filtros, "ver más" y visor de imágenes)
*/
(function () {
	'use strict';

	var grid = document.querySelector('.gallery-grid');
	if (!grid) return;

	var cells = Array.prototype.slice.call(grid.querySelectorAll('.gallery-grid__cell'));
	var moreBtn = document.querySelector('.gallery-more');
	var filterBtns = Array.prototype.slice.call(document.querySelectorAll('.gallery-filters__btn'));

	// Filtros
	filterBtns.forEach(function (btn) {
		btn.addEventListener('click', function () {
			var filter = btn.getAttribute('data-filter');
			filterBtns.forEach(function (b) {
				var active = b === btn;
				b.classList.toggle('is-active', active);
				b.setAttribute('aria-pressed', active ? 'true' : 'false');
			});
			cells.forEach(function (cell) {
				cell.classList.toggle('is-hidden', filter !== '*' && cell.getAttribute('data-cat') !== filter);
			});
			// Al filtrar se muestran todas las obras de la categoría
			if (filter !== '*') {
				grid.classList.remove('is-collapsed');
				if (moreBtn) moreBtn.hidden = true;
			}
		});
	});

	// Ver más
	if (moreBtn) {
		moreBtn.addEventListener('click', function () {
			grid.classList.remove('is-collapsed');
			moreBtn.hidden = true;
		});
	}

	// Visor de imágenes
	var links = cells.map(function (cell) { return cell.querySelector('[data-lightbox]'); });
	var box = document.createElement('div');
	box.className = 'glb';
	box.setAttribute('role', 'dialog');
	box.setAttribute('aria-modal', 'true');
	box.setAttribute('aria-label', 'Visor de imágenes');
	box.innerHTML =
		'<button class="glb__btn glb__close" type="button" aria-label="Cerrar">&times;</button>' +
		'<button class="glb__btn glb__prev" type="button" aria-label="Imagen anterior">&#8249;</button>' +
		'<figure class="glb__fig"><img class="glb__img" alt=""><figcaption class="glb__cap"></figcaption></figure>' +
		'<button class="glb__btn glb__next" type="button" aria-label="Imagen siguiente">&#8250;</button>';
	document.body.appendChild(box);

	var img = box.querySelector('.glb__img');
	var cap = box.querySelector('.glb__cap');
	var current = -1;
	var lastFocus = null;

	function visibleLinks() {
		return links.filter(function (a) {
			return !a.parentNode.classList.contains('is-hidden');
		});
	}

	function show(link) {
		var list = visibleLinks();
		current = list.indexOf(link);
		img.src = link.getAttribute('href');
		img.alt = link.querySelector('img').alt;
		cap.innerHTML = '';
		cap.appendChild(document.createTextNode(link.getAttribute('data-caption')));
		var small = document.createElement('small');
		small.textContent = (current + 1) + ' / ' + list.length;
		cap.appendChild(small);
	}

	function step(dir) {
		var list = visibleLinks();
		if (!list.length) return;
		show(list[(current + dir + list.length) % list.length]);
	}

	function open(link) {
		lastFocus = document.activeElement;
		show(link);
		box.classList.add('is-open');
		document.body.classList.add('glb-lock');
		box.querySelector('.glb__close').focus();
	}

	function close() {
		box.classList.remove('is-open');
		document.body.classList.remove('glb-lock');
		img.removeAttribute('src');
		if (lastFocus) lastFocus.focus();
	}

	links.forEach(function (link) {
		link.addEventListener('click', function (e) {
			e.preventDefault();
			open(link);
		});
	});

	box.querySelector('.glb__close').addEventListener('click', close);
	box.querySelector('.glb__prev').addEventListener('click', function () { step(-1); });
	box.querySelector('.glb__next').addEventListener('click', function () { step(1); });
	box.addEventListener('click', function (e) {
		if (e.target === box) close();
	});

	document.addEventListener('keydown', function (e) {
		if (!box.classList.contains('is-open')) return;
		if (e.key === 'Escape') close();
		else if (e.key === 'ArrowLeft') step(-1);
		else if (e.key === 'ArrowRight') step(1);
	});

	// Deslizar en móviles
	var touchX = null;
	box.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
	box.addEventListener('touchend', function (e) {
		if (touchX === null) return;
		var dx = e.changedTouches[0].clientX - touchX;
		if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
		touchX = null;
	});
})();
