
const STORAGE_KEYS = {
    CHAT_HISTORY: 'clippy_chat_history',
    API_KEY: 'clippy_api_key',
    PROMPT_STYLE: 'clippy_prompt_style',
    ALWAYS_ON_TOP: 'clippy_always_on_top'
};


const SYSTEM_PROMPTS = {
    helpful: "You are a helpful desktop assistant. Provide clear, accurate answers and assist with tasks.",
    concise: "You are a concise assistant. Give brief, direct answers without unnecessary explanation.",
    friendly: "You are a friendly and casual assistant. Be warm, conversational, and helpful.",
    professional: "You are a professional assistant. Provide well-structured, formal responses.",
    creative: "You are a creative and fun assistant. Be playful, use analogies, and make responses engaging."
};


let chatHistory = [];
let currentPromptStyle = 'helpful';
let isApiKeySet = false;


const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const minimizeBtn = document.getElementById('minimizeBtn');
const hideBtn = document.getElementById('hideBtn');
const closeBtn = document.getElementById('closeBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettings = document.getElementById('closeSettings');
const apiKeyInput = document.getElementById('apiKey');
const saveApiKeyBtn = document.getElementById('saveApiKey');
const promptStyleSelect = document.getElementById('promptStyle');
const alwaysOnTopCheckbox = document.getElementById('alwaysOnTop');
const clearHistoryBtn = document.getElementById('clearHistory');
const statusText = document.getElementById('statusText');
const chatContainer = document.getElementById('chatContainer');

function init() {
    loadFromStorage();
    setupEventListeners();
    displayWelcomeMessage();
}

function loadFromStorage() {
    const savedHistory = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    if (savedHistory) {
        try {
            chatHistory = JSON.parse(savedHistory);
            chatHistory.forEach(msg => {
                addMessageToUI(msg.role, msg.content, false);
            });
        } catch (e) {
            console.error('Failed to load chat history:', e);
        }
    }

    const savedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
        initializeApiKey(savedApiKey);
    }

    const savedStyle = localStorage.getItem(STORAGE_KEYS.PROMPT_STYLE);
    if (savedStyle) {
        currentPromptStyle = savedStyle;
        promptStyleSelect.value = savedStyle;
    }

    const savedAlwaysOnTop = localStorage.getItem(STORAGE_KEYS.ALWAYS_ON_TOP);
    if (savedAlwaysOnTop !== null) {
        const isOnTop = savedAlwaysOnTop === 'true';
        alwaysOnTopCheckbox.checked = isOnTop;
        window.electronAPI.setAlwaysOnTop(isOnTop);
    }
}

function saveChatHistory() {
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(chatHistory));
}

function setupEventListeners() {
    minimizeBtn.addEventListener('click', () => {
        window.electronAPI.minimizeWindow();
    });

    hideBtn.addEventListener('click', () => {
        window.electronAPI.toggleVisibility();
    });

    closeBtn.addEventListener('click', () => {
        window.electronAPI.closeWindow();
    });

    settingsBtn.addEventListener('click', () => {
        settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
    });

    closeSettings.addEventListener('click', () => {
        settingsPanel.style.display = 'none';
    });

    saveApiKeyBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            await initializeApiKey(apiKey);
            localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
        }
    });

    promptStyleSelect.addEventListener('change', (e) => {
        currentPromptStyle = e.target.value;
        localStorage.setItem(STORAGE_KEYS.PROMPT_STYLE, currentPromptStyle);
        setStatus(`Assistant style changed to: ${currentPromptStyle}`);
    });

    alwaysOnTopCheckbox.addEventListener('change', (e) => {
        const isOnTop = e.target.checked;
        window.electronAPI.setAlwaysOnTop(isOnTop);
        localStorage.setItem(STORAGE_KEYS.ALWAYS_ON_TOP, isOnTop.toString());
    });

    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Clear all chat history?')) {
            chatHistory = [];
            messagesContainer.innerHTML = '';
            localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
            displayWelcomeMessage();
            setStatus('Chat history cleared');
        }
    });

    sendBtn.addEventListener('click', sendMessage);

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

async function initializeApiKey(apiKey) {
    const result = await window.electronAPI.setApiKey(apiKey);
    if (result) {
        isApiKeySet = true;
        setStatus('API key set successfully');
        addMessageToUI('system', 'OpenAI API connected! You can now chat with me.');
    } else {
        isApiKeySet = false;
        setStatus('Failed to set API key', true);
        addMessageToUI('error', 'Failed to initialize OpenAI. Check your API key.');
    }
}

function displayWelcomeMessage() {
    if (chatHistory.length === 0) {
        addMessageToUI('system', 'Welcome to Clippy AI! 👋\n\nTo get started, set your OpenAI API key in settings (⚙️).\n\nAvailable commands:\n• "open [url]" - Open a website\n• "summarize clipboard" - Summarize clipboard content\n• "calculate [expression]" - Do math calculations');
    }
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessageToUI('user', message);
    chatHistory.push({ role: 'user', content: message });
    saveChatHistory();

    userInput.value = '';
    userInput.style.height = 'auto';

    sendBtn.disabled = true;
    setStatus('Processing...');

    const commandResult = await window.electronAPI.processCommand(message);

    if (commandResult.isCommand) {
        if (commandResult.needsSummary) {
            if (!isApiKeySet) {
                addMessageToUI('error', 'Please set your OpenAI API key in settings first.');
                sendBtn.disabled = false;
                setStatus('Ready');
                return;
            }

            showTypingIndicator();

            const summaryPrompt = `Please provide a concise summary of the following text:\n\n${commandResult.clipboardText}`;
            const response = await window.electronAPI.chatCompletion(
                [{ role: 'user', content: summaryPrompt }],
                SYSTEM_PROMPTS[currentPromptStyle]
            );

            removeTypingIndicator();

            if (response.success) {
                addMessageToUI('assistant', response.message);
                chatHistory.push({ role: 'assistant', content: response.message });
                saveChatHistory();
            } else {
                addMessageToUI('error', response.error);
            }
        } else {
            addMessageToUI('system', commandResult.result);
        }

        sendBtn.disabled = false;
        setStatus('Ready');
        return;
    }

    if (!isApiKeySet) {
        addMessageToUI('error', 'Please set your OpenAI API key in settings (⚙️) first.');
        sendBtn.disabled = false;
        setStatus('Ready');
        return;
    }

    showTypingIndicator();

    
    const response = await window.electronAPI.chatCompletion(
        chatHistory.slice(-10), 
        SYSTEM_PROMPTS[currentPromptStyle]
    );

    removeTypingIndicator();

    if (response.success) {
        addMessageToUI('assistant', response.message);
        chatHistory.push({ role: 'assistant', content: response.message });
        saveChatHistory();
        setStatus('Ready');
    } else {
        addMessageToUI('error', response.error);
        setStatus('Error', true);
    }

    
    sendBtn.disabled = false;
}


function addMessageToUI(role, content, shouldScroll = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.textContent = content;
    messagesContainer.appendChild(messageDiv);

    if (shouldScroll) {
        scrollToBottom();
    }
}


function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typingIndicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(indicator);
    scrollToBottom();
}


function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}


function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}


function setStatus(text, isError = false) {
    statusText.textContent = text;
    statusText.style.color = isError ? '#e74c3c' : '#4a9eff';
}


userInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});


init();
