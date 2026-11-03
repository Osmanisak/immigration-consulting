/* Immigration Consulting – fælles scripts (DA + EN) */
document.documentElement.classList.add('js');

(function(){
  const isEn = document.documentElement.lang === 'en';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Header-skygge ved scroll
  const header = document.querySelector('.site-header');
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});

  // Sprog-klode (toggle)
  const langSwitch = document.getElementById('langSwitch');
  if(langSwitch){
    const btn = langSwitch.querySelector('.lang-btn');
    const open = (o) => { langSwitch.classList.toggle('open', o); btn.setAttribute('aria-expanded', o ? 'true' : 'false'); };
    btn.addEventListener('click', () => open(!langSwitch.classList.contains('open')));
    document.addEventListener('click', e => { if(!langSwitch.contains(e.target)) open(false); });
    document.addEventListener('keydown', e => { if(e.key === 'Escape') open(false); });
  }

  // Mobil drawer
  const drawer = document.getElementById('drawer');
  const backdrop = document.getElementById('backdrop');
  const menuBurger = document.getElementById('menuBurger');
  function toggleDrawer(state){
    if(!drawer) return;
    const open = typeof state === 'boolean' ? state : !drawer.classList.contains('open');
    drawer.classList.toggle('open', open);
    backdrop && backdrop.classList.toggle('show', open);
    if(menuBurger) menuBurger.setAttribute('aria-expanded', open ? 'true' : 'false');
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
    if(open){ const first = drawer.querySelector('a,button'); first && first.focus(); }
    else if(menuBurger && drawer.contains(document.activeElement)){ menuBurger.focus(); }
  }
  window.toggleDrawer = toggleDrawer;
  if(menuBurger) menuBurger.addEventListener('click', () => toggleDrawer());
  if(backdrop) backdrop.addEventListener('click', () => toggleDrawer(false));
  document.querySelectorAll('[data-drawer-close]').forEach(el => el.addEventListener('click', () => toggleDrawer(false)));
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && drawer && drawer.classList.contains('open')) toggleDrawer(false); });

  // Fade-in ved scroll
  const revealEls = document.querySelectorAll('.reveal, .process');
  if('IntersectionObserver' in window && !reduceMotion.matches){
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if(en.isIntersecting){
          en.target.classList.add(en.target.classList.contains('process') ? 'in-view' : 'in');
          io.unobserve(en.target);
        }
      });
    }, {threshold:.15, rootMargin:'0px 0px -40px 0px'});
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in', 'in-view'));
  }

  // Branche-slider med manuel navigation
  document.querySelectorAll('[data-slider]').forEach(root => {
    const track = root.querySelector('.slider');
    const prev = root.querySelector('[data-prev]');
    const next = root.querySelector('[data-next]');
    const bar = root.querySelector('.slider-progress span');
    if(!track) return;
    const step = () => {
      const card = track.querySelector('.industry');
      return card ? card.getBoundingClientRect().width + 20 : track.clientWidth * .8;
    };
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      if(prev) prev.disabled = track.scrollLeft <= 4;
      if(next) next.disabled = track.scrollLeft >= max - 4;
      if(bar){
        const ratio = track.clientWidth / track.scrollWidth;
        bar.style.width = Math.max(ratio * 100, 12) + '%';
        bar.style.transform = 'translateX(' + (max > 0 ? (track.scrollLeft / max) * ((1 / Math.max(ratio, .12)) - 1) * 100 : 0) + '%)';
      }
    };
    const go = dir => track.scrollBy({left: dir * step(), behavior: reduceMotion.matches ? 'auto' : 'smooth'});
    prev && prev.addEventListener('click', () => go(-1));
    next && next.addEventListener('click', () => go(1));
    track.addEventListener('keydown', e => {
      if(e.key === 'ArrowRight'){ e.preventDefault(); go(1); }
      if(e.key === 'ArrowLeft'){ e.preventDefault(); go(-1); }
    });
    track.addEventListener('scroll', update, {passive:true});
    window.addEventListener('resize', update);
    update();
  });

  // Inline Netlify success (ingen redirect)
  function encodeFormData(fd){
    const p = new URLSearchParams();
    for(const [k, v] of fd.entries()) p.append(k, v);
    return p.toString();
  }
  document.addEventListener('submit', async function(e){
    const form = e.target;
    if(!(form instanceof HTMLFormElement)) return;
    if(!form.matches('[data-netlify][data-inline-success]')) return;
    e.preventDefault();

    const successBox = form.querySelector('.form-success');
    const submitBtn = form.querySelector('button[type="submit"]');
    const fd = new FormData(form);
    if(!fd.get('form-name')){
      const fn = form.getAttribute('name');
      if(fn) fd.append('form-name', fn);
    }

    if(submitBtn) submitBtn.disabled = true;
    try{
      const res = await fetch('/', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: encodeFormData(fd)
      });
      if(res.ok){
        form.reset();
        if(successBox){
          successBox.hidden = false;
          successBox.scrollIntoView({behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center'});
        }
      } else {
        alert(isEn ? 'Something went wrong while sending. Please try again in a moment.' : 'Der skete en fejl ved afsendelse. Prøv igen om et øjeblik.');
      }
    } catch(err){
      alert(isEn ? 'The form could not be sent right now. Check your connection and try again.' : 'Kunne ikke sende formularen lige nu. Tjek din forbindelse og prøv igen.');
    } finally {
      if(submitBtn) submitBtn.disabled = false;
    }
  }, {capture: true});
})();
