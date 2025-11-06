class ChatApp {
    constructor() {
        this.modelManager = new ModelManager();
        this.isProcessing = false;
        this.initializeEventListeners();
        this.updateStatus();
        this.showWelcomeTips();
    }

    initializeEventListeners() {
        const sendButton = document.getElementById('sendButton');
        const messageInput = document.getElementById('messageInput');
        const modelSelect = document.getElementById('modelSelect');
        const autoSelectButton = document.getElementById('autoSelect');

        sendButton.addEventListener('click', () => this.sendMessage());
        
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        messageInput.addEventListener('input', () => {
            this.updateAutoSelectVisibility();
        });

        modelSelect.addEventListener('change', (e) => {
            this.modelManager.switchModel(e.target.value);
            this.updateStatus();
            this.showNotification(`Switched to ${CONFIG.APIs[e.target.value]?.name}`);
        });

        autoSelectButton.addEventListener('click', () => {
            this.autoSelectModel();
        });
    }

    updateAutoSelectVisibility() {
        const messageInput = document.getElementById('messageInput');
        const autoSelectButton = document.getElementById('autoSelect');
        const hasText = messageInput.value.trim().length > 0;
        
        autoSelectButton.style.opacity = hasText ? '1' : '0.6';
        autoSelectButton.style.cursor = hasText ? 'pointer' : 'not-allowed';
    }

    autoSelectModel() {
        const messageInput = document.getElementById('messageInput');
        const question = messageInput.value.trim();
        
        if (!question) {
            this.showNotification('Please type a question first!', 'warning');
            return;
        }

        const bestModel = this.modelManager.getBestModel(question);
        const modelSelect = document.getElementById('modelSelect');
        
        modelSelect.value = bestModel;
        this.modelManager.switchModel(bestModel);
        this.updateStatus();
        
        const modelInfo = CONFIG.APIs[bestModel];
        this.showNotification(`🎯 Auto-selected ${modelInfo.name} - ${modelInfo.description}`);
    }

    async sendMessage() {
        if (this.isProcessing) return;
        
        const messageInput = document.getElementById('messageInput');
        const message = messageInput.value.trim();

        if (!message) return;

        this.isProcessing = true;
        this.addMessageToChat('user', message, this.modelManager.currentModel);
        messageInput.value = '';

        const sendButton = document.getElementById('sendButton');
        sendButton.disabled = true;
        sendButton.innerHTML = '<span class="btn-text">Thinking</span><span class="btn-icon">⏳</span>';

        try {
            const response = await this.modelManager.sendMessage(message);
            this.addMessageToChat('ai', response, this.modelManager.currentModel);
        } catch (error) {
            console.error('Chat error:', error);
            this.addMessageToChat('ai', `❌ Error: ${error.message}\n\nTry selecting a different model or rephrasing your question.`, this.modelManager.currentModel);
        } finally {
            this.isProcessing = false;
            sendButton.disabled = false;
            sendButton.innerHTML = '<span class="btn-text">Send</span><span class="btn-icon">📤</span>';
            this.updateStatus();
            this.updateAutoSelectVisibility();
        }
    }

    addMessageToChat(sender, text, model) {
        const chatMessages = document.getElementById('chatMessages');
        
        // Remove welcome message if it's the first real message
        const welcomeMessage = chatMessages.querySelector('.welcome-message');
        if (welcomeMessage && sender === 'user') {
            welcomeMessage.style.display = 'none';
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const modelInfo = CONFIG.APIs[model];
        const header = document.createElement('div');
        header.className = 'message-header';
        header.textContent = `${sender === 'user' ? 'You' : modelInfo?.name || model} • ${new Date().toLocaleTimeString()}`;

        const content = document.createElement('div');
        content.textContent = text;
        content.style.whiteSpace = 'pre-wrap';

        messageDiv.appendChild(header);
        messageDiv.appendChild(content);
        chatMessages.appendChild(messageDiv);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    updateStatus() {
        const currentModelSpan = document.getElementById('currentModel');
        const apiStatusSpan = document.getElementById('apiStatus');

        const modelInfo = CONFIG.APIs[this.modelManager.currentModel];
        currentModelSpan.textContent = `Active: ${modelInfo?.name}`;
        apiStatusSpan.textContent = this.isProcessing ? 'Status: Thinking...' : 'Status: Ready ✅';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const bgColor = type === 'warning' ? '#e74c3c' : '#27ae60';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
            font-weight: 500;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    showWelcomeTips() {
        // Add CSS animations for notifications
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});
