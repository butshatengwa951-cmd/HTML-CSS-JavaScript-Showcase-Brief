// ============================================
// BACK TO TOP BUTTON
// ============================================
const backToTopBtn = document.getElementById("sv-back-to-top");

window.addEventListener("scroll", () => {
  if (window.scrollY > 500) {
    backToTopBtn.classList.add("visible");
  } else {
    backToTopBtn.classList.remove("visible");
  }
});

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// ============================================
// STICKY FILTER BAR SHADOW ON SCROLL
// ============================================
const filterBar = document.getElementById("sv-filter-bar");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    filterBar.classList.add("scrolled");
  } else {
    filterBar.classList.remove("scrolled");
  }
});

// ============================================
// FILTER FUNCTIONALITY
// ============================================
document.getElementById("sv-filter-btn").addEventListener("click", () => {
  const searchTerm = document.getElementById("sv-search").value.toLowerCase();
  const region = document.getElementById("sv-region-filter").value;
  const type = document.getElementById("sv-type-filter").value;
  const priceRange = document.getElementById("sv-price-filter").value;

  const cards = document.querySelectorAll(".sv-card, .sv-deal-card");
  let totalVisibleCards = 0;

  cards.forEach((card) => {
    const cardCategory = card.dataset.category;
    const cardRegion = card.dataset.region;
    const cardPrice = parseInt(card.dataset.price);
    const cardLocation = card.dataset.location
      ? card.dataset.location.toLowerCase()
      : "";

    let showCard = true;

    // Filter by search term
    if (searchTerm && !cardLocation.includes(searchTerm)) {
      showCard = false;
    }

    // Filter by region
    if (region && cardRegion !== region) {
      showCard = false;
    }

    // Filter by type
    if (type && cardCategory !== type) {
      showCard = false;
    }

    // Filter by price
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      if (cardPrice < min || cardPrice > max) {
        showCard = false;
      }
    }

    // Show or hide card
    card.style.display = showCard ? "" : "none";

    if (showCard) {
      totalVisibleCards++;
    }
  });

  // Handle section visibility
  const sections = document.querySelectorAll(".sv-section");
  sections.forEach((section) => {
    const visibleCards = section.querySelectorAll(
      '.sv-card:not([style*="display: none"]), .sv-deal-card:not([style*="display: none"])',
    );
    if (visibleCards.length === 0) {
      section.style.display = "none";
    } else {
      section.style.display = "";
    }
  });

  // Handle no results message
  handleNoResultsMessage(totalVisibleCards);
});

// ============================================
// NO RESULTS MESSAGE HANDLER
// ============================================
function handleNoResultsMessage(visibleCount) {
  // Remove existing message if any
  const existingMessage = document.getElementById("sv-no-results");
  if (existingMessage) {
    existingMessage.remove();
  }

  // If no cards are visible, show message
  if (visibleCount === 0) {
    const noResultsMessage = document.createElement("div");
    noResultsMessage.id = "sv-no-results";
    noResultsMessage.className = "sv-no-results";
    noResultsMessage.innerHTML = `
      <div class="sv-no-results-content">
        <span class="sv-no-results-icon">🔍</span>
        <h3>No Results Available</h3>
        <p>We couldn't find any matches for your current filters. Try adjusting your search criteria or clearing the filters.</p>
        <button id="sv-clear-filters" class="btn">Clear All Filters</button>
      </div>
    `;

    // Insert after the filter bar
    const filterBar = document.getElementById("sv-filter-bar");
    filterBar.parentNode.insertBefore(noResultsMessage, filterBar.nextSibling);

    // Add event listener to clear filters button
    document
      .getElementById("sv-clear-filters")
      .addEventListener("click", clearAllFilters);
  }
}

// ============================================
// CLEAR ALL FILTERS
// ============================================
function clearAllFilters() {
  // Clear all filter inputs
  document.getElementById("sv-search").value = "";
  document.getElementById("sv-region-filter").value = "";
  document.getElementById("sv-type-filter").value = "";
  document.getElementById("sv-price-filter").value = "";

  // Show all cards
  const cards = document.querySelectorAll(".sv-card, .sv-deal-card");
  cards.forEach((card) => {
    card.style.display = "";
  });

  // Show all sections
  const sections = document.querySelectorAll(".sv-section");
  sections.forEach((section) => {
    section.style.display = "";
  });

  // Remove no results message
  const noResultsMessage = document.getElementById("sv-no-results");
  if (noResultsMessage) {
    noResultsMessage.remove();
  }
}

// ============================================
// MOBILE MENU TOGGLE
// ============================================
document.getElementById("menu-btn").addEventListener("click", () => {
  document.getElementById("nav-links").classList.toggle("active");
});

// ============================================
// LIVE SEARCH (Optional - updates as you type)
// ============================================
document.getElementById("sv-search").addEventListener("input", () => {
  // Trigger filter on enter key or after 500ms of no typing
  clearTimeout(window.searchTimeout);
  window.searchTimeout = setTimeout(() => {
    document.getElementById("sv-filter-btn").click();
  }, 500);
});
