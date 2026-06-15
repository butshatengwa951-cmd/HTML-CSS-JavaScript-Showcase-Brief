/* ==============================
   VOYA BITE – SERVICES PAGE JS
   Filtering, Booking Modal, etc.
   ============================== */
document.addEventListener("DOMContentLoaded", () => {
  // Only run on the Services page
  const filterBtn = document.getElementById("sv-filter-btn");
  if (!filterBtn) return;

  // ---------- FILTERING ----------
  const searchInput = document.getElementById("sv-search");
  const regionSelect = document.getElementById("sv-region-filter");
  const typeSelect = document.getElementById("sv-type-filter");
  const minPriceInput = document.getElementById("sv-price-min");
  const maxPriceInput = document.getElementById("sv-price-max");

  // All filterable items (adventures, hotels, flights, deals)
  const allCards = document.querySelectorAll(".sv-card, .sv-deal-card");

  // Helper: clear all filters
  function clearFilters() {
    searchInput.value = "";
    regionSelect.value = "";
    typeSelect.value = "";
    minPriceInput.value = "";
    maxPriceInput.value = "";
    showAllCards();
  }

  // Show all cards
  function showAllCards() {
    allCards.forEach((card) => (card.style.display = ""));
  }

  // Main filter logic
  filterBtn.addEventListener("click", () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedRegion = regionSelect.value;
    const selectedType = typeSelect.value;
    const minPrice = parseFloat(minPriceInput.value) || 0;
    const maxPrice = parseFloat(maxPriceInput.value) || Infinity;

    // Simple validation: min > max? Swap automatically
    if (minPrice > maxPrice && maxPriceInput.value) {
      // Visual feedback – highlight inputs
      minPriceInput.style.borderColor = "#e63946";
      maxPriceInput.style.borderColor = "#e63946";
      return;
    } else {
      minPriceInput.style.borderColor = "";
      maxPriceInput.style.borderColor = "";
    }

    let visibleCount = 0;

    allCards.forEach((card) => {
      let show = true;

      // Text search (location or title)
      if (searchTerm) {
        const location = (card.dataset.location || "").toLowerCase();
        const title = (
          card.querySelector("h3")?.textContent || ""
        ).toLowerCase();
        if (!location.includes(searchTerm) && !title.includes(searchTerm)) {
          show = false;
        }
      }

      // Region filter
      if (show && selectedRegion) {
        if (card.dataset.region !== selectedRegion) show = false;
      }

      // Type filter (adventure, hotel, flight, deal)
      if (show && selectedType) {
        if (card.dataset.category !== selectedType) show = false;
      }

      // Price range
      if (show && (minPrice > 0 || maxPrice < Infinity)) {
        const price = parseFloat(card.dataset.price);
        if (isNaN(price) || price < minPrice || price > maxPrice) show = false;
      }

      card.style.display = show ? "" : "none";
      if (show) visibleCount++;
    });

    // Optional: Show "no results" message (you can add a <p id="no-results">No trips found.</p>)
    let noResultsMsg = document.getElementById("no-results");
    if (!noResultsMsg) {
      noResultsMsg = document.createElement("p");
      noResultsMsg.id = "no-results";
      noResultsMsg.style.textAlign = "center";
      noResultsMsg.style.color = "var(--text-light)";
      noResultsMsg.style.marginTop = "2rem";
      document.querySelector("main").appendChild(noResultsMsg);
    }
    noResultsMsg.textContent =
      visibleCount === 0 ? "No results found. Try adjusting your filters." : "";
  });

  // Live filtering as you type (optional – uncomment if desired)
  // searchInput.addEventListener('input', () => filterBtn.click());

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

  // Open modal on any "Book" button click
  document.querySelectorAll(".sv-card-body .btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.style.display = "flex";
    });
  });

  // Handle form submission (mock)
  document.getElementById("sv-booking-form").addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Booking confirmed! (demo)");
    closeModal();
    e.target.reset();
  });

  // ---------- SMOOTH SCROLL FOR NAV LINKS ----------
  document.querySelectorAll('nav a[href^="index.html#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      // Only if we are on the same page or need to redirect? For services page we are not on index.
      // No action needed, browser will navigate.
    });
  });
});