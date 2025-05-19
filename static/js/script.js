document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const promptInput = document.getElementById('prompt-input');
    const chatMessages = document.getElementById('chat-messages');
    const themeToggle = document.getElementById('theme-toggle');
    const clearChat = document.getElementById('clear-chat');
    const voiceInput = document.getElementById('voice-input');
    
    // Modal elements
    const modal = document.getElementById('alert-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalConfirm = document.getElementById('modal-confirm');
    const modalCancel = document.getElementById('modal-cancel');
    const closeModal = document.getElementById('close-modal');
    
    let pendingModalAction = null;
    let recognition = null;
    let isListening = false;
    
    const modelToggle = document.getElementById('model-toggle');
	const modelDropdown = document.getElementById('model-dropdown');
	const currentModelText = document.getElementById('current-model');
	const modelOptions = document.querySelectorAll('.model-option');
	let currentModel = localStorage.getItem('selectedModel') || 'auto';
    
    // Configure marked.js options
    marked.setOptions({
        renderer: new marked.Renderer(),
        highlight: function(code, language) {
            const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
            return hljs.highlight(validLanguage, code).value;
        },
        langPrefix: 'hljs language-',
        pedantic: false,
        gfm: true,
        breaks: true,
        sanitize: false,
        smartypants: false,
        xhtml: false
    });
    
    // Initialize speech recognition
    function initSpeechRecognition() {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            // Create speech recognition instance
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            
            recognition.onstart = function() {
                voiceInput.classList.add('active');
                promptInput.placeholder = 'Listening...';
                isListening = true;
            };
            
            recognition.onresult = function(event) {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                    
                promptInput.value = transcript;
                // Resize the input as it gets filled
                promptInput.style.height = 'auto';
                promptInput.style.height = Math.min(promptInput.scrollHeight, 120) + 'px';
            };
            
            recognition.onerror = function(event) {
                console.error('Speech recognition error', event.error);
                stopListening();
                if (event.error === 'not-allowed') {
                    showModal(
                        'Microphone Access',
                        'Please allow microphone access to use voice input.',
                        null
                    );
                }
            };
            
            recognition.onend = function() {
                stopListening();
            };
            
            return true;
        } else {
            // Speech recognition not supported
            voiceInput.style.display = 'none'; // Hide the voice button
            return false;
        }
    }
    
    // Toggle voice input
    voiceInput.addEventListener('click', function() {
        if (!recognition) {
            if (!initSpeechRecognition()) {
                showModal(
                    'Not Supported',
                    'Voice recognition is not supported in this browser.',
                    null
                );
                return;
            }
        }
        
        if (isListening) {
            recognition.stop();
        } else {
            promptInput.focus();
            recognition.start();
        }
    });
    
    // Stop listening
    function stopListening() {
        voiceInput.classList.remove('active');
        promptInput.placeholder = 'Type your message...';
        isListening = false;
    }
    
    // Function to show modal
    function showModal(title, message, confirmAction) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        pendingModalAction = confirmAction;
        modal.classList.add('show');
    }
    
    // Function to hide modal
    function hideModal() {
        modal.classList.remove('show');
        pendingModalAction = null;
    }
    
    // Modal event listeners
    modalConfirm.addEventListener('click', function() {
        if (pendingModalAction) {
            pendingModalAction();
        }
        hideModal();
    });
    
    modalCancel.addEventListener('click', hideModal);
    closeModal.addEventListener('click', hideModal);
    
    // Close modal when clicking outside content
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideModal();
        }
    });
    
    // Theme toggle functionality
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        themeToggle.innerHTML = isDark 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
        
        // Save theme preference
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Clear chat functionality
    clearChat.addEventListener('click', function() {
        showModal(
            'Clear Conversation',
            'Are you sure you want to clear the chat history?',
            function() {
                // Keep only the first welcome message
                const firstMessage = chatMessages.querySelector('.message-group');
                chatMessages.innerHTML = '';
                chatMessages.appendChild(firstMessage);
            }
        );
    });
    
    // Format timestamp
    function formatTime() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        
        return `${hours}:${minutes} ${ampm}`;
    }
    
    // Auto-resize textarea on input
    promptInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
    
    // Function to add a message to the chat
    function addMessage(message, isUser = false, isBlocked = false) {
        // Create message group if it doesn't exist or if previous message was from a different sender
        let lastGroup = chatMessages.lastElementChild;
        const lastMessageIsUser = lastGroup ? 
            lastGroup.querySelector('.message').classList.contains('user-message') : false;
            
        // Create a new group if needed
        if (!lastGroup || lastMessageIsUser !== isUser) {
            lastGroup = document.createElement('div');
            lastGroup.classList.add('message-group');
            chatMessages.appendChild(lastGroup);
        }
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'animated', 'fadeInUp');
        messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
        
        // Add avatar
        const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('message-avatar');
        const avatarIcon = document.createElement('i');
        avatarIcon.className = isUser ? 'fas fa-user' : 'fas fa-robot';
        avatarDiv.appendChild(avatarIcon);
        
        // Create message bubble
        const bubbleDiv = document.createElement('div');
        bubbleDiv.classList.add('message-bubble');
        
        // Add copy button to message
        const copyButton = document.createElement('button');
        copyButton.className = 'message-copy-button';
        copyButton.innerHTML = '<i class="fas fa-copy"></i><span class="tooltip">Copy message</span>';
        copyButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent bubble click events
            
            // Get just the text content without formatting
            const rawMessageText = message;
            
            navigator.clipboard.writeText(rawMessageText).then(function() {
                // Success feedback
                const originalHTML = copyButton.innerHTML;
                copyButton.innerHTML = '<i class="fas fa-check"></i><span class="tooltip">Copied!</span>';
                setTimeout(function() {
                    copyButton.innerHTML = originalHTML;
                }, 2000);
            }).catch(function() {
                // Error feedback
                const originalHTML = copyButton.innerHTML;
                copyButton.innerHTML = '<i class="fas fa-times"></i><span class="tooltip">Error!</span>';
                setTimeout(function() {
                    copyButton.innerHTML = originalHTML;
                }, 2000);
            });
        });
        bubbleDiv.appendChild(copyButton);
        
        // Add message info
        const infoDiv = document.createElement('div');
        infoDiv.classList.add('message-info');
        
        const senderSpan = document.createElement('span');
        senderSpan.classList.add('message-sender');
        senderSpan.textContent = isUser ? 'You' : 'VoidGPT';
        
        const timeSpan = document.createElement('span');
        timeSpan.classList.add('message-time');
        timeSpan.textContent = formatTime();
        
        infoDiv.appendChild(senderSpan);
        infoDiv.appendChild(timeSpan);
        
        // Add message content with markdown
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        
        // Process markdown and set as HTML
        contentDiv.innerHTML = processMessageContent(message, isUser);
        
        // Add warning message if content is blocked (only for AI messages)
        if (!isUser && isBlocked) {
            const warningDiv = document.createElement('div');
            warningDiv.classList.add('message-warning');
            warningDiv.innerHTML = '⚠️ Warning: This response was flagged and may contain inappropriate content.';
            contentDiv.appendChild(warningDiv);
        }
        
        // Add code block copy buttons
        setTimeout(() => {
            addCodeBlockCopyButtons(contentDiv);
        }, 0);
        
        // Assemble the message
        bubbleDiv.appendChild(infoDiv);
        bubbleDiv.appendChild(contentDiv);
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(bubbleDiv);
        
        // Add to chat
        lastGroup.appendChild(messageDiv);
        
        // Scroll to the bottom of the chat
        scrollToBottom();
    }
	
	// Function to process message content with markdown
	function processMessageContent(content, isUser) {
	    // First, escape any HTML in the content to prevent XSS
	    let safeContent = content;
	    
	    if (isUser) {
	        // For user messages, encode HTML entities to prevent XSS
	        safeContent = escapeHtml(content);
	        
	        // Add simple link formatting without using markdown parser
	        safeContent = addSimpleLinks(safeContent);
	        
	        return safeContent;
	    } else {
	        // For AI responses, use marked with proper sanitization
	        const processedContent = marked.parse(safeContent);
	        return processedContent;
	    }
	}
	
	// Function to escape HTML to prevent XSS
	function escapeHtml(unsafe) {
	    return unsafe
	        .replace(/&/g, "&amp;")
	        .replace(/</g, "&lt;")
	        .replace(/>/g, "&gt;")
	        .replace(/"/g, "&quot;")
	        .replace(/'/g, "&#039;");
	}
	
	// Function to add simple link formatting to user messages
	function addSimpleLinks(text) {
	    // Regex to match URLs
	    const urlRegex = /(https?:\/\/[^\s]+)/g;
	    return text.replace(urlRegex, function(url) {
	        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
	    });
	}
	
	// Function to add copy buttons to code blocks
	function addCodeBlockCopyButtons(contentDiv) {
	    const codeBlocks = contentDiv.querySelectorAll('pre code');
	    
	    codeBlocks.forEach((codeBlock, index) => {
	        // Get parent pre element
	        const preBlock = codeBlock.parentNode;
	        
	        // Try to determine language
	        const className = codeBlock.className || '';
	        const languageMatch = className.match(/language-(\w+)/);
	        const language = languageMatch ? languageMatch[1] : 'text';
	        
	        // Create code block header
	        const headerDiv = document.createElement('div');
	        headerDiv.className = 'code-block-header';
	        
	        // Add language indicator
	        const languageSpan = document.createElement('span');
	        languageSpan.className = 'code-language';
	        languageSpan.textContent = language.toUpperCase();
	        headerDiv.appendChild(languageSpan);
	        
	        // Create copy button
	        const copyButton = document.createElement('button');
	        copyButton.className = 'copy-code-button';
	        copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
	        copyButton.addEventListener('click', function() {
	            const textToCopy = codeBlock.textContent;
	            
	            navigator.clipboard.writeText(textToCopy).then(function() {
	                // Success feedback
	                copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
	                setTimeout(function() {
	                    copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
	                }, 2000);
	            }).catch(function() {
	                // Error feedback
	                copyButton.innerHTML = '<i class="fas fa-times"></i> Error!';
	                setTimeout(function() {
	                    copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
	                }, 2000);
	            });
	        });
	        
	        headerDiv.appendChild(copyButton);
	        
	        // Insert header before the pre element
	        preBlock.insertAdjacentElement('beforebegin', headerDiv);
	        
	        // Group the header and pre element
	        const wrapperDiv = document.createElement('div');
	        wrapperDiv.style.marginBottom = '16px';
	        wrapperDiv.style.borderRadius = '8px';
	        wrapperDiv.style.overflow = 'hidden';
	        
	        // Replace pre with the new wrapper containing both header and pre
	        preBlock.parentNode.insertBefore(wrapperDiv, preBlock);
	        wrapperDiv.appendChild(headerDiv);
	        wrapperDiv.appendChild(preBlock);
	    });
	}
    
    // Function to scroll to bottom
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to show "thinking" indicator
    function showThinking() {
        const thinkingDiv = document.createElement('div');
        thinkingDiv.classList.add('thinking');
        thinkingDiv.id = 'thinking-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            thinkingDiv.appendChild(dot);
        }
        
        chatMessages.appendChild(thinkingDiv);
        scrollToBottom();
    }
    
    // Function to remove "thinking" indicator
    function removeThinking() {
        const thinkingDiv = document.getElementById('thinking-indicator');
        if (thinkingDiv) {
            thinkingDiv.remove();
        }
    }
    
    // Handle form submission
    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Stop voice recognition if active
        if (isListening && recognition) {
            recognition.stop();
        }
        
        const prompt = promptInput.value.trim();
        if (!prompt) return;
        
        // Add user message to chat
        addMessage(prompt, true);
        
        // Clear input and reset height
        promptInput.value = '';
        promptInput.style.height = 'auto';
        
        // Show thinking indicator
        showThinking();
        
        try {
            // Send prompt to server
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: prompt, model: currentModel }),
            });
            
            const data = await response.json();
            
            // Remove thinking indicator
            removeThinking();
            
            // Add AI response to chat - now with the blocked flag
            addMessage(data.response.content, false, data.response.blocked);
        } catch (error) {
            // Remove thinking indicator
            removeThinking();
            
            // Add error message
            addMessage('Sorry, there was an error processing your request. Please try again.');
            console.error('Error:', error);
        }
    });
    
    // Ensure the textarea is properly sized on load
    promptInput.style.height = 'auto';
    
    // Focus input on page load
    promptInput.focus();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // ESC key closes the modal
        if (e.key === 'Escape') {
            if (modal.classList.contains('show')) {
                hideModal();
            }
            if (isListening && recognition) {
                recognition.stop();
            }
        }
        
        // Ctrl/Cmd + Enter submits the form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (promptInput.value.trim()) {
                chatForm.dispatchEvent(new Event('submit'));
            }
        }
    });
    
    // Initialize speech recognition if available
    initSpeechRecognition();
    
    // Fix for mobile virtual keyboard issues
    let resizeTimeout;
	window.addEventListener('resize', function() {
	    clearTimeout(resizeTimeout);
	    resizeTimeout = setTimeout(() => {
	        setViewportHeight();
	        updateContentPadding();
	        scrollToBottom();
	    }, 150);
	});
    
    // Special fix for iOS Safari
    function fixIOSViewport() {
        // Only apply to iOS devices
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
            document.documentElement.style.height = '100%';
            setTimeout(function() {
                window.scrollTo(0, 1);
            }, 300);
        }
    }
    
    fixIOSViewport();
    
    // At page load and on resize
	function setViewportHeight() {
	    const vh = window.innerHeight * 0.01;
	    document.documentElement.style.setProperty('--vh', `${vh}px`);
	}
	window.addEventListener('resize', setViewportHeight);
	setViewportHeight();
    
    // Set a bottom margin to ensure content isn't hidden behind the input bar
    function updateContentPadding() {
        const inputHeight = document.querySelector('.chat-input-wrapper').offsetHeight;
        document.querySelector('.chat-messages').style.paddingBottom = `${inputHeight + 20}px`;
    }
    
    // Update padding on load and resize
    updateContentPadding();
    window.addEventListener('resize', updateContentPadding);
    
	// Update the initModelSelector function
	function initModelSelector() {
	    // Set initial model from localStorage or default to 'auto'
	    updateModelSelection(currentModel);
	    
	    // Toggle dropdown when clicking the button
	    modelToggle.addEventListener('click', function(e) {
	        e.stopPropagation();
	        modelDropdown.classList.toggle('show');
	    });
	    
	    // Close dropdown when clicking outside
	    document.addEventListener('click', function() {
	        modelDropdown.classList.remove('show');
	    });
	    
	    // Prevent clicks inside dropdown from closing it
	    modelDropdown.addEventListener('click', function(e) {
	        e.stopPropagation();
	    });
	    
	    // Handle model selection
	    modelOptions.forEach(option => {
	        option.addEventListener('click', function() {
	            const model = this.getAttribute('data-model');
	            updateModelSelection(model);
	            modelDropdown.classList.remove('show');
	        });
	    });
	    
	    // Add indicator to model toggle button based on selected model
	    updateModelToggleIndicator();
	}
	
	// New function to update the model toggle indicator
	function updateModelToggleIndicator() {
	    // Remove any existing indicator classes
	    modelToggle.classList.remove('model-auto', 'model-gpt-4o-mini', 'model-gpt-4o', 'model-o4-mini');
	    
	    // Add class based on current model
	    modelToggle.classList.add(`model-${currentModel}`);
	    
	    // Update tooltip to show current model
	    const selectedOption = document.querySelector(`.model-option[data-model="${currentModel}"]`);
	    const modelName = selectedOption.querySelector('.model-name').textContent;
	    modelToggle.setAttribute('aria-label', `Model: ${modelName}`);
	}
	
	// Update the updateModelSelection function
	function updateModelSelection(model) {
	    currentModel = model;
	    localStorage.setItem('selectedModel', model);
	    
	    // Update selected styling
	    modelOptions.forEach(option => {
	        option.classList.remove('selected');
	    });
	    
	    const selectedOption = document.querySelector(`.model-option[data-model="${model}"]`);
	    selectedOption.classList.add('selected');
	    
	    // Update the indicator
	    updateModelToggleIndicator();
	}
	initModelSelector();
});
