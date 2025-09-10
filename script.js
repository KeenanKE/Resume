/* filepath: script.js */
// Animation Observer for scroll-triggered animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Mobile navigation toggle
function toggleMobileNav() {
  const navMenu = document.getElementById('nav-menu');
  const navToggle = document.getElementById('nav-toggle');
  const body = document.body;
  
  if (navMenu && navToggle) {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (navMenu.classList.contains('active')) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = '';
    }
  }
}

// Close mobile menu when clicking on nav links
function closeMobileNav() {
  const navMenu = document.getElementById('nav-menu');
  const navToggle = document.getElementById('nav-toggle');
  const body = document.body;
  
  if (navMenu && navToggle) {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
    body.style.overflow = '';
  }
}

// Projects Carousel functionality
class ProjectsCarousel {
  constructor() {
    this.track = document.querySelector('.projects-track');
    this.cards = document.querySelectorAll('.project-card');
    this.prevBtn = document.getElementById('prev-btn');
    this.nextBtn = document.getElementById('next-btn');
    this.indicators = document.querySelectorAll('.indicator');
    
    this.currentIndex = 0;
    this.cardWidth = 350 + 24; // card width + gap
    this.visibleCards = this.getVisibleCards();
    // Fix: Only allow scrolling if there are more cards than visible
    this.maxIndex = Math.max(0, this.cards.length - this.visibleCards);
    
    this.autoSlideInterval = null;
    this.isAutoSliding = true;
    this.autoSlideDelay = 4000; // 4 seconds
    this.isPaused = false;
    
    this.init();
  }
  
  getVisibleCards() {
    const containerWidth = this.track.parentElement.offsetWidth;
    const calculatedVisible = Math.floor((containerWidth - 32) / this.cardWidth);
    // Ensure we never show more cards than available
    return Math.min(calculatedVisible, this.cards.length);
  }
  
  init() {
    if (!this.track || this.cards.length === 0) return;
    
    this.updateCarousel();
    
    // Only start auto-slide if there are cards to scroll
    if (this.maxIndex > 0) {
      this.startAutoSlide();
    }
    
    // Event listeners for navigation buttons
    this.prevBtn?.addEventListener('click', () => {
      this.prevSlide();
      this.resetAutoSlide();
    });
    
    this.nextBtn?.addEventListener('click', () => {
      this.nextSlide();
      this.resetAutoSlide();
    });
    
    // Event listeners for indicators
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        this.goToSlide(index);
        this.resetAutoSlide();
      });
    });
    
    // Pause auto-slide on hover
    this.track.addEventListener('mouseenter', () => this.pauseAutoSlide());
    this.track.addEventListener('mouseleave', () => this.resumeAutoSlide());
    
    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());
    
    // Touch/swipe support
    this.addTouchSupport();
    
    // Pause when tab is not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseAutoSlide();
      } else {
        this.resumeAutoSlide();
      }
    });
  }
  
  updateCarousel() {
    if (!this.track) return;
    
    const translateX = -this.currentIndex * this.cardWidth;
    this.track.style.transform = `translateX(${translateX}px)`;
    
    // Update indicators based on available slides
    const totalSlides = Math.max(1, this.maxIndex + 1);
    this.indicators.forEach((indicator, index) => {
      if (index < totalSlides) {
        indicator.style.display = 'block';
        indicator.classList.toggle('active', index === this.currentIndex);
      } else {
        indicator.style.display = 'none';
      }
    });
    
    // Update navigation buttons
    if (this.prevBtn) {
      this.prevBtn.disabled = this.currentIndex === 0;
      this.prevBtn.style.opacity = this.currentIndex === 0 ? '0.3' : '0.8';
    }
    
    if (this.nextBtn) {
      this.nextBtn.disabled = this.currentIndex >= this.maxIndex;
      this.nextBtn.style.opacity = this.currentIndex >= this.maxIndex ? '0.3' : '0.8';
    }
    
    // Hide navigation if no scrolling is needed
    if (this.maxIndex === 0) {
      if (this.prevBtn) this.prevBtn.style.display = 'none';
      if (this.nextBtn) this.nextBtn.style.display = 'none';
      document.querySelector('.carousel-indicators').style.display = 'none';
    } else {
      if (this.prevBtn) this.prevBtn.style.display = 'flex';
      if (this.nextBtn) this.nextBtn.style.display = 'flex';
      document.querySelector('.carousel-indicators').style.display = 'flex';
    }
  }
  
  nextSlide() {
    // Only move if we haven't reached the maximum
    if (this.currentIndex < this.maxIndex) {
      this.currentIndex++;
    } else if (this.maxIndex > 0) {
      // Loop back to start only if there are multiple positions
      this.currentIndex = 0;
    }
    this.updateCarousel();
  }
  
  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else if (this.maxIndex > 0) {
      // Loop to end only if there are multiple positions
      this.currentIndex = this.maxIndex;
    }
    this.updateCarousel();
  }
  
  goToSlide(index) {
    // Ensure the index is within valid bounds
    this.currentIndex = Math.min(Math.max(0, index), this.maxIndex);
    this.updateCarousel();
  }
  
  startAutoSlide() {
    // Only auto-slide if there are multiple positions and not paused
    if (this.isAutoSliding && !this.isPaused && this.maxIndex > 0) {
      this.autoSlideInterval = setInterval(() => {
        this.nextSlide();
      }, this.autoSlideDelay);
    }
  }
  
  pauseAutoSlide() {
    this.isPaused = true;
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }
  
  resumeAutoSlide() {
    this.isPaused = false;
    this.startAutoSlide();
  }
  
  resetAutoSlide() {
    this.pauseAutoSlide();
    setTimeout(() => {
      this.resumeAutoSlide();
    }, 1000); // Wait 1 second before resuming auto-slide
  }
  
  handleResize() {
    this.visibleCards = this.getVisibleCards();
    this.maxIndex = Math.max(0, this.cards.length - this.visibleCards);
    this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
    this.updateCarousel();
  }
  
  addTouchSupport() {
    let startX = 0;
    let isDragging = false;
    let startTime = 0;
    
    this.track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startTime = Date.now();
      isDragging = true;
      this.pauseAutoSlide();
    }, { passive: true });
    
    this.track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      
      const currentX = e.touches[0].clientX;
      const diff = startX - currentX;
      
      // Add some visual feedback during drag (but prevent over-scrolling)
      if (Math.abs(diff) > 10) {
        const maxTranslate = -this.maxIndex * this.cardWidth;
        const currentTranslate = -this.currentIndex * this.cardWidth - diff * 0.3;
        const clampedTranslate = Math.max(maxTranslate, Math.min(0, currentTranslate));
        this.track.style.transform = `translateX(${clampedTranslate}px)`;
      }
    }, { passive: true });
    
    this.track.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      const timeDiff = Date.now() - startTime;
      const velocity = Math.abs(diff) / timeDiff;
      
      // Reset transform
      this.track.style.transform = `translateX(${-this.currentIndex * this.cardWidth}px)`;
      
      // Determine if it's a swipe (minimum distance and velocity)
      if (Math.abs(diff) > 50 || velocity > 0.5) {
        if (diff > 0 && this.currentIndex < this.maxIndex) {
          this.nextSlide();
        } else if (diff < 0 && this.currentIndex > 0) {
          this.prevSlide();
        }
      }
      
      isDragging = false;
      this.resetAutoSlide();
    }, { passive: true });
  }
  
  // Method to filter visible cards
  filterCards(category) {
    this.cards.forEach(card => {
      const cardCategory = card.dataset.category;
      const shouldShow = category === 'all' || cardCategory === category;
      card.style.display = shouldShow ? 'block' : 'none';
    });
    
    // Reset carousel position and recalculate
    this.currentIndex = 0;
    this.updateVisibleCards();
    this.updateCarousel();
  }
  
  updateVisibleCards() {
    this.cards = document.querySelectorAll('.project-card[style*="block"], .project-card:not([style*="none"])');
    this.visibleCards = this.getVisibleCards();
    this.maxIndex = Math.max(0, this.cards.length - this.visibleCards);
  }
}

