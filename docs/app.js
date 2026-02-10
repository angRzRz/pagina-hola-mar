const CONFIG = {
  brandName: "Hola Mar",
  scriptUrl: "",
  retentionDays: 30,
  agents: {
    general: {
      name: "Equipo Hola Mar",
      photo: "logo.png"
    }
  }
};

const state = {
  sessionId: crypto.randomUUID(),
  step: "await_name",
  lang: "es",
  consent: false,
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
  quickReplies: document.getElementById("quick-replies"),
  consentPanel: document.getElementById("consent-panel"),
  consentCheckbox: document.getElementById("consent-checkbox"),
  consentContinue: document.getElementById("consent-continue"),
  consentText: document.getElementById("consent-text"),
  welcomeTitle: document.getElementById("welcome-title"),
  welcomeSubtitle: document.getElementById("welcome-subtitle"),
  agentName: document.getElementById("agent-name"),
  agentAvatar: document.getElementById("agent-avatar")
};

const messages = {
  es: {
    welcome: (agent) =>
      agent
        ? `Soy ${agent}, ¿en qué puedo ayudarte?`
        : "Soy el asistente de Hola Mar, ¿en qué puedo ayudarte?",
    askName: "Para empezar, ¿cómo te llamas?",
    askPhone:
      "Gracias. ¿Cuál es tu número de teléfono? Lo usaremos para que el agente te contacte cuando esté disponible.",
    phoneWhy:
      "Lo pedimos para que un agente te contacte por WhatsApp o llamada en cuanto esté disponible.",
    consentNeeded:
      "Antes de continuar, necesito que aceptes la Política de Privacidad.",
    askRole: "¿Eres comprador o vendedor?",
    askCategory: "¿Buscas comprar o alquilar?",
    buy: "Comprar",
    rent: "Alquilar",
    buyer: "Comprador",
    seller: "Vendedor",
    askLocation: "¿En qué zona o ciudad te interesa?",
    askBudgetBuy: "¿Cuál es tu presupuesto máximo para comprar en euros?",
    askBudgetRent: "¿Cuál es tu presupuesto máximo de alquiler al mes?",
    askBedrooms: "¿Cuántas habitaciones mínimo necesitas?",
    askSellerLocation: "¿En qué zona está tu propiedad?",
    askSellerType: "¿Qué tipo de propiedad quieres vender?",
    noMatches:
      "Ahora mismo no tengo viviendas que encajen con esos criterios. Un agente te contactará con opciones.",
    matchesIntro: "Estas viviendas encajan con lo que buscas:",
    finishBuyer:
      "Gracias, un agente te contactará en cuanto esté disponible.",
    finishSeller:
      "Gracias, un agente te contactará para ayudarte con la venta.",
    invalidPhone: "Necesito un teléfono válido con dígitos.",
    invalidNumber: "Escribe un número válido, por favor.",
    restricted:
      "No puedo ayudar con ese tema. Puedo ayudarte con vivienda, compra o venta.",
    keepGoing:
      "Un agente te contactará en cuanto esté disponible. ¿Quieres añadir algún detalle más?"
  },
  en: {
    welcome: (agent) =>
      agent
        ? `I'm ${agent}. How can I help you?`
        : "I'm the Hola Mar assistant. How can I help you?",
    askName: "To start, what's your name?",
    askPhone:
      "Thanks. What's your phone number? We'll use it so an agent can contact you when available.",
    phoneWhy:
      "We ask for it so an agent can contact you by WhatsApp or call as soon as possible.",
    consentNeeded: "Please accept the Privacy Policy to continue.",
    askRole: "Are you buying or selling?",
    askCategory: "Are you looking to buy or rent?",
    buy: "Buy",
    rent: "Rent",
    buyer: "Buyer",
    seller: "Seller",
    askLocation: "Which area or city are you interested in?",
    askBudgetBuy: "What's your maximum purchase budget in euros?",
    askBudgetRent: "What's your maximum monthly rent in euros?",
    askBedrooms: "Minimum number of bedrooms?",
    askSellerLocation: "Where is your property located?",
    askSellerType: "What type of property are you selling?",
    noMatches:
      "I don't have matching homes right now. An agent will contact you with options.",
    matchesIntro: "These homes match your criteria:",
    finishBuyer:
      "Thanks, an agent will contact you as soon as they are available.",
    finishSeller: "Thanks, an agent will contact you to help with the sale.",
    invalidPhone: "Please enter a valid phone number with digits.",
    invalidNumber: "Please enter a valid number.",
    restricted:
      "I can't help with that topic. I can help with homes, buying or selling.",
    keepGoing:
      "An agent will contact you when available. Do you want to add more details?"
  }
};

