const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    toggleVisibility: () => ipcRenderer.invoke('toggle-visibility'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    setAlwaysOnTop: (flag) => ipcRenderer.invoke('set-always-on-top', flag),
    setApiKey: (apiKey) => ipcRenderer.invoke('set-api-key', apiKey),
    getClipboardText: () => ipcRenderer.invoke('get-clipboard-text'),
    openUrl: (url) => ipcRenderer.invoke('open-url', url),
    chatCompletion: (messages, systemPrompt) => ipcRenderer.invoke('chat-completion', { messages, systemPrompt }),
    processCommand: (message) => ipcRenderer.invoke('process-command', message)
});
