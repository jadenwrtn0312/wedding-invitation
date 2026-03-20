/* ============================================
   Korean Premium Wedding Invitation
   Application Logic
   ============================================ */

(function () {
  'use strict';

  /* ---------- Fade-in on scroll (IntersectionObserver) ---------- */
  function initScrollAnimations() {
    const els = document.querySelectorAll('.fade-in');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Lightbox ---------- */
  var lightbox = {
    el: null,
    img: null,
    counter: null,
    images: [],
    current: 0,
    touchStartX: 0,
    touchEndX: 0,

    init: function () {
      this.el = document.getElementById('lightbox');
      this.img = this.el.querySelector('.lightbox-image-wrapper img');
      this.counter = this.el.querySelector('.lightbox-counter');

      var items = document.querySelectorAll('.gallery-item');
      var self = this;

      items.forEach(function (item, i) {
        self.images.push(item.querySelector('img').src);
        item.addEventListener('click', function () {
          self.open(i);
        });
      });

      // Navigation
      this.el.querySelector('.lightbox-close').addEventListener('click', function () { self.close(); });
      this.el.querySelector('.lightbox-prev').addEventListener('click', function () { self.prev(); });
      this.el.querySelector('.lightbox-next').addEventListener('click', function () { self.next(); });

      // Close on backdrop click
      this.el.addEventListener('click', function (e) {
        if (e.target === self.el) self.close();
      });

      // Keyboard nav
      document.addEventListener('keydown', function (e) {
        if (!self.el.classList.contains('active')) return;
        if (e.key === 'Escape') self.close();
        if (e.key === 'ArrowLeft') self.prev();
        if (e.key === 'ArrowRight') self.next();
      });

      // Touch swipe
      this.el.addEventListener('touchstart', function (e) {
        self.touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      this.el.addEventListener('touchend', function (e) {
        self.touchEndX = e.changedTouches[0].screenX;
        self.handleSwipe();
      }, { passive: true });
    },

    open: function (index) {
      this.current = index;
      this.update();
      this.el.classList.add('active');
      document.body.classList.add('lightbox-open');
    },

    close: function () {
      this.el.classList.remove('active');
      document.body.classList.remove('lightbox-open');
    },

    prev: function () {
      this.current = (this.current - 1 + this.images.length) % this.images.length;
      this.update();
    },

    next: function () {
      this.current = (this.current + 1) % this.images.length;
      this.update();
    },

    update: function () {
      this.img.style.opacity = '0';
      var self = this;
      setTimeout(function () {
        self.img.src = self.images[self.current];
        self.img.style.opacity = '1';
        self.counter.textContent = (self.current + 1) + ' / ' + self.images.length;
      }, 150);
    },

    handleSwipe: function () {
      var diff = this.touchStartX - this.touchEndX;
      if (Math.abs(diff) < 50) return;
      if (diff > 0) this.next();
      else this.prev();
    }
  };

  /* ---------- Calendar ---------- */
  function buildCalendar() {
    var grid = document.getElementById('calGrid');
    if (!grid) return;

    // June 2026 starts on Monday (day 1), has 30 days
    var firstDay = 1; // 0=Sun, 1=Mon — June 1, 2026 is Monday
    var daysInMonth = 30;

    // Day labels already in HTML. Fill day cells.
    // Need blank cells for offset (June 1 is Monday, so 1 blank for Sun)
    for (var i = 0; i < firstDay; i++) {
      var empty = document.createElement('div');
      empty.className = 'cal-day empty';
      grid.appendChild(empty);
    }

    for (var d = 1; d <= daysInMonth; d++) {
      var cell = document.createElement('div');
      cell.className = 'cal-day';
      cell.textContent = d;

      var dayOfWeek = (firstDay + d - 1) % 7;
      if (dayOfWeek === 0) cell.classList.add('sunday');
      if (d === 13) cell.classList.add('today');

      grid.appendChild(cell);
    }
  }

  /* ---------- D-Day Counter ---------- */
  function updateDday() {
    var el = document.getElementById('ddayNumber');
    if (!el) return;

    var wedding = new Date(2026, 5, 13, 11, 0, 0); // June 13, 2026
    var now = new Date();
    var diff = wedding.getTime() - now.getTime();
    var days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days > 0) {
      el.innerHTML = 'D-' + days;
    } else if (days === 0) {
      el.innerHTML = 'D-Day';
    } else {
      el.innerHTML = 'D+' + Math.abs(days);
    }
  }

  /* ---------- ICS Download ---------- */
  function downloadICS() {
    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wedding//Invitation//KO',
      'BEGIN:VEVENT',
      'DTSTART:20260613T020000Z',
      'DTEND:20260613T040000Z',
      'SUMMARY:제성원 ♥ 곽미림 결혼식',
      'LOCATION:더채플앳대치\\, 서울 강남구 영동대로 318\\, 1층',
      'DESCRIPTION:제성원 & 곽미림 결혼식\\n2026년 6월 13일 토요일 오전 11시\\n더채플앳대치',
      'BEGIN:VALARM',
      'TRIGGER:-PT1H',
      'ACTION:DISPLAY',
      'DESCRIPTION:결혼식 1시간 전입니다',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ];

    var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '제성원_곽미림_결혼식.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ---------- RSVP ---------- */
  function initRSVP() {
    var form = document.getElementById('rsvpForm');
    var success = document.getElementById('rsvpSuccess');
    var counterValue = document.getElementById('guestCount');
    var minusBtn = document.getElementById('guestMinus');
    var plusBtn = document.getElementById('guestPlus');
    var count = 1;

    if (!form) return;

    // Check for existing RSVP
    var existingRSVP = localStorage.getItem('wedding_rsvp');
    if (existingRSVP) {
      form.style.display = 'none';
      success.classList.add('show');
      return;
    }

    // Counter buttons
    minusBtn.addEventListener('click', function () {
      if (count > 1) {
        count--;
        counterValue.textContent = count;
      }
    });

    plusBtn.addEventListener('click', function () {
      if (count < 10) {
        count++;
        counterValue.textContent = count;
      }
    });

    // Submit
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('rsvpName').value.trim();
      var phone = document.getElementById('rsvpPhone').value.trim();
      var attendance = form.querySelector('input[name="attendance"]:checked');

      if (!name) {
        alert('성함을 입력해 주세요.');
        return;
      }

      var data = {
        name: name,
        phone: phone,
        attendance: attendance ? attendance.value : '',
        guests: count,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('wedding_rsvp', JSON.stringify(data));

      form.style.display = 'none';
      success.classList.add('show');
    });
  }

  /* ---------- Map Buttons ---------- */
  function initMapButtons() {
    var kakaoBtn = document.getElementById('btnKakao');
    var naverBtn = document.getElementById('btnNaver');
    var tmapBtn = document.getElementById('btnTmap');

    if (kakaoBtn) {
      kakaoBtn.addEventListener('click', function () {
        window.open('https://map.kakao.com/link/to/더채플앳대치,37.4988,127.0632', '_blank');
      });
    }
    if (naverBtn) {
      naverBtn.addEventListener('click', function () {
        window.open('https://map.naver.com/v5/search/서울 강남구 영동대로 318', '_blank');
      });
    }
    if (tmapBtn) {
      tmapBtn.addEventListener('click', function () {
        window.open('https://tmap.life/ae7d45c1', '_blank');
      });
    }
  }

  /* ---------- Smooth scroll for cover arrow ---------- */
  function initSmoothScroll() {
    var arrow = document.querySelector('.scroll-hint');
    if (arrow) {
      arrow.addEventListener('click', function () {
        var invitation = document.querySelector('.invitation');
        if (invitation) {
          invitation.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initScrollAnimations();
    lightbox.init();
    buildCalendar();
    updateDday();
    initRSVP();
    initMapButtons();
    initSmoothScroll();

    // ICS button
    var icsBtn = document.getElementById('icsBtn');
    if (icsBtn) {
      icsBtn.addEventListener('click', downloadICS);
    }

    // Update D-day every hour
    setInterval(updateDday, 3600000);
  });

})();
