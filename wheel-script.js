// Wheel of Choice - JavaScript
// Extract this JavaScript and add it to your existing JS file for integration

class WheelOfChoice {
    constructor(containerId = 'wheel-of-choice') {
        this.containerId = containerId;
        this.options = [
            { text: 'Option 1', color: '#FF6B6B' },
            { text: 'Option 2', color: '#4ECDC4' },
            { text: 'Option 3', color: '#45B7D1' },
            { text: 'Option 4', color: '#96CEB4' },
            { text: 'Option 5', color: '#FFEAA7' },
            { text: 'Option 6', color: '#DDA0DD' }
        ];
        
        this.isSpinning = false;
        this.currentRotation = 0;
        this.spinDuration = 4;
        
        this.init();
    }

    init() {
        this.setupElements();
        this.renderWheel();
        this.renderOptions();
        this.bindEvents();
    }

    setupElements() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with ID '${this.containerId}' not found`);
            return;
        }

        this.wheel = container.querySelector('#wheel');
        this.spinButton = container.querySelector('#spinButton');
        this.result = container.querySelector('#result');
        
        if (!this.wheel || !this.spinButton || !this.result) {
            console.error('Required wheel elements not found');
            return;
        }
    }

    renderWheel() {
        if (!this.wheel) return;
        
        this.wheel.innerHTML = '';
        const segmentAngle = 360 / this.options.length;

        this.options.forEach((option, index) => {
            const segment = document.createElement('div');
            segment.className = 'wheel-segment';
            segment.style.background = option.color;
            segment.style.transform = `rotate(${segmentAngle * index}deg)`;
            segment.style.clipPath = `polygon(0% 0%, ${100 - (100/this.options.length)}% 0%, 100% 100%, 0% 100%)`;
            
            const span = document.createElement('span');
            span.textContent = option.text;
            segment.appendChild(span);
            
            this.wheel.appendChild(segment);
        });
    }

    renderOptions() {
        const container = document.querySelector(`#${this.containerId} #optionsList`);
        if (!container) return;
        
        container.innerHTML = '';

        this.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option-input';
            
            optionDiv.innerHTML = `
                <input type="text" value="${option.text}" onchange="wheel.updateOption(${index}, 'text', this.value)">
                <input type="color" class="color-picker" value="${option.color}" onchange="wheel.updateOption(${index}, 'color', this.value)">
                <button class="remove-btn" onclick="wheel.removeOption(${index})" ${this.options.length <= 2 ? 'disabled' : ''}>×</button>
            `;
            
