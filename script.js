class PickerWheel {
    constructor() {
        this.canvas = document.getElementById('wheelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = 180;
        
        this.items = [];
        this.isSpinning = false;
        this.currentRotation = 0;
        this.targetRotation = 0;
        this.animationId = null;
        
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
            '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D2B4DE',
            '#A9DFBF', '#F9E79F', '#D5A6BD', '#A3E4D7', '#F4D03F'
        ];
        
        this.defaultItems = [
            'Option 1', 'Option 2', 'Option 3', 'Option 4', 
            'Option 5', 'Option 6', 'Option 7', 'Option 8'
        ];
        
        this.settings = {
            spinDuration: 3000,
            soundEnabled: true,
            confettiEnabled: true
        };
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadDefaultItems();
        this.drawWheel();
        this.loadSettings();
    }
    
    initializeElements() {
        this.itemInput = document.getElementById('itemInput');
        this.addBtn = document.getElementById('addBtn');
        this.itemsList = document.getElementById('itemsList');
        this.spinBtn = document.getElementById('spinBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.defaultBtn = document.getElementById('defaultBtn');
        this.resultDisplay = document.getElementById('resultDisplay');
        this.resultText = document.getElementById('resultText');
        this.spinDurationSelect = document.getElementById('spinDuration');
        this.soundToggle = document.getElementById('soundToggle');
        this.confettiToggle = document.getElementById('confettiToggle');
        this.exportBtn = document.getElementById('exportBtn');
        this.confettiContainer = document.getElementById('confettiContainer');
    }
    
    attachEventListeners() {
        this.addBtn.addEventListener('click', () => this.addItem());
        this.itemInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addItem();
        });
        this.spinBtn.addEventListener('click', () => this.spin());
        this.clearBtn.addEventListener('click', () => this.clearItems());
        this.defaultBtn.addEventListener('click', () => this.loadDefaultItems());
        this.spinDurationSelect.addEventListener('change', () => this.updateSettings());
        this.soundToggle.addEventListener('change', () => this.updateSettings());
        this.confettiToggle.addEventListener('change', () => this.updateSettings());
        this.exportBtn.addEventListener('click', () => this.exportImage());
        
        // Handle responsive canvas sizing
        window.addEventListener('resize', () => this.handleResize());
    }
    
    handleResize() {
        const containerWidth = this.canvas.parentElement.clientWidth - 40;
        const maxSize = Math.min(containerWidth, 400);
        
        if (window.innerWidth <= 768) {
            this.canvas.width = Math.min(maxSize, 300);
            this.canvas.height = Math.min(maxSize, 300);
        } else if (window.innerWidth <= 480) {
            this.canvas.width = Math.min(maxSize, 250);
            this.canvas.height = Math.min(maxSize, 250);
        } else {
            this.canvas.width = 400;
            this.canvas.height = 400;
        }
        
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = (this.canvas.width / 2) - 20;
        this.drawWheel();
    }
    
    addItem() {
        const text = this.itemInput.value.trim();
        if (text && !this.items.some(item => item.text === text)) {
            const item = {
                text: text,
                color: this.colors[this.items.length % this.colors.length],
                id: Date.now()
            };
            this.items.push(item);
            this.itemInput.value = '';
            this.updateItemsList();
            this.drawWheel();
            this.saveToLocalStorage();
        }
    }
    
    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.updateItemsList();
        this.drawWheel();
        this.saveToLocalStorage();
    }
    
    clearItems() {
        if (confirm('Are you sure you want to clear all items?')) {
            this.items = [];
            this.updateItemsList();
            this.drawWheel();
            this.saveToLocalStorage();
        }
    }
    
    loadDefaultItems() {
        this.items = this.defaultItems.map((text, index) => ({
            text: text,
            color: this.colors[index % this.colors.length],
            id: Date.now() + index
        }));
        this.updateItemsList();
        this.drawWheel();
        this.saveToLocalStorage();
    }
    
    updateItemsList() {
        this.itemsList.innerHTML = '';
        this.items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item';
            itemElement.innerHTML = `
                <div class="item-color" style="background-color: ${item.color}"></div>
                <span class="item-text">${item.text}</span>
                <button class="delete-btn" onclick="wheel.removeItem(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            this.itemsList.appendChild(itemElement);
        });
    }
    
    drawWheel() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.items.length === 0) {
            this.drawEmptyWheel();
            return;
        }
        
        const angleStep = (2 * Math.PI) / this.items.length;
        
        this.items.forEach((item, index) => {
            const startAngle = index * angleStep + this.currentRotation;
            const endAngle = (index + 1) * angleStep + this.currentRotation;
            
            // Draw sector
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX, this.centerY);
            this.ctx.arc(this.centerX, this.centerY, this.radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = item.color;
            this.ctx.fill();
            
            // Draw border
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX, this.centerY);
            this.ctx.arc(this.centerX, this.centerY, this.radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw text
            const textAngle = startAngle + angleStep / 2;
            const textRadius = this.radius * 0.7;
            const textX = this.centerX + Math.cos(textAngle) * textRadius;
            const textY = this.centerY + Math.sin(textAngle) * textRadius;
            
            this.ctx.save();
            this.ctx.translate(textX, textY);
            this.ctx.rotate(textAngle + Math.PI / 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 14px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Text shadow
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            this.ctx.shadowBlur = 2;
            this.ctx.shadowOffsetX = 1;
            this.ctx.shadowOffsetY = 1;
            
            this.ctx.fillText(item.text, 0, 0);
            this.ctx.restore();
        });
        
        // Draw center circle
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 30, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }
    
    drawEmptyWheel() {
        // Draw empty circle
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.fill();
        this.ctx.strokeStyle = '#bdc3c7';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw "Add items" text
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.font = 'bold 18px Poppins';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Add items to spin!', this.centerX, this.centerY);
        
        // Draw center circle
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 30, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#95a5a6';
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }
    
    spin() {
        if (this.isSpinning || this.items.length === 0) return;
        
        this.isSpinning = true;
        this.spinBtn.disabled = true;
        this.spinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SPINNING';
        
        // Play sound
        if (this.settings.soundEnabled) {
            this.playSpinSound();
        }
        
        // Calculate target rotation
        const spins = 5 + Math.random() * 5; // 5-10 full rotations
        const finalAngle = Math.random() * 2 * Math.PI;
        this.targetRotation = this.currentRotation + spins * 2 * Math.PI + finalAngle;
        
        const startTime = Date.now();
        const duration = this.settings.spinDuration;
        const startRotation = this.currentRotation;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            this.currentRotation = startRotation + (this.targetRotation - startRotation) * easeOut;
            this.drawWheel();
            
            if (progress < 1) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                this.finishSpin();
            }
        };
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    finishSpin() {
        this.isSpinning = false;
        this.spinBtn.disabled = false;
        this.spinBtn.innerHTML = '<i class="fas fa-play"></i> SPIN';
        
        // Calculate winner
        const normalizedRotation = this.currentRotation % (2 * Math.PI);
        const angleStep = (2 * Math.PI) / this.items.length;
        const pointerAngle = (3 * Math.PI / 2) - normalizedRotation; // Pointer is at top
        let winnerIndex = Math.floor(((pointerAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI) / angleStep);
        
        // Adjust for the fact that we want the section the pointer is pointing to
        winnerIndex = (this.items.length - winnerIndex - 1) % this.items.length;
        
        const winner = this.items[winnerIndex];
        this.showResult(winner);
        
        if (this.settings.confettiEnabled) {
            this.createConfetti();
        }
        
        if (this.settings.soundEnabled) {
            this.playWinSound();
        }
    }
    
    showResult(winner) {
        this.resultText.textContent = winner.text;
        this.resultText.style.borderLeftColor = winner.color;
        this.resultDisplay.classList.add('show');
        
        // Add bounce animation
        setTimeout(() => {
            this.resultText.classList.add('bounce');
            setTimeout(() => {
                this.resultText.classList.remove('bounce');
            }, 1000);
        }, 100);
    }
    
    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
        
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
                confetti.style.animationDelay = Math.random() * 0.5 + 's';
                
                this.confettiContainer.appendChild(confetti);
                
                // Remove confetti after animation
                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 3500);
            }, i * 10);
        }
    }
    
    playSpinSound() {
        // Create a simple spinning sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    playWinSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.8);
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    updateSettings() {
        this.settings.spinDuration = parseInt(this.spinDurationSelect.value);
        this.settings.soundEnabled = this.soundToggle.checked;
        this.settings.confettiEnabled = this.confettiToggle.checked;
        this.saveSettings();
    }
    
    saveSettings() {
        localStorage.setItem('pickerWheelSettings', JSON.stringify(this.settings));
    }
    
    loadSettings() {
        const saved = localStorage.getItem('pickerWheelSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
            this.spinDurationSelect.value = this.settings.spinDuration;
            this.soundToggle.checked = this.settings.soundEnabled;
            this.confettiToggle.checked = this.settings.confettiEnabled;
        }
    }
    
    saveToLocalStorage() {
        localStorage.setItem('pickerWheelItems', JSON.stringify(this.items));
    }
    
    loadFromLocalStorage() {
        const saved = localStorage.getItem('pickerWheelItems');
        if (saved) {
            this.items = JSON.parse(saved);
            this.updateItemsList();
            this.drawWheel();
        }
    }
    
    exportImage() {
        // Create a temporary canvas with white background
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Fill with white background
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Draw the wheel on top
        tempCtx.drawImage(this.canvas, 0, 0);
        
        // Download the image
        const link = document.createElement('a');
        link.download = 'picker-wheel.png';
        link.href = tempCanvas.toDataURL();
        link.click();
    }
}

// Initialize the wheel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.wheel = new PickerWheel();
    
    // Load saved items
    wheel.loadFromLocalStorage();
    
    // Handle initial resize
    wheel.handleResize();
});

// Prevent context menu on canvas
document.getElementById('wheelCanvas').addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Add some keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement.id === 'itemInput') {
        wheel.addItem();
    } else if (e.key === ' ' && !wheel.isSpinning && wheel.items.length > 0) {
        e.preventDefault();
        wheel.spin();
    }
});