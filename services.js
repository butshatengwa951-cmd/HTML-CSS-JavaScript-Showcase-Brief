// Services JavaScript

// ============================================
// THEME MANAGEMENT
// ============================================
function initTheme() {
  const savedTheme = localStorage.getItem("voya-theme") || "light";
  const savedColor = localStorage.getItem("voya-color") || "blue";
  document.documentElement.setAttribute("data-theme", savedTheme);
  document.documentElement.setAttribute("data-color", savedColor);
  updateThemeIcon(savedTheme);
  updateActiveColorBtn(savedColor);
}
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("voya-theme", newTheme);
  updateThemeIcon(newTheme);
}
function updateThemeIcon(theme) {
  const icon = document.querySelector(
    "#theme-toggle .material-symbols-outlined",
  );
  if (icon) icon.textContent = theme === "dark" ? "light_mode" : "dark_mode";
}
function setColor(color) {
  document.documentElement.setAttribute("data-color", color);
  localStorage.setItem("voya-color", color);
  updateActiveColorBtn(color);
}
function updateActiveColorBtn(color) {
  document
    .querySelectorAll(".color-btn")
    .forEach((btn) =>
      btn.classList.toggle("active", btn.dataset.color === color),
    );
}
document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
document
  .querySelectorAll(".color-btn")
  .forEach((btn) =>
    btn.addEventListener("click", () => setColor(btn.dataset.color)),
  );
initTheme();

// ============================================
// BOOKING SYSTEM VARIABLES
// ============================================
let currentBookingData = {
  itemName: "",
  category: "",
  price: 0,
  basePrice: 0,
  location: "",
  duration: "",
};
const PRICE_PER_EXTRA_ADULT = 500;
const PRICE_PER_CHILD = 250;
const FLIGHT_CHILD_DISCOUNT = 0.25;
const FLIGHT_GROUP_DISCOUNT = 0.1;
const FLIGHT_GROUP_THRESHOLD = 4;

