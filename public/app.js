// Simple helper for scrolling to sections
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 70;
  window.scrollTo({ top: y, behavior: "smooth" });
}

// Toast message
const globalMessage = document.getElementById("globalMessage");
let toastTimeout = null;

function showToast(message, type = "info", duration = 5000) {
  if (!globalMessage) return;

  globalMessage.textContent = message;
  globalMessage.classList.remove("pmh-toast-error", "pmh-toast-success");
  if (type === "error") globalMessage.classList.add("pmh-toast-error");
  if (type === "success") globalMessage.classList.add("pmh-toast-success");

  globalMessage.hidden = false;

  if (toastTimeout) clearTimeout(toastTimeout);
  if (duration) {
    toastTimeout = setTimeout(() => {
      globalMessage.hidden = true;
    }, duration);
  }
}

// DOM elements
const durationInput = document.getElementById("duration");
const durationValue = document.getElementById("durationValue");
const generateBtn = document.getElementById("generateBtn");
const imageFileInput = document.getElementById("imageFile");
const imageUrlInput = document.getElementById("imageUrl");
const promptInput = document.getElementById("prompt");
const statusText = document.getElementById("statusText");
const spinner = document.getElementById("spinner");
const resultContainer = document.getElementById("resultContainer");
const resultVideo = document.getElementById("resultVideo");
const downloadLink = document.getElementById("downloadLink");
const heroGeneratorBtn = document.getElementById("heroGeneratorBtn");
const heroPricingBtn = document.getElementById("heroPricingBtn");
const getCreditsBtn = document.getElementById("getCreditsBtn");

// Duration label
if (durationInput && durationValue) {
  durationInput.addEventListener("input", () => {
    durationValue.textContent = `${durationInput.value}s`;
  });
}

// Scroll buttons
heroGeneratorBtn?.addEventListener("click", () => scrollToId("generator"));
heroPricingBtn?.addEventListener("click", () => scrollToId("pricing"));

// Year
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Helper: convert File -> base64 data URL
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// Video generation
async function handleGenerate() {
  if (!generateBtn) return;

  const prompt = (promptInput?.value || "").trim();
  const duration = Number(durationInput?.value || 5);
  const imageFile = imageFileInput?.files?.[0] || null;
  const imageUrl = (imageUrlInput?.value || "").trim();

  if (!prompt) {
    showToast("Please enter a motion prompt.", "error");
    return;
  }
  if (!imageFile && !imageUrl) {
    showToast("Upload an image or paste an image URL first.", "error");
    return;
  }

  let body = { prompt, duration };
  if (imageFile) {
    try {
      const dataUrl = await fileToDataUrl(imageFile);
      body.image = dataUrl;
      body.mimeType = imageFile.type || "image/png";
    } catch (err) {
      console.error(err);
      showToast("Could not read the image file.", "error");
      return;
    }
  } else if (imageUrl) {
    body.imageUrl = imageUrl;
  }

  // UI state
  generateBtn.disabled = true;
  generateBtn.textContent = "Generating…";
  spinner.hidden = false;
  resultContainer.hidden = true;
  statusText.textContent = "We’re generating your clip. This usually takes under a minute…";

  try {
    const res = await fetch("/api/generate-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg = errJson.error || "Unexpected error from video generator.";
      throw new Error(msg);
    }

    const data = await res.json();
    const { videoUrl, contentType } = data;

    if (!videoUrl) {
      throw new Error("Server did not return a video URL.");
    }

    resultVideo.src = videoUrl;
    resultVideo.type = contentType || "video/mp4";
    resultContainer.hidden = false;
    statusText.textContent = "Done! You can play or download your video.";
    downloadLink.href = videoUrl;

    showToast("Video generated successfully ✅", "success", 4500);
  } catch (err) {
    console.error("Generate error:", err);
    showToast(err.message || "Failed to generate video.", "error");
    statusText.textContent = "Something went wrong. Please try again.";
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate Video";
    spinner.hidden = true;
  }
}

generateBtn?.addEventListener("click", () => {
  handleGenerate();
});

// Stripe checkout
async function startStripeCheckout(plan) {
  try {
    showToast("Opening secure Stripe checkout…", "info", 3000);

    const res = await fetch(`/api/checkout/stripe/session?plan=${encodeURIComponent(plan)}`, {
      method: "POST"
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || "Stripe checkout failed.");
    }

    const data = await res.json();
    if (!data.url) throw new Error("Stripe did not return a redirect URL.");
    window.location.href = data.url;
  } catch (err) {
    console.error("Stripe error:", err);
    showToast(err.message || "Unable to start Stripe checkout.", "error");
  }
}

// PayPal checkout
async function startPayPalCheckout(plan) {
  try {
    showToast("Redirecting to PayPal…", "info", 3000);

    const res = await fetch(`/api/checkout/paypal/create?plan=${encodeURIComponent(plan)}`, {
      method: "POST"
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || "PayPal checkout failed.");
    }

    const data = await res.json();
    if (!data.approvalUrl) throw new Error("PayPal did not return an approval URL.");
    window.location.href = data.approvalUrl;
  } catch (err) {
    console.error("PayPal error:", err);
    showToast(err.message || "Unable to start PayPal checkout.", "error");
  }
}

// Attach plan buttons
document.querySelectorAll("[data-stripe-plan]").forEach(btn => {
  btn.addEventListener("click", () => {
    const plan = btn.getAttribute("data-stripe-plan");
    if (plan) startStripeCheckout(plan);
  });
});

document.querySelectorAll("[data-paypal-plan]").forEach(btn => {
  btn.addEventListener("click", () => {
    const plan = btn.getAttribute("data-paypal-plan");
    if (plan) startPayPalCheckout(plan);
  });
});

// Header "Get Credits" -> Stripe starter
getCreditsBtn?.addEventListener("click", () => {
  startStripeCheckout("starter");
});
