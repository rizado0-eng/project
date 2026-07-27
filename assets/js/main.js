(function(){
"use strict";

var root = document.documentElement;
var themeToggle = document.getElementById('themeToggle');
var savedTheme = localStorage.getItem('theme');
if (savedTheme) root.setAttribute('data-theme', savedTheme);
if (themeToggle){
  themeToggle.addEventListener('click', function(){
    var current = root.getAttribute('data-theme');
    var isDark = current ? current === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var next = isDark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

var header = document.getElementById('siteHeader');
var progress = document.getElementById('scrollProgress');
var backToTop = document.getElementById('backToTop');
function onScroll(){
  var y = window.scrollY || document.documentElement.scrollTop;
  if (header) header.classList.toggle('is-scrolled', y > 40);
  if (backToTop) backToTop.classList.toggle('show', y > 500);
  if (progress){
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  }
}
document.addEventListener('scroll', onScroll, { passive:true });
onScroll();
if (backToTop) backToTop.addEventListener('click', function(){ window.scrollTo({ top:0, behavior:'smooth' }); });

var menuToggle = document.getElementById('menuToggle');
var menuClose = document.getElementById('menuClose');
var navMobile = document.getElementById('navMobile');
if (menuToggle && navMobile){
  function openMenu(){ navMobile.classList.add('is-open'); document.body.style.overflow='hidden'; }
  function closeMenu(){ navMobile.classList.remove('is-open'); document.body.style.overflow=''; }
  menuToggle.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  navMobile.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMenu); });
}

var revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window){
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting){ entry.target.classList.add('in'); io.unobserve(entry.target); }
    });
  }, { threshold:0.12 });
  revealEls.forEach(function(el){ io.observe(el); });
} else {
  revealEls.forEach(function(el){ el.classList.add('in'); });
}

document.querySelectorAll('.faq-item').forEach(function(item){
  var q = item.querySelector('.faq-q');
  var a = item.querySelector('.faq-a');
  q.addEventListener('click', function(){
    var isOpen = item.getAttribute('data-open') === 'true';
    item.parentElement.querySelectorAll('.faq-item').forEach(function(other){
      other.setAttribute('data-open', 'false');
      other.querySelector('.faq-a').style.maxHeight = null;
    });
    if (!isOpen){
      item.setAttribute('data-open', 'true');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

document.querySelectorAll('.news-card').forEach(function(card){
  var btn = card.querySelector('.read-more');
  if (!btn) return;
  btn.addEventListener('click', function(){
    var isOpen = card.getAttribute('data-open') === 'true';
    card.setAttribute('data-open', isOpen ? 'false' : 'true');
    btn.querySelector('.label').textContent = isOpen ? 'Читать статью' : 'Свернуть';
  });
});

/* Consultation / lead forms (multi-step optional) */
document.querySelectorAll('form[data-lead-form]').forEach(function(form){
  var phoneInput = form.querySelector('input[type="tel"]');
  if (phoneInput){
    phoneInput.addEventListener('input', function(){
      var digits = phoneInput.value.replace(/\D/g, '').replace(/^7|^8/, '');
      var parts = ['+7'];
      if (digits.length > 0) parts.push(' (' + digits.substring(0,3));
      if (digits.length >= 3) parts[parts.length-1] += ')';
      if (digits.length > 3) parts.push(' ' + digits.substring(3,6));
      if (digits.length > 6) parts.push('-' + digits.substring(6,8));
      if (digits.length > 8) parts.push('-' + digits.substring(8,10));
      phoneInput.value = parts.join('');
    });
  }

  function setFieldError(input, hasError){
    var row = input.closest('.form-row');
    if (!row) return;
    row.classList.toggle('has-error', hasError);
    input.classList.toggle('invalid', hasError);
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var nameInput = form.querySelector('input[name="name"]');
    var phone = form.querySelector('input[type="tel"]');
    var consent = form.querySelector('input[type="checkbox"]');
    var valid = true;

    if (nameInput){
      var nameValid = nameInput.value.trim().length >= 2;
      setFieldError(nameInput, !nameValid);
      valid = valid && nameValid;
    }
    if (phone){
      var phoneValid = phone.value.replace(/\D/g,'').length >= 10;
      setFieldError(phone, !phoneValid);
      valid = valid && phoneValid;
    }
    if (consent){
      var consentErr = form.querySelector('.consent-err');
      var consentValid = consent.checked;
      if (consentErr) consentErr.style.display = consentValid ? 'none' : 'block';
      valid = valid && consentValid;
    }
    if (!valid) return;

    /* No backend wired up yet: replace with a real API call, e.g.
       fetch('/api/lead', { method:'POST', body: new FormData(form) }) */
    console.log('Lead submitted (demo, not sent anywhere yet):', Object.fromEntries(new FormData(form)));

    var successEl = form.parentElement.querySelector('.form-success');
    form.style.display = 'none';
    if (successEl) successEl.style.display = 'block';
  });
});

/* Fraud warning banner */
var fraudBanner = document.getElementById('fraudBanner');
if (fraudBanner){
  if (!sessionStorage.getItem('fraudBannerDismissed')){
    setTimeout(function(){ fraudBanner.classList.add('show'); }, 1000);
  }
  fraudBanner.querySelectorAll('[data-dismiss-fraud]').forEach(function(btn){
    btn.addEventListener('click', function(){
      fraudBanner.classList.remove('show');
      sessionStorage.setItem('fraudBannerDismissed', '1');
    });
  });
}

var yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
