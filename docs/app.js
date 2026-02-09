const CONFIG = {
  brandName: "Hola Mar",
  scriptUrl: "",
  retentionDays: 30
};

const state = {
  sessionId: crypto.randomUUID(),
  step: "await_name",
  lang: "es",
  consent: false,
  createdAt: null,
  lead: {
    name: "",
    phone: "",
    role: "",
    language: "",
    agent: "",
    criteria: {},
    summary: ""
  },
  transcript: [],
  properties: []
};

const elements = {
  chatBody: document.getElementById("chat-body"),
  chatForm: document.getElementById("chat-form"),
  chatInput: document.getElementById("chat-input"),
  sendBtn: document.getElementById("send-btn"),
  quickReplies: document.getElementById("quick-replies"),
  consentPanel: document.getElementById("consent-panel"),
  consentCheckbox: document.getElementById("consent-checkbox"),
  consentContinue: document.getElementById("consent-continue"),
  welcomeTitle: document.getElementById("welcome-title"),
  welcomeSubtitle: document.getElementById("welcome-subtitle"),
  agentName: document.getElementById("agent-name"),
  agentAvatar: document.getElementById("agent-avatar"),
  progressText: document.getElementById("progress-text"),
  progressFill: document.getElementById("progress-fill")
};

const messages = {
  es: {
    welcome:
      "Hola, somos Hola Mar. Te ayudamos con tu compra o venta inmobiliaria.",
    intro: "Será rápido: 3 preguntas y te mostramos opciones reales.",
    askName: "¿Cómo te llamas?",
    afterName: (name) => `Encantados, ${name}.`,
    askPhone: "¿Nos compartes un teléfono de contacto? (WhatsApp o llamada)",
    phoneWhy:
      "Lo pedimos para que nuestro equipo te contacte por WhatsApp o llamada en cuanto esté disponible.",
    consentNeeded:
      "Necesitamos tu permiso para guardar esta conversación y que nuestro equipo la revise.",
    consentThanks: "¡Perfecto, gracias!",
    askRole: "¿Qué necesitas hoy?",
    buyer: "Comprar",
    seller: "Vender",
    renter: "Alquilar",
    askLocation: "¿En qué zona o ciudad buscas?",
    askBudget: "¿Cuál es tu presupuesto máximo aproximado?",
    askBedrooms: "¿Cuántas habitaciones mínimo?",
    askRentLocation: "¿En qué zona o ciudad quieres alquilar?",
    askRentBudget: "¿Cuál es tu presupuesto mensual aproximado?",
    askRentBedrooms: "¿Cuántas habitaciones mínimo?",
    askSellerLocation: "¿En qué zona está la propiedad?",
    askSellerType: "¿Qué tipo de propiedad es?",
    askSellerPrice: "¿Precio aproximado de venta?",
    noMatches:
      "Ahora mismo no tenemos opciones exactas en la base. Nuestro equipo revisará tu caso.",
    matchesIntro: (count) => `Encontramos ${count} opciones que encajan:`,
    finishBuyer:
      "Si alguna te interesa, dime el código y te contactamos.",
    finishRent:
      "Si alguna te interesa, dime el código y te contactamos.",
    finishSeller:
      "Gracias. Nuestro equipo te contactará para ayudarte con la venta.",
    invalidPhone: "Escríbenos un teléfono válido con números.",
    invalidNumber: "Escribe un número válido, por favor.",
    restricted:
      "Solo podemos ayudar con compra o venta de vivienda y datos de nuestras propiedades.",
    keepGoing: "Lo anotamos. ¿Algo más que debamos saber?"
  },
  en: {
    welcome: "Hi, we're Hola Mar. We help you buy or sell property.",
    intro: "Quick and easy: 3 questions and we’ll show real options.",
    askName: "What's your name?",
    afterName: (name) => `Nice to meet you, ${name}.`,
    askPhone: "May we have a contact phone? (WhatsApp or call)",
    phoneWhy:
      "We ask for it so our team can contact you by WhatsApp or call when available.",
    consentNeeded:
      "We need your permission to store this chat and let our team review it.",
    consentThanks: "Perfect, thanks.",
    askRole: "What do you need today?",
    buyer: "Buy",
    seller: "Sell",
    renter: "Rent",
    askLocation: "Which area or city are you looking in?",
    askBudget: "What's your maximum budget (approx.)?",
    askBedrooms: "Minimum number of bedrooms?",
    askRentLocation: "Which area or city do you want to rent in?",
    askRentBudget: "What's your monthly budget (approx.)?",
    askRentBedrooms: "Minimum number of bedrooms?",
    askSellerLocation: "Where is the property located?",
    askSellerType: "What type of property is it?",
    askSellerPrice: "Approximate asking price?",
    noMatches:
      "I don't see exact matches right now. Our team will review your case.",
    matchesIntro: (count) => `We found ${count} options that match:`,
    finishBuyer: "If any interest you, share the code and we’ll contact you.",
    finishRent: "If any interest you, share the code and we’ll contact you.",
    finishSeller: "Thanks. Our team will contact you to help with the sale.",
    invalidPhone: "Please enter a valid phone number.",
    invalidNumber: "Please enter a valid number.",
    restricted:
      "I can only help with buying/selling property and our listings.",
    keepGoing: "Got it. Anything else we should know?"
  }
};

