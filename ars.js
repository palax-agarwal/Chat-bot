/*
  © 2025 Palax Agarwal. All Rights Reserved.
  This project and its source code are proprietary and may not be
  copied, modified, redistributed, or used commercially without permission.
*/

const botKnowledge = {
  html: "HTML stands for HyperText Markup Language. It is used to structure web pages.",
  css: "CSS stands for Cascading Style Sheets. It is used to style and design web pages.",
  js: "JS stands for JavaScript. It is used to make web pages interactive and dynamic.",
  javascript: "JS stands for JavaScript. It is used to make web pages interactive and dynamic.",
  react: "React is a popular JavaScript library for building user interfaces and dynamic web applications.",
  python: "Python is a versatile, high-level programming language used for web development, data science, and automation.",
  java: "Java is an object-oriented, platform-independent programming language widely used for building applications and Android apps.",
  nodejs: "Node.js is a JavaScript runtime built on Chrome's V8 engine that lets developers run JavaScript on the server side.",
};

const chatbotResponses = {
  greeting: "Hello! 👋 How can I help you today?",
  morning: "Good morning! ☀️ How can I help you today?",
  afternoon: "Good afternoon! 😊 How can I help you today?",
  evening: "Good evening! 🌙 How can I help you today?",
  howAreYou: "I'm doing great, thanks for asking! 😊 How can I help you today?",
  name: "I'm Aeries, your AI tech buddy! 🤖 I can help you with common questions and programming terms.",
  capabilities:
    "I can chat with you about common topics and answer simple programming questions! 🤖 Ask me about HTML, CSS, JavaScript, React, Python, Java, or Node.js, or just say hi!",
  thanks: "You're welcome! 😊",
  bye: "Goodbye! 👋 Have a great day!",
  fallback:
    "I'm not sure I understand that yet. 😅 Try asking me about HTML, CSS, JavaScript, React, Python, Java, or Node.js — or just say hi!",
};

let currentUser = null;
let chatMessages = [];
let isTyping = false;
let recognition = null;
let isListening = false;

const themeToggle = document.getElementById("themeToggle");
const authButtons = document.getElementById("authButtons");
const userInfo = document.getElementById("userInfo");
const userName = document.getElementById("userName");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const logoutBtn = document.getElementById("logoutBtn");
const modalOverlay = document.getElementById("modalOverlay");
const authModal = document.getElementById("authModal");
const modalTitle = document.getElementById("modalTitle");
const modalClose = document.getElementById("modalClose");
const authForm = document.getElementById("authForm");
const nameGroup = document.getElementById("nameGroup");
const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const passwordToggle = document.getElementById("passwordToggle");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const switchModeText = document.getElementById("switchModeText");
const switchModeBtn = document.getElementById("switchModeBtn");
const welcomeScreen = document.getElementById("welcomeScreen");
const chatMessages_el = document.getElementById("chatMessages");
const messagesContainer = document.getElementById("messagesContainer");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const voiceBtn = document.getElementById("voiceBtn");
const sendBtn = document.getElementById("sendBtn");

document.addEventListener("DOMContentLoaded", function () {
  initializeTheme();
  initializeAuth();
  initializeSpeechRecognition();
  initializeEventListeners();
  loadChatHistory();
});

function initializeTheme() {
  const savedTheme = localStorage.getItem("aeries-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("aeries-theme", newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = themeToggle.querySelector("i");
  icon.className = theme === "light" ? "fas fa-moon" : "fas fa-sun";
}

function initializeAuth() {
  const savedUser = localStorage.getItem("aeries-user");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    updateAuthUI();
  }
}

function updateAuthUI() {
  if (currentUser) {
    authButtons.classList.add("hidden");
    userInfo.classList.remove("hidden");
    userName.textContent = currentUser.name;
  } else {
    authButtons.classList.remove("hidden");
    userInfo.classList.add("hidden");
  }
}

function showAuthModal(mode) {
  modalTitle.textContent = mode === "login" ? "Welcome Back" : "Create Account";

  if (mode === "signup") {
    nameGroup.classList.remove("hidden");
    nameInput.required = true;
    authSubmitBtn.querySelector(".btn-text").textContent = "Create Account";
    switchModeText.innerHTML =
      'Already have an account? <button type="button" class="link-btn" id="switchModeBtn">Sign in</button>';
  } else {
    nameGroup.classList.add("hidden");
    nameInput.required = false;
    authSubmitBtn.querySelector(".btn-text").textContent = "Sign In";
    switchModeText.innerHTML =
      'Don\'t have an account? <button type="button" class="link-btn" id="switchModeBtn">Sign up</button>';
  }

  document
    .getElementById("switchModeBtn")
    .addEventListener("click", function () {
      const newMode = mode === "login" ? "signup" : "login";
      showAuthModal(newMode);
    });

  modalOverlay.classList.remove("hidden");
  authForm.dataset.mode = mode;
}

