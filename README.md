# Clippy AI - Floating Desktop Assistant

A cross-platform floating desktop assistant powered by OpenAI's GPT models, built with Electron.js. Chat with an AI assistant, execute commands, and get quick answers—all from a sleek, always-on-top widget.

## ✨ Features

- **🤖 AI Chat**: Conversational AI powered by OpenAI GPT-3.5
- **🪟 Floating Widget**: Draggable, resizable, always-on-top window
- **💬 Chat History**: Persistent conversation history stored locally
- **🎨 Customizable Styles**: Choose from 5 different assistant personalities
- **⚡ Quick Commands**:
  - `open [url]` - Open any website in your default browser
  - `summarize clipboard` - AI-powered summarization of clipboard content
  - `calculate [expression]` - Instant math calculations
- **🎯 Minimal UI**: Clean, modern interface with dark theme
- **🔒 Secure**: Context isolation with proper IPC communication

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## 🚀 Installation

1. **Clone or navigate to the project directory**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the application**
   ```bash
   npm start
   ```

## 🔧 Setup

1. **Launch the app** using `npm start`

2. **Set your OpenAI API key**:
   - Click the settings icon (⚙️) in the title bar
   - Paste your OpenAI API key
   - Click "Save Key"

3. **Start chatting!** Type your message and press Enter or click the send button

## 📖 Usage

### Basic Chat
Simply type your question or message and press Enter:
```
What's the weather like today?
Explain quantum computing in simple terms
Write a haiku about coding
```

### Commands

#### Open Website
```
open google.com
open https://github.com
open youtube.com
```

#### Summarize Clipboard
First copy some text to your clipboard, then type:
```
summarize clipboard
summarize
```

#### Calculate Math
```
calculate 2 + 2
calc 15 * 7 + 3
calculate (100 - 25) / 5
```

### Assistant Styles

Choose from 5 different assistant personalities in settings:
- **Helpful Assistant** - Balanced, clear, and informative
- **Concise & Direct** - Brief answers without fluff
- **Friendly & Casual** - Warm and conversational
- **Professional** - Formal and well-structured
- **Creative & Fun** - Playful and engaging

### Settings

Access settings via the ⚙️ icon:
- **API Key**: Set or update your OpenAI API key
- **Assistant Style**: Change the AI's response personality
- **Always on Top**: Toggle window stay-on-top behavior
- **Clear History**: Remove all chat history

## 🎨 Interface Controls

- **Drag**: Click and drag the title bar to move the window
- **Resize**: Drag window edges to resize
- **Minimize**: `-` button to minimize
- **Close**: `×` button to close the app
- **Settings**: `⚙️` button for configuration

## 🏗️ Project Structure

```
clippy-ai-assistant/
├── main.js           # Electron main process
├── preload.js        # IPC bridge (secure communication)
├── index.html        # Application UI structure
├── styles.css        # UI styling
├── renderer.js       # Frontend logic and event handlers
└── package.json      # Project dependencies and scripts
```

## 🔐 Security

- **Context Isolation**: Enabled for security
- **No Node Integration**: Renderer process isolated from Node.js
- **Secure IPC**: Communication via contextBridge
- **Local Storage**: API key and chat history stored locally

## 💡 Tips

1. **Keyboard Shortcuts**:
   - `Enter` to send message
   - `Shift + Enter` for new line in input

2. **Chat History**: Your conversations are automatically saved and restored when you reopen the app

3. **Token Limits**: Responses are limited to 500 tokens to keep them concise

4. **Context Window**: Only the last 10 messages are sent to the API for context

## 🛠️ Development

To run in development mode with DevTools:
```bash
npm run dev
```

## 📦 Building for Distribution

To package the app for your platform, you can use `electron-builder` or `electron-forge`:

1. Install electron-builder:
   ```bash
   npm install --save-dev electron-builder
   ```

2. Add build scripts to `package.json`:
   ```json
   "scripts": {
     "build": "electron-builder"
   }
   ```

3. Build the app:
   ```bash
   npm run build
   ```

## 🐛 Troubleshooting

### API Key Issues
- Ensure your API key starts with `sk-`
- Check that you have credits in your OpenAI account
- Verify the key has proper permissions

### Window Not Appearing
- Check if the window is minimized
- Try restarting the application
- Ensure no other instances are running

### Commands Not Working
- Verify the exact command syntax
- Check the status bar for error messages
- Ensure the API key is set for summarize commands

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 🔮 Future Enhancements

Potential features for future versions:
- Multiple AI model support (GPT-4, Claude, etc.)
- Custom keyboard shortcuts
- Voice input/output
- File attachment support
- Multi-window support
- Plugin system for custom commands
- Theme customization

---

Built with ❤️ using Electron.js and OpenAI
