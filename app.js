(() => {
  'use strict';
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const text = (value) => String(value ?? '').trim();
  const gallery = (Array.isArray(window.INSIDE_GALLERY) ? window.INSIDE_GALLERY : []).filter((item) => item && item.type !== 'logo' && typeof item.src === 'string' && typeof item.title === 'string');
  const typeNames = { tables: 'Столы', projects: 'Мебельные проекты', video: 'Видео' };
  const state = { filter: 'all', shown: 8, lastFocus: null };
  const galleryGrid = $('[data-gallery-grid]');
  const galleryCount = $('[data-gallery-count]');
  const moreButton = $('[data-gallery-more]');
  const lightbox = $('[data-lightbox]');
  const lightboxImage = $('[data-lightbox-image]');
  const lightboxCaption = $('[data-lightbox-caption]');
  const visibleItems = () => state.filter === 'all' ? gallery : gallery.filter((item) => item.type === state.filter);
  const setStatus = (element, message, isError = false) => {
    if (!element) return;
    element.textContent = message;
    element.classList.toggle('is-error', isError);
  };
  function renderGallery() {
    if (!galleryGrid || !galleryCount || !moreButton) return;
    const all = visibleItems();
    const visible = all.slice(0, state.shown);
    galleryGrid.replaceChildren(...visible.map((item) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'gallery-item';
      button.dataset.galleryIndex = String(gallery.indexOf(item));
      button.setAttribute('aria-label', `Открыть: ${item.title}`);
      const image = document.createElement('img');
      image.src = item.src; image.alt = item.title; image.loading = 'lazy';
      const tag = document.createElement('span');
      tag.className = 'gallery-item__tag'; tag.textContent = typeNames[item.type] || 'Материал';
      button.append(image, tag);
      return button;
    }));
    galleryCount.textContent = `${visible.length} из ${all.length} материалов`;
    moreButton.hidden = visible.length >= all.length;
  }
  function openLightbox(item, trigger) {
    if (!item || !lightboxImage || !lightboxCaption || typeof lightbox?.showModal !== 'function') return;
    state.lastFocus = trigger; lightboxImage.src = item.src; lightboxImage.alt = item.title; lightboxCaption.textContent = item.title; lightbox.showModal();
  }
  $$('.filter-tab').forEach((button) => button.addEventListener('click', () => {
    state.filter = button.dataset.filter || 'all'; state.shown = 8;
    $$('.filter-tab').forEach((tab) => { const selected = tab === button; tab.classList.toggle('is-active', selected); tab.setAttribute('aria-selected', String(selected)); });
    renderGallery();
  }));
  moreButton?.addEventListener('click', () => { state.shown += 8; renderGallery(); });
  galleryGrid?.addEventListener('click', (event) => { const trigger = event.target.closest('[data-gallery-index]'); openLightbox(trigger ? gallery[Number(trigger.dataset.galleryIndex)] : null, trigger); });
  $('[data-lightbox-close]')?.addEventListener('click', () => lightbox?.close());
  lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });
  lightbox?.addEventListener('close', () => state.lastFocus?.focus());
  const menuToggle = $('.menu-toggle');
  const mobileNav = $('#mobile-nav');
  const closeMenu = () => { mobileNav?.classList.remove('is-open'); menuToggle?.setAttribute('aria-expanded', 'false'); };
  menuToggle?.addEventListener('click', () => { if (!mobileNav) return; const open = mobileNav.classList.toggle('is-open'); menuToggle.setAttribute('aria-expanded', String(open)); });
  $$('.mobile-nav a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  const reviews = [
    { name: 'Сергей', date: '16 сентября 2026', text: 'Вежливый. Быстрая сделка.' },
    { name: 'Юлия', date: '12 сентября 2026', text: 'Быстрая сделка.' },
    { name: 'Анастасия', date: '8 сентября 2026', text: 'Всё аккуратно, результатом довольна.' },
    { name: 'Алексей', date: '3 сентября 2026', text: 'Быстро согласовали и установили.' },
    { name: 'Марина', date: '28 августа 2026', text: 'Подсказали с материалами и сделали аккуратно.' },
    { name: 'Дмитрий', date: '23 августа 2026', text: 'Хорошее качество и понятная коммуникация.' },
    { name: 'Ольга', date: '18 августа 2026', text: 'Учли размеры и пожелания, спасибо.' },
    { name: 'Владислав', date: '11 августа 2026', text: 'Всё в срок, мебель отлично вписалась.' }
  ];
  const reviewList = $('[data-review-list]');
  if (reviewList) reviewList.replaceChildren(...reviews.map((review) => {
    const card = document.createElement('article'); card.className = 'review-card';
    const top = document.createElement('div'); top.className = 'review-card__top';
    const avatar = document.createElement('span'); avatar.className = 'review-card__avatar'; avatar.setAttribute('aria-hidden', 'true'); avatar.textContent = review.name.slice(0, 1);
    const author = document.createElement('div'); author.className = 'review-card__author';
    const name = document.createElement('strong'); name.textContent = review.name;
    const date = document.createElement('small'); date.textContent = review.date;
    const stars = document.createElement('div'); stars.className = 'stars'; stars.setAttribute('aria-label', 'Оценка: 5 из 5'); stars.textContent = '★★★★★';
    const quote = document.createElement('p'); quote.textContent = `«${review.text}»`;
    author.append(name, date); top.append(avatar, author); card.append(top, stars, quote);
    return card;
  }));
  $('[data-review-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    setStatus($('[data-review-note]'), 'Приём отзывов будет доступен после подключения модерации.');
  });
  $('[data-contact-form]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget; const note = $('[data-contact-note]'); const submit = form.querySelector('[type="submit"]');
    const fields = Object.fromEntries(new FormData(form).entries());
    if (!text(fields.name) || !text(fields.contact)) return setStatus(note, 'Укажите имя и удобный способ связи.', true);
    submit.disabled = true; submit.setAttribute('aria-busy', 'true'); setStatus(note, 'Отправляем заявку…');
    try {
      const response = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(fields) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || 'Не удалось отправить заявку.');
      form.reset(); setStatus(note, 'Заявка отправлена. Менеджер свяжется с вами по указанному контакту.');
    } catch (error) { setStatus(note, error.message || 'Сервис временно недоступен. Попробуйте ещё раз.', true); }
    finally { submit.disabled = false; submit.removeAttribute('aria-busy'); }
  });
  renderGallery();
})();
