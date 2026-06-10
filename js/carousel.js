export function initCarousel() {
  const carousel = document.querySelector('.carousel-track');
  const slides = document.querySelectorAll('.review-slide');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dots = document.querySelectorAll('.carousel-dot');
  
  if (!carousel || slides.length === 0) return;

  let currentIndex = 0;
  let autoSlideInterval;
  
  // Calculate items per view based on window width
  const getItemsPerView = () => window.innerWidth < 768 ? 1 : 3;
  let itemsPerView = getItemsPerView();

  const updateCarousel = () => {
    const slideWidth = 100 / itemsPerView;
    const offset = currentIndex * slideWidth;
    carousel.style.transform = `translateX(-${offset}%)`;
    
    // Update dots (if we have 8 reviews and show 3, we have 6 dots)
    const totalDots = slides.length - itemsPerView + 1;
    dots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  };

  const nextSlide = () => {
    if (currentIndex >= slides.length - itemsPerView) {
      currentIndex = 0;
    } else {
      currentIndex++;
    }
    updateCarousel();
  };

  const prevSlide = () => {
    if (currentIndex <= 0) {
      currentIndex = slides.length - itemsPerView;
    } else {
      currentIndex--;
    }
    updateCarousel();
  };

  const startAutoSlide = () => {
    autoSlideInterval = setInterval(nextSlide, 4000);
  };

  const stopAutoSlide = () => {
    clearInterval(autoSlideInterval);
  };

  // Event Listeners
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentIndex = index;
      updateCarousel();
    });
  });

  const carouselContainer = document.querySelector('.carousel-container');
  if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', stopAutoSlide);
    carouselContainer.addEventListener('mouseleave', startAutoSlide);
    
    // Touch support
    let startX = 0;
    carouselContainer.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      stopAutoSlide();
    }, {passive: true});
    
    carouselContainer.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      if (startX - endX > 50) nextSlide();
      else if (endX - startX > 50) prevSlide();
      startAutoSlide();
    }, {passive: true});
  }

  window.addEventListener('resize', () => {
    itemsPerView = getItemsPerView();
    if (currentIndex > slides.length - itemsPerView) {
      currentIndex = Math.max(0, slides.length - itemsPerView);
    }
    updateCarousel();
  });

  // Init
  updateCarousel();
  startAutoSlide();
}