function generateBookingCode() {
  return (
    "VB-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================
function validateFullName(name) {
  const trimmed = name.trim();
  if (!trimmed) return "Full name is required";
  if (trimmed.length < 3) return "Name must be at least 3 characters";
  if (!trimmed.includes(" ")) return "Please enter both first and last name";
  if (/[^a-zA-Z\s'-]/.test(trimmed)) return "Name contains invalid characters";
  return "";
}
function validateEmail(email) {
  const trimmed = email.trim();
  if (!trimmed) return "Email address is required";
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed))
    return "Please enter a valid email address";
  return "";
}
function validatePhone(phone) {
  const trimmed = phone.trim();
  if (!trimmed) return "Phone number is required";
  const digitsOnly = trimmed.replace(/\D/g, "");
  if (digitsOnly.length < 10)
    return "Phone number must have at least 10 digits";
  if (digitsOnly.length > 15) return "Phone number is too long";
  return "";
}
function validateCheckIn(date) {
  if (!date) return "Start date is required";
  const selected = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selected < today) return "Start date cannot be in the past";
  return "";
}
function validateCheckOut(checkIn, checkOut) {
  if (!checkOut) return "";
  if (new Date(checkOut) <= new Date(checkIn))
    return "End date must be after start date";
  return "";
}

function showFieldError(elementId, error) {
  const el = document.getElementById(elementId);
  if (error) {
    el.textContent = error;
    el.classList.add("show");
  } else {
    el.textContent = "";
    el.classList.remove("show");
  }
}
function toggleFieldClass(input, error) {
  input.classList.remove("error", "valid");
  if (error) input.classList.add("error");
  else if (input.value.trim()) input.classList.add("valid");
}

// ============================================
// REAL-TIME VALIDATION
// ============================================
function setupRealTimeValidation() {
  const nameInput = document.getElementById("full-name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const checkInInput = document.getElementById("check-in");
  const checkOutInput = document.getElementById("check-out");

  nameInput.addEventListener("blur", function () {
    const e = validateFullName(this.value);
    showFieldError("name-error", e);
    toggleFieldClass(this, e);
  });
  nameInput.addEventListener("input", function () {
    if (this.classList.contains("error")) {
      const e = validateFullName(this.value);
      showFieldError("name-error", e);
      toggleFieldClass(this, e);
    }
  });
  emailInput.addEventListener("blur", function () {
    const e = validateEmail(this.value);
    showFieldError("email-error", e);
    toggleFieldClass(this, e);
  });
  emailInput.addEventListener("input", function () {
    if (this.classList.contains("error")) {
      const e = validateEmail(this.value);
      showFieldError("email-error", e);
      toggleFieldClass(this, e);
    }
  });
  phoneInput.addEventListener("blur", function () {
    const e = validatePhone(this.value);
    showFieldError("phone-error", e);
    toggleFieldClass(this, e);
  });
  phoneInput.addEventListener("input", function () {
    if (this.classList.contains("error")) {
      const e = validatePhone(this.value);
      showFieldError("phone-error", e);
      toggleFieldClass(this, e);
    }
  });
  checkInInput.addEventListener("change", function () {
    const e = validateCheckIn(this.value);
    showFieldError("checkin-error", e);
    toggleFieldClass(this, e);
    autoSetCheckOut();
    updatePriceDisplay();
  });
  checkOutInput.addEventListener("change", function () {
    const e = validateCheckOut(checkInInput.value, this.value);
    showFieldError("checkout-error", e);
    toggleFieldClass(this, e);
    updatePriceDisplay();
  });
}

// ============================================
// AUTO-SET CHECKOUT DATE
// ============================================
function autoSetCheckOut() {
  const category = currentBookingData.category.toLowerCase();
  const checkInValue = document.getElementById("check-in").value;
  if (!checkInValue) return;
  const checkIn = new Date(checkInValue);
  let daysToAdd = 0;
  if (category === "adventure") {
    const match = currentBookingData.duration.match(/(\d+)/);
    if (match) daysToAdd = parseInt(match[1]);
  } else if (category === "hotel") {
    daysToAdd = 1;
  } else if (category === "flight") {
    daysToAdd = 7;
  } else if (category === "deal") {
    if (currentBookingData.itemName.includes("Early Bird")) daysToAdd = 60;
    else if (currentBookingData.itemName.includes("Last Minute"))
      daysToAdd = 14;
    else daysToAdd = 3;
  }
  if (daysToAdd > 0) {
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + daysToAdd);
    const checkOutStr = checkOut.toISOString().split("T")[0];
    document.getElementById("check-out").value = checkOutStr;
    document.getElementById("check-out").setAttribute("min", checkOutStr);
  }
}

// ============================================
// DYNAMIC PRICING
// ============================================
function calculateTotalPrice() {
  const adults = parseInt(document.getElementById("adults").value) || 1;
  const children = parseInt(document.getElementById("children").value) || 0;
  const basePrice = currentBookingData.basePrice;
  const category = currentBookingData.category.toLowerCase();
  const totalPeople = adults + children;

  if (category === "flight") {
    let adultTicketPrice = basePrice;
    let childTicketPrice = Math.round(basePrice * (1 - FLIGHT_CHILD_DISCOUNT));
    let totalAdultCost = adults * adultTicketPrice;
    let totalChildCost = children * childTicketPrice;
    let subtotal = totalAdultCost + totalChildCost;
    let discount = 0;
    if (totalPeople >= FLIGHT_GROUP_THRESHOLD)
      discount = Math.round(subtotal * FLIGHT_GROUP_DISCOUNT);
    let totalPrice = subtotal - discount;
    return {
      basePrice,
      adultTicketPrice,
      childTicketPrice,
      totalAdultCost,
      totalChildCost,
      subtotal,
      discount,
      totalPrice,
      adults,
      children,
      isFlight: true,
      totalPeople,
    };
  }

  const extraAdults = Math.max(0, adults - 1);
  const adultExtraCost = extraAdults * PRICE_PER_EXTRA_ADULT;
  const childCost = children * PRICE_PER_CHILD;
  const totalPrice = basePrice + adultExtraCost + childCost;
  return {
    basePrice,
    adultExtraCost,
    childCost,
    totalPrice,
    extraAdults,
    children,
    isFlight: false,
  };
}

function updatePriceDisplay() {
  const pricing = calculateTotalPrice();

  if (pricing.isFlight) {
    document.getElementById("summary-base-price").textContent =
      "R" + pricing.adultTicketPrice.toLocaleString() + " per adult";
    const adultExtraRow = document.getElementById("adult-extra-row");
    if (pricing.adults > 1) {
      adultExtraRow.style.display = "flex";
      document.getElementById("summary-adult-extra").textContent =
        "R" +
        pricing.totalAdultCost.toLocaleString() +
        " (" +
        pricing.adults +
        " adult ticket" +
        (pricing.adults > 1 ? "s" : "") +
        ")";
    } else {
      adultExtraRow.style.display = "none";
    }
    const childExtraRow = document.getElementById("child-extra-row");
    if (pricing.children > 0) {
      childExtraRow.style.display = "flex";
      document.getElementById("summary-child-extra").textContent =
        "R" +
        pricing.totalChildCost.toLocaleString() +
        " (" +
        pricing.children +
        " child ticket" +
        (pricing.children > 1 ? "s" : "") +
        ")";
    } else {
      childExtraRow.style.display = "none";
    }
    let discountRow = document.getElementById("discount-row");
    if (pricing.discount > 0) {
      if (!discountRow) {
        discountRow = document.createElement("div");
        discountRow.id = "discount-row";
        discountRow.className = "summary-row";
        discountRow.style.color = "#27ae60";
        discountRow.innerHTML =
          '<span>Group Discount (10%):</span><span id="summary-discount"></span>';
        const totalRow = document.querySelector(".summary-row.total");
        totalRow.parentNode.insertBefore(discountRow, totalRow);
      }
      discountRow.style.display = "flex";
      document.getElementById("summary-discount").textContent =
        "-R" + pricing.discount.toLocaleString();
    } else if (discountRow) {
      discountRow.style.display = "none";
    }
    document.getElementById("summary-total").textContent =
      "R" + pricing.totalPrice.toLocaleString();
    currentBookingData.price = pricing.totalPrice;
  } else {
    document.getElementById("summary-base-price").textContent =
      "R" + pricing.basePrice.toLocaleString();
    const adultExtraRow = document.getElementById("adult-extra-row");
    if (pricing.adultExtraCost > 0) {
      adultExtraRow.style.display = "flex";
      document.getElementById("summary-adult-extra").textContent =
        "R" +
        pricing.adultExtraCost.toLocaleString() +
        " (" +
        pricing.extraAdults +
        " extra adult" +
        (pricing.extraAdults > 1 ? "s" : "") +
        ")";
    } else {
      adultExtraRow.style.display = "none";
    }
    const childExtraRow = document.getElementById("child-extra-row");
    if (pricing.childCost > 0) {
      childExtraRow.style.display = "flex";
      document.getElementById("summary-child-extra").textContent =
        "R" +
        pricing.childCost.toLocaleString() +
        " (" +
        pricing.children +
        " child" +
        (pricing.children > 1 ? "ren" : "") +
        ")";
    } else {
      childExtraRow.style.display = "none";
    }
    const discountRow = document.getElementById("discount-row");
    if (discountRow) discountRow.style.display = "none";
    document.getElementById("summary-total").textContent =
      "R" + pricing.totalPrice.toLocaleString();
    currentBookingData.price = pricing.totalPrice;
  }
}

function setupPriceListeners() {
  document
    .getElementById("adults")
    .addEventListener("change", updatePriceDisplay);
  document
    .getElementById("adults")
    .addEventListener("input", updatePriceDisplay);
  document
    .getElementById("children")
    .addEventListener("change", updatePriceDisplay);
  document
    .getElementById("children")
    .addEventListener("input", updatePriceDisplay);
}

// ============================================
// OPEN BOOKING FORM (Specific Bookings)
// ============================================
function openBookingForm(itemName, category, price, location, duration) {
  hideCustomFields();
  const numPrice = parseInt(price) || 0;
  currentBookingData = {
    itemName,
    category,
    price: numPrice,
    basePrice: numPrice,
    location,
    duration,
  };
  document.getElementById("booking-item-title").textContent =
    itemName + " - " + category;
  document.getElementById("summary-item").textContent = itemName;
  setFormDateConstraints(category, itemName);
  updateFormLabels(category);
  document.getElementById("booking-form-modal").style.display = "block";
  document.getElementById("booking-details-form").reset();
  document.getElementById("adults").value = 1;
  document.getElementById("children").value = 0;
  clearAllErrors();
  updatePriceDisplay();
}

// ============================================
// OPEN CUSTOM TRIP INQUIRY FORM
// ============================================
function openCustomTripForm() {
  currentBookingData = {
    itemName: "Custom Trip Inquiry",
    category: "Custom",
    price: 0,
    basePrice: 0,
    location: "To be determined",
    duration: "Flexible",
  };
  document.getElementById("booking-item-title").textContent =
    "Custom Trip Inquiry";
  document.getElementById("summary-item").textContent = "Custom Trip";
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("check-in").setAttribute("min", today);
  document.getElementById("check-out").setAttribute("min", today);
  updateFormLabels("custom");
  showCustomFields();
  document.getElementById("booking-form-modal").style.display = "block";
  document.getElementById("booking-details-form").reset();
  document.getElementById("adults").value = 1;
  document.getElementById("children").value = 0;
  clearAllErrors();
  updatePriceDisplay();
}

function hideCustomFields() {
  ["destination-group", "trip-type-group", "budget-group"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}

function showCustomFields() {
  createCustomField(
    "destination-group",
    "Preferred Destination",
    "destination",
    "text",
    "e.g., Bali, Morocco, Patagonia...",
    "special-requests",
    "before",
  );
  createCustomField(
    "trip-type-group",
    "Trip Type",
    "trip-type",
    "select",
    "",
    "destination-group",
    "after",
    [
      { value: "", text: "Select type..." },
      { value: "adventure", text: "Adventure" },
      { value: "hotel", text: "Hotel Stay" },
      { value: "flight", text: "Flight Only" },
      { value: "package", text: "Full Package" },
    ],
  );
  createCustomField(
    "budget-group",
    "Budget Range",
    "budget",
    "select",
    "",
    "trip-type-group",
    "after",
    [
      { value: "", text: "Select budget..." },
      { value: "0-5000", text: "Under R5,000" },
      { value: "5000-10000", text: "R5,000 - R10,000" },
      { value: "10000-20000", text: "R10,000 - R20,000" },
      { value: "20000-50000", text: "R20,000 - R50,000" },
      { value: "50000+", text: "R50,000+" },
    ],
  );
  ["destination-group", "trip-type-group", "budget-group"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "block";
  });
}

function createCustomField(
  id,
  label,
  inputId,
  type,
  placeholder,
  refId,
  position,
  options,
) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.className = "form-group";
    let html = '<label for="' + inputId + '">' + label + "</label>";
    if (type === "select" && options) {
      html += '<select id="' + inputId + '">';
      options.forEach((opt) => {
        html += '<option value="' + opt.value + '">' + opt.text + "</option>";
      });
      html += "</select>";
    } else {
      html +=
        '<input type="' +
        type +
        '" id="' +
        inputId +
        '" placeholder="' +
        placeholder +
        '">';
    }
    el.innerHTML = html;
    const refEl = document.getElementById(refId);
    if (refEl) {
      if (position === "before") refEl.parentNode.insertBefore(el, refEl);
      else refEl.parentNode.insertBefore(el, refEl.nextSibling);
    }
  }
  el.style.display = "block";
  return el;
}