function setLanguage(lang) {
  state.lang = lang;
  state.lead.language = lang;
}

function getText(key) {
  return messages[state.lang][key];
}

function addMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `msg ${role}`;
  msg.textContent = text;
  elements.chatBody.appendChild(msg);
  elements.chatBody.scrollTop = elements.chatBody.scrollHeight;
  state.transcript.push({ role, text, ts: new Date().toISOString() });
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
  elements.consentPanel.hidden = !show;
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

function isRent(text) {
  const sample = text.toLowerCase();
  return (
    sample.includes("alquil") ||
    sample.includes("rent") ||
    sample.includes("renta") ||
    sample.includes("lease")
  );
}

function updateSummary() {
  if (state.lead.role === "buyer") {
    const { location, maxPrice, minBedrooms, category } = state.lead.criteria;
    const operation = category === "alquiler" ? "Alquiler" : "Compra";
    const budgetLabel = category === "alquiler" ? "Alquiler" : "Presupuesto";
    state.lead.summary = `Comprador · Operación: ${operation} · Zona: ${
      location || "-"
    } · ${budgetLabel}: ${maxPrice || "-"}€ · Habitaciones: ${
      minBedrooms || "-"
    }`;
  }
  if (state.lead.role === "seller") {
    const { location, propertyType } = state.lead.criteria;
    state.lead.summary = `Vendedor · Zona: ${location || "-"} · Tipo: ${
      propertyType || "-"
    }`;
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
  } catch (error) {
    return;
  }
}

