(function(){
"use strict";

/* Theme toggle */
var root = document.documentElement;
var themeToggle = document.getElementById('themeToggle');
var savedTheme = localStorage.getItem('theme');
if (savedTheme) root.setAttribute('data-theme', savedTheme);
themeToggle.addEventListener('click', function(){
  var current = root.getAttribute('data-theme');
  var isDark = current ? current === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  var next = isDark ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

/* Header scroll state + scroll progress */
var header = document.getElementById('siteHeader');
var progress = document.getElementById('scrollProgress');
var backToTop = document.getElementById('backToTop');
function onScroll(){
  var y = window.scrollY || document.documentElement.scrollTop;
  header.classList.toggle('is-scrolled', y > 40);
  backToTop.classList.toggle('show', y > 500);
  var h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
}
document.addEventListener('scroll', onScroll, { passive:true });
onScroll();
backToTop.addEventListener('click', function(){ window.scrollTo({ top:0, behavior:'smooth' }); });

/* Mobile nav */
var menuToggle = document.getElementById('menuToggle');
var menuClose = document.getElementById('menuClose');
var navMobile = document.getElementById('navMobile');
function openMenu(){ navMobile.classList.add('is-open'); document.body.style.overflow='hidden'; }
function closeMenu(){ navMobile.classList.remove('is-open'); document.body.style.overflow=''; }
menuToggle.addEventListener('click', openMenu);
menuClose.addEventListener('click', closeMenu);
navMobile.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMenu); });

/* Reveal on scroll */
var revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window){
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting){ entry.target.classList.add('in'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(function(el){ io.observe(el); });
} else {
  revealEls.forEach(function(el){ el.classList.add('in'); });
}

/* Animated stat counters */
var statEls = document.querySelectorAll('.stat-card .num');
function animateCount(el){
  var target = parseFloat(el.getAttribute('data-count'));
  var suffix = el.getAttribute('data-suffix') || '';
  var duration = 1400;
  var start = null;
  function step(ts){
    if (!start) start = ts;
    var progressRatio = Math.min((ts - start) / duration, 1);
    var eased = 1 - Math.pow(1 - progressRatio, 3);
    var value = Math.round(target * eased);
    el.textContent = value.toLocaleString('ru-RU') + suffix;
    if (progressRatio < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
if ('IntersectionObserver' in window && statEls.length){
  var statIo = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting){ animateCount(entry.target); statIo.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });
  statEls.forEach(function(el){ statIo.observe(el); });
}

/* Loan calculator */
var calcSum = document.getElementById('calcSum');
var calcTerm = document.getElementById('calcTerm');
var calcRate = document.getElementById('calcRate');
var calcSumOut = document.getElementById('calcSumOut');
var calcTermOut = document.getElementById('calcTermOut');
var calcRateOut = document.getElementById('calcRateOut');
var calcMonthly = document.getElementById('calcMonthly');
var calcOutSum = document.getElementById('calcOutSum');
var calcOverpay = document.getElementById('calcOverpay');
var calcTotal = document.getElementById('calcTotal');
var calcBarFill = document.getElementById('calcBarFill');
var calcTypeButtons = document.querySelectorAll('.calc-type-toggle button');

function formatRub(value){
  return Math.round(value).toLocaleString('ru-RU') + ' ₽';
}
function formatMonths(m){
  if (m % 12 === 0 && m >= 12) return (m/12) + ' ' + pluralYears(m/12);
  return m + ' мес.';
}
function pluralYears(n){
  var mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'год';
  if ([2,3,4].indexOf(mod10) !== -1 && [12,13,14].indexOf(mod100) === -1) return 'года';
  return 'лет';
}

function recalc(){
  var P = parseFloat(calcSum.value);
  var n = parseInt(calcTerm.value, 10);
  var annualRate = parseFloat(calcRate.value);
  var monthlyRate = annualRate / 100 / 12;

  var monthlyPayment;
  if (monthlyRate === 0){
    monthlyPayment = P / n;
  } else {
    var factor = Math.pow(1 + monthlyRate, n);
    monthlyPayment = P * (monthlyRate * factor) / (factor - 1);
  }
  var total = monthlyPayment * n;
  var overpay = Math.max(total - P, 0);

  calcSumOut.textContent = formatRub(P);
  calcTermOut.textContent = formatMonths(n);
  calcRateOut.textContent = annualRate.toFixed(1).replace('.', ',') + '%';
  calcMonthly.textContent = formatRub(monthlyPayment);
  calcOutSum.textContent = formatRub(P);
  calcOverpay.textContent = formatRub(overpay);
  calcTotal.textContent = formatRub(total);

  var principalShare = total > 0 ? Math.min(Math.max((P / total) * 100, 4), 100) : 100;
  calcBarFill.style.width = principalShare + '%';
}

[calcSum, calcTerm, calcRate].forEach(function(input){
  input.addEventListener('input', recalc);
});
calcTypeButtons.forEach(function(btn){
  btn.addEventListener('click', function(){
    calcTypeButtons.forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    calcRate.value = btn.getAttribute('data-rate');
    recalc();
  });
});
recalc();

/* FAQ accordion */
document.querySelectorAll('.faq-item').forEach(function(item){
  var q = item.querySelector('.faq-q');
  var a = item.querySelector('.faq-a');
  q.addEventListener('click', function(){
    var isOpen = item.getAttribute('data-open') === 'true';
    document.querySelectorAll('.faq-item').forEach(function(other){
      other.setAttribute('data-open', 'false');
      other.querySelector('.faq-a').style.maxHeight = null;
    });
    if (!isOpen){
      item.setAttribute('data-open', 'true');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

/* Testimonials slider */
var testiTrack = document.getElementById('testiTrack');
var testiPrev = document.getElementById('testiPrev');
var testiNext = document.getElementById('testiNext');
var testiIndex = 0;
function testiVisibleCount(){
  var w = window.innerWidth;
  if (w <= 640) return 1;
  if (w <= 960) return 2;
  return 3;
}
function testiMaxIndex(){
  var total = testiTrack.children.length;
  return Math.max(total - testiVisibleCount(), 0);
}
function updateTesti(){
  var cardWidth = testiTrack.children[0].getBoundingClientRect().width;
  var gap = 24;
  testiTrack.style.transform = 'translateX(-' + (testiIndex * (cardWidth + gap)) + 'px)';
}
testiNext.addEventListener('click', function(){
  testiIndex = Math.min(testiIndex + 1, testiMaxIndex());
  updateTesti();
});
testiPrev.addEventListener('click', function(){
  testiIndex = Math.max(testiIndex - 1, 0);
  updateTesti();
});
window.addEventListener('resize', function(){
  testiIndex = Math.min(testiIndex, testiMaxIndex());
  updateTesti();
});

/* Multi-step application form */
var applyForm = document.getElementById('applyForm');
var formSteps = applyForm.querySelectorAll('.form-step');
var progressDots = document.querySelectorAll('.apply-progress .dot');
var formSuccess = document.getElementById('formSuccess');
var currentStep = 1;

function showStep(step){
  formSteps.forEach(function(s){ s.classList.toggle('active', parseInt(s.getAttribute('data-step'),10) === step); });
  progressDots.forEach(function(d){ d.classList.toggle('active', parseInt(d.getAttribute('data-step'),10) <= step); });
  currentStep = step;
}

var serviceChips = document.querySelectorAll('#serviceChips .chip');
var selectedService = serviceChips[0].getAttribute('data-value');
serviceChips.forEach(function(chip){
  chip.addEventListener('click', function(){
    serviceChips.forEach(function(c){ c.classList.remove('active'); });
    chip.classList.add('active');
    selectedService = chip.getAttribute('data-value');
  });
});

function setFieldError(input, hasError){
  var row = input.closest('.form-row');
  row.classList.toggle('has-error', hasError);
  input.classList.toggle('invalid', hasError);
}

function validateStep1(){
  var sumInput = document.getElementById('applySum');
  var valid = sumInput.value.trim().length > 0;
  setFieldError(sumInput, !valid);
  return valid;
}
function validateStep2(){
  var nameInput = document.getElementById('applyName');
  var phoneInput = document.getElementById('applyPhone');
  var nameValid = nameInput.value.trim().length >= 2;
  var phoneDigits = phoneInput.value.replace(/\D/g, '');
  var phoneValid = phoneDigits.length >= 10;
  setFieldError(nameInput, !nameValid);
  setFieldError(phoneInput, !phoneValid);
  return nameValid && phoneValid;
}

applyForm.querySelectorAll('[data-next]').forEach(function(btn){
  btn.addEventListener('click', function(){
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    showStep(Math.min(currentStep + 1, 3));
  });
});
applyForm.querySelectorAll('[data-back]').forEach(function(btn){
  btn.addEventListener('click', function(){ showStep(Math.max(currentStep - 1, 1)); });
});

var phoneInputEl = document.getElementById('applyPhone');
phoneInputEl.addEventListener('input', function(){
  var digits = phoneInputEl.value.replace(/\D/g, '').replace(/^7|^8/, '');
  var parts = ['+7'];
  if (digits.length > 0) parts.push(' (' + digits.substring(0,3));
  if (digits.length >= 3) parts[parts.length-1] += ')';
  if (digits.length > 3) parts.push(' ' + digits.substring(3,6));
  if (digits.length > 6) parts.push('-' + digits.substring(6,8));
  if (digits.length > 8) parts.push('-' + digits.substring(8,10));
  phoneInputEl.value = parts.join('');
});

applyForm.addEventListener('submit', function(e){
  e.preventDefault();
  var consent = document.getElementById('applyConsent');
  var consentErr = document.getElementById('consentErr');
  if (!consent.checked){
    consentErr.style.display = 'block';
    return;
  }
  consentErr.style.display = 'none';

  /* No backend wired up yet: replace this block with a real API call
     (fetch('/api/lead', { method:'POST', body: JSON.stringify(payload) })) */
  var payload = {
    service: selectedService,
    amount: document.getElementById('applySum').value,
    name: document.getElementById('applyName').value,
    phone: document.getElementById('applyPhone').value,
    city: document.getElementById('applyCity').value
  };
  console.log('Lead submitted (demo, not sent anywhere yet):', payload);

  applyForm.style.display = 'none';
  document.querySelector('.apply-progress').style.display = 'none';
  formSuccess.style.display = 'block';
});

/* Cookie consent */
var cookieBanner = document.getElementById('cookieBanner');
var cookieAccept = document.getElementById('cookieAccept');
var cookieDecline = document.getElementById('cookieDecline');
if (!localStorage.getItem('cookieConsent')){
  setTimeout(function(){ cookieBanner.classList.add('show'); }, 1200);
}
function dismissCookie(value){
  localStorage.setItem('cookieConsent', value);
  cookieBanner.classList.remove('show');
}
cookieAccept.addEventListener('click', function(){ dismissCookie('accepted'); });
cookieDecline.addEventListener('click', function(){ dismissCookie('declined'); });

/* Footer year */
document.getElementById('year').textContent = new Date().getFullYear();

})();
