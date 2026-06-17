/* ==============================
   VOYA BITE – SERVICES PAGE JS
   Burger Menu, Filtering, Booking Modal
   ============================== */
document.addEventListener("DOMContentLoaded", () => {
  // ---------- BURGER MENU TOGGLE ----------
  const menuBtn = document.getElementById("menu-btn");
  const navLinks = document.getElementById("nav-links");

  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("open");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
      });
    });
  }

  // ---------- FILTERING ----------
  const filterBtn = document.getElementById("sv-filter-btn");
  if (!filterBtn) return;

  const searchInput = document.getElementById("sv-search");
  const regionSelect = document.getElementById("sv-region-filter");
  const typeSelect = document.getElementById("sv-type-filter");
  const priceSelect = document.getElementById("sv-price-filter");

  const allCards = document.querySelectorAll(".sv-card, .sv-deal-card");

  const noResultsMsg = document.createElement("div");
  noResultsMsg.id = "sv-no-results";
  noResultsMsg.innerHTML = `
    <div style="text-align: center; padding: 3rem 1rem;">
      <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">🔍</span>
      <h3 style="margin-bottom: 0.5rem; color: var(--text-dark);">No Results Found</h3>
      <p style="color: var(--text-light);">Try adjusting your filters or search terms.</p>
    </div>
  `;
  noResultsMsg.style.display = "none";

  const filterBar = document.getElementById("sv-filter-bar");
  filterBar.after(noResultsMsg);

  filterBtn.addEventListener("click", () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedRegion = regionSelect.value;
    const selectedType = typeSelect.value;
    const selectedPriceRange = priceSelect.value;

    let minPrice = 0;
    let maxPrice = Infinity;

    if (selectedPriceRange) {
      const [min, max] = selectedPriceRange.split("-").map(Number);
      minPrice = min;
      maxPrice = max;
    }

    let visibleCount = 0;

    allCards.forEach((card) => {
      let show = true;

      if (searchTerm) {
        const location = (card.dataset.location || "").toLowerCase();
        const title = (
          card.querySelector("h3")?.textContent || ""
        ).toLowerCase();
        if (!location.includes(searchTerm) && !title.includes(searchTerm)) {
          show = false;
        }
      }

      if (show && selectedRegion) {
        if (card.dataset.region !== selectedRegion) show = false;
      }

      if (show && selectedType) {
        if (card.dataset.category !== selectedType) show = false;
      }

      if (show && selectedPriceRange) {
        const price = parseFloat(card.dataset.price);
        if (isNaN(price) || price < minPrice || price > maxPrice) show = false;
      }

      card.style.display = show ? "" : "none";
      if (show) visibleCount++;
    });

    noResultsMsg.style.display = visibleCount === 0 ? "block" : "none";
  });

  // ---------- BOOKING MODAL ----------
  const modal = document.createElement("div");
  modal.id = "sv-booking-modal";
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.6); display: none; justify-content: center;
    align-items: center; z-index: 999;
  `;
  modal.innerHTML = `
    <div style="background: #fff; border-radius: 1.5rem; padding: 2rem; max-width: 500px; width: 90%; position: relative;">
      <button id="sv-close-modal" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
      <h3 style="margin-bottom: 1rem;">Book Your Trip</h3>
      <form id="sv-booking-form">
        <input type="text" placeholder="Full Name" required style="width:100%; padding:0.75rem; margin-bottom:1rem; border-radius:1rem; border:2px solid #eee;">
        <input type="email" placeholder="Email" required style="width:100%; padding:0.75rem; margin-bottom:1rem; border-radius:1rem; border:2px solid #eee;">
        <input type="date" required style="width:100%; padding:0.75rem; margin-bottom:1rem; border-radius:1rem; border:2px solid #eee;">
        <button type="submit" class="btn" style="width:100%;">Confirm Booking</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  const closeModal = () => (modal.style.display = "none");
  modal.querySelector("#sv-close-modal").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.querySelectorAll(".sv-card-body .btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.style.display = "flex";
    });
  });

  document.getElementById("sv-booking-form").addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Booking confirmed! (demo)");
    closeModal();
    e.target.reset();
  });
});