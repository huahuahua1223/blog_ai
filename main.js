// 初始化应用程序
async function initApp() {
    try {
        // 加载环境变量
        await window.loadEnv();
        console.log('环境变量加载完成');
        
        // 触发DOM加载后的初始化函数
        initDomContent();
    } catch (error) {
        console.error('初始化应用程序出错:', error);
        // 即使环境变量加载失败，仍然初始化应用
        initDomContent();
    }
}

// 等待DOM加载完成的主要初始化函数
function initDomContent() {
    // 导航栏滚动效果
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');
    const burger = document.querySelector('.burger');
    
    // 汉堡菜单点击事件
    burger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        // 汉堡菜单动画
        burger.classList.toggle('toggle');
    });
    
    // 滚动事件
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
            // 触发自定义事件供Three.js使用
            const scrollEvent = new CustomEvent('scroll-update', { 
                detail: { scrollY: window.scrollY, isScrolled: true } 
            });
            document.dispatchEvent(scrollEvent);
        } else {
            navbar.classList.remove('scrolled');
            // 触发自定义事件供Three.js使用
            const scrollEvent = new CustomEvent('scroll-update', { 
                detail: { scrollY: window.scrollY, isScrolled: false } 
            });
            document.dispatchEvent(scrollEvent);
        }
    });
    
    // 轮播图功能
    const carousel = document.querySelector('.carousel');
    const carouselItems = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const indicators = document.querySelectorAll('.indicator');
    let currentIndex = 0;
    
    // 更新轮播图
    function updateCarousel() {
        // 移除所有active类
        carouselItems.forEach(item => {
            item.classList.remove('active');
        });
        indicators.forEach(indicator => {
            indicator.classList.remove('active');
        });
        
        // 添加active类到当前项
        carouselItems[currentIndex].classList.add('active');
        indicators[currentIndex].classList.add('active');
    }
    
    // 下一张
    function nextSlide() {
        currentIndex = (currentIndex + 1) % carouselItems.length;
        updateCarousel();
    }
    
    // 上一张
    function prevSlide() {
        currentIndex = (currentIndex - 1 + carouselItems.length) % carouselItems.length;
        updateCarousel();
    }
    
    // 点击按钮
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    // 点击指示器
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
        });
    });
    
    // 自动轮播
    let intervalId = setInterval(nextSlide, 5000);
    
    // 鼠标悬停时暂停轮播
    carousel.addEventListener('mouseenter', () => {
        clearInterval(intervalId);
    });
    
    // 鼠标离开时继续轮播
    carousel.addEventListener('mouseleave', () => {
        intervalId = setInterval(nextSlide, 5000);
    });
    
    // 技能进度条动画
    const skillBars = document.querySelectorAll('.skill-progress');
    const skillSection = document.querySelector('.about-section');
    
    function checkSkills() {
        const sectionPos = skillSection.getBoundingClientRect().top;
        const screenPos = window.innerHeight / 1.3;
        
        if (sectionPos < screenPos) {
            skillBars.forEach(bar => {
                const width = bar.getAttribute('style').match(/\d+/)[0];
                bar.style.width = width + '%';
            });
            window.removeEventListener('scroll', checkSkills);
        }
    }
    
    window.addEventListener('scroll', checkSkills);
    // 初始加载时检查一次
    checkSkills();
    
    // 作品集悬停效果
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    portfolioItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const overlay = item.querySelector('.portfolio-overlay');
            overlay.style.transform = 'translateY(0)';
            
            // 触发自定义事件通知Three.js
            document.dispatchEvent(new CustomEvent('portfolio-hover', { 
                detail: { isHovered: true } 
            }));
        });
        
        item.addEventListener('mouseleave', () => {
            const overlay = item.querySelector('.portfolio-overlay');
            overlay.style.transform = 'translateY(100%)';
            
            // 触发自定义事件通知Three.js
            document.dispatchEvent(new CustomEvent('portfolio-hover', { 
                detail: { isHovered: false } 
            }));
        });
    });
    
    // 联系表单提交
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // 获取表单数据
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // 这里可以添加表单验证逻辑
            
            // 模拟表单提交
            alert(`感谢您的留言，${name}！\n我们会尽快回复您的邮箱：${email}`);
            
            // 清空表单
            contactForm.reset();
        });
    }
    
    // 深色/浅色模式切换
    const themeToggle = document.getElementById('themeToggle');
    
    // 检查本地存储中的主题设置
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        document.body.classList.add(currentTheme);
        if (currentTheme === 'dark-mode') {
            themeToggle.checked = true;
            
            // 触发自定义事件通知Three.js切换颜色方案
            document.dispatchEvent(new CustomEvent('theme-changed', { 
                detail: { isDarkMode: true } 
            }));
        }
    }
    
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark-mode');
            
            // 触发自定义事件通知Three.js切换颜色方案
            document.dispatchEvent(new CustomEvent('theme-changed', { 
                detail: { isDarkMode: true } 
            }));
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.removeItem('theme');
            
            // 触发自定义事件通知Three.js切换颜色方案
            document.dispatchEvent(new CustomEvent('theme-changed', { 
                detail: { isDarkMode: false } 
            }));
        }
    });
    
    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // 关闭移动端菜单(如果打开)
                navLinks.classList.remove('active');
                
                window.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 页面加载动画
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // 发送页面已加载事件给Three.js
        document.dispatchEvent(new CustomEvent('page-loaded'));
    });
    
    // 观察元素进入视口
    const observeElements = document.querySelectorAll('section');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                
                // 触发自定义事件通知Three.js
                document.dispatchEvent(new CustomEvent('section-visible', { 
                    detail: { 
                        id: entry.target.id,
                        isVisible: true 
                    }
                }));
            } else {
                entry.target.classList.remove('in-view');
                
                // 触发自定义事件通知Three.js
                document.dispatchEvent(new CustomEvent('section-visible', {
                    detail: { 
                        id: entry.target.id,
                        isVisible: false 
                    }
                }));
            }
        });
    }, observerOptions);
    
    observeElements.forEach(element => {
        observer.observe(element);
    });
}

// 添加页面加载事件监听器
document.addEventListener('DOMContentLoaded', initApp); 