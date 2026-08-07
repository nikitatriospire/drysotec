// Header
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

// Hero section Swiper
document.addEventListener('DOMContentLoaded', () => {
  const autoplayDelay = 5000; // 5 seconds per slide
  let remainingTime = autoplayDelay;

  // Select swiper elements
  const swiperEl = document.querySelector('.heroSwiper');
  if (!swiperEl) return;

  // Count non-duplicate slides
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

    // Custom Pagination rendering lines with animated fills
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

    // Navigation buttons
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

  // Hide Controls & Counters if only 1 slide exists
  function handleSingleSlideVisibility(swiper, totalSlides) {
    if (totalSlides <= 1) {
      const elementsToHide = [
        swiper.pagination?.el,
        swiper.navigation?.prevEl,
        swiper.navigation?.nextEl,
        document.getElementById('currentSlide')?.parentElement, // Hides the whole counter container if wrapped together
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

  // Update the "01 / 04" counter numbers
  function updateSlideInfo(swiper, totalSlides) {
    const current = swiper.realIndex + 1;
    const format = (num) => String(num).padStart(2, '0');

    const currentEl = document.getElementById('currentSlide');
    const totalEl = document.getElementById('totalSlides');

    if (currentEl) currentEl.textContent = format(current);
    if (totalEl) totalEl.textContent = format(totalSlides);
  }

  // Play video in the active slide, pause videos in inactive slides
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

  // Manages past, active, and future pagination progress bars
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

// Cards section Swiper
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

    // Re-append valid slides & clean empty Webflow lists
    cardSlides.forEach(slide => swiperWrapper.appendChild(slide));
    const dynList = swiperWrapper.querySelector(".w-dyn-list");
    if (dynList) dynList.remove();

    // Swiper Initialization
    const swiper = new Swiper(swiperEl, {
      slidesPerView: 1,
      spaceBetween: 16,
      centeredSlides: false,
      watchSlidesProgress: true,
      loop: true,
      loopAdditionalSlides: 2,
      // Swiper only arranges loop-wrapped slides on both sides at init when
      // centeredSlides or a slidesOffset is set; otherwise it only prepares
      // the "next" side and the left peek card is missing on first paint.
      slidesOffsetBefore: 1,
      breakpoints: {
        768: {
          slidesPerView: 2,
          spaceBetween: 24,
        },
        1280: {
          slidesPerView: 2,
          spaceBetween: 32,
        },
      },
    });

    // FIX 3: Support both button class variants (card-arrow or swiper-cards)
    const swiperPrev = document.querySelector(".swiper-cards_prev, .card-arrow-prev");
    const swiperNext = document.querySelector(".swiper-cards_next, .card-arrow-next");

    if (swiperPrev) swiperPrev.addEventListener("click", () => swiper.slidePrev());
    if (swiperNext) swiperNext.addEventListener("click", () => swiper.slideNext());
  }
});