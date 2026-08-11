// ---------------------------------------------------------
// Sync --header-h with the sticky header's real height, so
// sections below can size themselves to the visible viewport
// ---------------------------------------------------------
(() => {
  const header = document.querySelector("header");
  if (!header) return;

  const setHeaderHeight = () => {
    document.documentElement.style.setProperty("--header-h", `${header.offsetHeight}px`);
  };

  setHeaderHeight();
  new ResizeObserver(setHeaderHeight).observe(header);
})();

// ---------------------------------------------------------
// Create lucide icons
// ---------------------------------------------------------

lucide.createIcons();

document.addEventListener('alpine:init', () => {
  Alpine.data('navDropdown', (options = { delay: 300 }) => ({
    isOpen: false,
    activeSubmenu: null,
    timeoutId: null,

    // Toggle for clicks (or keyboard Space/Enter)
    toggleDropdown() {
      if (this.isOpen) {
        this.closeDropdown();
      } else {
        this.isOpen = true;
      }
    },

    // Closes the menu and resets submenus
    closeDropdown() {
      this.isOpen = false;
      this.activeSubmenu = null;
    },

    // Opens immediately and clears any pending close delays
    handleMouseEnter() {
      clearTimeout(this.timeoutId);
      this.isOpen = true;
    },

    // Waits for the specified delay before closing, 
    // allowing the user to move their mouse to the dropdown
    handleMouseLeave() {
      this.timeoutId = setTimeout(() => {
        this.closeDropdown();
      }, options.delay);
    }
  }));
});
// ==========================================
// HEADER NAVIGATION (ALPINE.JS)
// ==========================================
document.addEventListener('alpine:init', () => {
  Alpine.data('navDropdown', (config = {}) => ({
    isOpen: false,
    activeSubmenu: null,
    delay: config.delay || 300,
    timer: null,

    handleMouseEnter() {
      clearTimeout(this.timer);
      this.isOpen = true;
    },

    handleMouseLeave() {
      this.timer = setTimeout(() => {
        this.isOpen = false;
        this.activeSubmenu = null;
      }, this.delay);
    },

    toggleDropdown() {
      this.isOpen = !this.isOpen;
      if (!this.isOpen) {
        this.activeSubmenu = null;
      }
    },

    closeDropdown() {
      this.isOpen = false;
      this.activeSubmenu = null;
    }
  }));
});

// ==========================================
// HERO SECTION SWIPER
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const autoplayDelay = 5000;
  let remainingTime = autoplayDelay;

  const swiperEl = document.querySelector('.heroSwiper');
  if (!swiperEl) return;

  const slides = swiperEl.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)');
  const slideCount = slides.length;

  const swiper = new Swiper('.heroSwiper', {
    effect: 'fade',
    fadeEffect: {
      crossFade: true
    },
    loop: slideCount > 1,
    autoplay: slideCount > 1 ? {
      delay: autoplayDelay,
      disableOnInteraction: false,
    } : false,

    pagination: {
      el: '.hero-pagination-tailwind',
      clickable: true,
      renderBullet: function (index, className) {
        return `
          <span class="${className} relative! m-0! h-2! flex-1! rounded-none! bg-white/30! opacity-100! overflow-hidden cursor-pointer">
            <span class="bullet-progress absolute left-0 top-0 h-full w-0 bg-white"></span>
          </span>
        `;
      }
    },

    navigation: {
      prevEl: '.heroSwiper_prev',
      nextEl: '.heroSwiper_next',
    },

    on: {
      init: function () {
        handleSingleSlideVisibility(this, slideCount);
        updateSlideInfo(this, slideCount);
        playActiveVideo(this);

        if (slideCount > 1) {
          updatePaginationState(this);
        }
      },

      slideChange: function () {
        if (slideCount <= 1) return;

        remainingTime = autoplayDelay;
        updateSlideInfo(this, slideCount);
        updatePaginationState(this);
        playActiveVideo(this);
      }
    }
  });

  function handleSingleSlideVisibility(swiper, totalSlides) {
    if (totalSlides <= 1) {
      const elementsToHide = [
        swiper.pagination?.el,
        swiper.navigation?.prevEl,
        swiper.navigation?.nextEl,
        document.getElementById('currentSlide')?.parentElement,
        document.getElementById('currentSlide'),
        document.getElementById('totalSlides')
      ];

      elementsToHide.forEach((el) => {
        if (el) {
          el.style.display = 'none';
        }
      });
    }
  }

  function updateSlideInfo(swiper, totalSlides) {
    const current = swiper.realIndex + 1;
    const format = (num) => String(num).padStart(2, '0');

    const currentEl = document.getElementById('currentSlide');
    const totalEl = document.getElementById('totalSlides');

    if (currentEl) currentEl.textContent = format(current);
    if (totalEl) totalEl.textContent = format(totalSlides);
  }

  function playActiveVideo(swiper) {
    document.querySelectorAll('.heroSwiper video').forEach((video) => {
      video.pause();
      video.currentTime = 0;
    });

    const activeSlide = swiper.slides[swiper.activeIndex];
    const activeVideo = activeSlide ? activeSlide.querySelector('video') : null;

    if (activeVideo) {
      activeVideo.play().catch(() => {});
    }
  }

  function updatePaginationState(swiper) {
    const bullets = swiper.pagination.bullets;
    if (!bullets || bullets.length === 0) return;

    const currentIndex = swiper.realIndex;

    bullets.forEach((bullet, index) => {
      const progressBar = bullet.querySelector('.bullet-progress');
      if (!progressBar) return;

      progressBar.style.transition = 'none';

      if (index < currentIndex) {
        progressBar.style.width = '100%';
      } else if (index > currentIndex) {
        progressBar.style.width = '0%';
      } else {
        progressBar.style.width = '0%';
        void progressBar.offsetWidth;

        if (swiper.autoplay && swiper.autoplay.running) {
          progressBar.style.transition = `width ${remainingTime}ms linear`;
          progressBar.style.width = '100%';
        }
      }
    });
  }
});