const placeholders = {
  es: {
    await_name: "Tu nombre",
    await_phone: "Tu teléfono",
    await_role: "Comprar o vender",
    await_location: "Zona o ciudad",
    await_budget: "Presupuesto (ej: 250000)",
    await_bedrooms: "Habitaciones (ej: 2)",
    await_rent_location: "Zona o ciudad",
    await_rent_budget: "Presupuesto mensual (ej: 900)",
    await_rent_bedrooms: "Habitaciones (ej: 2)",
    await_seller_location: "Zona de la propiedad",
    await_seller_type: "Tipo de propiedad",
    await_seller_price: "Precio aproximado",
    done: "Escribe un detalle extra",
    default: "Escribe tu mensaje"
  },
  en: {
    await_name: "Your name",
    await_phone: "Your phone",
    await_role: "Buy or sell",
    await_location: "Area or city",
    await_budget: "Budget (e.g. 250000)",
    await_bedrooms: "Bedrooms (e.g. 2)",
    await_rent_location: "Area or city",
    await_rent_budget: "Monthly budget (e.g. 900)",
    await_rent_bedrooms: "Bedrooms (e.g. 2)",
    await_seller_location: "Property area",
    await_seller_type: "Property type",
    await_seller_price: "Approx. price",
    done: "Add an extra detail",
    default: "Type your message"
  }
};

const stepMeta = {
  await_name: { step: 1, label: "Tus datos" },
  await_phone: { step: 1, label: "Tus datos" },
  await_consent: { step: 1, label: "Privacidad" },
  await_role: { step: 2, label: "Compra o venta" },
  await_location: { step: 3, label: "Detalles" },
  await_budget: { step: 3, label: "Detalles" },
  await_bedrooms: { step: 3, label: "Detalles" },
  await_rent_location: { step: 3, label: "Alquiler" },
  await_rent_budget: { step: 3, label: "Alquiler" },
  await_rent_bedrooms: { step: 3, label: "Alquiler" },
  await_seller_location: { step: 3, label: "Detalles" },
  await_seller_type: { step: 3, label: "Detalles" },
  await_seller_price: { step: 3, label: "Detalles" },
  done: { step: 4, label: "Seguimiento" }
};

let botQueue = Promise.resolve();
let typingEl = null;

function t(key, ...args) {
  const value = messages[state.lang][key];
  return typeof value === "function" ? value(...args) : value;
}

function setLanguage(lang) {
  state.lang = lang;
  state.lead.language = lang;
  updatePlaceholder();
}

function setStep(step) {
  state.step = step;
  updateProgress();
  updatePlaceholder();
  if (step === "await_consent") {
    setInputEnabled(false);
  } else {
    setInputEnabled(true);
  }
}

function updatePlaceholder() {
  const ph =
    placeholders[state.lang]?.[state.step] ||
    placeholders[state.lang]?.default ||
    "Escribe tu mensaje";
  elements.chatInput.placeholder = ph;
}

function updateProgress() {
  const meta = stepMeta[state.step] || { step: 1, label: "" };
  elements.progressText.textContent = `Paso ${meta.step} de 4 · ${meta.label}`;
  elements.progressFill.style.width = `${(meta.step / 4) * 100}%`;
}

function setInputEnabled(enabled) {
  elements.chatInput.disabled = !enabled;
  elements.sendBtn.disabled = !enabled;
}

function addMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `msg ${role}`;
  msg.textContent = text;
  elements.chatBody.appendChild(msg);
  elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
  state.transcript.push({ role, text, ts: new Date().toISOString() });
}

function showTyping() {
  if (typingEl) return;
  typingEl = document.createElement("div");
  typingEl.className = "msg bot typing";
  typingEl.innerHTML = "<span></span><span></span><span></span>";
  elements.chatBody.appendChild(typingEl);
  elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
}

