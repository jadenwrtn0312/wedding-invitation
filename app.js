(function() {
  'use strict';

  // Fade-in
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.15 });
  document.querySelectorAll('.fade-in').forEach(function(el) { obs.observe(el); });

  // Calendar - June 2026 starts Monday
  var grid = document.getElementById('calGrid');
  if (grid) {
    var firstDay = 1;
    for (var i = 0; i < firstDay; i++) {
      var emp = document.createElement('span');
      emp.className = 'cal-day empty';
      grid.appendChild(emp);
    }
    for (var d = 1; d <= 30; d++) {
      var cell = document.createElement('span');
      cell.className = 'cal-day';
      cell.textContent = d;
      if ((firstDay + d - 1) % 7 === 0) cell.classList.add('sun');
      if (d === 13) cell.classList.add('highlight');
      grid.appendChild(cell);
    }
  }

  // D-day
  var ddayEl = document.getElementById('dday');
  if (ddayEl) {
    var wedding = new Date(2026, 5, 13);
    var today = new Date(); today.setHours(0,0,0,0);
    var diff = Math.ceil((wedding - today) / 86400000);
    ddayEl.textContent = diff > 0 ? 'D-' + diff : diff === 0 ? 'D-Day' : 'D+' + Math.abs(diff);
  }

  // ICS
  var icsBtn = document.getElementById('icsBtn'); if (icsBtn) icsBtn.addEventListener('click', function() {
    var ics = ['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT',
      'DTSTART:20260613T020000Z','DTEND:20260613T040000Z',
      'SUMMARY:제성원 ♥ 곽미림 결혼식',
      'LOCATION:더채플앳대치 서울 강남구 영동대로 318',
      'END:VEVENT','END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], {type:'text/calendar'}));
    a.download = 'wedding.ics'; a.click();
  });

  // Gallery lightbox
  var lightbox = document.getElementById('lightbox');
  var lbImg = lightbox.querySelector('.lb-img-wrap img');
  var lbCounter = lightbox.querySelector('.lb-counter');
  var images = [];
  var idx = 0;

  document.querySelectorAll('.gallery-item img').forEach(function(img) { images.push(img.src); });

  document.querySelectorAll('.gallery-item').forEach(function(slide, i) {
    slide.addEventListener('click', function() { openLB(i); });
  });

  function openLB(i) { idx = i; updateLB(); lightbox.classList.add('active'); document.body.classList.add('lightbox-open'); }
  function closeLB() { lightbox.classList.remove('active'); document.body.classList.remove('lightbox-open'); }
  function updateLB() { lbImg.src = images[idx]; lbCounter.textContent = (idx+1) + ' / ' + images.length; }

  lightbox.querySelector('.lb-close').addEventListener('click', closeLB);
  lightbox.querySelector('.lb-prev').addEventListener('click', function() { idx = (idx - 1 + images.length) % images.length; updateLB(); });
  lightbox.querySelector('.lb-next').addEventListener('click', function() { idx = (idx + 1) % images.length; updateLB(); });
  lightbox.addEventListener('click', function(e) { if (e.target === lightbox) closeLB(); });
  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft') { idx = (idx - 1 + images.length) % images.length; updateLB(); }
    if (e.key === 'ArrowRight') { idx = (idx + 1) % images.length; updateLB(); }
  });

  // Swipe
  var sx = 0;
  lightbox.addEventListener('touchstart', function(e) { sx = e.touches[0].clientX; });
  lightbox.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) { idx = dx < 0 ? (idx+1)%images.length : (idx-1+images.length)%images.length; updateLB(); }
  });

  // Scroll arrow
  document.querySelector('.scroll-arrow').addEventListener('click', function() {
    document.querySelector('.invite').scrollIntoView({ behavior:'smooth' });
  });

  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var num = btn.getAttribute('data-copy');
      navigator.clipboard.writeText(num).then(function() {
        btn.textContent = '복사됨';
        btn.classList.add('copied');
        setTimeout(function() { btn.textContent = '복사'; btn.classList.remove('copied'); }, 2000);
      });
    });
  });
})();