function setFormDateConstraints(category, itemName) {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  let minDate = todayStr;
  if (category.toLowerCase() === "deal") {
    if (itemName.includes("Early Bird")) {
      const earlyBirdDate = new Date(today);
      earlyBirdDate.setDate(earlyBirdDate.getDate() + 60);
      minDate = earlyBirdDate.toISOString().split("T")[0];
    } else if (itemName.includes("Last Minute")) {
      const lastMinuteDate = new Date(today);
      lastMinuteDate.setDate(lastMinuteDate.getDate() + 14);
      minDate = lastMinuteDate.toISOString().split("T")[0];
    }
  }
  document.getElementById("check-in").setAttribute("min", minDate);
  document.getElementById("check-out").setAttribute("min", minDate);
}

function updateFormLabels(category) {
  const checkInLabel = document.querySelector('label[for="check-in"]');
  const checkOutLabel = document.querySelector('label[for="check-out"]');
  const adultsLabel = document.querySelector('label[for="adults"]');
  switch (category.toLowerCase()) {
    case "flight":
      if (checkInLabel) checkInLabel.textContent = "Departure Date";
      if (checkOutLabel) checkOutLabel.textContent = "Return Date";
      if (adultsLabel) adultsLabel.textContent = "Adult Tickets (12+ years)";
      break;
    case "hotel":
      if (checkInLabel) checkInLabel.textContent = "Check-in Date";
      if (checkOutLabel) checkOutLabel.textContent = "Check-out Date";
      if (adultsLabel) adultsLabel.textContent = "Adults (12+ years)";
      break;
    case "custom":
      if (checkInLabel) checkInLabel.textContent = "Preferred Start Date";
      if (checkOutLabel) checkOutLabel.textContent = "Preferred End Date";
      if (adultsLabel) adultsLabel.textContent = "Number of Travelers";
      break;
    default:
      if (checkInLabel) checkInLabel.textContent = "Start Date";
      if (checkOutLabel) checkOutLabel.textContent = "End Date";
      if (adultsLabel) adultsLabel.textContent = "Adults (12+ years)";
  }
}

