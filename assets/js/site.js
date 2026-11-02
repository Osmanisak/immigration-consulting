/* Immigration Consulting – fælles script (mobilmenu, årstal, inline formularstatus).
   Alt indhold er synligt uden JavaScript; dette script tilføjer kun adfærd. */
(function () {
  var lang = (document.documentElement.lang || 'da').slice(0, 2);

  /* ---------- Mobilmenu ---------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = toggle && document.getElementById(toggle.getAttribute('aria-controls'));

  if (toggle && nav) {
    var header = toggle.closest('header');
    var isOpen = function () { return toggle.getAttribute('aria-expanded') === 'true'; };

    var setOpen = function (open, returnFocus) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', toggle.getAttribute(open ? 'data-label-close' : 'data-label-open'));
      nav.classList.toggle('is-open', open);
      if (!open && returnFocus) toggle.focus();
    };

    toggle.addEventListener('click', function () { setOpen(!isOpen()); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) setOpen(false, true);
    });

    document.addEventListener('click', function (e) {
      if (isOpen() && !header.contains(e.target)) setOpen(false);
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    // Luk, når fokus forlader headeren med tastaturet
    header.addEventListener('focusout', function (e) {
      if (isOpen() && e.relatedTarget && !header.contains(e.relatedTarget)) setOpen(false);
    });

    var desktop = window.matchMedia('(min-width: 60em)');
    var onChange = function (e) { if (e.matches) setOpen(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* ---------- Årstal i footer ---------- */
  var year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = year; });

  /* ---------- Inline Netlify-formularer (ingen redirect) ---------- */
  var messages = {
    da: {
      failed: 'Der skete en fejl ved afsendelse. Prøv igen om et øjeblik.',
      offline: 'Kunne ikke sende formularen lige nu. Tjek din forbindelse og prøv igen.'
    },
    en: {
      failed: 'There was an error sending the form. Please try again in a moment.',
      offline: 'Could not send the form right now. Check your connection and try again.'
    }
  };
  var text = messages[lang] || messages.da;

  function encodeFormData(fd) {
    var p = new URLSearchParams();
    fd.forEach(function (v, k) { p.append(k, v); });
    return p.toString();
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (!form.matches('[data-netlify][data-inline-success]')) return;
    e.preventDefault();

    var successBox = form.querySelector('.form-success');
    var errorBox = form.querySelector('.form-error');
    var submitBtn = form.querySelector('button[type="submit"]');

    var showError = function (msg) {
      if (errorBox) {
        errorBox.querySelector('[data-error-text]').textContent = msg;
        errorBox.hidden = false;
        errorBox.focus();
      } else {
        alert(msg);
      }
    };

    var fd = new FormData(form);
    if (!fd.get('form-name')) {
      var fn = form.getAttribute('name');
      if (fn) fd.append('form-name', fn);
    }

    if (successBox) successBox.hidden = true;
    if (errorBox) errorBox.hidden = true;
    if (submitBtn) submitBtn.disabled = true;
    form.setAttribute('aria-busy', 'true');

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodeFormData(fd)
    }).then(function (res) {
      if (res.ok) {
        form.reset();
        if (successBox) {
          successBox.hidden = false;
          successBox.focus();
        }
      } else {
        showError(text.failed);
      }
    }).catch(function () {
      showError(text.offline);
    }).finally(function () {
      if (submitBtn) submitBtn.disabled = false;
      form.removeAttribute('aria-busy');
    });
  }, { capture: true });
})();
