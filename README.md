<div align="center">
  <h1>VoidGPT</h1>
  <p><strong>Reverse engineered ChatGPT client for authentication-free access</strong></p>
  <img src="https://img.shields.io/badge/Python-3.7+-blue.svg" alt="Python Version">
  <img src="https://img.shields.io/badge/Flask-2.0.1-green.svg" alt="Flask Version">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
</div>

<br>

## 📑 Overview

**VoidGPT** is an advanced Flask application that provides direct access to ChatGPT through sophisticated reverse engineering techniques. This project bypasses standard authentication requirements and API limitations, allowing you to interact with ChatGPT's capabilities through an elegant web interface without any accounts or API keys.

## ✨ Key Features

- **Reverse Engineered Authentication**: Access ChatGPT without accounts or API keys
- **Zero Cost Usage**: No API credits or subscription fees required
- **Multiple Model Selection**: Support for GPT-4o, GPT-4o-mini, and other models
- **Elegant User Interface**: Clean design with dark/light theme options
- **Voice Input Support**: Speak your prompts directly
- **Advanced Formatting**: Full markdown and code syntax highlighting
- **No Rate Limits**: Unthrottled access to ChatGPT capabilities

## ⚙️ Technical Implementation

This project implements several advanced techniques to bypass ChatGPT's authentication systems:

- **Session Data Rotation**: Dynamically manages authentication tokens
- **Sentinel Challenge Solver**: Automatically resolves proof-of-work challenges
- **Browser Fingerprint Simulation**: Mimics legitimate browser requests
- **Headers & Cookies Management**: Sophisticated handling of authentication artifacts

## 🚀 Installation

1. Clone the repository
   ```bash
   git clone https://github.com/void-eth/VoidGPT.git
   cd VoidGPT
   ```

2. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

3. Launch the application
   ```bash
   python app.py
   ```

4. Open your browser and navigate to `http://127.0.0.1:5000`

## 📁 Project Structure

```
VoidGPT/
├── app.py                # Flask application server
├── voidgpt.py            # Core reverse engineering client
├── static/
│   ├── css/
│   │   └── style.css     # Application styling
│   └── js/
│       └── script.js     # Frontend functionality
└── templates/
    └── index.html        # Main HTML template
```

## 💡 Usage Examples

### Accessing Different Models
Click the chip icon in the header to select between:
- **Auto**: Default selection for balanced performance
- **GPT-4o Mini**: Faster responses with good quality
- **GPT-4o**: Maximum quality for complex queries
- **O4 Mini**: Alternative balanced option

### Voice Input
Click the microphone icon to activate voice input and speak your prompt.

## 🔍 How It Works

The core functionality in `voidgpt.py` implements a custom client that:

1. Generates temporary session data and tokens
2. Solves ChatGPT's sentinel challenges
3. Constructs proper request headers and body content
4. Manages response parsing to extract AI replies
5. Provides an OpenAI-compatible interface for easy integration

This bypasses the standard authentication flow and enables direct communication with ChatGPT's backend services.

## 🌟 Credits

- Core reverse engineering implementation by [void-eth](https://github.com/void-eth)
- Main reverse engineering research by the [Webscout team](https://github.com/OEvortex/Webscout)
- Web GUI and modifications by the [void-eth](https://github.com/void-eth)

## ⚠️ Legal Disclaimer

This project is provided strictly for **educational and research purposes**. The developers do not endorse bypassing API restrictions or terms of service violations. Users assume all responsibility for how they use this software. Usage may violate OpenAI's Terms of Service.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