function clearAllErrors() {
  document.querySelectorAll(".error-message").forEach((el) => {
    el.textContent = "";
    el.classList.remove("show");
  });
  document
    .querySelectorAll(".form-group input, .form-group textarea")
    .forEach((el) => el.classList.remove("error", "valid"));
}

function closeBookingForm() {
  document.getElementById("booking-form-modal").style.display = "none";
}

// ============================================
// SUBMIT BOOKING FORM
// ============================================
function submitBookingForm(event) {
  if (event) event.preventDefault();
  const fullName = document.getElementById("full-name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const checkIn = document.getElementById("check-in").value;
  const checkOut = document.getElementById("check-out").value;

  const nameError = validateFullName(fullName);
  const emailError = validateEmail(email);
  const phoneError = validatePhone(phone);
  const checkInError = validateCheckIn(checkIn);
  const checkOutError = validateCheckOut(checkIn, checkOut);

  showFieldError("name-error", nameError);
  toggleFieldClass(document.getElementById("full-name"), nameError);
  showFieldError("email-error", emailError);
  toggleFieldClass(document.getElementById("email"), emailError);
  showFieldError("phone-error", phoneError);
  toggleFieldClass(document.getElementById("phone"), phoneError);
  showFieldError("checkin-error", checkInError);
  toggleFieldClass(document.getElementById("check-in"), checkInError);
  showFieldError("checkout-error", checkOutError);
  toggleFieldClass(document.getElementById("check-out"), checkOutError);

  if (nameError || emailError || phoneError || checkInError || checkOutError) {
    const firstError = document.querySelector(".error-message.show");
    if (firstError)
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  let formData = {
    fullName: fullName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    checkIn,
    checkOut,
    adults: document.getElementById("adults").value,
    children: document.getElementById("children").value,
    specialRequests: document.getElementById("special-requests").value.trim(),
  };

  const destinationEl = document.getElementById("destination");
  const tripTypeEl = document.getElementById("trip-type");
  const budgetEl = document.getElementById("budget");

  if (destinationEl && destinationEl.style.display !== "none") {
    formData.isCustomTrip = true;
    formData.destination = destinationEl.value.trim();
    formData.tripType = tripTypeEl ? tripTypeEl.value : "";
    formData.budget = budgetEl ? budgetEl.value : "";
  }

  closeBookingForm();
  generateBookingPDF(formData);
}

// ============================================
// PDF GENERATION
// ============================================
function generateBookingPDF(formData) {
  showProcessingModal();
  const bookingCode = generateBookingCode();
  const pricing = calculateTotalPrice();
  const bookingDate = new Date().toLocaleDateString("en-ZA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  setTimeout(() => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    let y = 20;

    // ============================================
    // HEADER
    // ============================================
    doc.setFillColor(40, 40, 40);
    doc.rect(0, 0, pageWidth, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("VOYA BITE", pageWidth / 2, 15, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      formData.isCustomTrip ? "TRIP INQUIRY" : "BOOKING CONFIRMATION",
      pageWidth / 2,
      24,
      { align: "center" },
    );

    // ============================================
    // BOOKING CODE + STATUS
    // ============================================
    y = 46;
    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(0.5);
    doc.rect(margin, y - 4, pageWidth - margin * 2, 16);
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y - 4, pageWidth - margin * 2, 16, "F");
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("BOOKING CODE:", margin + 4, y + 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(bookingCode, margin + 4, y + 7);

    if (!formData.isCustomTrip) {
      doc.setTextColor(39, 174, 96);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("CONFIRMED", pageWidth - margin - 4, y + 4, { align: "right" });
    } else {
      doc.setTextColor(230, 126, 34);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("PENDING REVIEW", pageWidth - margin - 4, y + 4, {
        align: "right",
      });
    }

    // ============================================
    // GUEST DETAILS
    // ============================================
    y = 74;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("GUEST DETAILS", margin, y);
    y += 4;
    doc.setDrawColor(40, 40, 40);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    doc.setFontSize(9);

    const guestData = [
      ["Name:", formData.fullName],
      ["Email:", formData.email],
      ["Phone:", formData.phone],
    ];
    guestData.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, margin + 32, y);
      y += 7;
    });

    // ============================================
    // TRIP / INQUIRY DETAILS
    // ============================================
    y += 4;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(
      formData.isCustomTrip ? "INQUIRY DETAILS" : "TRIP DETAILS",
      margin,
      y,
    );
    y += 4;
    doc.setDrawColor(40, 40, 40);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    doc.setFontSize(9);

    if (formData.isCustomTrip) {
      const inquiryData = [
        ["Trip Type:", formData.tripType || "Not specified"],
        ["Destination:", formData.destination || "Not specified"],
        ["Budget:", formData.budget || "Not specified"],
        [
          "Travelers:",
          formData.adults +
            " adult(s)" +
            (parseInt(formData.children) > 0
              ? ", " + formData.children + " child(ren)"
              : ""),
        ],
        ["Start Date:", formData.checkIn || "Not specified"],
        ["End Date:", formData.checkOut || "Not specified"],
        ["Inquiry Date:", bookingDate],
      ];
      inquiryData.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(value, margin + 38, y);
        y += 7;
      });
    } else {
      const tripData = [
        ["Trip:", currentBookingData.itemName],
        ["Category:", currentBookingData.category],
        ["Location:", currentBookingData.location],
        ["Duration:", currentBookingData.duration],
        [
          "Travelers:",
          formData.adults +
            " adult(s)" +
            (parseInt(formData.children) > 0
              ? ", " + formData.children + " child(ren)"
              : ""),
        ],
        ["Start Date:", formData.checkIn || "Not specified"],
        ["End Date:", formData.checkOut || "Not specified"],
        ["Booked On:", bookingDate],
      ];
      tripData.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, margin, y);
        doc.setFont("helvetica", "normal");
        doc.text(value, margin + 38, y);
        y += 7;
      });
    }

    // ============================================
    // PRICE / QUOTE SECTION
    // ============================================
    y += 4;
    if (!formData.isCustomTrip) {
      doc.setFillColor(245, 245, 245);

      if (pricing.isFlight) {
        let boxH = 16;
        if (pricing.adults > 1) boxH += 7;
        if (pricing.children > 0) boxH += 7;
        if (pricing.discount > 0) boxH += 14;
        boxH += 10;

        doc.rect(margin, y - 2, pageWidth - margin * 2, boxH, "F");
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Price per adult ticket:", margin + 3, y + 3);
        doc.setFont("helvetica", "normal");
        doc.text(
          "R" + pricing.adultTicketPrice.toLocaleString(),
          pageWidth - margin - 3,
          y + 3,
          { align: "right" },
        );

        if (pricing.adults > 1) {
          y += 7;
          doc.setFont("helvetica", "bold");
          doc.text(
            "Adult Tickets (" + pricing.adults + "x):",
            margin + 3,
            y + 3,
          );
          doc.setFont("helvetica", "normal");
          doc.text(
            "R" + pricing.totalAdultCost.toLocaleString(),
            pageWidth - margin - 3,
            y + 3,
            { align: "right" },
          );
        }
        if (pricing.children > 0) {
          y += 7;
          doc.setFont("helvetica", "bold");
          doc.text(
            "Child Tickets (" + pricing.children + "x, 25% off):",
            margin + 3,
            y + 3,
          );
          doc.setFont("helvetica", "normal");
          doc.text(
            "R" + pricing.totalChildCost.toLocaleString(),
            pageWidth - margin - 3,
            y + 3,
            { align: "right" },
          );
        }
        if (pricing.discount > 0) {
          y += 7;
          doc.setDrawColor(180, 180, 180);
          doc.line(margin + 3, y + 1, pageWidth - margin - 3, y + 1);
          doc.setTextColor(39, 174, 96);
          doc.setFont("helvetica", "bold");
          doc.text("Group Discount (10%):", margin + 3, y + 4);
          doc.text(
            "-R" + pricing.discount.toLocaleString(),
            pageWidth - margin - 3,
            y + 4,
            { align: "right" },
          );
        }
        y += 10;
        doc.setDrawColor(180, 180, 180);
        doc.line(margin + 3, y - 1, pageWidth - margin - 3, y - 1);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("TOTAL:", margin + 3, y + 4);
        doc.setFontSize(12);
        doc.text(
          "R" + pricing.totalPrice.toLocaleString(),
          pageWidth - margin - 3,
          y + 4,
          { align: "right" },
        );
      } else {
        let boxH = 16;
        if (pricing.adultExtraCost > 0) boxH += 7;
        if (pricing.childCost > 0) boxH += 7;
        boxH += 10;

        doc.rect(margin, y - 2, pageWidth - margin * 2, boxH, "F");
        doc.setTextColor(40, 40, 40);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Base Price:", margin + 3, y + 3);
        doc.setFont("helvetica", "normal");
        doc.text(
          "R" + pricing.basePrice.toLocaleString(),
          pageWidth - margin - 3,
          y + 3,
          { align: "right" },
        );

        if (pricing.adultExtraCost > 0) {
          y += 7;
          doc.setFont("helvetica", "bold");
          doc.text(
            "Extra Adults (" + pricing.extraAdults + "):",
            margin + 3,
            y + 3,
          );
          doc.setFont("helvetica", "normal");
          doc.text(
            "R" + pricing.adultExtraCost.toLocaleString(),
            pageWidth - margin - 3,
            y + 3,
            { align: "right" },
          );
        }
        if (pricing.childCost > 0) {
          y += 7;
          doc.setFont("helvetica", "bold");
          doc.text("Children (" + pricing.children + "):", margin + 3, y + 3);
          doc.setFont("helvetica", "normal");
          doc.text(
            "R" + pricing.childCost.toLocaleString(),
            pageWidth - margin - 3,
            y + 3,
            { align: "right" },
          );
        }
        y += 10;
        doc.setDrawColor(180, 180, 180);
        doc.line(margin + 3, y - 1, pageWidth - margin - 3, y - 1);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text("TOTAL:", margin + 3, y + 4);
        doc.setFontSize(12);
        doc.text(
          "R" + pricing.totalPrice.toLocaleString(),
          pageWidth - margin - 3,
          y + 4,
          { align: "right" },
        );
      }
    } else {
      doc.setFillColor(255, 243, 205);
      doc.rect(margin, y - 2, pageWidth - margin * 2, 13, "F");
      doc.setTextColor(150, 100, 0);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(
        "A travel specialist will contact you within 24 hours with a personalized quote.",
        margin + 4,
        y + 3,
      );
    }

    // ============================================
    // IMPORTANT INFORMATION
    // ============================================
    y += 16;
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("IMPORTANT INFORMATION", margin, y);
    y += 4;
    doc.setDrawColor(40, 40, 40);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);

    const info = formData.isCustomTrip
      ? [
          "A travel specialist will review your inquiry and contact you shortly.",
          "This is not a confirmed booking - it is an inquiry only.",
          "For immediate assistance, contact support@voyabite.com",
          "Please save this reference code for your records.",
        ]
      : [
          "Please save this booking code for future reference.",
          "Present this booking code and valid ID at check-in.",
          "Free cancellation up to 48 hours before start date.",
          "For changes or assistance, contact support@voyabite.com",
        ];
    info.forEach((line) => {
      doc.text(line, margin, y);
      y += 6;
    });

    // ============================================
    // FOOTER (fixed at bottom of page)
    // ============================================
    doc.setFillColor(40, 40, 40);
    doc.rect(0, pageHeight - 18, pageWidth, 18, "F");
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(7);
    doc.text(
      "Voya Bite Travel Solutions | support@voyabite.com | +27 800 123 456",
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" },
    );
    doc.text(
      "Computer-generated document - no signature required.",
      pageWidth / 2,
      pageHeight - 5,
      { align: "center" },
    );

    doc.save(
      "VoyaBite-" +
        (formData.isCustomTrip ? "Inquiry" : "Booking") +
        "-" +
        bookingCode +
        ".pdf",
    );
    updateModalWithCode(bookingCode, formData);
  }, 1000);
}

