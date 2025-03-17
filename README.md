# 个人网站

这是一个使用HTML、CSS和JavaScript构建的个人网站模板，带有与本地大语言模型的集成功能。

## 功能特点

- 现代化的响应式设计，适配各种屏幕尺寸
- 流畅的轮播图展示
- 深色/浅色主题切换
- 作品集展示区
- 联系表单
- 社交媒体链接
- 本地DeepSeek AI模型集成（通过Ollama）
- **文件知识库功能** - 上传文档，基于文档内容提问
- **Three.js粒子动画背景** - 交互式动态背景效果

## 使用技术

- HTML5
- CSS3（使用CSS变量和Flexbox/Grid布局）
- 原生JavaScript（无需任何框架）
- Three.js（创建交互式3D背景）
- Ollama API（与本地大语言模型交互）

## 如何使用

1. 下载或克隆此项目
2. 打开`index.html`文件在浏览器中查看网站

## AI聊天功能使用说明

要使用内置的AI聊天功能，您需要：

1. 从[Ollama官网](https://ollama.ai)下载并安装Ollama
2. 打开命令行/终端运行：`ollama serve`启动Ollama服务
3. 下载DeepSeek模型：`ollama pull deepseek-r1:8b`
4. 之后刷新网站，聊天功能应该可以正常工作了

## 文件知识库功能

网站支持上传文件作为知识库来回答问题：

1. 点击"上传知识文件"按钮选择文本文件（推荐.txt或.md格式）
2. 系统会读取文件内容并作为上下文注入到与AI的对话中
3. 之后您可以针对文件内容提问，AI将基于文件中的信息回答
4. 如果想切换回普通对话模式，点击"清除知识库"按钮即可

> 注意：目前仅支持文本文件的直接处理。PDF和DOCX文件需要更多的库支持，在此示例中未完全实现。

## 解决浏览器CORS问题

由于浏览器安全限制，直接从网页访问本地API可能会遇到CORS问题。解决方法：

1. 使用浏览器扩展禁用CORS（如Chrome的"CORS Unblock"扩展）
2. 或配置Ollama允许CORS请求：`OLLAMA_ORIGINS=* ollama serve`

## Vercel部署步骤

1. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   在项目目录下运行:
   ```bash
   vercel
   ```

## 自定义

- 修改`styles.css`中的CSS变量来更改颜色主题
- 替换图片URL为您自己的图片
- 编辑`index.html`中的文本内容
- 在`main.js`中调整轮播图时间和其他功能参数
- 在`background.js`中调整Three.js背景效果

## 联系方式

如有任何问题或建议，请随时联系我：

- 邮箱：example@example.com
- 网站：[www.example.com](http://www.example.com)

## 许可

MIT许可 - 详情请查看LICENSE文件 