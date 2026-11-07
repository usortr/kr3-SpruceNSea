/* =========================================================
   Spruce & Sea — модалка оформления группы заказа
   ========================================================= */
window.SS_CHECKOUT_MODAL = (function () {
  'use strict';

  let modalEl = null;
  let bsModal = null;
  let currentGroup = null;

  const fmtPrice = n => Number(n || 0).toLocaleString('ru-RU') + ' ₽';

  function ensureModal() {
    if (modalEl) return;
    modalEl = document.createElement('div');
    modalEl.className = 'modal fade';
    modalEl.id = 'checkoutModal';
    modalEl.tabIndex = -1;
    modalEl.setAttribute('aria-hidden', 'true');
    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content checkout-modal">
          <div class="modal-header">
            <h2 class="modal-title" data-checkout-title>Оформление заказа</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Закрыть"></button>
          </div>
          <div class="modal-body">
            <form class="checkout-modal__form" data-checkout-form novalidate>
              <div class="checkout-modal__fields">
                <label class="checkout-modal__field">
                  <span>Имя и фамилия</span>
                  <input type="text" name="name" autocomplete="name" required>
                </label>
                <label class="checkout-modal__field">
                  <span>Телефон</span>
                  <input type="tel" name="phone" autocomplete="tel" required
                         placeholder="+7 (___) ___-__-__">
                </label>
                <label class="checkout-modal__field">
                  <span>Почта</span>
                  <input type="email" name="email" autocomplete="email" required>
                </label>
              </div>

              <label class="checkout-modal__agree">
                <input type="checkbox" name="agree" required>
                <span>Я согласен с условиями сделки</span>
              </label>

              <div class="checkout-modal__preview" data-checkout-preview></div>
            </form>
          </div>
          <div class="modal-footer">
            <div class="checkout-modal__total">
              <span>Итого</span>
              <strong data-checkout-total>0 ₽</strong>
            </div>
            <button type="button" class="btn btn--primary btn--block checkout-modal__submit"
                    data-checkout-submit disabled>
              Подтвердить
            </button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modalEl);

    if (window.bootstrap && window.bootstrap.Modal) {
      bsModal = window.bootstrap.Modal.getOrCreateInstance(modalEl);
    }

    /* Валидация формы */
    const form = modalEl.querySelector('[data-checkout-form]');
    const submitBtn = modalEl.querySelector('[data-checkout-submit]');
    form.addEventListener('input', () => validate());
    form.addEventListener('change', () => validate());

    function validate() {
      const name = form.name.value.trim();
      const phone = form.phone.value.trim();
      const email = form.email.value.trim();
      const agree = form.agree.checked;
      const ok = name.length >= 2
        && phone.replace(/\D/g, '').length >= 10
        && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        && agree;
      submitBtn.disabled = !ok;
    }

    /* Сабмит */
    submitBtn.addEventListener('click', () => {
      if (submitBtn.disabled) return;
      const form = modalEl.querySelector('[data-checkout-form]');
      const payload = {
        group: currentGroup,
        name: form.name.value.trim(),
        phone: form.phone.value.trim(),
        email: form.email.value.trim(),
        lines: window.SS_CART.listByGroup(currentGroup),
        total: window.SS_CART.sumTotal(window.SS_CART.listByGroup(currentGroup)),
        createdAt: new Date().toISOString(),
      };

      /* TODO: отправка на бэкенд. Пока — console.log */
      console.log('[checkout]', payload);

      /* Очищаем группу, закрываем, показываем toast */
      window.SS_CART.clearGroup(currentGroup);
      bsModal ? bsModal.hide() : (modalEl.style.display = 'none');
      if (window.SS_TOAST) window.SS_TOAST.show('Заказ отправлен');
    });
  }

  function renderPreview(group) {
    const lines = window.SS_CART.listByGroup(group);
    const total = window.SS_CART.sumTotal(lines);

    const totalEl = modalEl.querySelector('[data-checkout-total]');
    if (totalEl) totalEl.textContent = fmtPrice(total);

    const previewEl = modalEl.querySelector('[data-checkout-preview]');
    if (!previewEl) return;

    if (!lines.length) {
      previewEl.innerHTML = `<p class="checkout-modal__empty">В группе пока нет позиций.</p>`;
      return;
    }

    previewEl.innerHTML = `
      <h3 class="checkout-modal__preview-title">Ваш заказ</h3>
      <ul class="checkout-modal__preview-list">
        ${lines.map(i => `
          <li class="checkout-modal__preview-line">
            <span class="checkout-modal__preview-name">
              ${i.title}${i.qty > 1 ? ' × ' + i.qty : ''}
            </span>
            <span class="checkout-modal__preview-price">${fmtPrice(i.total)}</span>
          </li>`).join('')}
      </ul>`;
  }

  function open(group) {
    if (!window.SS_CART) return;
    const lines = window.SS_CART.listByGroup(group);
    if (!lines.length) return;

    ensureModal();
    currentGroup = group;

    /* Заголовок */
    const titleEl = modalEl.querySelector('[data-checkout-title]');
    if (titleEl) {
      titleEl.textContent = group === 'restaurant'
        ? 'Оформление заказа из ресторана'
        : 'Оформление заказа';
    }

    /* Сброс формы */
    const form = modalEl.querySelector('[data-checkout-form]');
    form.reset();
    const submitBtn = modalEl.querySelector('[data-checkout-submit]');
    if (submitBtn) submitBtn.disabled = true;

    renderPreview(group);

    if (bsModal) bsModal.show();
    else modalEl.style.display = 'block';
  }

  return { open };
})();