// ============================================
// MODAL FUNCTIONS
// ============================================
function showProcessingModal() {
  document.getElementById("booking-modal").style.display = "block";
  document.getElementById("booking-modal-body").innerHTML =
    '<div class="booking-confirmation"><div class="booking-loader"></div><h2>Processing Your ' +
    (currentBookingData.category === "Custom" ? "Inquiry" : "Booking") +
    "</h2><p><strong>" +
    currentBookingData.itemName +
    "</strong></p><p>" +
    currentBookingData.category +
    "</p><p>" +
    currentBookingData.location +
    "</p><p>Generating your confirmation...</p></div>";
}

function updateModalWithCode(bookingCode, formData) {
  const pricing = calculateTotalPrice();
  let pd = "";

  if (formData.isCustomTrip) {
    pd += "<p><strong>Custom Trip Inquiry</strong></p>";
    pd += "<p>Destination: " + (formData.destination || "TBD") + "</p>";
    pd += "<p>Type: " + (formData.tripType || "Not specified") + "</p>";
    pd += "<p>" + (formData.checkIn || "Date TBD") + "</p>";
    pd +=
      "<p>Travelers: " +
      formData.adults +
      " adult" +
      (formData.adults > 1 ? "s" : "") +
      (parseInt(formData.children) > 0
        ? " + " +
          formData.children +
          " child" +
          (formData.children > 1 ? "ren" : "")
        : "") +
      "</p>";
  } else {
    pd += "<p><strong>" + currentBookingData.itemName + "</strong></p>";
    pd += "<p>" + currentBookingData.location + "</p>";
    pd += "<p>" + (formData.checkIn || "Date TBD") + "</p>";
    if (pricing.isFlight) {
      pd +=
        "<p>" +
        formData.adults +
        " adult ticket" +
        (formData.adults > 1 ? "s" : "") +
        (parseInt(formData.children) > 0
          ? " + " +
            formData.children +
            " child ticket" +
            (formData.children > 1 ? "s" : "")
          : "") +
        "</p>";
    } else {
      pd +=
        "<p>" +
        formData.adults +
        " adult" +
        (formData.adults > 1 ? "s" : "") +
        (parseInt(formData.children) > 0
          ? " + " +
            formData.children +
            " child" +
            (formData.children > 1 ? "ren" : "")
          : "") +
        "</p>";
    }
    pd +=
      "<p><strong>R" +
      currentBookingData.price.toLocaleString() +
      "</strong></p>";
  }

  const title = formData.isCustomTrip
    ? "Inquiry Submitted"
    : "Booking Confirmed";
  const icon = formData.isCustomTrip ? "&#9993;" : "&#10003;";
  const note1 = formData.isCustomTrip
    ? "Your trip inquiry has been submitted. A travel specialist will contact you within 24 hours."
    : "Your booking PDF has been downloaded automatically.";

  document.getElementById("booking-modal-body").innerHTML =
    '<div class="booking-confirmation"><div class="booking-success-icon">' +
    icon +
    "</div><h2>" +
    title +
    "</h2><p>Thank you, <strong>" +
    formData.fullName +
    '</strong></p><div class="booking-code-display"><p>Your Reference Code:</p><h3>' +
    bookingCode +
    '</h3></div><div class="booking-details-summary">' +
    pd +
    '</div><p class="booking-note">' +
    note1 +
    '</p><button class="btn" onclick="closeModal()">Done</button></div>';
}

