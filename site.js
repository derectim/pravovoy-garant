(() => {
  document.documentElement.classList.add('has-js');
  const menu = document.querySelector('#site-menu');
  let menuOpener;
  const dialog = document.querySelector('#consult-dialog');
  const form = document.querySelector('#consult-form');
  const service = form.elements.service;
  const status = document.querySelector('#form-status');

  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  if (typeof menu.showModal === 'function') {
    for (const opener of document.querySelectorAll('[data-menu]')) {
      opener.setAttribute('aria-haspopup','dialog');
      opener.setAttribute('aria-controls',menu.id);
      opener.addEventListener('click', event => {
        event.preventDefault();
        menuOpener = opener;
        menu.showModal();
      });
    }
  }
  menu.querySelector('[data-dismiss-menu]').addEventListener('click', () => menu.close());
  menu.addEventListener('click', event => {
    if (event.target === menu) menu.close();
    const link = event.target.closest('a[href^="#"]');
    if (link && !link.hasAttribute('data-consult')) {
      menu.close();
      requestAnimationFrame(() => {
        const dest = document.getElementById(link.hash.slice(1));
        if (!dest) return;
        const target = dest.matches('details') ? dest.querySelector('summary') : dest;
        if (!target.hasAttribute('tabindex') && !target.matches('summary')) target.tabIndex = -1;
        target.focus({preventScroll:true});
      });
    }
  });
  document.addEventListener('click', event => {
    const materialLink = event.target.closest('a[href="#analysis"], a[href="#service-directory"]');
    if (materialLink && !event.defaultPrevented && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      openMaterial(materialLink.hash);
    }
    const consult = event.target.closest('[data-consult]');
    if (consult && typeof dialog.showModal === 'function') {
      event.preventDefault();
      const restoreFocus = menu.open ? menuOpener : consult;
      if (menu.open) menu.close();
      if (consult.dataset.consult) service.value = consult.dataset.consult;
      status.textContent = '';
      dialog.showModal();
      dialog.addEventListener('close', () => restoreFocus.focus({preventScroll:true}), {once:true});
      return;
    }
  });
  dialog.querySelector('.dismiss').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  form.elements.situation.addEventListener('input', () => form.elements.situation.setCustomValidity(''));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const situation = form.elements.situation.value.trim();
    if (!situation) {
      form.elements.situation.setCustomValidity('Опишите вопрос, чтобы сохранить обращение.');
      form.elements.situation.reportValidity();
      return;
    }
    const name = form.elements.client.value.trim();
    const lines = ['Правовой Гарант', 'Обращение для консультации', '', 'Дата: ' + new Intl.DateTimeFormat('ru-RU').format(new Date())];
    if (name) lines.push('Имя: ' + name);
    lines.push('Направление: ' + (service.value || 'Нужно определить'), '', 'Суть вопроса', situation);
    const url = URL.createObjectURL(new Blob(['\uFEFF' + lines.join('\r\n')], {type:'text/plain;charset=utf-8'}));
    const link = el('a');
    link.href = url;
    link.download = 'Правовой Гарант — обращение.txt';
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 15000);
    status.textContent = 'Текст готов. Файл обращения можно найти в загрузках браузера.';
  });
  function openMaterial(hash) {
    const material = document.getElementById(hash.slice(1));
    const details = material?.closest('details');
    if (details) details.open = true;
  }
  openMaterial(location.hash);
  window.addEventListener('hashchange', () => openMaterial(location.hash));
  const requested = new URLSearchParams(location.search).get('service');
  const requestedOption = [...service.options].find(option => option.dataset.slug === requested);
  if (requestedOption) {
    service.value = requestedOption.value;
    if (location.hash === '#brief' && typeof dialog.showModal === 'function') {
      document.querySelector('#brief [data-consult]').click();
    }
  }

  const navItems = [...document.querySelectorAll('.dock a')];
  function markSection() {
    const offset = innerHeight * .4;
    const sections = [...document.querySelectorAll('main > section')];
    const section = sections.reverse().find(node => node.getBoundingClientRect().top <= offset);
    const key = {navigator:'practices',casework:'approach',region:'approach'}[section?.id] || section?.id;
    for (const link of navItems) {
      if (link.hash === '#' + key) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    }
  }
  const observer = new IntersectionObserver(markSection, { rootMargin: '0px 0px -60% 0px' });
  document.querySelectorAll('main > section').forEach(section => observer.observe(section));
  markSection();
})();
