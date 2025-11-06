class ModelManager {
    constructor() {
        this.conversationHistory = [];
        this.currentModel = 'gemini';
    }

    async sendMessage(message, model = null) {
        const selectedModel = model || this.currentModel;
        
        this.conversationHistory.push({
            sender: 'user',
            text: message,
            model: selectedModel,
            timestamp: new Date().toISOString()
        });

        try {
            let response;
            
            switch(selectedModel) {
                case 'gemini':
                    response = await APIHandlers.handleGemini(message, this.conversationHistory);
                    break;
                case 'qwen':
                    response = await APIHandlers.handleQwen(message, this.conversationHistory);
                    break;
                case 'claude':
                    response = await APIHandlers.handleClaude(message, this.conversationHistory);
                    break;
                case 'llama':
                    response = await APIHandlers.handleLlama(message, this.conversationHistory);
                    break;
                default:
                    throw new Error(`Unknown model: ${selectedModel}`);
            }

            this.conversationHistory.push({
                sender: 'ai',
                text: response,
                model: selectedModel,
                timestamp: new Date().toISOString()
            });

            return response;

        } catch (error) {
            console.error(`Error with ${selectedModel}:`, error);
            throw error;
        }
    }

    analyzeQuestion(question) {
        const lowerQuestion = question.toLowerCase();
        
        if (lowerQuestion.includes('code') || lowerQuestion.includes('program') || 
            lowerQuestion.includes('python') || lowerQuestion.includes('javascript')) {
            return 'coding';
        } else if (lowerQuestion.includes('creative') || lowerQuestion.includes('story') || 
                   lowerQuestion.includes('write') || lowerQuestion.includes('poem')) {
            return 'creative';
        } else if (lowerQuestion.includes('technical') || lowerQuestion.includes('science') || 
                   lowerQuestion.includes('math') || lowerQuestion.includes('physics')) {
            return 'technical';
        } else if (lowerQuestion.includes('reason') || lowerQuestion.includes('logic') || 
                   lowerQuestion.includes('problem')) {
            return 'reasoning';
        } else {
            return 'general';
        }
    }

    getBestModel(question) {
        const category = this.analyzeQuestion(question);
        const preferredModels = CONFIG.modelPreferences[category] || CONFIG.modelPreferences.general;
        
        for (const model of preferredModels) {
            if (CONFIG.APIs[model] && CONFIG.APIs[model].free) {
                return model;
            }
        }
        
        return 'gemini';
    }

    switchModel(newModel) {
        this.currentModel = newModel;
        return this.currentModel;
    }

    getConversationHistory() {
        return this.conversationHistory;
    }

    clearHistory() {
        this.conversationHistory = [];
    }
}