function closeModal() {
  document.getElementById("booking-modal").style.display = "none";
}

window.onclick = function (event) {
  if (event.target == document.getElementById("booking-form-modal"))
    document.getElementById("booking-form-modal").style.display = "none";
  if (event.target == document.getElementById("booking-modal"))
    document.getElementById("booking-modal").style.display = "none";
};

// ============================================
// INITIALIZE
// ============================================
setupRealTimeValidation();
setupPriceListeners();

// ============================================
// BACK TO TOP
// ============================================
const backToTopBtn = document.getElementById("sv-back-to-top");
window.addEventListener("scroll", () => {
  backToTopBtn.classList.toggle("visible", window.scrollY > 500);
});
backToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
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
    const cardLocation = (card.dataset.location || "").toLowerCase();
    let showCard = true;
    if (searchTerm && !cardLocation.includes(searchTerm)) showCard = false;
    if (region && cardRegion !== region) showCard = false;
    if (type && cardCategory !== type) showCard = false;
    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      if (cardPrice < min || cardPrice > max) showCard = false;
    }
    card.style.display = showCard ? "" : "none";
    if (showCard) totalVisibleCards++;
  });
  document.querySelectorAll(".sv-section").forEach((section) => {
    const visibleCards = section.querySelectorAll(
      '.sv-card:not([style*="display: none"]), .sv-deal-card:not([style*="display: none"])',
    );
    section.style.display = visibleCards.length === 0 ? "none" : "";
  });
  handleNoResultsMessage(totalVisibleCards);
});

