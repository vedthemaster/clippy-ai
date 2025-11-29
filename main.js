const { app, BrowserWindow, ipcMain, clipboard, shell, globalShortcut } = require('electron');
const path = require('path');
const OpenAI = require('openai');

let mainWindow;
let openaiClient;
let isWindowVisible = true;

function initializeOpenAI(apiKey) {
    if (!apiKey) {
        console.error('OpenAI API key not provided');
        return false;
    }

    try {
        openaiClient = new OpenAI({
            apiKey: apiKey
        });
        return true;
    } catch (error) {
        console.error('Failed to initialize OpenAI:', error);
        return false;
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 600,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.setMovable(true);
}

app.whenReady().then(() => {
    createWindow();

    const ret = globalShortcut.register('CommandOrControl+Shift+Space', () => {
        if (mainWindow) {
            if (isWindowVisible) {
                mainWindow.hide();
                isWindowVisible = false;
            } else {
                mainWindow.show();
                isWindowVisible = true;
            }
        }
    });

    if (!ret) {
        console.log('Global shortcut registration failed');
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('will-quit', () => {
    // Unregister all shortcuts
    globalShortcut.unregisterAll();
});

ipcMain.handle('minimize-window', () => {
    if (mainWindow) {
        mainWindow.minimize();
    }
});

ipcMain.handle('toggle-visibility', () => {
    if (mainWindow) {
        if (isWindowVisible) {
            mainWindow.hide();
            isWindowVisible = false;
        } else {
            mainWindow.show();
            isWindowVisible = true;
        }
        return isWindowVisible;
    }
    return false;
});

ipcMain.handle('close-window', () => {
    if (mainWindow) {
        mainWindow.close();
    }
});

ipcMain.handle('set-always-on-top', (event, flag) => {
    if (mainWindow) {
        mainWindow.setAlwaysOnTop(flag);
    }
});

ipcMain.handle('set-api-key', (event, apiKey) => {
    return initializeOpenAI(apiKey);
});

ipcMain.handle('get-clipboard-text', () => {
    return clipboard.readText();
});

ipcMain.handle('open-url', async (event, url) => {
    try {
        await shell.openExternal(url);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('chat-completion', async (event, { messages, systemPrompt }) => {
    if (!openaiClient) {
        return {
            success: false,
            error: 'OpenAI client not initialized. Please set your API key first.'
        };
    }

    try {
        const messagesWithSystem = [
            { role: 'system', content: systemPrompt },
            ...messages
        ];

        const completion = await openaiClient.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messagesWithSystem,
            max_tokens: 500,
            temperature: 0.7
        });

        return {
            success: true,
            message: completion.choices[0].message.content
        };
    } catch (error) {
        console.error('OpenAI API error:', error);
        return {
            success: false,
            error: error.message || 'Failed to get response from OpenAI'
        };
    }
});

ipcMain.handle('process-command', async (event, message) => {
    const lowerMessage = message.toLowerCase().trim();

    if (lowerMessage.startsWith('open ')) {
        const url = message.substring(5).trim();
        let fullUrl = url;

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            fullUrl = 'https://' + url;
        }

        const result = await shell.openExternal(fullUrl);
        return {
            isCommand: true,
            result: `Opening ${fullUrl}...`
        };
    }

    // Summarize clipboard command
    if (lowerMessage === 'summarize clipboard' || lowerMessage === 'summarize') {
        const clipboardText = clipboard.readText();
        if (!clipboardText) {
            return {
                isCommand: true,
                result: 'Clipboard is empty.'
            };
        }
        return {
            isCommand: true,
            needsSummary: true,
            clipboardText: clipboardText
        };
    }

    if (lowerMessage.startsWith('calculate ') || lowerMessage.startsWith('calc ')) {
        const expression = message.substring(message.indexOf(' ') + 1).trim();
        try {
            const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
            if (sanitized !== expression) {
                return {
                    isCommand: true,
                    result: 'Invalid math expression. Only use numbers and +, -, *, /, (, )'
                };
            }
            const result = Function('"use strict"; return (' + sanitized + ')')();
            return {
                isCommand: true,
                result: `${expression} = ${result}`
            };
        } catch (error) {
            return {
                isCommand: true,
                result: 'Error calculating expression: ' + error.message
            };
        }
    }

    return {
        isCommand: false
    };
});
