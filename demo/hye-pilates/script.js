// Basic UI interactions and map initialization


function initApp() {
	const root = document.documentElement;
	// Force light theme to keep white background aesthetic
	root.classList.remove('dark');

	// Mobile menu toggle
	const menuButton = document.getElementById('menuButton');
	const mobileNav = document.getElementById('mobileNav');
	menuButton?.addEventListener('click', () => {
		const expanded = menuButton.getAttribute('aria-expanded') === 'true';
		menuButton.setAttribute('aria-expanded', String(!expanded));
		mobileNav?.classList.toggle('hidden');
	});

	// Header subtle border on scroll
	const siteHeader = document.getElementById('siteHeader');
	function onScroll() {
		const y = window.scrollY || window.pageYOffset;
		if (y > 10) {
			siteHeader?.classList.add('border-gray-200');
		} else {
			siteHeader?.classList.remove('border-gray-200');
		}
	}
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();

	// Footer year
	const yearEl = document.getElementById('year');
	if (yearEl) yearEl.textContent = String(new Date().getFullYear());

	// Leaflet Map: 10 Craighurst Ave, Toronto, ON
	const mapEl = document.getElementById('map');
	if (mapEl && typeof L !== 'undefined') {
		const lat = 43.7054;
		const lng = -79.3995;
		const map = L.map('map', {
			zoomControl: true,
			scrollWheelZoom: false,
		}).setView([lat, lng], 16);

		// Grayscale basemap (CartoDB Positron)
		L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
			attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
			maxZoom: 19,
		}).addTo(map);

		// Brand marker using a DivIcon
		const marker = L.marker([lat, lng], {
			icon: L.divIcon({
				className: 'hye-marker',
				html: '<div class="px-3 py-1 rounded bg-white/90 text-gray-900 border border-gray-300 shadow font-serif text-sm">HYE</div>',
				iconSize: [0, 0],
				iconAnchor: [0, 0],
			})
		}).addTo(map);

		marker.bindPopup('HYE — 10 Craighurst Ave, Toronto, ON');

		// Invalidate size after paint to ensure tiles render
		setTimeout(() => map.invalidateSize(), 50);
	}

}

// Mini calendar renderer (Monday-first)
(function(){
	const grid = document.getElementById('miniCalendarGrid');
	const label = document.getElementById('calMonthLabel');
	const prev = document.getElementById('calPrev');
	const next = document.getElementById('calNext');
	if(!grid || !label || !prev || !next) return;

	let view = new Date();
	view.setDate(1);

	function render(){
		grid.innerHTML = '';
		const y = view.getFullYear();
		const m = view.getMonth();
		label.textContent = new Date(y, m, 1).toLocaleString(undefined, { month:'long', year:'numeric' });

		// Compute Monday-first index: Mon=0..Sun=6
		let day = new Date(y, m, 1).getDay(); // 0..6, Sun=0
		const firstIndex = (day === 0) ? 6 : day - 1;
		const daysInPrev = new Date(y, m, 0).getDate();
		const daysInMonth = new Date(y, m+1, 0).getDate();
		const today = new Date();

		const cells = 42; // 6 rows
		for(let i=0;i<cells;i++){
			const dayIndex = i - firstIndex + 1;
			const cell = document.createElement('div');
			cell.className = 'calendar-cell';
			if(dayIndex <= 0){
				cell.textContent = String(daysInPrev + dayIndex);
				cell.classList.add('muted');
			}else if(dayIndex > daysInMonth){
				cell.textContent = String(dayIndex - daysInMonth);
				cell.classList.add('muted');
			}else{
				cell.textContent = String(dayIndex);
				if(dayIndex===today.getDate() && m===today.getMonth() && y===today.getFullYear()){
					cell.classList.add('today');
				}
				cell.classList.add('hover:bg-gray-100','dark:hover:bg-gray-800');
			}
			grid.appendChild(cell);
		}
	}

	prev.addEventListener('click', () => { view.setMonth(view.getMonth()-1); render(); });
	next.addEventListener('click', () => { view.setMonth(view.getMonth()+1); render(); });
	render();
})();

// Vertical Reviews auto-cycle
(function(){
	const viewport = document.getElementById('reviewsViewport');
	const track = document.getElementById('reviewsTrack');
	if(!viewport || !track) return;
	const rows = Array.from(track.querySelectorAll('.review-row'));
	let index = 0;
	function update(){
		const rowH = rows[0]?.offsetHeight || 0;
		track.style.transform = `translateY(${-index * rowH}px)`;
	}
	function next(){ index = (index + 1) % rows.length; update(); }
	function prev(){ index = (index - 1 + rows.length) % rows.length; update(); }
	let timer = setInterval(next, 5000);
	function reset(){ clearInterval(timer); timer = setInterval(next, 5000); }
	document.querySelector('.rev-next')?.addEventListener('click', ()=>{ next(); reset(); });
	document.querySelector('.rev-prev')?.addEventListener('click', ()=>{ prev(); reset(); });
	window.addEventListener('resize', update);
	update();
})();

// Minimal calendar card: fill with today
(function(){
	const m = document.getElementById('miniCardMonth');
	const d = document.getElementById('miniCardDate');
	const w = document.getElementById('miniCardWeekday');
	if(!m || !d || !w) return;
	const now = new Date();
	m.textContent = now.toLocaleString(undefined, { month:'long' });
	d.textContent = String(now.getDate());
	w.textContent = now.toLocaleString(undefined, { weekday:'long' });
})();

// Minimal testimonials auto-cycle
(function(){
	const host = document.getElementById('autoTestimonials');
	if(!host) return;
	const slides = host.querySelectorAll('.testimonial-slide');
	let i = 0;
	function show(n){
		slides[i].classList.remove('is-active');
		i = (n + slides.length) % slides.length;
		slides[i].classList.add('is-active');
	}
	let timer = setInterval(()=>show(i+1), 5000);
	function reset(){ clearInterval(timer); timer = setInterval(()=>show(i+1), 5000); }
	host.querySelector('.t-prev')?.addEventListener('click', ()=>{ show(i-1); reset(); });
	host.querySelector('.t-next')?.addEventListener('click', ()=>{ show(i+1); reset(); });
})();

// Ensure marquee rows have enough width by duplicating children until >2x viewport width
(function(){
	const tracks = document.querySelectorAll('.js-marquee-track');
	tracks.forEach(track => {
		const container = track.closest('.max-w-full, .w-full') || track.parentElement;
		if(!container) return;
		const containerWidth = container.clientWidth || 0;
		let width = track.scrollWidth;
		if(width < containerWidth * 2){
			const clones = [];
			Array.from(track.children).forEach(node => clones.push(node.cloneNode(true)));
			while(width < containerWidth * 2.2){
				clones.forEach(c => track.appendChild(c.cloneNode(true)));
				width = track.scrollWidth;
			}
		}
	});
})();


if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initApp);
} else {
	initApp();
}