            container.appendChild(optionDiv);
        });
    }

    addOption() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#F39C12', '#E74C3C', '#9B59B6', '#1ABC9C'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        this.options.push({
            text: `Option ${this.options.length + 1}`,
            color: randomColor
        });
        
        this.renderWheel();
        this.renderOptions();
    }

    removeOption(index) {
        if (this.options.length > 2) {
            this.options.splice(index, 1);
            this.renderWheel();
            this.renderOptions();
        }
    }

    updateOption(index, property, value) {
        if (this.options[index]) {
            this.options[index][property] = value;
            this.renderWheel();
        }
    }

    spin() {
        if (this.isSpinning || !this.wheel || !this.spinButton || !this.result) return;

        this.isSpinning = true;
        this.spinButton.disabled = true;
        this.result.className = 'result';
        this.result.textContent = 'Spinning...';

        // Calculate random rotation (multiple full rotations + random position)
        const minRotation = 1080; // 3 full rotations minimum
        const maxRotation = 2160; // 6 full rotations maximum
        const randomRotation = Math.random() * (maxRotation - minRotation) + minRotation;
        
        this.currentRotation += randomRotation;
        
        // Apply rotation
        this.wheel.style.transition = `transform ${this.spinDuration}s cubic-bezier(0.17, 0.67, 0.12, 0.99)`;
        this.wheel.style.transform = `rotate(${this.currentRotation}deg)`;

        // Play spin sound (if enabled)
        const soundElement = document.querySelector(`#${this.containerId} #spinSound`);
        if (soundElement && soundElement.value === 'true') {
            this.playSpinSound();
        }

        // Calculate result after spin
        setTimeout(() => {
            this.calculateResult();
            this.isSpinning = false;
            this.spinButton.disabled = false;
        }, this.spinDuration * 1000);
    }

    calculateResult() {
        const segmentAngle = 360 / this.options.length;
        const normalizedRotation = (360 - (this.currentRotation % 360)) % 360;
        const selectedIndex = Math.floor(normalizedRotation / segmentAngle);
        const winner = this.options[selectedIndex];

        if (this.result) {
            this.result.className = 'result show';
            this.result.textContent = `🎉 ${winner.text}`;
        }

        // Flash the winning segment
        this.flashWinningSegment(selectedIndex);
        
        // Trigger custom event for external listeners
        const event = new CustomEvent('wheelResult', { 
            detail: { 
                winner: winner, 
                index: selectedIndex 
            } 
        });
        document.dispatchEvent(event);
    }

    flashWinningSegment(index) {
        if (!this.wheel) return;
        
        const segments = this.wheel.querySelectorAll('.wheel-segment');
        const winningSegment = segments[index];
        
        if (!winningSegment) return;
        
        let flashCount = 0;
        const flashInterval = setInterval(() => {
            winningSegment.style.filter = flashCount % 2 === 0 ? 'brightness(1.5)' : 'brightness(1)';
            flashCount++;
            
            if (flashCount >= 6) {
                clearInterval(flashInterval);
                winningSegment.style.filter = 'brightness(1)';
            }
        }, 200);
    }

    playSpinSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    updateSpinDuration(value) {
        this.spinDuration = parseInt(value);
        const durationElement = document.querySelector(`#${this.containerId} #durationValue`);
        if (durationElement) {
            durationElement.textContent = value + 's';
        }
    }

    reset() {
        this.options = [
            { text: 'Option 1', color: '#FF6B6B' },
            { text: 'Option 2', color: '#4ECDC4' },
            { text: 'Option 3', color: '#45B7D1' },
            { text: 'Option 4', color: '#96CEB4' },
            { text: 'Option 5', color: '#FFEAA7' },
            { text: 'Option 6', color: '#DDA0DD' }
        ];
        
        this.currentRotation = 0;
        if (this.wheel) {
            this.wheel.style.transform = 'rotate(0deg)';
        }
        if (this.result) {
            this.result.className = 'result';
            this.result.textContent = 'Click "Spin the Wheel" to get started!';
        }
        
        this.renderWheel();
        this.renderOptions();
    }

    bindEvents() {
        if (this.spinButton) {
            this.spinButton.addEventListener('click', () => this.spin());
        }
    }

    // Public API methods
    setOptions(options) {
        this.options = options;
        this.renderWheel();
        this.renderOptions();
    }

    getOptions() {
        return [...this.options];
    }

    getCurrentResult() {
        return this.result ? this.result.textContent : null;
    }
}

// Global functions for HTML event handlers (for backwards compatibility)
let wheel;

function initializeWheel(containerId = 'wheel-of-choice') {
    wheel = new WheelOfChoice(containerId);
    return wheel;
}

function addOption() {
    if (wheel) wheel.addOption();
}

function updateSpinDuration(value) {
    if (wheel) wheel.updateSpinDuration(value);
}

function resetWheel() {
    if (wheel) wheel.reset();
}

// Auto-initialize if wheel container exists
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('wheel') || document.querySelector('.wheel-of-choice-container')) {
        wheel = new WheelOfChoice();
        
        // Keyboard shortcut to spin
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && wheel && !wheel.isSpinning) {
                e.preventDefault();
                wheel.spin();
            }
        });
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WheelOfChoice;
}