function hideAuthModal() {
  modalOverlay.classList.add("hidden");
  authForm.reset();

  const btnText = authSubmitBtn.querySelector(".btn-text");
  const loadingSpinner = authSubmitBtn.querySelector(".loading-spinner");
  btnText.classList.remove("hidden");
  loadingSpinner.classList.add("hidden");
  authSubmitBtn.disabled = false;
}

function handleAuth(mode, formData) {
  
  const btnText = authSubmitBtn.querySelector(".btn-text");
  const loadingSpinner = authSubmitBtn.querySelector(".loading-spinner");
  btnText.classList.add("hidden");
  loadingSpinner.classList.remove("hidden");
  authSubmitBtn.disabled = true;

  setTimeout(() => {
    const userData = {
      id: Date.now().toString(),
      name: mode === "signup" ? formData.name : formData.email.split("@")[0],
      email: formData.email,
    };

    currentUser = userData;
    localStorage.setItem("aeries-user", JSON.stringify(userData));
    updateAuthUI();
    hideAuthModal();
  }, 1500);
}

function logout() {
  currentUser = null;
  localStorage.removeItem("aeries-user");
  updateAuthUI();

  chatMessages = [];
  localStorage.removeItem("aeries-chat-history");
  showWelcomeScreen();
}

function initializeSpeechRecognition() {
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = function () {
      isListening = true;
      voiceBtn.classList.add("listening");
      voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
    };

    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript;
      messageInput.value = transcript;
      messageInput.focus();
    };

    recognition.onend = function () {
      isListening = false;
      voiceBtn.classList.remove("listening");
      voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    };

    recognition.onerror = function (event) {
      console.error("Speech recognition error:", event.error);
      isListening = false;
      voiceBtn.classList.remove("listening");
      voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    };
  } else {
    voiceBtn.style.display = "none";
  }
}

function toggleVoiceRecognition() {
  if (!recognition) return;

  if (isListening) {
    recognition.stop();
  } else {
    recognition.start();
  }
}

function showWelcomeScreen() {
  welcomeScreen.classList.remove("hidden");
  chatMessages_el.classList.add("hidden");
  messagesContainer.innerHTML = "";
}

function showChatInterface() {
  welcomeScreen.classList.add("hidden");
  chatMessages_el.classList.remove("hidden");
}

function addMessage(text, sender, timestamp = new Date()) {
  const message = {
    id: Date.now().toString(),
    text,
    sender,
    timestamp,
  };

  chatMessages.push(message);
  renderMessage(message);
  saveChatHistory();
  scrollToBottom();

  if (chatMessages.length === 1) {
    showChatInterface();
  }
}

function renderMessage(message) {
  const messageEl = document.createElement("div");
  messageEl.className = `message ${message.sender}`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.innerHTML =
    message.sender === "user"
      ? '<i class="fas fa-user"></i>'
      : '<i class="fas fa-robot"></i>';

  const content = document.createElement("div");
  content.className = "message-content";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = message.text;

  const time = document.createElement("div");
  time.className = "message-time";
  time.textContent = formatTime(message.timestamp);

  content.appendChild(bubble);
  content.appendChild(time);
  messageEl.appendChild(avatar);
  messageEl.appendChild(content);

  messagesContainer.appendChild(messageEl);
}

function showTypingIndicator() {
  if (isTyping) return;

  isTyping = true;
  const typingEl = document.createElement("div");
  typingEl.className = "typing-indicator";
  typingEl.id = "typingIndicator";

  typingEl.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;

  messagesContainer.appendChild(typingEl);
  scrollToBottom();
}

function hideTypingIndicator() {
  isTyping = false;
  const typingEl = document.getElementById("typingIndicator");
  if (typingEl) {
    typingEl.remove();
  }
}

