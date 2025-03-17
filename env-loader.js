// 环境变量加载器
(function() {
    // 读取.env文件并解析环境变量
    function loadEnv() {
        return new Promise((resolve, reject) => {
            fetch('.env')
                .then(response => {
                    if (!response.ok) {
                        console.warn('无法加载.env文件，将使用默认配置');
                        return ''; // 返回空字符串以便继续处理
                    }
                    return response.text();
                })
                .then(text => {
                    const env = {};
                    
                    // 解析环境变量
                    if (text) {
                        const lines = text.split('\n');
                        for (const line of lines) {
                            // 忽略注释和空行
                            if (line.trim() === '' || line.startsWith('#')) continue;
                            
                            const [key, ...valueParts] = line.split('=');
                            const value = valueParts.join('='); // 处理值中可能包含=的情况
                            
                            if (key && value) {
                                env[key.trim()] = value.trim();
                            }
                        }
                    }
                    
                    // 将环境变量暴露给window对象
                    window.ENV = env;
                    resolve(env);
                })
                .catch(error => {
                    console.error('加载环境变量出错:', error);
                    window.ENV = {}; // 设置空对象作为后备
                    reject(error);
                });
        });
    }
    
    // 导出环境变量加载函数
    window.loadEnv = loadEnv;
})(); 