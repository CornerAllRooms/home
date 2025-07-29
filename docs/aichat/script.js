const PROXY_URL = 'https://cornerroom.co.za/api/chat'; // Replace with your backend URL

// DOM Elements
const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");
const sendMessageButton = document.querySelector("#send-message-button");

let userMessage = null;
let isResponseGenerating = false;
let userId = localStorage.getItem('user-id') || generateUserId();

function generateUserId() {
  const id = 'user-' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('user-id', id);
  return id;
}

// Improved typing effect
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
  let i = 0;
  const typingInterval = setInterval(() => {
    if (i < text.length) {
      textElement.textContent = text.substring(0, i + 1);
      i++;
      chatContainer.scrollTo(0, chatContainer.scrollHeight);
    } else {
      clearInterval(typingInterval);
      isResponseGenerating = false;
      incomingMessageDiv.querySelector(".icon")?.classList.remove("hide");
      saveChatsToStorage();
    }
  }, 20);
};

const handleOutgoingChat = () => {
  userMessage = typingForm.querySelector(".typing-input").value.trim();
  if (!userMessage || isResponseGenerating) return;
  
  isResponseGenerating = true;
  const html = `
    <div class="message-content">
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

const showLoadingAnimation = () => {
  const html = `
    <div class="message-content">
      <img class="avatar" src="gemini.svg" alt="AI avatar">
      <p class="text"></p>
      <div class="bouncing-dots">
        <div class="dot" style="--delay: 0s; --color-start: #2563eb; --color-end: #0ea5e9"></div>
        <div class="dot" style="--delay: 0.2s; --color-start: #2563eb; --color-end: #0ea5e9"></div>
        <div class="dot" style="--delay: 0.4s; --color-start: #2563eb; --color-end: #0ea5e9"></div>
      </div>
    </div>
    <span class="icon material-symbols-rounded hide">content_copy</span>`;
  
  const incomingMessageDiv = createMessageElement(html, "incoming");
  chatContainer.appendChild(incomingMessageDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  generateAPIResponse(incomingMessageDiv);
};

const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text");
  
  try {
    const response = await fetch(PROXY_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-User-ID": userId
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: userMessage }]
      }),
    });

    if (response.status === 429) {
      throw new Error("You've used your daily limit of 50 messages. Please try again tomorrow.");
    }
    
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    const apiResponse = data.choices[0]?.message?.content || "No response generated.";
    
    incomingMessageDiv.querySelector(".bouncing-dots")?.remove();
    showTypingEffect(apiResponse, textElement, incomingMessageDiv);
  } catch (error) {
    incomingMessageDiv.querySelector(".bouncing-dots")?.remove();
    textElement.textContent = `⚠️ ${error.message}`;
    isResponseGenerating = false;
    incomingMessageDiv.querySelector(".icon")?.classList.remove("hide");
  }
};

// Utility functions
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const saveChatsToStorage = () => {
  localStorage.setItem("saved-chats", chatContainer.innerHTML);
};

const copyMessage = (copyButton) => {
  navigator.clipboard.writeText(
    copyButton.parentElement.querySelector(".text").textContent
  );
  copyButton.textContent = "done";
  setTimeout(() => copyButton.textContent = "content_copy", 1000);
};

// Quick connection test
async function testConnection() {
  const testDiv = createMessageElement('<div class="message-content"><p class="text"></p></div>', "incoming");
  chatContainer.appendChild(testDiv);
  
  try {
    const response = await fetch(PROXY_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-User-ID": userId
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }]
      }),
    });
    
    const data = await response.json();
    testDiv.querySelector(".text").textContent = response.ok 
      ? "✅ Connected to Chatting Corner" 
      : "❌ Connection failed";
  } catch (error) {
    testDiv.querySelector(".text").textContent = `❌ Connection error: ${error.message}`;
  }
}

// Initialization
const initApp = () => {
  // Load saved chats
  chatContainer.innerHTML = localStorage.getItem("saved-chats") || '';
  if (chatContainer.innerHTML) {
    document.body.classList.add("hide-header");
  }
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  
// Load theme preference
const isDarkMode = localStorage.getItem("darkMode") === "true";
if (isDarkMode) {
  document.body.classList.add("dark-mode");
  toggleThemeButton.textContent = "dark_mode";
} else {
  document.body.classList.remove("dark-mode");
  toggleThemeButton.textContent = "light_mode";
}

// Theme toggle handler
toggleThemeButton.addEventListener("click", () => {
  const isNowDarkMode = !document.body.classList.contains("dark-mode");
  
  // Toggle dark mode class
  document.body.classList.toggle("dark-mode", isNowDarkMode);
  
  // Update icon
  toggleThemeButton.textContent = isNowDarkMode ? "dark_mode" : "light_mode";
  
  // Save preference
  localStorage.setItem("darkMode", isNowDarkMode);
});

// Set up other event listeners
typingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleOutgoingChat();
});

deleteChatButton.addEventListener("click", () => {
  if (confirm("Delete all chats?")) {
    localStorage.removeItem("saved-chats");
    chatContainer.innerHTML = '';
    document.body.classList.remove("hide-header");
  }
});

chatContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("icon")) {
    copyMessage(e.target);
  }
});
  // Test API connection on startup
  testConnection();
};

document.addEventListener("DOMContentLoaded", initApp);