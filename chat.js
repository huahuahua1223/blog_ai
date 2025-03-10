// 与Ollama DeepSeek模型交互的代码
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
    
    // 发送消息给Ollama API (使用流式响应实时显示思考过程)
    async function sendToOllama(message) {
        try {
            // 创建消息元素但显示正在思考
            const botMessage = addMessage('思考中...', false);
            
            try {
                // 准备请求正文，如果有上下文则包含上下文
                let requestBody = {
                    model: 'deepseek-r1:8b',
                    prompt: message,
                    stream: true, // 启用流式响应
                    options: {
                        temperature: 0.7,
                        // 可以添加其他模型参数
                    }
                };
                
                // 如果有上下文，则添加到提示中，并添加system提示要求思考过程可见
                if (currentContext) {
                    requestBody.prompt = `我将为你提供一些背景知识，请基于这些知识回答我的问题。请在回答问题时，先进行思考分析，然后给出最终答案。请确保你的思考过程可见。\n\n背景知识：\n${currentContext}\n\n我的问题是：${message}`;
                } else {
                    requestBody.system = "请在回答问题时展示你的思考过程，先分析问题，然后给出答案。请确保你的思考过程对用户可见。";
                    requestBody.prompt = `${message}`;
                }
                
                // 尝试直接请求（如果Ollama配置了CORS）
                const response = await fetch('http://localhost:11434/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
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
                    
                    // 解析JSON行
                    const lines = chunk.split('\n').filter(line => line.trim());
                    for (const line of lines) {
                        try {
                            const data = JSON.parse(line);
                            if (data.response) {
                                responseText += data.response;
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
                
            } catch (fetchError) {
                console.error('直接请求失败:', fetchError);
                
                // 提示用户CORS问题
                botMessage.querySelector('p').textContent = '由于浏览器的安全限制（CORS策略），无法直接从网页访问本地Ollama API。\n\n解决方案：\n1. 使用浏览器扩展禁用CORS（如"CORS Unblock"或"Allow CORS"）\n2. 在Ollama启动时配置允许CORS\n3. 创建一个简单的代理服务器转发请求';
                
                // 添加CORS解决方案按钮
                const corsHelpDiv = document.createElement('div');
                corsHelpDiv.className = 'cors-help';
                corsHelpDiv.style.textAlign = 'center';
                corsHelpDiv.style.margin = '20px 0';
                
                const corsHelpButton = document.createElement('button');
                corsHelpButton.className = 'btn';
                corsHelpButton.textContent = '查看CORS解决方案';
                corsHelpButton.addEventListener('click', () => {
                    window.open('https://github.com/ollama/ollama/blob/main/docs/api.md#cross-origin-resource-sharing-cors', '_blank');
                });
                
                corsHelpDiv.appendChild(corsHelpButton);
                chatMessages.parentNode.insertBefore(corsHelpDiv, chatMessages.nextSibling);
            }
        } catch (error) {
            console.error('与Ollama通信出错:', error);
            
            // 如果出错，显示错误消息并提供一个备用回复
            const lastMessage = chatMessages.lastChild;
            if (lastMessage && lastMessage.classList.contains('bot')) {
                const messageParagraph = lastMessage.querySelector('p');
                messageParagraph.textContent = '抱歉，我无法连接到本地的DeepSeek模型。请确保Ollama服务正在运行，并且DeepSeek模型已经下载。\n\n可以通过以下命令启动Ollama服务：\n命令行中输入: ollama serve\n\n如果还没有下载DeepSeek模型，可以使用命令：\n命令行中输入: ollama pull deepseek-r1:8b';
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
            
            // 发送到Ollama
            sendToOllama(userMessage);
        }
    });
    
    // 处理输入框回车键
    userMessageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });
    
    // 检测Ollama服务是否可用
    async function checkOllamaService() {
        try {
            // 尝试使用fetch API，但处理可能的CORS错误
            const response = await fetch('http://localhost:11434/api/tags', {
                method: 'GET'
            });
            console.log(response);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Ollama服务可用，已安装模型:', data.models);
                
                // 检查是否已安装DeepSeek模型
                const hasDeepSeek = data.models.some(model => 
                    model.name.toLowerCase().includes('deepseek')
                );
                
                if (hasDeepSeek) {
                    // 找到了DeepSeek模型
                    const deepseekModel = data.models.find(model => 
                        model.name.toLowerCase().includes('deepseek')
                    );
                    console.log('找到DeepSeek模型:', deepseekModel.name);
                    
                    // 添加欢迎信息，确认可以使用的模型
                    addMessage(`检测到可用的DeepSeek模型: ${deepseekModel.name}。您现在可以开始对话！您可以看到已预加载的知识库，或上传新的文档进行提问。我会在回答问题时展示我的思考过程。`, false);
                    
                    // 预加载知识库
                    preloadKnowledgeBase();
                } else {
                    addMessage('检测到Ollama服务正在运行，但未找到DeepSeek模型。请使用以下命令下载模型：\n命令行中输入: ollama pull deepseek-r1:8b', false);
                }
            }
        } catch (error) {
            console.error('Ollama服务检测失败:', error);
            
            // 特别处理CORS错误
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                addMessage('检测到Ollama服务可能正在运行，但由于浏览器的CORS限制无法访问。请使用以下解决方案之一：\n\n1. 使用浏览器插件禁用CORS（如"CORS Unblock"）\n2. 配置Ollama允许CORS请求\n3. 使用简单的代理服务器转发请求', false);
                
                // 尝试预加载知识库，即使Ollama无法访问
                preloadKnowledgeBase();
            } else {
                addMessage('无法连接到Ollama服务。请确保您已安装Ollama并启动服务：\n1. 从 https://ollama.ai 下载并安装Ollama\n2. 命令行中输入: ollama serve\n3. 下载DeepSeek模型: ollama pull deepseek-r1:8b', false);
            }
            
            // 增加一个启动Ollama的指导
            const helpDiv = document.createElement('div');
            helpDiv.className = 'ollama-help';
            helpDiv.style.textAlign = 'center';
            helpDiv.style.margin = '20px 0';
            
            const helpButton = document.createElement('button');
            helpButton.className = 'btn';
            helpButton.textContent = 'Ollama设置指南';
            helpButton.addEventListener('click', () => {
                window.open('https://github.com/ollama/ollama#get-started', '_blank');
            });
            
            helpDiv.appendChild(helpButton);
            chatMessages.parentNode.insertBefore(helpDiv, chatMessages.nextSibling);
        }
    }
    
    // 页面加载时检查服务可用性
    checkOllamaService();
    
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
}); 