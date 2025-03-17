// OpenAI API配置
const CONFIG = {
    // API基础URL - 从环境变量获取或使用默认值
    get BASE_URL() {
        return window.ENV?.API_BASE_URL || '';
    },
    
    // API密钥 - 从环境变量获取或使用默认值
    get API_KEY() {
        return window.ENV?.API_KEY || '';
    },
    
    // 模型名称 - 从环境变量获取或使用默认值
    get MODEL() {
        return window.ENV?.API_MODEL || 'deepseek-reasoner';
    },
    
    // 获取当前API配置
    get API_CONFIG() {
        // 使用本地存储保存的配置或默认配置
        const savedBaseUrl = localStorage.getItem('openai_base_url');
        const savedApiKey = localStorage.getItem('openai_api_key');
        const savedModel = localStorage.getItem('openai_model');
        
        return {
            baseUrl: savedBaseUrl || this.BASE_URL,
            apiKey: savedApiKey || this.API_KEY,
            model: savedModel || this.MODEL
        };
    },
    
    // 设置API配置
    setApiConfig(baseUrl, apiKey, model) {
        if (baseUrl) localStorage.setItem('openai_base_url', baseUrl);
        if (apiKey) localStorage.setItem('openai_api_key', apiKey);
        if (model) localStorage.setItem('openai_model', model);
        // 刷新页面以应用新配置
        window.location.reload();
    }
};

// 导出配置
window.API_CONFIG = CONFIG; 