function hideTyping() {
  if (!typingEl) return;
  typingEl.remove();
  typingEl = null;
}

function addBotMessage(text) {
  const delay = 350 + Math.random() * 450;
  botQueue = botQueue.then(
    () =>
      new Promise((resolve) => {
        showTyping();
        setTimeout(() => {
          hideTyping();
          addMessage("bot", text);
          resolve();
        }, delay);
      })
  );
  return botQueue;
}

function showQuickReplies(options) {
  elements.quickReplies.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option.label;
    button.addEventListener("click", () => {
      handleUserMessage(option.value || option.label);
    });
    elements.quickReplies.appendChild(button);
  });
}

function clearQuickReplies() {
  elements.quickReplies.innerHTML = "";
}

function showConsentPanel(show) {
  if (!elements.consentPanel) return;
  elements.consentPanel.hidden = !show;
  if (show) {
    if (elements.consentCheckbox) {
      elements.consentCheckbox.checked = false;
    }
    if (elements.consentContinue) {
      elements.consentContinue.disabled = true;
    }
    setInputEnabled(false);
    clearQuickReplies();
  }
}

function detectLanguage(text) {
  const sample = text.toLowerCase();
  const esWords = [
    "hola",
    "buenas",
    "quiero",
    "busco",
    "comprar",
    "vender",
    "piso",
    "casa",
    "zona",
    "precio"
  ];
  const enWords = [
    "hello",
    "hi",
    "want",
    "looking",
    "buy",
    "sell",
    "house",
    "apartment",
    "price",
    "area"
  ];
  const esHit = esWords.some((word) => sample.includes(word));
  const enHit = enWords.some((word) => sample.includes(word));
  if (esHit && !enHit) return "es";
  if (enHit && !esHit) return "en";
  return navigator.language && navigator.language.startsWith("en") ? "en" : "es";
}

function containsRestrictedTopic(text) {
  const sample = text.toLowerCase();
  const banned = [
    "arma",
    "armas",
    "drog",
    "porn",
    "sexo",
    "nsfw",
    "política",
    "politica",
    "famos",
    "celebr",
    "ilegal",
    "delito"
  ];
  return banned.some((word) => sample.includes(word));
}

function looksLikeWhy(text) {
  const sample = text.toLowerCase();
  return (
    sample.includes("por qué") ||
    sample.includes("por que") ||
    sample.includes("para qué") ||
    sample.includes("para que")
  );
}

function extractPhone(text) {
  const digits = text.replace(/\D/g, "");
  if (digits.length < 7) return "";
  return digits;
}

function extractNumber(text) {
  const digits = text.replace(/\D/g, "");
  if (!digits) return null;
  return Number(digits);
}

function isBuyer(text) {
  const sample = text.toLowerCase();
  return sample.includes("compr") || sample.includes("buy");
}

function isSeller(text) {
  const sample = text.toLowerCase();
  return sample.includes("vend") || sample.includes("sell");
}

function isRenter(text) {
  const sample = text.toLowerCase();
  return sample.includes("alquil") || sample.includes("rent");
}

function updateSummary() {
  if (state.lead.role === "buyer") {
    const { location, maxPrice, minBedrooms } = state.lead.criteria;
    state.lead.summary = `Comprador · Zona: ${location || "-"} · Presupuesto: ${
      maxPrice || "-"
    }€ · Habitaciones: ${minBedrooms || "-"}`;
  }
  if (state.lead.role === "rent") {
    const { location, maxRent, minBedrooms } = state.lead.criteria;
    state.lead.summary = `Alquiler · Zona: ${location || "-"} · Presupuesto mensual: ${
      maxRent || "-"
    }€ · Habitaciones: ${minBedrooms || "-"}`;
  }
  if (state.lead.role === "seller") {
    const { location, propertyType, askingPrice } = state.lead.criteria;
    state.lead.summary = `Vendedor · Zona: ${location || "-"} · Tipo: ${
      propertyType || "-"
    } · Precio: ${askingPrice || "-"}`;
  }
}

