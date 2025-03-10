// Three.js粒子动画背景
document.addEventListener('DOMContentLoaded', () => {
    // 初始化场景、相机和渲染器
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    // 设置渲染器尺寸和属性
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // 将渲染器的domElement添加到页面中
    document.getElementById('bg-canvas').appendChild(renderer.domElement);
    
    // 相机位置
    camera.position.z = 30;
    
    // 创建粒子
    const particlesCount = window.innerWidth > 768 ? 2000 : 1000; // 根据设备调整粒子数量
    const particles = new THREE.BufferGeometry();
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0x03a9f4, // 使用网站的主题色
        size: 0.05,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    
    // 创建粒子位置数组
    const positions = new Float32Array(particlesCount * 3);
    const velocities = []; // 存储每个粒子的速度
    const colors = new Float32Array(particlesCount * 3); // 粒子颜色
    const sizes = new Float32Array(particlesCount); // 粒子大小
    
    // 基础颜色
    const baseColor = new THREE.Color(0x03a9f4);
    
    for (let i = 0; i < particlesCount * 3; i += 3) {
        // 随机位置 
        positions[i] = (Math.random() - 0.5) * 100; // x
        positions[i + 1] = (Math.random() - 0.5) * 100; // y
        positions[i + 2] = (Math.random() - 0.5) * 100; // z
        
        // 随机速度
        velocities.push({
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01
        });
        
        // 颜色略微随机变化
        colors[i] = baseColor.r + (Math.random() * 0.1 - 0.05);
        colors[i + 1] = baseColor.g + (Math.random() * 0.1 - 0.05);
        colors[i + 2] = baseColor.b + (Math.random() * 0.1 - 0.05);
        
        // 随机大小
        sizes[i/3] = Math.random() * 0.05 + 0.02;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // 更新材质使用顶点着色
    particlesMaterial.vertexColors = true;
    particlesMaterial.blending = THREE.AdditiveBlending;
    
    // 创建粒子系统
    const particleSystem = new THREE.Points(particles, particlesMaterial);
    scene.add(particleSystem);
    
    // 添加光线
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 10, 5);
    scene.add(directionalLight);
    
    // 交互状态变量
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let particleSpeed = 1.0;
    let isHovered = false;
    let isDarkMode = false;
    let activeSection = null;
    
    // 监听鼠标移动
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });
    
    // 监听主题切换
    document.addEventListener('theme-changed', (event) => {
        isDarkMode = event.detail.isDarkMode;
        updateParticleColors();
    });
    
    // 监听作品悬停
    document.addEventListener('portfolio-hover', (event) => {
        isHovered = event.detail.isHovered;
        // 当悬停时增加粒子运动速度
        if (isHovered) {
            particleSpeed = 2.0;
            // 增加粒子亮度
            updateParticleBrightness(1.5);
        } else {
            particleSpeed = 1.0;
            // 恢复粒子正常亮度
            updateParticleBrightness(1.0);
        }
    });
    
    // 监听滚动更新
    document.addEventListener('scroll-update', (event) => {
        // 根据滚动位置调整粒子旋转
        particleSystem.rotation.x = event.detail.scrollY * 0.0002;
    });
    
    // 监听部分可见性
    document.addEventListener('section-visible', (event) => {
        activeSection = event.detail.isVisible ? event.detail.id : null;
        
        // 根据当前可见的部分调整粒子效果
        if (activeSection === 'home') {
            // 主页时粒子较活跃
            particleSpeed = 1.5;
            updateParticleDensity(1.0);
        } else if (activeSection === 'about') {
            // 关于页面时粒子较均匀
            particleSpeed = 0.8;
            updateParticleColors(0.3, 0.8, 1.0); // 蓝色调
        } else if (activeSection === 'portfolio') {
            // 作品集时粒子颜色有变化
            particleSpeed = 1.0;
            updateParticleColors(0.1, 0.8, 0.4); // 绿色调
        } else if (activeSection === 'contact') {
            // 联系页面时粒子较平静
            particleSpeed = 0.6;
            updateParticleColors(0.9, 0.3, 0.1); // 橙色调
        } else if (activeSection === 'ai-chat') {
            // AI聊天区域粒子颜色特殊
            particleSpeed = 1.2;
            updateParticleColors(0.7, 0.2, 0.9); // 紫色调
        } else {
            // 默认状态
            particleSpeed = 1.0;
            updateParticleColors();
        }
    });
    
    // 更新粒子颜色
    function updateParticleColors(r, g, b) {
        const colors = particleSystem.geometry.attributes.color.array;
        
        // 确定基础颜色
        let baseColor;
        if (r !== undefined && g !== undefined && b !== undefined) {
            // 使用指定颜色
            baseColor = new THREE.Color(r, g, b);
        } else if (isDarkMode) {
            // 深色模式颜色
            baseColor = new THREE.Color(0x0288d1);
        } else {
            // 浅色模式颜色
            baseColor = new THREE.Color(0x03a9f4);
        }
        
        // 更新粒子颜色
        for (let i = 0; i < colors.length; i += 3) {
            colors[i] = baseColor.r + (Math.random() * 0.1 - 0.05);
            colors[i + 1] = baseColor.g + (Math.random() * 0.1 - 0.05);
            colors[i + 2] = baseColor.b + (Math.random() * 0.1 - 0.05);
        }
        
        particleSystem.geometry.attributes.color.needsUpdate = true;
    }
    
    // 更新粒子亮度
    function updateParticleBrightness(factor) {
        const colors = particleSystem.geometry.attributes.color.array;
        for (let i = 0; i < colors.length; i++) {
            colors[i] = Math.min(colors[i] * factor, 1.0);
        }
        particleSystem.geometry.attributes.color.needsUpdate = true;
    }
    
    // 更新粒子大小和密度
    function updateParticleDensity(factor) {
        const sizes = particleSystem.geometry.attributes.size.array;
        for (let i = 0; i < sizes.length; i++) {
            sizes[i] = (Math.random() * 0.05 + 0.02) * factor;
        }
        particleSystem.geometry.attributes.size.needsUpdate = true;
    }
    
    // 初始化颜色
    updateParticleColors();
    
    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        
        // 粒子的移动
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            // 根据速度因子更新位置
            positions[i] += velocities[i/3].x * particleSpeed;
            positions[i + 1] += velocities[i/3].y * particleSpeed;
            positions[i + 2] += velocities[i/3].z * particleSpeed;
            
            // 当粒子移出边界，将其移到另一边
            if (positions[i] > 50) positions[i] = -50;
            if (positions[i] < -50) positions[i] = 50;
            if (positions[i + 1] > 50) positions[i + 1] = -50;
            if (positions[i + 1] < -50) positions[i + 1] = 50;
            if (positions[i + 2] > 50) positions[i + 2] = -50;
            if (positions[i + 2] < -50) positions[i + 2] = 50;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
        
        // 平滑鼠标跟随效果
        targetX = mouseX * 0.2;
        targetY = mouseY * 0.2;
        particleSystem.rotation.x += (targetY - particleSystem.rotation.x) * 0.05;
        particleSystem.rotation.y += (targetX - particleSystem.rotation.y) * 0.05;
        
        // 渲染场景
        renderer.render(scene, camera);
    }
    
    // 窗口大小调整处理
    window.addEventListener('resize', () => {
        // 更新相机
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        
        // 更新渲染器
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // 开始动画
    animate();
    
    // 根据页面滚动位置调整粒子效果
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const scrollDirection = scrollY > lastScrollY ? 1 : -1;
        
        // 根据滚动方向调整粒子系统的旋转
        particleSystem.rotation.x += scrollDirection * 0.01;
        
        lastScrollY = scrollY;
    });
    
    // 为移动设备添加陀螺仪支持
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (event) => {
            if (event.beta && event.gamma) {
                targetY = event.beta * 0.01;  // 前后倾斜
                targetX = event.gamma * 0.01; // 左右倾斜
            }
        });
    }
    
    // 页面加载完成事件处理
    document.addEventListener('page-loaded', () => {
        // 页面加载完成时的特效
        updateParticleBrightness(1.5);
        
        // 2秒后恢复正常
        setTimeout(() => {
            updateParticleBrightness(1.0);
        }, 2000);
    });
}); 