function getAIResponse(input) {
  const text = input.toLowerCase().trim();

  if (
    /^(hi|hello|hey|heey+|yo|hola|hiya|sup)\b/.test(text) &&
    /\bgood (morning|afternoon|evening)\b/.test(text)
  ) {
    if (text.includes("morning")) return chatbotResponses.morning;
    if (text.includes("afternoon")) return chatbotResponses.afternoon;
    return chatbotResponses.evening;
  }

  if (/^(hi|hello|hey|heey+|yo|hola|hiya|sup)\b/.test(text)) {
    return chatbotResponses.greeting;
  }

  if (/\bgood (morning|afternoon|evening)\b/.test(text)) {
    if (text.includes("morning")) return chatbotResponses.morning;
    if (text.includes("afternoon")) return chatbotResponses.afternoon;
    return chatbotResponses.evening;
  }

  if (/\bhow are you\b|\bhow r u\b/.test(text)) {
    return chatbotResponses.howAreYou;
  }

  if (/\bwhat(?:'s| is) your name\b|\bwho are you\b|\bwho r u\b/.test(text)) {
    return chatbotResponses.name;
  }

  const term = detectProgrammingTerm(text);
  if (term) {
    return botKnowledge[term];
  }

  if (/^(help|help me|what can you do|what do you do|can you help)/.test(text)) {
    return chatbotResponses.capabilities;
  }

  if (/\b(thank you|thanks|thx|ty)\b/.test(text)) {
    return chatbotResponses.thanks;
  }

  if (/\b(bye|goodbye|see you|good night)\b/.test(text)) {
    return chatbotResponses.bye;
  }

  return chatbotResponses.fallback;
}

function detectProgrammingTerm(text) {
  if (/\bjavascript\b/.test(text)) return "javascript";
  if (/\bnode(?:\.?js)?\b|\bnode js\b/.test(text)) return "nodejs";
  if (/\bhtml\b/.test(text)) return "html";
  if (/\bcss\b/.test(text)) return "css";
  if (/\bjs\b/.test(text)) return "js";
  if (/\breact(?:js)?\b/.test(text)) return "react";
  if (/\bpython\b/.test(text)) return "python";
  if (/\bjava\b/.test(text)) return "java";
  return null;
}

function handleUserMessage(text) {
  if (!text.trim()) return;

  addMessage(text, "user");

  showTypingIndicator();

  setTimeout(() => {
    hideTypingIndicator();
    const response = getAIResponse(text);
    addMessage(response, "ai");
  }, 1000 + Math.random() * 2000); 
}

function scrollToBottom() {
  setTimeout(() => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 100);
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function saveChatHistory() {
  // localStorage.setItem("aeries-chat-history", JSON.stringify(chatMessages));
}

function loadChatHistory() {
    const savedMessages = localStorage.getItem("aeries-chat-history");
  if (savedMessages) {
    chatMessages = JSON.parse(savedMessages).map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));

    if (chatMessages.length > 0) {
      showChatInterface();
      chatMessages.forEach(renderMessage);
      scrollToBottom();
    }
  }
}

function initializeEventListeners() {

  themeToggle.addEventListener("click", toggleTheme);

  loginBtn.addEventListener("click", () => showAuthModal("login"));
  signupBtn.addEventListener("click", () => showAuthModal("signup"));
  logoutBtn.addEventListener("click", logout);

  modalClose.addEventListener("click", hideAuthModal);
  modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) {
      hideAuthModal();
    }
  });

  passwordToggle.addEventListener("click", function () {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    this.innerHTML =
      type === "password"
        ? '<i class="fas fa-eye"></i>'
        : '<i class="fas fa-eye-slash"></i>';
  });

  authForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const mode = this.dataset.mode;
    const formData = {
      name: nameInput.value,
      email: emailInput.value,
      password: passwordInput.value,
    };

    handleAuth(mode, formData);
  });

  chatForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const text = messageInput.value.trim();
    if (text) {
      handleUserMessage(text);
      messageInput.value = "";
    }
  });

  
  voiceBtn.addEventListener("click", toggleVoiceRecognition);


  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("chip")) {
      const suggestion = e.target.dataset.suggestion;
      messageInput.value = suggestion;
      handleUserMessage(suggestion);
    }
  });

 
  messageInput.addEventListener("input", function () {
    sendBtn.disabled = !this.value.trim();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modalOverlay.classList.contains("hidden")) {
      hideAuthModal();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      if (messageInput.value.trim()) {
        chatForm.dispatchEvent(new Event("submit"));
      }
    }
  });
}


sendBtn.disabled = true;