async function sendLeadUpdate(reason) {
  if (!CONFIG.scriptUrl) return;
  const payload = {
    sessionId: state.sessionId,
    createdAt: state.createdAt,
    updatedAt: new Date().toISOString(),
    reason,
    lead: state.lead,
    transcript: state.transcript,
    source: window.location.href
  };
  try {
    await fetch(CONFIG.scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch {
    return;
  }
}

function formatProperty(property) {
  const isRent = state.lead.role === "rent";
  const value = isRent ? property.rent : property.price;
  const price = new Intl.NumberFormat(state.lang, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value || 0);
  const suffix = isRent ? " / mes" : "";
  return `${property.id} · ${property.title} · ${property.zone} · ${property.bedrooms} hab · ${price}${suffix}`;
}

function listMatches() {
  const { location, maxPrice, maxRent, minBedrooms } = state.lead.criteria;
  const isRent = state.lead.role === "rent";
  const matches = state.properties.filter((property) => {
    const category = property.category || "venta";
    if (isRent && category !== "alquiler") return false;
    if (!isRent && category !== "venta") return false;
    const locationOk = location
      ? property.zone.toLowerCase().includes(location.toLowerCase())
      : true;
    const value = isRent ? property.rent : property.price;
    const limit = isRent ? maxRent : maxPrice;
    const priceOk = limit ? value && value <= limit : true;
    const bedOk = minBedrooms ? property.bedrooms >= minBedrooms : true;
    return locationOk && priceOk && bedOk;
  });
  if (!matches.length) {
    addBotMessage(t("noMatches"));
    addBotMessage(isRent ? t("finishRent") : t("finishBuyer"));
    return;
  }
  addBotMessage(t("matchesIntro", matches.length));
  matches.slice(0, 5).forEach((property) => {
    addBotMessage(formatProperty(property));
  });
  addBotMessage(isRent ? t("finishRent") : t("finishBuyer"));
}

function handleRole(role) {
  state.lead.role = role;
  state.lead.criteria = {};
  updateSummary();
  clearQuickReplies();
  if (role === "buyer") {
    addBotMessage(t("askLocation"));
    setStep("await_location");
  } else if (role === "rent") {
    addBotMessage(t("askRentLocation"));
    setStep("await_rent_location");
  } else {
    addBotMessage(t("askSellerLocation"));
    setStep("await_seller_location");
  }
  sendLeadUpdate("role");
}

function finalizeConsent() {
  state.consent = true;
  state.lead.consent = true;
  if (elements.consentPanel) {
    elements.consentPanel.hidden = true;
    elements.consentPanel.remove();
  }
  setInputEnabled(true);
}

function handleConsentAccepted() {
  if (state.consent || state.step !== "await_consent") return;
  finalizeConsent();
  addBotMessage(t("consentThanks"));
  addBotMessage(t("askRole"));
  setStep("await_role");
  showQuickReplies([
    { label: t("buyer"), value: t("buyer") },
    { label: t("seller"), value: t("seller") }
  ]);
  sendLeadUpdate("consent");
}

function handleUserMessage(text) {
  const cleanText = text.trim();
  if (!cleanText) return;
  if (state.step === "await_consent") {
    addBotMessage(t("consentNeeded"));
    return;
  }
  addMessage("user", cleanText);
  if (!state.lead.language) {
    setLanguage(detectLanguage(cleanText));
  }
  if (containsRestrictedTopic(cleanText)) {
    addBotMessage(t("restricted"));
    return;
  }
  if (state.step === "await_name") {
    state.lead.name = cleanText;
    addBotMessage(t("afterName", cleanText));
    addBotMessage(t("askPhone"));
    setStep("await_phone");
    sendLeadUpdate("name");
    return;
  }
  if (state.step === "await_phone") {
    if (looksLikeWhy(cleanText)) {
      addBotMessage(t("phoneWhy"));
      return;
    }
    const phone = extractPhone(cleanText);
    if (!phone) {
      addBotMessage(t("invalidPhone"));
      return;
    }
    state.lead.phone = phone;
    showConsentPanel(true);
    setStep("await_consent");
    addBotMessage(t("consentNeeded"));
    sendLeadUpdate("phone");
    return;
  }
  if (state.step === "await_role") {
    if (isBuyer(cleanText)) {
      handleRole("buyer");
      return;
    }
    if (isRenter(cleanText)) {
      handleRole("rent");
      return;
    }
    if (isSeller(cleanText)) {
      handleRole("seller");
      return;
    }
    addBotMessage(t("askRole"));
    showQuickReplies([
      { label: t("buyer"), value: t("buyer") },
      { label: t("renter"), value: t("renter") },
      { label: t("seller"), value: t("seller") }
    ]);
    return;
  }
  if (state.step === "await_location") {
    state.lead.criteria.location = cleanText;
    updateSummary();
    addBotMessage(t("askBudget"));
    setStep("await_budget");
    sendLeadUpdate("location");
    return;
  }
  if (state.step === "await_rent_location") {
    state.lead.criteria.location = cleanText;
    updateSummary();
    addBotMessage(t("askRentBudget"));
    setStep("await_rent_budget");
    sendLeadUpdate("rent_location");
    return;
  }
  if (state.step === "await_budget") {
    const budget = extractNumber(cleanText);
    if (!budget) {
      addBotMessage(t("invalidNumber"));
      return;
    }
    state.lead.criteria.maxPrice = budget;
    updateSummary();
    addBotMessage(t("askBedrooms"));
    setStep("await_bedrooms");
    sendLeadUpdate("budget");
    return;
  }
  if (state.step === "await_rent_budget") {
    const budget = extractNumber(cleanText);
    if (!budget) {
      addBotMessage(t("invalidNumber"));
      return;
    }
    state.lead.criteria.maxRent = budget;
    updateSummary();
    addBotMessage(t("askRentBedrooms"));
    setStep("await_rent_bedrooms");
    sendLeadUpdate("rent_budget");
    return;
  }
  if (state.step === "await_bedrooms") {
    const bedrooms = extractNumber(cleanText);
    if (!bedrooms) {
      addBotMessage(t("invalidNumber"));
      return;
    }
    state.lead.criteria.minBedrooms = bedrooms;
    updateSummary();
    listMatches();
    setStep("done");
    sendLeadUpdate("criteria");
    return;
  }
  if (state.step === "await_rent_bedrooms") {
    const bedrooms = extractNumber(cleanText);
    if (!bedrooms) {
      addBotMessage(t("invalidNumber"));
      return;
    }
    state.lead.criteria.minBedrooms = bedrooms;
    updateSummary();
    listMatches();
    setStep("done");
    sendLeadUpdate("rent_criteria");
    return;
  }
  if (state.step === "await_seller_location") {
    state.lead.criteria.location = cleanText;
    updateSummary();
    addBotMessage(t("askSellerType"));
    setStep("await_seller_type");
    sendLeadUpdate("seller_location");
    return;
  }
  if (state.step === "await_seller_type") {
    state.lead.criteria.propertyType = cleanText;
    updateSummary();
    addBotMessage(t("askSellerPrice"));
    setStep("await_seller_price");
    sendLeadUpdate("seller_type");
    return;
  }
  if (state.step === "await_seller_price") {
    const price = extractNumber(cleanText);
    if (!price) {
      addBotMessage(t("invalidNumber"));
      return;
    }
    state.lead.criteria.askingPrice = price;
    updateSummary();
    addBotMessage(t("finishSeller"));
    setStep("done");
    sendLeadUpdate("seller_price");
    return;
  }
  if (state.step === "done") {
    state.lead.criteria.extra = cleanText;
    updateSummary();
    addBotMessage(t("keepGoing"));
    sendLeadUpdate("extra");
  }
}

async function loadProperties() {
  try {
    const response = await fetch("data/properties.json", {
      cache: "no-store"
    });
    if (!response.ok) return;
    const data = await response.json();
    state.properties = Array.isArray(data) ? data : [];
  } catch {
    state.properties = [];
  }
}

function setupBrand() {
  state.lead.agent = CONFIG.brandName;
  elements.agentName.textContent = CONFIG.brandName;
  elements.welcomeTitle.textContent = `Bienvenido a ${CONFIG.brandName}`;
  elements.welcomeSubtitle.textContent = "Atención inmobiliaria";
  elements.agentAvatar.textContent = CONFIG.brandName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function startConversation() {
  setLanguage(
    navigator.language && navigator.language.startsWith("en") ? "en" : "es"
  );
  setStep("await_name");
  state.createdAt = new Date().toISOString();
  addBotMessage(t("welcome"));
  addBotMessage(t("intro"));
  addBotMessage(t("askName"));
  sendLeadUpdate("start");
}

elements.chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = elements.chatInput.value;
  elements.chatInput.value = "";
  if (state.step === "await_consent") {
    addBotMessage(t("consentNeeded"));
    return;
  }
  handleUserMessage(text);
});

elements.consentCheckbox?.addEventListener("change", () => {
  if (elements.consentContinue) {
    elements.consentContinue.disabled = !elements.consentCheckbox.checked;
  }
});

elements.consentContinue?.addEventListener("click", () => {
  if (!elements.consentCheckbox.checked) {
    addBotMessage(t("consentNeeded"));
    return;
  }
  handleConsentAccepted();
});

setupBrand();
loadProperties();
startConversation();
