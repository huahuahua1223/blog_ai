// Ollama API配置
const CONFIG = {
    // 默认本地URL
    LOCAL_API_URL: 'http://localhost:11434',
    
    // Ngrok URL (需要替换为您的Ngrok地址)
    // NGROK_API_URL: 'https://your-ngrok-url.ngrok.io', // 替换为您的Ngrok URL
    NGROK_API_URL: 'https://sweeping-redbird-striking.ngrok-free.app', // 替换为您的Ngrok URL

    // 当前使用的API URL
    get API_URL() {
        // 检测是否是生产环境
        const isProduction = window.location.hostname !== 'localhost' && 
                            !window.location.hostname.includes('127.0.0.1');
        
        // 使用本地存储保存的URL或默认选择
        const savedUrl = localStorage.getItem('ollama_api_url');
        
        if (savedUrl) {
            return savedUrl;
        } else if (isProduction) {
            return this.NGROK_API_URL;
        } else {
            return this.LOCAL_API_URL;
        }
    },
    
    // 设置API URL
    setApiUrl(url) {
        localStorage.setItem('ollama_api_url', url);
        // 刷新页面以应用新URL
        window.location.reload();
    }
};

// 导出配置
window.OLLAMA_CONFIG = CONFIG; 