// ==========================================
// CARDS SECTION SWIPER
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  const swiperEl = document.querySelector(".swiper-cards");

  if (swiperEl && !swiperEl.swiper) {
    const swiperWrapper = swiperEl.querySelector(".swiper-wrapper");

    const cardSlides = Array.from(
      swiperEl.querySelectorAll(".swiper-slide")
    ).filter(el => {
      const emptyParent = el.parentElement ? el.parentElement.closest(".w-dyn-empty") : null;
      return !emptyParent;
    });

    cardSlides.forEach(slide => swiperWrapper.appendChild(slide));
    const dynList = swiperWrapper.querySelector(".w-dyn-list");
    if (dynList) dynList.remove();

    const swiper = new Swiper(swiperEl, {
      slidesPerView: 1,
      spaceBetween: 16,
      centeredSlides: false,
      watchSlidesProgress: true,
      loop: false,
      loopAdditionalSlides: 2,
      slidesOffsetBefore: 1,

      autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },

      breakpoints: {
        0: {
          slidesPerView: 1,
          spaceBetween: 24,
          centeredSlides: false,
          loop: true,
        },
        500: {
          slidesPerView: 1.5,
          spaceBetween: 24,
          centeredSlides: true,
          loop: true,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 24,
          loop: true,
        },
        1280: {
          slidesPerView: 2,
          spaceBetween: 32,
          loop: true,
        },
      },
    });

    const swiperPrev = document.querySelector(".swiper-cards_prev, .card-arrow-prev");
    const swiperNext = document.querySelector(".swiper-cards_next, .card-arrow-next");

    if (swiperPrev) swiperPrev.addEventListener("click", () => swiper.slidePrev());
    if (swiperNext) swiperNext.addEventListener("click", () => swiper.slideNext());
  }
});

// ==========================================
// PARTNERS LOGO SECTION SWIPER
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  const swiperEl = document.querySelector(".swiper-partners");
  if (!swiperEl || swiperEl.swiper) return;

  const slideCount = swiperEl.querySelectorAll(".swiper-slide").length;
  const maxSlidesPerView = 5;
  const canLoop = slideCount > maxSlidesPerView;

  const swiper = new Swiper(swiperEl, {
    slidesPerView: 2,
    spaceBetween: 0,
    loop: canLoop,
    watchOverflow: true,
    grabCursor: true,

    breakpoints: {
      0: {
        slidesPerView: 2,
        spaceBetween: 0,
      },
      576: {
        slidesPerView: 3,
        spaceBetween: 0,
      },
      992: {
        slidesPerView: 4,
        spaceBetween: 0,
      },
      1280: {
        slidesPerView: 5,
        spaceBetween: 0,
      },
    },

    navigation: {
      prevEl: ".logo-nav-prev",
      nextEl: ".logo-nav-next",
    },

    pagination: {
      el: ".swiper-pagination-partners",
      clickable: true,
    },
  });

  const sliderWrapper = swiperEl.closest(".relative") || swiperEl.parentElement;
  const controls = sliderWrapper.querySelectorAll(
    ".logo-nav-prev, .logo-nav-next, .swiper-pagination-partners"
  );
  swiper.on("lock", () => controls.forEach((el) => el.classList.add("hidden")));
  swiper.on("unlock", () => controls.forEach((el) => el.classList.remove("hidden")));
});