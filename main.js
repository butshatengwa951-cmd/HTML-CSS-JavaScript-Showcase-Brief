// ========================================
// MAIN.JS FILE
// ========================================
const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");

menuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

// Closes mobile menu smoothly when clicking on a page section destination link
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
  });
});

const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};

ScrollReveal().reveal(".header-content h1", {
  ...scrollRevealOption,
  delay: 500,
});
ScrollReveal().reveal(".header-content p", {
  ...scrollRevealOption,
});

ScrollReveal().reveal(".banner-card", {
  ...scrollRevealOption,
  interval: 500,
});

// ScrollReveal().reveal(".img-card", {
//   duration: 1000,
//   interval: 500,
// });

// const hero = document.querySelector(".hero");
// const cards = document.querySelectorAll(".card");
// const nextBtn = document.getElementById("next");
// const prevBtn = document.getElementById("prev");

// let current = 0;

// hero.style.setProperty(
//     "--bg-current",
//     `url(${cards[0].dataset.bg})`
// );

// function changeBackground(newImage) {
//     hero.style.setProperty(
//         "--bg-next",
//         `url(${newImage})`
//     );

//     hero.classList.add("fade");

//     setTimeout(() => {
//         hero.style.setProperty(
//             "--bg-current",
//             `url(${newImage})`
//         );
//         hero.classList.remove("fade");
//     }, 800);
// }

// function updateCarousel() {
//     cards.forEach(card => card.classList.remove("active"));

//     cards[current].classList.add("active");

//     changeBackground(cards[current].dataset.bg);
// }

// nextBtn.addEventListener("click", () => {
//     current = (current + 1) % cards.length;
//     updateCarousel();
// });

// prevBtn.addEventListener("click", () => {
//     current = (current - 1 + cards.length) % cards.length;
//     updateCarousel();
// });

// cards.forEach((card, index) => {
//     card.addEventListener("click", () => {
//         current = index;
//         updateCarousel();
//     });
// });

