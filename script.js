// Utility functions
const utils = {
  isReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches,

  getRandomY: () => Math.random() * (window.innerHeight * 0.3),

  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  preloadImages: (urls) => {
    return Promise.all(
      urls.map((url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
      })
    );
  }
};

// Animation Controllers
class AnimationController {
  constructor() {
    this.initialized = false;
    this.timeline = null;
  }

  // Mouse glow effect - Timing matched to V1
  updateGlow(e) {
    const glowEffect = document.querySelector(".glow-effect");
    if (!glowEffect) return;

    gsap.to(glowEffect, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.6,
      ease: "power2.out"
    });
  }

  // Parallax effect - Timing matched to V1
  parallaxEffect(e) {
    const moveX = e.clientX * 0.05;
    const moveY = e.clientY * 0.05;

    gsap.to(".bg1", {
      x: moveX,
      y: moveY,
      duration: 1,
      ease: "power1.out"
    });

    gsap.to(".bg2", {
      x: moveX * 0.7,
      y: moveY * 0.7,
      duration: 1,
      ease: "power1.out"
    });
  }

  // Collection items animation - Timing matched to V1
  setupCollectionAnimations() {
    const items = document.querySelectorAll(".item-wrapper");

    items.forEach((item) => {
      const imageContainer = item.querySelector(".image-container");
      if (!imageContainer) return;

      gsap.set(imageContainer, { scale: 1, y: 0 });

      item.addEventListener("mouseenter", () => {
        gsap.to(imageContainer, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out"
        });
      });

      item.addEventListener("mouseleave", () => {
        gsap.to(imageContainer, {
          scale: 1,
          duration: 0.3,
          ease: "power2.inOut"
        });
      });
    });
  }

  // Initial Door Animation - Timing matched to V1
  initialDoorShake() {
    gsap.to(".door-container", {
      x: "+=7",
      duration: 0.1,
      repeat: 5,
      yoyo: true,
      ease: "power1.out",
      onComplete: () => {
        gsap.delayedCall(0.5, () => this.playDoorAnimation());
      }
    });
  }

  // Main door animation - Timing and labels matched to V1
  playDoorAnimation() {
    if (!this.timeline) {
      this.timeline = gsap.timeline({
        onComplete: () => {
          gsap.set(".door-container", { display: "none" });
          this.setupCollectionAnimations();
          this.setupLogoAnimations();
        }
      });
    }

    // Set initial states
    gsap.set([".door-left", ".door-right"], { x: 0 });
    gsap.set(".content-wrapper", {
      opacity: 0,
      visibility: "visible"
    });
    gsap.set([".cloud", ".bird"], { opacity: 0 });
    gsap.set(".door::before", { opacity: 0 });
    gsap.set(".collection-item", { opacity: 0, y: 50 });
    gsap.set(".item-wrapper", { rotation: 15, opacity: 0 });

    // Animation sequence with exact V1 timing
    this.timeline
      .addLabel("doorOpenAnimation")
      .addLabel("bg2SlideInStart", "doorOpenAnimation+=0.2")
      .addLabel("contentStart", "bg2SlideInStart")
      .to(".door::before", {
        opacity: 0.8,
        duration: 1,
        ease: "power2.inOut"
      })
      .to(".door::before", {
        opacity: 0,
        duration: 0.5,
        ease: "power4.inOut"
      })
      .to(
        [".door-left", ".door-right"],
        {
          x: (i) => (i === 0 ? "-100%" : "100%"),
          duration: 2,
          ease: "power4.inOut",
          stagger: 0.1
        },
        "doorOpenAnimation"
      )
      .to(
        ".bg2",
        {
          y: 0,
          duration: 1.5,
          ease: "power3.inOut"
        },
        "bg2SlideInStart"
      )
      .add(this.startBackgroundAnimations.bind(this), "contentStart")
      .add(this.animateContent.bind(this), "contentStart")
      .to(
        ".door-container",
        {
          opacity: 0,
          duration: 0.3
        },
        "doorOpenAnimation+=2"
      );
  }

  // Background animations - Timing matched to V1
  startBackgroundAnimations() {
    gsap.set([".cloud", ".bird"], { opacity: 1 });

    const animateElement = (element, duration, delay = 0) => {
      if (!element) return;

      const elementWidth = element.offsetWidth;

      gsap.to(element, {
        x: window.innerWidth + elementWidth,
        duration: duration,
        delay: delay,
        ease: "none",
        repeat: -1,
        onRepeat: () => {
          gsap.set(element, {
            y: utils.getRandomY(),
            x: -elementWidth
          });
        }
      });

      gsap.to(element, {
        y: "+=20",
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    };

    const cloud = document.querySelector(".cloud");
    const bird = document.querySelector(".bird");

    if (cloud)
      gsap.set(cloud, { x: -cloud.offsetWidth, y: utils.getRandomY() });
    if (bird) gsap.set(bird, { x: -bird.offsetWidth, y: utils.getRandomY() });

    animateElement(cloud, 20);
    animateElement(bird, 10, 2);
  }

  // Content animation - Timing and stagger matched to V1
  animateContent() {
    gsap
      .timeline()
      .to(".content-wrapper", {
        opacity: 1,
        duration: 1.5,
        ease: "power2.out"
      })
      .from(
        ".logo",
        {
          y: -50,
          opacity: 0,
          duration: 1,
          ease: "back.out(1.7)"
        },
        "-=0.5"
      )
      .from(
        ".explore-text",
        {
          scale: 0.8,
          opacity: 0,
          duration: 1,
          ease: "power2.out"
        },
        "-=0.7"
      )
      .to(
        ".collection-item",
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: "back.out(1.7)"
        },
        "-=0.5"
      )
      .to(
        ".item-wrapper",
        {
          rotation: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out"
        },
        "-=1"
      );
  }

  // Logo animations - Timing matched to V1
  setupLogoAnimations() {
    setInterval(() => {
      gsap.to(".explore-glow", {
        opacity: 0.5,
        duration: 1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });
    }, 4000);
  }

  // Initialize animations - Modified to match V1 behavior
  async initialize() {
    if (this.initialized) return;

    try {
      // Set initial states
      gsap.set(".content-wrapper", {
        opacity: 0,
        visibility: "hidden"
      });
      gsap.set(".door-container", { scale: 1 });
      gsap.set(".collection-item", { opacity: 0, y: 50 });
      gsap.set([".cloud", ".bird"], { opacity: 1 });
      gsap.set(".item-wrapper", { rotation: 15, opacity: 0 });

      // Add logo to preload images
      const imagesToPreload = [
        "https://raw.githubusercontent.com/signuppotter/test2/f3d16644b36058a2f45cc88b04a8a324b7508679/Senor%20Logo%20(2).svg",
        "https://raw.githubusercontent.com/signuppotter/Paloma2/refs/heads/main/BG1.webp",
        "https://raw.githubusercontent.com/signuppotter/Paloma2/refs/heads/main/BG2B2.webp",
        "https://raw.githubusercontent.com/signuppotter/Paloma2/refs/heads/main/doorLeft.webp",
        "https://raw.githubusercontent.com/signuppotter/Paloma2/refs/heads/main/doorRight.webp"
      ];

      await utils.preloadImages(imagesToPreload);
      this.initialDoorShake();
      this.initialized = true;
    } catch (error) {
      console.error("Initialization error:", error);
      // Fallback to direct door animation
      this.playDoorAnimation();
    }
  }
}

// Create animation controller instance
const controller = new AnimationController();

// Event listeners with minimal debouncing to match V1 responsiveness
window.addEventListener(
  "mousemove",
  utils.debounce((e) => {
    controller.updateGlow(e);
    controller.parallaxEffect(e);
  }, 5)
);

document.addEventListener(
  "touchmove",
  utils.debounce((e) => {
    const touch = e.touches[0];
    controller.updateGlow(touch);
    controller.parallaxEffect(touch);
  }, 5)
);

// Initialize on load
window.addEventListener("load", () => controller.initialize());

// Error handling
window.addEventListener("error", (e) => {
  if (e.message.includes("GSAP")) {
    console.error("GSAP error:", e);
    // Fallback to simple fade-in
    document.querySelector(".content-wrapper").style.opacity = 1;
    document.querySelector(".content-wrapper").style.visibility = "visible";
  }
});