function handleNoResultsMessage(visibleCount) {
  const existingMessage = document.getElementById("sv-no-results");
  if (existingMessage) existingMessage.remove();
  if (visibleCount === 0) {
    const msg = document.createElement("div");
    msg.id = "sv-no-results";
    msg.className = "sv-no-results";
    msg.innerHTML =
      '<div class="sv-no-results-content"><h3>No Results Available</h3><p>No matches found for your current filters. Try adjusting your search criteria or clearing the filters.</p><button id="sv-clear-filters">Clear All Filters</button></div>';
    document
      .getElementById("sv-filter-bar")
      .parentNode.insertBefore(
        msg,
        document.getElementById("sv-filter-bar").nextSibling,
      );
    document
      .getElementById("sv-clear-filters")
      .addEventListener("click", clearAllFilters);
  }
}

function clearAllFilters() {
  document.getElementById("sv-search").value = "";
  document.getElementById("sv-region-filter").value = "";
  document.getElementById("sv-type-filter").value = "";
  document.getElementById("sv-price-filter").value = "";
  document
    .querySelectorAll(".sv-card, .sv-deal-card")
    .forEach((card) => (card.style.display = ""));
  document
    .querySelectorAll(".sv-section")
    .forEach((section) => (section.style.display = ""));
  const msg = document.getElementById("sv-no-results");
  if (msg) msg.remove();
}

// ============================================
// MOBILE MENU
// ============================================
document.getElementById("menu-btn").addEventListener("click", () => {
  document.getElementById("nav-links").classList.toggle("active");
});

// ============================================
// LIVE SEARCH
// ============================================
document.getElementById("sv-search").addEventListener("input", () => {
  clearTimeout(window.searchTimeout);
  window.searchTimeout = setTimeout(() => {
    document.getElementById("sv-filter-btn").click();
  }, 400);
});
