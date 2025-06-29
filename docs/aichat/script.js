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

// Secure API configuration (replace with your actual API_KEY)
const GROQ_API = {
  url: "https://api.groq.com/openai/v1/chat/completions",
  apiKey: "GROQ_API_KEY", // REPLACE THIS WITH YOUR ACTUAL KEY
  model: "meta-llama/llama-4-scout-17b-16e-instruct",

  async getResponse(prompt) {
    try {
      const response = await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7
        })
      });

      if (response.status === 429) {
        return "⚠️ Too many requests. Please wait a moment...";
      }
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "No response generated.";
    } catch (error) {
      console.error("API Error:", error);
      return "🔴 Connection error. Please try again later.";
    }
  }
};

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

const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text");
  try {
    const apiResponse = await GROQ_API.getResponse(userMessage);
    showTypingEffect(apiResponse, textElement, incomingMessageDiv);
  } catch (error) {
    textElement.textContent = "⚠️ Failed to generate response";
    isResponseGenerating = false;
    incomingMessageDiv.querySelector(".icon")?.classList.remove("hide");
  }
};

// Chat functions
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

// Initialization
const initApp = () => {
  // Load saved chats
  chatContainer.innerHTML = localStorage.getItem("saved-chats") || '';
  if (chatContainer.innerHTML) {
    document.body.classList.add("hide-header");
  }
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  
  // Set up event listeners
  typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
  });
  
  deleteChatButton.addEventListener("click", () => {
    if (confirm("Delete all chats?")) {
      localStorage.removeItem("saved-chats");
      chatContainer.innerHTML = 'trash.svg';
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

// Quick connection test
async function testConnection() {
  const testDiv = createMessageElement('<div class="message-content"><p class="text"></p></div>', "incoming");
  chatContainer.appendChild(testDiv);
  const testResponse = await process.env.GROQ_API.getResponse("Hello Roomie");
  testDiv.querySelector(".text").textContent = testResponse.includes("🔴") 
    ? "❌ Connection failed" 
    : "✅ Connected to Chatting Corner";
}

document.addEventListener("DOMContentLoaded", initApp);