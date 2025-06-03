class ImageManager {
    constructor() {
        this.images = [
            {
                path: 'Snipaste_2025-05-28_19-20-16.png',
                name: '可爱柴犬',
                id: 'default'
            }
        ];
        this.currentImageIndex = 0;
        this.gameStats = this.loadStats();
        this.difficulty = 'simple'; // simple, normal, hard
        
        this.initializeEvents();
        this.updateStats();
    }

    initializeEvents() {
        // 图片选择事件
        document.addEventListener('click', (e) => {
            if (e.target.closest('.image-option:not(.add-new)')) {
                this.selectImage(e.target.closest('.image-option'));
            }
        });

        // 添加图片按钮事件
        document.getElementById('addImageBtn').addEventListener('click', () => {
            this.showUploadModal();
        });

        // 文件上传事件
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('imageInput');

        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.background = 'rgba(255, 255, 255, 0.2)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.background = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.background = '';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // 上传确认和取消
        document.getElementById('confirmUpload').addEventListener('click', () => {
            this.confirmUpload();
        });

        document.getElementById('cancelUpload').addEventListener('click', () => {
            this.hideUploadModal();
        });

        // 难度切换
        document.getElementById('difficultyBtn').addEventListener('click', () => {
            this.showDifficultyModal();
        });

        // 下一难度按钮
        document.getElementById('nextLevelBtn').addEventListener('click', () => {
            this.showDifficultyModal();
            document.getElementById('winModal').style.display = 'none';
        });

        // 难度选择相关事件
        document.getElementById('closeDifficultyModal').addEventListener('click', () => {
            this.hideDifficultyModal();
        });

        // 难度选择按钮事件
        document.querySelectorAll('.select-difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficultyOption = e.target.closest('.difficulty-option');
                const difficulty = difficultyOption.dataset.difficulty;
                this.selectDifficulty(difficulty);
            });
        });

        // 模态框点击外部关闭
        document.getElementById('uploadModal').addEventListener('click', (e) => {
            if (e.target.id === 'uploadModal') {
                this.hideUploadModal();
            }
        });

        document.getElementById('difficultyModal').addEventListener('click', (e) => {
            if (e.target.id === 'difficultyModal') {
                this.hideDifficultyModal();
            }
        });
    }

    selectImage(imageOption) {
        // 移除之前的选中状态
        document.querySelectorAll('.image-option').forEach(option => {
            option.classList.remove('active');
        });

        // 添加选中状态
        imageOption.classList.add('active');

        // 获取图片路径并切换
        const imagePath = imageOption.dataset.image;
        if (imagePath && window.game) {
            window.game.changeImage(imagePath);
            document.getElementById('originalImg').src = imagePath;
            this.currentImageIndex = this.images.findIndex(img => img.path === imagePath);
        }
    }

    showUploadModal() {
        document.getElementById('uploadModal').style.display = 'block';
    }

    hideUploadModal() {
        document.getElementById('uploadModal').style.display = 'none';
        document.getElementById('imageInput').value = '';
        document.getElementById('confirmUpload').disabled = true;
        this.selectedFile = null;
    }

    handleFileSelect(file) {
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件！');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB限制
            alert('图片文件不能超过5MB！');
            return;
        }

        this.selectedFile = file;
        document.getElementById('confirmUpload').disabled = false;

        // 预览图片
        const reader = new FileReader();
        reader.onload = (e) => {
            const uploadArea = document.getElementById('uploadArea');
            uploadArea.innerHTML = `
                <img src="${e.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 10px;">
                <p>点击确认添加此图片</p>
            `;
        };
        reader.readAsDataURL(file);
    }

    confirmUpload() {
        if (!this.selectedFile) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            const imageName = this.selectedFile.name.split('.')[0];
            
            // 添加到图片列表
            const newImage = {
                path: imageData,
                name: imageName,
                id: 'custom_' + Date.now()
            };
            
            this.images.push(newImage);
            this.addImageOption(newImage);
            this.hideUploadModal();
            
            // 自动选择新上传的图片
            setTimeout(() => {
                const newOption = document.querySelector(`[data-image="${imageData}"]`);
                if (newOption) {
                    this.selectImage(newOption);
                }
            }, 100);
        };
        reader.readAsDataURL(this.selectedFile);
    }

    addImageOption(image) {
        const gallery = document.querySelector('.image-gallery');
        const addBtn = document.getElementById('addImageBtn');
        
        const imageOption = document.createElement('div');
        imageOption.className = 'image-option';
        imageOption.dataset.image = image.path;
        imageOption.innerHTML = `
            <img src="${image.path}" alt="${image.name}">
            <span>${image.name}</span>
        `;
        
        gallery.insertBefore(imageOption, addBtn);
    }

    showDifficultyModal() {
        document.getElementById('difficultyModal').style.display = 'block';
    }

    hideDifficultyModal() {
        document.getElementById('difficultyModal').style.display = 'none';
    }

    selectDifficulty(difficulty) {
        this.difficulty = difficulty;
        
        const difficultyNames = {
            'simple': '简单',
            'normal': '普通',
            'hard': '困难'
        };
        
        document.getElementById('difficulty').textContent = difficultyNames[this.difficulty];
        
        // 更新选中状态
        document.querySelectorAll('.difficulty-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('selected');
        
        // 根据难度调整游戏参数
        if (window.game) {
            this.applyDifficulty();
        }
        
        // 关闭模态框
        this.hideDifficultyModal();
        
        // 显示切换成功的提示
        this.showDifficultyChangeNotification(difficultyNames[this.difficulty]);
    }

    showDifficultyChangeNotification(difficultyName) {
        // 创建临时通知元素
        const notification = document.createElement('div');
        notification.className = 'difficulty-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">🎯</span>
                <span>难度已切换为：${difficultyName}</span>
            </div>
        `;
        
        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 3000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // 3秒后自动删除
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    applyDifficulty() {
        const settings = {
            'simple': { shuffleTimes: 50, hintAvailable: true },
            'normal': { shuffleTimes: 100, hintAvailable: true },
            'hard': { shuffleTimes: 200, hintAvailable: false }
        };
        
        const currentSetting = settings[this.difficulty];
        
        // 更新游戏设置
        if (window.game) {
            window.game.shuffleTimes = currentSetting.shuffleTimes;
            window.game.hintAvailable = currentSetting.hintAvailable;
            
            // 禁用/启用提示按钮
            const hintBtn = document.getElementById('hintBtn');
            hintBtn.disabled = !currentSetting.hintAvailable;
            hintBtn.style.opacity = currentSetting.hintAvailable ? '1' : '0.5';
            
            // 重新开始游戏以应用新难度
            window.game.resetGame();
        }
    }

    // 游戏统计相关方法
    loadStats() {
        const stored = localStorage.getItem('puzzleGameStats');
        if (stored) {
            return JSON.parse(stored);
        }
        return {
            bestTime: null,
            bestMoves: null,
            completedGames: 0,
            totalMoves: 0,
            totalTime: 0
        };
    }

    saveStats() {
        localStorage.setItem('puzzleGameStats', JSON.stringify(this.gameStats));
    }

    updateGameStats(moves, timeSeconds) {
        this.gameStats.completedGames++;
        this.gameStats.totalMoves += moves;
        this.gameStats.totalTime += timeSeconds;
        
        // 更新最佳记录
        if (!this.gameStats.bestTime || timeSeconds < this.gameStats.bestTime) {
            this.gameStats.bestTime = timeSeconds;
        }
        
        if (!this.gameStats.bestMoves || moves < this.gameStats.bestMoves) {
            this.gameStats.bestMoves = moves;
        }
        
        this.saveStats();
        this.updateStats();
        this.showAchievement(moves, timeSeconds);
    }

    updateStats() {
        const formatTime = (seconds) => {
            if (!seconds) return '--:--';
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };

        document.getElementById('bestTime').textContent = formatTime(this.gameStats.bestTime);
        document.getElementById('bestMoves').textContent = this.gameStats.bestMoves || '--';
        document.getElementById('completedGames').textContent = this.gameStats.completedGames;
    }

    showAchievement(moves, timeSeconds) {
        const achievements = [];
        
        // 检查各种成就
        if (this.gameStats.completedGames === 1) {
            achievements.push('🎯 首次完成！');
        }
        
        if (moves === this.gameStats.bestMoves && this.gameStats.completedGames > 1) {
            achievements.push('🏆 最少步数记录！');
        }
        
        if (timeSeconds === this.gameStats.bestTime && this.gameStats.completedGames > 1) {
            achievements.push('⚡ 最快时间记录！');
        }
        
        if (moves <= 30) {
            achievements.push('🎖️ 步数大师（≤30步）');
        }
        
        if (timeSeconds <= 60) {
            achievements.push('⏰ 速度之王（≤1分钟）');
        }
        
        if (this.gameStats.completedGames % 10 === 0) {
            achievements.push(`🌟 完成${this.gameStats.completedGames}局游戏！`);
        }
        
        const achievementElement = document.getElementById('achievement');
        if (achievements.length > 0) {
            achievementElement.innerHTML = achievements.join('<br>');
            achievementElement.style.display = 'block';
        } else {
            achievementElement.style.display = 'none';
        }
    }
}

// 扩展游戏类以支持统计
if (window.PuzzleGame) {
    const originalHandleWin = window.PuzzleGame.prototype.handleWin;
    window.PuzzleGame.prototype.handleWin = function() {
        originalHandleWin.call(this);
        
        // 计算游戏时间
        const gameTime = Math.floor((Date.now() - this.startTime) / 1000);
        
        // 更新统计
        if (window.imageManager) {
            window.imageManager.updateGameStats(this.moveCount, gameTime);
        }
    };
}

// 初始化图片管理器
let imageManager;
document.addEventListener('DOMContentLoaded', () => {
    imageManager = new ImageManager();
    window.imageManager = imageManager;
}); 