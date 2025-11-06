const CONFIG = {
    APIs: {
        qwen: {
            name: "Qwen 2.5 (72B)",
            endpoint: "https://api.openrouter.ai/api/v1/chat/completions",
            model: "qwen/qwen-2.5-72b-instruct:free",
            free: true
        },
        mixtral: {
            name: "Mixtral 8x7B", 
            endpoint: "https://api.openrouter.ai/api/v1/chat/completions",
            model: "mistralai/mixtral-8x7b-instruct:free",
            free: true
        },
        llama: {
            name: "Llama 3.1 (8B)",
            endpoint: "https://api.openrouter.ai/api/v1/chat/completions", 
            model: "meta-llama/llama-3.1-8b-instruct:free",
            free: true
        },
        codellama: {
            name: "Code Llama (34B)",
            endpoint: "https://api.openrouter.ai/api/v1/chat/completions",
            model: "codellama/codellama-34b-instruct:free",
            free: true
        }
    }
};
