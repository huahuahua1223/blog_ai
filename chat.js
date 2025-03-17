// 获取API配置的函数
function getApiConfig() {
    return window.API_CONFIG ? window.API_CONFIG.API_CONFIG : {
        baseUrl: window.ENV?.API_BASE_URL,
        apiKey: window.ENV?.API_KEY,
        model: window.ENV?.API_MODEL
    };
}

// 与OpenAI API (deepseek-reasoner模型)交互的代码
document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chatMessages');
    const userMessageInput = document.getElementById('userMessage');
    const sendButton = document.getElementById('sendMessage');
    
    // 知识库管理
    let knowledgeBases = []; // 存储知识库列表
    let currentContext = ''; // 存储当前上下文
    
    // 创建知识库管理区域
    const kbManagerDiv = document.createElement('div');
    kbManagerDiv.className = 'kb-manager';
    kbManagerDiv.style.margin = '15px 0';
    kbManagerDiv.style.padding = '15px';
    kbManagerDiv.style.backgroundColor = 'var(--light-gray)';
    kbManagerDiv.style.borderRadius = '10px';
    
    const kbTitle = document.createElement('h3');
    kbTitle.textContent = '知识库管理';
    kbTitle.style.marginBottom = '10px';
    kbTitle.style.fontSize = '1.1rem';
    
    const kbList = document.createElement('div');
    kbList.className = 'kb-list';
    kbList.style.marginBottom = '15px';
    kbList.style.maxHeight = '150px';
    kbList.style.overflowY = 'auto';
    
    const kbEmptyText = document.createElement('p');
    kbEmptyText.textContent = '未加载任何知识库';
    kbEmptyText.style.color = 'var(--thinking-color)';
    kbEmptyText.style.fontStyle = 'italic';
    kbEmptyText.style.padding = '5px 0';
    kbList.appendChild(kbEmptyText);
    
    kbManagerDiv.appendChild(kbTitle);
    kbManagerDiv.appendChild(kbList);
    
    // 创建文件上传区域
    const fileUploadDiv = document.createElement('div');
    fileUploadDiv.className = 'file-upload';
    fileUploadDiv.style.display = 'flex';
    fileUploadDiv.style.flexWrap = 'wrap';
    fileUploadDiv.style.gap = '10px';
    fileUploadDiv.style.alignItems = 'center';
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'docUpload';
    fileInput.accept = '.txt,.pdf,.docx,.md';
    fileInput.style.display = 'none';
    
    const fileLabel = document.createElement('label');
    fileLabel.htmlFor = 'docUpload';
    fileLabel.className = 'btn';
    fileLabel.innerHTML = '<i class="fas fa-upload"></i> 上传知识文件';
    fileLabel.style.display = 'inline-block';
    
    fileUploadDiv.appendChild(fileInput);
    fileUploadDiv.appendChild(fileLabel);
    
    // 添加清除按钮
    const clearAllButton = document.createElement('button');
    clearAllButton.className = 'btn';
    clearAllButton.innerHTML = '<i class="fas fa-trash"></i> 清除所有知识库';
    clearAllButton.addEventListener('click', () => {
        knowledgeBases = [];
        currentContext = '';
        updateKnowledgeBaseList();
        addMessage('已清除所有知识库，将使用模型的原始知识回答问题。', false);
    });
    
    fileUploadDiv.appendChild(clearAllButton);
    kbManagerDiv.appendChild(fileUploadDiv);
    
    // 将知识库管理区域添加到聊天输入上方
    const chatContainer = document.querySelector('.chat-container');
    chatContainer.insertBefore(kbManagerDiv, document.querySelector('.chat-messages'));
    
    // 更新知识库列表显示
    function updateKnowledgeBaseList() {
        kbList.innerHTML = '';
        
        if (knowledgeBases.length === 0) {
            const emptyText = document.createElement('p');
            emptyText.textContent = '未加载任何知识库';
            emptyText.style.color = 'var(--thinking-color)';
            emptyText.style.fontStyle = 'italic';
            emptyText.style.padding = '5px 0';
            kbList.appendChild(emptyText);
            return;
        }
        
        // 重建知识库的综合上下文
        currentContext = knowledgeBases.map(kb => `[${kb.name}]: ${kb.content}`).join('\n\n');
        
        // 创建知识库列表
        knowledgeBases.forEach((kb, index) => {
            const kbItem = document.createElement('div');
            kbItem.className = 'kb-item';
            kbItem.style.display = 'flex';
            kbItem.style.justifyContent = 'space-between';
            kbItem.style.alignItems = 'center';
            kbItem.style.padding = '8px';
            kbItem.style.marginBottom = '5px';
            kbItem.style.backgroundColor = 'var(--background-color)';
            kbItem.style.borderRadius = '5px';
            kbItem.style.boxShadow = 'var(--box-shadow)';
            
            const kbInfo = document.createElement('div');
            kbInfo.style.flex = '1';
            
            const kbName = document.createElement('div');
            kbName.textContent = kb.name;
            kbName.style.fontWeight = 'bold';
            
            const kbSize = document.createElement('div');
            kbSize.textContent = `${Math.round(kb.content.length / 1024 * 10) / 10} KB`;
            kbSize.style.fontSize = '0.8rem';
            kbSize.style.color = 'var(--thinking-color)';
            
            kbInfo.appendChild(kbName);
            kbInfo.appendChild(kbSize);
            
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.className = 'kb-remove';
            removeBtn.style.background = 'none';
            removeBtn.style.border = 'none';
            removeBtn.style.color = 'var(--accent-color)';
            removeBtn.style.cursor = 'pointer';
            removeBtn.style.fontSize = '1rem';
            removeBtn.style.padding = '5px';
            removeBtn.title = '移除此知识库';
            
            removeBtn.addEventListener('click', () => {
                knowledgeBases.splice(index, 1);
                updateKnowledgeBaseList();
                addMessage(`已移除知识库: ${kb.name}`, false);
            });
            
            kbItem.appendChild(kbInfo);
            kbItem.appendChild(removeBtn);
            kbList.appendChild(kbItem);
        });
    }
    
    // 处理文件上传
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            // 读取文件内容
            const content = await readFileContent(file);
            
            // 添加到知识库
            knowledgeBases.push({
                name: file.name,
                content: content,
                size: file.size,
                type: file.type
            });
            
            // 更新知识库列表
            updateKnowledgeBaseList();
            
            // 通知用户文件已加载
            addMessage(`知识库文件 "${file.name}" 已加载，您现在可以基于此文件内容提问。`, false);
            
            // 重置文件输入
            fileInput.value = '';
        } catch (error) {
            console.error('读取文件失败:', error);
            addMessage(`文件读取失败: ${error.message}`, false);
        }
    });
    
    // 预加载jh.txt知识库
    async function preloadKnowledgeBase() {
        try {
            const response = await fetch('jh.txt');
            if (!response.ok) {
                console.error('加载jh.txt失败:', response.statusText);
                return;
            }
            
            const content = await response.text();
            knowledgeBases.push({
                name: 'jh.txt',
                content: content,
                size: content.length,
                type: 'text/plain'
            });
            
            // 更新知识库列表
            updateKnowledgeBaseList();
            
            // 通知用户文件已预加载
            addMessage('系统已预加载知识库文件 "jh.txt"，您现在可以基于此文件内容提问。', false);
        } catch (error) {
            console.error('预加载知识库失败:', error);
        }
    }
    
    // 读取不同类型文件内容的函数
    async function readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            // 处理不同文件类型
            if (file.type === 'application/pdf') {
                // 对于PDF文件，我们可能需要使用专门的PDF解析库
                // 这里使用简单提示，实际项目中可以集成pdf.js等库
                resolve("PDF文件需要特殊处理，此示例仅支持文本文件。请上传txt或md文件。");
            } else if (file.name.endsWith('.docx')) {
                // 对于Word文件，也需要专门的解析库
                resolve("Word文件需要特殊处理，此示例仅支持文本文件。请上传txt或md文件。");
            } else {
                // 文本文件直接读取
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = (e) => reject(new Error('文件读取失败'));
                reader.readAsText(file);
            }
        });
    }
    
    // 添加消息到聊天区域
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const paragraph = document.createElement('p');
        paragraph.textContent = content;
        
        messageContent.appendChild(paragraph);
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        // 自动滚动到最新消息
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return messageDiv; // 返回消息元素，以便后续更新
    }
    
    // 发送消息给OpenAI API
    async function sendToOpenAI(message) {
        try {
            // 创建消息元素但显示正在思考
            const botMessage = addMessage('思考中...', false);
            
            try {
                const apiConfig = getApiConfig();
                
                // 准备消息数组
                const messages = [];
                
                // 如果有上下文，则添加到系统消息中
                if (currentContext) {
                    messages.push({
                        role: "system", 
                        content: `我将为你提供一些背景知识，请基于这些知识回答我的问题。请在回答问题时，先进行思考分析，然后给出最终答案。请确保你的思考过程可见。\n\n背景知识：\n${currentContext}`
                    });
                } else {
                    messages.push({
                        role: "system", 
                        content: "请在回答问题时展示你的思考过程，先分析问题，然后给出答案。请确保你的思考过程对用户可见。"
                    });
                }
                
                // 添加用户消息
                messages.push({
                    role: "user",
                    content: message
                });
                
                // 准备请求数据
                const requestData = {
                    model: apiConfig.model,
                    messages: messages,
                    stream: true, // 使用流式响应
                    temperature: 0.7
                };
                
                // 发送请求到OpenAI API
                const response = await fetch(`${apiConfig.baseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiConfig.apiKey}`
                    },
                    body: JSON.stringify(requestData)
                });
                
                if (!response.ok) {
                    throw new Error(`API返回错误: ${response.status}`);
                }
                
                // 获取响应的可读流
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let responseText = '';
                
                // 获取回答内容的元素
                const messageParagraph = botMessage.querySelector('p');
                messageParagraph.textContent = ''; // 清除"思考中..."
                
                // 处理流式响应
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    // 解码二进制数据
                    const chunk = decoder.decode(value, { stream: true });
                    
                    // 处理SSE格式数据（以data:开头的行）
                    const lines = chunk.split('\n').filter(line => line.trim() && line.startsWith('data:'));
                    for (const line of lines) {
                        try {
                            const jsonStr = line.substring(5).trim(); // 移除'data:'前缀
                            
                            // 处理流式响应结束标志
                            if (jsonStr === '[DONE]') continue;
                            
                            const data = JSON.parse(jsonStr);
                            if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                                const content = data.choices[0].delta.content;
                                responseText += content;
                                messageParagraph.textContent = responseText;
                                
                                // 自动滚动到最新消息
                                chatMessages.scrollTop = chatMessages.scrollHeight;
                            }
                        } catch (e) {
                            console.warn('解析流式响应出错:', e);
                        }
                    }
                }
                
                // 如果没有收到任何响应
                if (!responseText) {
                    messageParagraph.textContent = "抱歉，我没有生成任何回答。请重试。";
                }
                
            } catch (apiError) {
                console.error('API请求失败:', apiError);
                
                // 显示错误消息
                botMessage.querySelector('p').textContent = `API请求失败: ${apiError.message}。请检查API配置和网络连接。`;
            }
        } catch (error) {
            console.error('与API通信出错:', error);
            
            // 如果出错，显示错误消息
            const lastMessage = chatMessages.lastChild;
            if (lastMessage && lastMessage.classList.contains('bot')) {
                const messageParagraph = lastMessage.querySelector('p');
                messageParagraph.textContent = '抱歉，无法连接到API。请检查网络连接和API配置。';
            }
        }
    }
    
    // 处理发送按钮点击
    sendButton.addEventListener('click', () => {
        const userMessage = userMessageInput.value.trim();
        
        if (userMessage) {
            // 显示用户消息
            addMessage(userMessage, true);
            
            // 清空输入框
            userMessageInput.value = '';
            
            // 发送到OpenAI API
            sendToOpenAI(userMessage);
        }
    });
    
    // 处理输入框回车键
    userMessageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });
    
    // 检测API服务是否可用
    async function checkAPIService() {
        try {
            const apiConfig = getApiConfig();
            
            // 尝试发送简单请求检查API可用性
            const response = await fetch(`${apiConfig.baseUrl}/models`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiConfig.apiKey}`
                }
            });
            
            if (response.ok) {
                console.log('API服务可用');
                addMessage(`检测到API服务可用。您现在可以开始对话！您可以上传文档进行提问，我会在回答问题时展示我的思考过程。`, false);
                
                // 预加载知识库
                preloadKnowledgeBase();
            } else {
                console.error('API服务返回错误:', response.status);
                addMessage(`API连接测试失败: ${response.status} ${response.statusText}。请检查API配置。`, false);
            }
        } catch (error) {
            console.error('API服务检测失败:', error);
            addMessage(`无法连接到API服务。请检查您的网络连接和API配置。错误信息: ${error.message}`, false);
            
            // 尝试预加载知识库，即使API不可用
            preloadKnowledgeBase();
        }
    }
    
    // 页面加载时检查服务可用性
    checkAPIService();
    
    // 添加示例问题按钮
    const exampleQuestions = [
        '江西软件职业技术大学的区块链院长是谁？',
        '我的知识库中有什么信息？',
        '总结知识库内容',
        '提取知识库中的关键信息'
    ];
    
    const exampleButtonsContainer = document.createElement('div');
    exampleButtonsContainer.className = 'example-questions';
    exampleButtonsContainer.style.display = 'flex';
    exampleButtonsContainer.style.flexWrap = 'wrap';
    exampleButtonsContainer.style.gap = '10px';
    exampleButtonsContainer.style.marginTop = '20px';
    exampleButtonsContainer.style.justifyContent = 'center';
    
    exampleQuestions.forEach(question => {
        const button = document.createElement('button');
        button.className = 'btn';
        button.textContent = question;
        button.style.fontSize = '0.9rem';
        button.style.padding = '8px 15px';
        
        button.addEventListener('click', () => {
            userMessageInput.value = question;
            sendButton.click();
        });
        
        exampleButtonsContainer.appendChild(button);
    });
    
    // 将示例问题按钮添加到聊天容器之后
    chatContainer.parentNode.insertBefore(exampleButtonsContainer, chatContainer.nextSibling);

    // 添加API设置UI
    addApiSettingsToPage();
});

// 添加API设置界面
function createApiSettingsUI() {
    const apiSettingsDiv = document.createElement('div');
    apiSettingsDiv.className = 'api-settings';
    apiSettingsDiv.style.marginTop = '15px';
    apiSettingsDiv.style.padding = '10px 15px';
    apiSettingsDiv.style.backgroundColor = 'var(--light-gray)';
    apiSettingsDiv.style.borderRadius = '10px';
    apiSettingsDiv.style.fontSize = '0.9rem';

    const apiSettingsTitle = document.createElement('div');
    apiSettingsTitle.textContent = 'API 设置';
    apiSettingsTitle.style.fontWeight = 'bold';
    apiSettingsTitle.style.marginBottom = '10px';
    apiSettingsTitle.style.display = 'flex';
    apiSettingsTitle.style.justifyContent = 'space-between';
    apiSettingsTitle.style.alignItems = 'center';

    const apiStatus = document.createElement('span');
    apiStatus.className = 'api-status';
    apiStatus.textContent = '检测中...';
    apiStatus.style.fontSize = '0.8rem';
    apiStatus.style.padding = '3px 8px';
    apiStatus.style.borderRadius = '10px';
    apiStatus.style.backgroundColor = '#f0f0f0';
    apiSettingsTitle.appendChild(apiStatus);

    // 设置表单
    const apiForm = document.createElement('div');
    apiForm.style.display = 'flex';
    apiForm.style.flexDirection = 'column';
    apiForm.style.gap = '10px';
    
    // Base URL输入
    const baseUrlGroup = document.createElement('div');
    const baseUrlLabel = document.createElement('label');
    baseUrlLabel.textContent = 'API Base URL:';
    baseUrlLabel.style.display = 'block';
    baseUrlLabel.style.marginBottom = '5px';
    baseUrlLabel.style.fontSize = '0.9rem';
    
    const baseUrlInput = document.createElement('input');
    baseUrlInput.type = 'text';
    baseUrlInput.className = 'base-url-input';
    baseUrlInput.value = getApiConfig().baseUrl;
    baseUrlInput.placeholder = 'API Base URL';
    baseUrlInput.style.width = '100%';
    baseUrlInput.style.padding = '8px 10px';
    baseUrlInput.style.borderRadius = '5px';
    baseUrlInput.style.border = '1px solid #ddd';
    baseUrlInput.style.fontSize = '0.9rem';
    
    baseUrlGroup.appendChild(baseUrlLabel);
    baseUrlGroup.appendChild(baseUrlInput);
    
    // API Key输入
    const apiKeyGroup = document.createElement('div');
    const apiKeyLabel = document.createElement('label');
    apiKeyLabel.textContent = 'API Key:';
    apiKeyLabel.style.display = 'block';
    apiKeyLabel.style.marginBottom = '5px';
    apiKeyLabel.style.fontSize = '0.9rem';
    
    const apiKeyInput = document.createElement('input');
    apiKeyInput.type = 'password';
    apiKeyInput.className = 'api-key-input';
    apiKeyInput.value = getApiConfig().apiKey;
    apiKeyInput.placeholder = 'API Key';
    apiKeyInput.style.width = '100%';
    apiKeyInput.style.padding = '8px 10px';
    apiKeyInput.style.borderRadius = '5px';
    apiKeyInput.style.border = '1px solid #ddd';
    apiKeyInput.style.fontSize = '0.9rem';
    
    apiKeyGroup.appendChild(apiKeyLabel);
    apiKeyGroup.appendChild(apiKeyInput);
    
    // 模型名称输入
    const modelGroup = document.createElement('div');
    const modelLabel = document.createElement('label');
    modelLabel.textContent = '模型名称:';
    modelLabel.style.display = 'block';
    modelLabel.style.marginBottom = '5px';
    modelLabel.style.fontSize = '0.9rem';
    
    const modelInput = document.createElement('input');
    modelInput.type = 'text';
    modelInput.className = 'model-input';
    modelInput.value = getApiConfig().model;
    modelInput.placeholder = '模型名称';
    modelInput.style.width = '100%';
    modelInput.style.padding = '8px 10px';
    modelInput.style.borderRadius = '5px';
    modelInput.style.border = '1px solid #ddd';
    modelInput.style.fontSize = '0.9rem';
    
    modelGroup.appendChild(modelLabel);
    modelGroup.appendChild(modelInput);
    
    // 按钮组
    const buttonGroup = document.createElement('div');
    buttonGroup.style.display = 'flex';
    buttonGroup.style.gap = '10px';
    buttonGroup.style.marginTop = '10px';
    
    const saveButton = document.createElement('button');
    saveButton.className = 'btn';
    saveButton.textContent = '保存设置';
    saveButton.style.padding = '8px 15px';
    saveButton.style.fontSize = '0.9rem';
    saveButton.style.flex = '1';
    
    saveButton.addEventListener('click', () => {
        const baseUrl = baseUrlInput.value.trim();
        const apiKey = apiKeyInput.value.trim();
        const model = modelInput.value.trim();
        
        if (baseUrl && apiKey && model && window.API_CONFIG) {
            window.API_CONFIG.setApiConfig(baseUrl, apiKey, model);
        } else {
            alert('请填写所有必填字段');
        }
    });
    
    const resetButton = document.createElement('button');
    resetButton.className = 'btn';
    resetButton.textContent = '重置设置';
    resetButton.style.padding = '8px 15px';
    resetButton.style.fontSize = '0.9rem';
    resetButton.style.flex = '1';
    resetButton.style.backgroundColor = '#f44336';
    
    resetButton.addEventListener('click', () => {
        if (confirm('确定要重置API设置吗？这将恢复默认设置。')) {
            localStorage.removeItem('openai_base_url');
            localStorage.removeItem('openai_api_key');
            localStorage.removeItem('openai_model');
            window.location.reload();
        }
    });
    
    buttonGroup.appendChild(saveButton);
    buttonGroup.appendChild(resetButton);
    
    apiForm.appendChild(baseUrlGroup);
    apiForm.appendChild(apiKeyGroup);
    apiForm.appendChild(modelGroup);
    apiForm.appendChild(buttonGroup);

    const statusNote = document.createElement('div');
    statusNote.style.marginTop = '10px';
    statusNote.style.fontSize = '0.8rem';
    statusNote.style.color = 'var(--thinking-color)';
    statusNote.textContent = '提示: 配置正确的API参数可以确保您的聊天功能正常工作。';

    apiSettingsDiv.appendChild(apiSettingsTitle);
    apiSettingsDiv.appendChild(apiForm);
    apiSettingsDiv.appendChild(statusNote);

    return apiSettingsDiv;
}

// 添加API设置UI到页面
function addApiSettingsToPage() {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer && chatContainer.parentNode) {
        const apiSettings = createApiSettingsUI();
        chatContainer.parentNode.insertBefore(apiSettings, chatContainer);
        
        // 检查API连接状态
        updateApiStatus();
    }
}

// 更新API状态指示器
async function updateApiStatus() {
    const apiStatus = document.querySelector('.api-status');
    if (!apiStatus) return;
    
    try {
        apiStatus.textContent = '连接中...';
        apiStatus.style.backgroundColor = '#ffeb3b'; // 黄色
        
        const apiConfig = getApiConfig();
        const response = await fetch(`${apiConfig.baseUrl}/models`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiConfig.apiKey}`
            },
            signal: AbortSignal.timeout(5000) // 5秒超时
        });
        
        if (response.ok) {
            apiStatus.textContent = '已连接';
            apiStatus.style.backgroundColor = '#4caf50'; // 绿色
            apiStatus.style.color = 'white';
        } else {
            apiStatus.textContent = '连接错误';
            apiStatus.style.backgroundColor = '#ff9800'; // 橙色
        }
    } catch (error) {
        apiStatus.textContent = '未连接';
        apiStatus.style.backgroundColor = '#f44336'; // 红色
        apiStatus.style.color = 'white';
        console.error('API连接失败:', error);
    }
} 