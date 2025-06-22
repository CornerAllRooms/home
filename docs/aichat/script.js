const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");
const sendMessageButton = document.querySelector("#send-message-button");
const installBanner = document.getElementById('add-to-home-screen-banner');
const installButton = document.getElementById('add-to-home-screen-button');

let userMessage = null;
let isResponseGenerating = false;
let deferredPrompt = null;

const GROQ_API = {
  url: "https://api.groq.com/openai/v1/chat/completions",
  apiKey: "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", // Get it below
  model: "llama3-70b-8192", // Free as of June 2024

  async getResponse(prompt) {
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await response.json();
    return data.choices[0].message.content;
  }
};

// Update your generateAPIResponse() to use GROQ_API:
const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text");
  try {
    const apiResponse = await GROQ_API.getResponse(userMessage);
    showTypingEffect(apiResponse, textElement, incomingMessageDiv);
  } catch (error) {
    // Keep your existing error handling
  }
};

const initApp = () => {
  setupIcons();
  loadDataFromLocalstorage();
  registerServiceWorker();
  setupEventListeners();
};

const setupIcons = () => {
  toggleThemeButton.innerHTML = '<span class="material-symbols-rounded">light_mode</span>';
  deleteChatButton.innerHTML = '<span class="material-symbols-rounded">delete</span>';
  sendMessageButton.innerHTML = '<span class="material-symbols-rounded">send</span>';
  if (installButton) {
    installButton.innerHTML = '<span class="material-symbols-rounded">add_to_home_screen</span>';
  }
};

const loadDataFromLocalstorage = () => {
  const savedChats = localStorage.getItem("saved-chats");
  const isLightMode = localStorage.getItem("themeColor") === "light";
  document.body.classList.toggle("light_mode", isLightMode);
  updateThemeIcon(isLightMode);
  chatContainer.innerHTML = savedChats || '';
  document.body.classList.toggle("hide-header", !!savedChats);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const updateThemeIcon = (isLightMode) => {
  const icon = toggleThemeButton.querySelector('.material-symbols-rounded');
  if (icon) {
    icon.textContent = isLightMode ? 'dark_mode' : 'light_mode';
  }
};

const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registered');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed:', err);
      });
  }
};

const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const showTypingEffect = (text, textElement, incomingMessageDiv) => {
  const words = text.split(' ');
  let currentWordIndex = 0;
  const typingInterval = setInterval(() => {
    textElement.textContent += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
    incomingMessageDiv.querySelector(".icon")?.classList.add("hide");
    if (currentWordIndex === words.length) {
      clearInterval(typingInterval);
      isResponseGenerating = false;
      incomingMessageDiv.querySelector(".icon")?.classList.remove("hide");
      saveChatsToStorage();
    }
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
  }, 75);
};

const saveChatsToStorage = () => {
  const chats = chatContainer.innerHTML;
  localStorage.setItem("saved-chats", chats);
};

/* Duplicate generateAPIResponse removed to fix redeclaration error */

const showLoadingAnimation = () => {
  const html = `<div class="message-content">
                  <img class="avatar" src="gemini.svg" alt="Gemini avatar">
                  <p class="text"></p>
                  <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                  </div>
                </div>
                <span class="icon material-symbols-rounded">content_copy</span>`;
  const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
  chatContainer.appendChild(incomingMessageDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  generateAPIResponse(incomingMessageDiv);
};

const copyMessage = (copyButton) => {
  const messageText = copyButton.parentElement.querySelector(".text").textContent;
  navigator.clipboard.writeText(messageText);
  copyButton.textContent = "done";
  setTimeout(() => copyButton.textContent = "content_copy", 1000);
};

const handleOutgoingChat = () => {
  userMessage = typingForm.querySelector(".typing-input").value.trim();
  if (!userMessage || isResponseGenerating) return;
  isResponseGenerating = true;
  const html = `<div class="message-content">
                  <img class="avatar" src="car.png" alt="User avatar">
                  <p class="text">${userMessage}</p>
                </div>`;
  const outgoingMessageDiv = createMessageElement(html, "outgoing");
  chatContainer.appendChild(outgoingMessageDiv);
  typingForm.reset();
  document.body.classList.add("hide-header");
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  setTimeout(showLoadingAnimation, 500);
};

const setupInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!window.matchMedia('(display-mode: standalone)').matches) {
      installBanner.style.display = 'flex';
    }
  });
  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    installBanner.style.display = 'none';
    deferredPrompt = null;
  });
};

const setupEventListeners = () => {
  toggleThemeButton.addEventListener("click", () => {
    const isLightMode = document.body.classList.toggle("light_mode");
    localStorage.setItem("themeColor", isLightMode ? "light" : "dark");
    updateThemeIcon(isLightMode);
  });
  deleteChatButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all chats?")) {
      localStorage.removeItem("saved-chats");
      chatContainer.innerHTML = '';
      document.body.classList.remove("hide-header");
    }
  });
  suggestions.forEach(suggestion => {
    suggestion.addEventListener("click", () => {
      userMessage = suggestion.querySelector(".text").textContent;
      handleOutgoingChat();
    });
  });
  typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
  });
  chatContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("icon") && e.target.textContent === "content_copy") {
      copyMessage(e.target);
    }
  });
  setupInstallPrompt();
};

document.addEventListener("DOMContentLoaded", initApp);