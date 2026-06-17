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