// Project filtering
function filterProjects(category) {
  const cards = document.querySelectorAll('.project-card');
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  // Update active filter button
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === category);
  });
  
  // Filter cards
  cards.forEach(card => {
    const cardCategory = card.dataset.category;
    const shouldShow = category === 'all' || cardCategory === category;
    
    card.style.display = shouldShow ? 'block' : 'none';
  });
  
  // Reinitialize carousel after filtering
  setTimeout(() => {
    if (window.projectsCarousel) {
      window.projectsCarousel = new ProjectsCarousel();
    }
  }, 100);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize animation observer
  const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in');
  animatedElements.forEach(el => observer.observe(el));
  
  // Initialize projects carousel
  window.projectsCarousel = new ProjectsCarousel();
  
  // Counter animation for stats
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target.querySelector('.stat-number');
        if (counter) {
          animateCounter(counter);
          statsObserver.unobserve(entry.target);
        }
      }
    });
  }, { threshold: 0.5 });
  
  document.querySelectorAll('.stat').forEach(stat => {
    statsObserver.observe(stat);
  });
  
  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.offsetTop;
        const offsetPosition = elementPosition - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Active navigation highlighting
  window.addEventListener('scroll', updateActiveNav);
  
  // Filter button event listeners
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filterProjects(btn.dataset.filter);
    });
  });
  
  // Mobile navigation toggle
  const navToggle = document.getElementById('nav-toggle');
  if (navToggle) {
    navToggle.addEventListener('click', toggleMobileNav);
  }
  
  // Close mobile menu when clicking on nav links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navbar = document.querySelector('.navbar');
    
    if (navMenu && navMenu.classList.contains('active') && 
        !navbar.contains(e.target)) {
      closeMobileNav();
    }
  });
  
  // Close mobile menu on window resize if screen becomes larger
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeMobileNav();
    }
  });
  
  // Contact form handling
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactForm);
  }
});

// Helper functions
function animateCounter(element) {
  const target = parseInt(element.textContent.replace(/\D/g, ''));
  let current = 0;
  const increment = target / 50;
  
  const updateCounter = () => {
    if (current < target) {
      current = Math.min(current + increment, target);
      element.textContent = `${Math.ceil(current)}+`;
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = `${target}+`;
    }
  };
  
  updateCounter();
}

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });
  
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

function handleContactForm(e) {
  e.preventDefault();
  
  // Get form data
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  // Here you would typically send the data to your server
  console.log('Contact form submitted:', data);
  
  // Show success message (you can customize this)
  alert('Thank you for your message! I will get back to you soon.');
  
  // Reset form
  e.target.reset();
}

// Three.js animation for hero section
function initHeroAnimation() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  // Create geometry
  const geometry = new THREE.IcosahedronGeometry(12, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0x2563eb,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  
  // Add points
  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0x2563eb,
      size: 2,
      transparent: true,
      opacity: 0.6
    })
  );
  scene.add(points);
  
  camera.position.z = 30;
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    
    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.008;
    
    points.rotation.x += 0.005;
    points.rotation.y += 0.008;
    
    renderer.render(scene, camera);
  }
  
  // Handle window resize
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  window.addEventListener('resize', onWindowResize);
  animate();
}

// Initialize Three.js when page loads
window.addEventListener('load', initHeroAnimation);