function formatMoney(value) {
  return new Intl.NumberFormat(state.lang, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function formatProperty(property) {
  const isRent = property.category === "alquiler";
  const amount = isRent ? property.rent : property.price;
  const price = formatMoney(amount);
  const suffix =
    isRent && state.lang === "en"
      ? "/month"
      : isRent
      ? "/mes"
      : "";
  const categoryLabel =
    property.category === "alquiler"
      ? state.lang === "en"
        ? "rent"
        : "alquiler"
      : state.lang === "en"
      ? "sale"
      : "venta";
  return `${property.id} · ${property.title} · ${property.zone} · ${property.bedrooms} hab · ${categoryLabel} · ${price}${suffix}`;
}

function listMatches() {
  addMessage("bot", getText("finishBuyer"));
}

function handleRole(role) {
  state.lead.role = role;
  state.lead.criteria = {};
  updateSummary();
  clearQuickReplies();
  if (role === "buyer") {
    addMessage("bot", getText("askLocation"));
    state.step = "await_location";
  } else {
    addMessage("bot", getText("askSellerLocation"));
    state.step = "await_seller_location";
  }
  sendLeadUpdate("role");
}

function handleUserMessage(text) {
  const cleanText = text.trim();
  if (!cleanText) return;
  addMessage("user", cleanText);
  if (!state.lead.language) {
    setLanguage(detectLanguage(cleanText));
  }
  if (containsRestrictedTopic(cleanText)) {
    addMessage("bot", getText("restricted"));
    return;
  }
  if (state.step === "await_name") {
    state.lead.name = cleanText;
    addMessage("bot", getText("askPhone"));
    state.step = "await_phone";
    sendLeadUpdate("name");
    return;
  }
  if (state.step === "await_phone") {
    if (looksLikeWhy(cleanText)) {
      addMessage("bot", getText("phoneWhy"));
      return;
    }
    const phone = extractPhone(cleanText);
    if (!phone) {
      addMessage("bot", getText("invalidPhone"));
      return;
    }
    state.lead.phone = phone;
    showConsentPanel(true);
    addMessage("bot", getText("consentNeeded"));
    state.step = "await_consent";
    sendLeadUpdate("phone");
    return;
  }
  if (state.step === "await_consent") {
    addMessage("bot", getText("consentNeeded"));
    return;
  }
  if (state.step === "await_role") {
    if (isBuyer(cleanText)) {
      handleRole("buyer");
      return;
    }
    if (isSeller(cleanText)) {
      handleRole("seller");
      return;
    }
    addMessage("bot", getText("askRole"));
    showQuickReplies([
      { label: getText("buyer"), value: getText("buyer") },
      { label: getText("seller"), value: getText("seller") }
    ]);
    return;
  }
  if (state.step === "await_location") {
    state.lead.criteria.location = cleanText;
    updateSummary();
    addMessage("bot", getText("askBudget"));
    state.step = "await_budget";
    sendLeadUpdate("location");
    return;
  }
  if (state.step === "await_budget") {
    const budget = extractNumber(cleanText);
    if (!budget) {
      addMessage("bot", getText("invalidNumber"));
      return;
    }
    state.lead.criteria.maxPrice = budget;
    updateSummary();
    addMessage("bot", getText("askBedrooms"));
    state.step = "await_bedrooms";
    sendLeadUpdate("budget");
    return;
  }
  if (state.step === "await_bedrooms") {
    const bedrooms = extractNumber(cleanText);
    if (!bedrooms) {
      addMessage("bot", getText("invalidNumber"));
      return;
    }
    state.lead.criteria.minBedrooms = bedrooms;
    updateSummary();
    listMatches();
    state.step = "done";
    sendLeadUpdate("criteria");
    return;
  }
  if (state.step === "await_seller_location") {
    state.lead.criteria.location = cleanText;
    updateSummary();
    addMessage("bot", getText("askSellerType"));
    state.step = "await_seller_type";
    sendLeadUpdate("seller_location");
    return;
  }
  if (state.step === "await_seller_type") {
    state.lead.criteria.propertyType = cleanText;
    updateSummary();
    addMessage("bot", getText("finishSeller"));
    state.step = "done";
    sendLeadUpdate("seller_type");
    return;
  }
  addMessage("bot", getText("keepGoing"));
}

async function loadProperties() {
  try {
    const response = await fetch("data/properties.json", {
      cache: "no-store"
    });
    if (!response.ok) return;
    const data = await response.json();
    state.properties = Array.isArray(data) ? data : [];
  } catch (error) {
    state.properties = [];
  }
}

function setupAgent() {
  const params = new URLSearchParams(window.location.search);
  const agentKey = params.get("agent") || "general";
  const agent = CONFIG.agents[agentKey] || CONFIG.agents.general;
  state.lead.agent = agent.name;
  elements.agentName.textContent = agent.name;
  elements.welcomeTitle.textContent = `Bienvenido a ${CONFIG.brandName}`;
  elements.welcomeSubtitle.textContent = agent.name
    ? `Soy ${agent.name}`
    : "Asistente inmobiliario";
  elements.agentAvatar.textContent = agent.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (agent.photo) {
    const img = document.createElement("img");
    img.src = agent.photo;
    img.alt = agent.name;
    elements.agentAvatar.innerHTML = "";
    elements.agentAvatar.appendChild(img);
  }
}

function startConversation() {
  setLanguage(
    navigator.language && navigator.language.startsWith("en") ? "en" : "es"
  );
  addMessage("bot", getText("welcome")(state.lead.agent));
  addMessage("bot", getText("askName"));
  state.createdAt = new Date().toISOString();
  sendLeadUpdate("start");
}

elements.chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = elements.chatInput.value;
  elements.chatInput.value = "";
  handleUserMessage(text);
});

elements.consentContinue.addEventListener("click", () => {
  if (!elements.consentCheckbox.checked) {
    addMessage("bot", getText("consentNeeded"));
    return;
  }
  state.consent = true;
  state.lead.consent = true;
  showConsentPanel(false);
  addMessage("bot", getText("askRole"));
  state.step = "await_role";
  showQuickReplies([
    { label: getText("buyer"), value: getText("buyer") },
    { label: getText("seller"), value: getText("seller") }
  ]);
  sendLeadUpdate("consent");
});

setupAgent();
loadProperties();
startConversation();
