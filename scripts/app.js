class ChatApp {
    constructor() {
        this.modelManager = new ModelManager();
        this.isProcessing = false;
        this.initializeEventListeners();
        this.updateStatus();
    }

    initializeEventListeners() {
        const sendButton = document.getElementById('sendButton');
        const messageInput = document.getElementById('messageInput');
        const modelSelect = document.getElementById('modelSelect');

        sendButton.addEventListener('click', () => this.sendMessage());
        
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        modelSelect.addEventListener('change', (e) => {
            this.modelManager.switchModel(e.target.value);
            this.updateStatus();
        });
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
        sendButton.textContent = 'Thinking...';

        try {
            const response = await this.modelManager.sendMessage(message);
            this.addMessageToChat('ai', response, this.modelManager.currentModel);
        } catch (error) {
            this.addMessageToChat('ai', `Error: ${error.message}`, this.modelManager.currentModel);
        } finally {
            this.isProcessing = false;
            sendButton.disabled = false;
            sendButton.textContent = 'Send';
            this.updateStatus();
        }
    }

    addMessageToChat(sender, text, model) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const modelInfo = CONFIG.APIs[model];
        const header = document.createElement('div');
        header.className = 'message-header';
        header.textContent = `${sender === 'user' ? 'You' : modelInfo?.name || model} • ${new Date().toLocaleTimeString()}`;

        const content = document.createElement('div');
        content.textContent = text;

        messageDiv.appendChild(header);
        messageDiv.appendChild(content);
        chatMessages.appendChild(messageDiv);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    updateStatus() {
        const currentModelSpan = document.getElementById('currentModel');
        const modelInfo = CONFIG.APIs[this.modelManager.currentModel];
        currentModelSpan.textContent = `Ready: ${modelInfo?.name || this.modelManager.currentModel}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});
