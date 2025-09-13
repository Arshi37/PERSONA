/**
 * Spinner Tool for NameStyler.site
 * A modern, interactive spinner with smooth animations and customizable options
 */

class SpinnerTool {
    constructor() {
        this.canvas = document.getElementById('spinnerCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.items = [];
        this.currentRotation = 0;
        this.isSpinning = false;
        this.spinHistory = [];
        this.totalSpins = 0;
        this.animationId = null;
        
        // Configuration
        this.config = {
            removeAfterSpin: true,
            enableSound: false,
            spinDuration: 3000,
            colors: [
                '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
                '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
                '#F1948A', '#85C1E9', '#F4D03F', '#A569BD', '#5DADE2', '#58D68D'
            ]
        };
        
        this.setupCanvas();
        this.bindEvents();
        this.loadInitialItems();
        this.updateStats();
        this.draw();
    }
    
    setupCanvas() {
        const size = Math.min(400, window.innerWidth - 100);
        this.canvas.width = size;
        this.canvas.height = size;
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';
        
        this.centerX = size / 2;
        this.centerY = size / 2;
        this.radius = (size / 2) - 20;
    }
    
    bindEvents() {
        // Spin button
        document.getElementById('spinBtn').addEventListener('click', () => {
            if (!this.isSpinning && this.items.length > 0) {
                this.spin();
            }
        });
        
        // Update items button
        document.getElementById('updateItems').addEventListener('click', () => {
            this.updateItems();
        });
        
        // Reset button
        document.getElementById('resetSpinner').addEventListener('click', () => {
            this.reset();
        });
        
        // Export results button
        document.getElementById('exportResults').addEventListener('click', () => {
            this.exportResults();
        });
        
        // Clear history button
        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearHistory();
        });
        
        // Options
        document.getElementById('removeAfterSpin').addEventListener('change', (e) => {
            this.config.removeAfterSpin = e.target.checked;
        });
        
        document.getElementById('enableSound').addEventListener('change', (e) => {
            this.config.enableSound = e.target.checked;
        });
        
        document.getElementById('spinDuration').addEventListener('input', (e) => {
            this.config.spinDuration = parseFloat(e.target.value) * 1000;
            document.getElementById('durationValue').textContent = e.target.value;
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.draw();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isSpinning && this.items.length > 0) {
                e.preventDefault();
                this.spin();
            }
        });
    }
    
    loadInitialItems() {
        const textarea = document.getElementById('itemsInput');
        const items = textarea.value
            .split('\n')
            .map(item => item.trim())
            .filter(item => item.length > 0);
        
        this.items = [...items];
        this.updateStats();
    }
    
    updateItems() {
        const textarea = document.getElementById('itemsInput');
        const items = textarea.value
            .split('\n')
            .map(item => item.trim())
            .filter(item => item.length > 0);
        
        if (items.length === 0) {
            this.showNotification('Please add at least one item!', 'warning');
            return;
        }
        
        this.items = [...items];
        this.updateStats();
        this.draw();
        this.showNotification(`Updated with ${items.length} items!`, 'success');
    }
    
    reset() {
        this.items = [];
        this.spinHistory = [];
        this.totalSpins = 0;
        this.currentRotation = 0;
        this.isSpinning = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        document.getElementById('itemsInput').value = 'Apple\nBanana\nCherry\nDate\nElderberry\nGrape\nKiwi\nMango';
        document.getElementById('currentResult').innerHTML = `
            <div class="result-label">Selected:</div>
            <div class="result-value">Click spin to start!</div>
        `;
        
        this.loadInitialItems();
        this.updateHistoryDisplay();
        this.draw();
        this.showNotification('Spinner reset successfully!', 'info');
    }
    
    spin() {
        if (this.isSpinning || this.items.length === 0) return;
        
        this.isSpinning = true;
        const spinBtn = document.getElementById('spinBtn');
        spinBtn.disabled = true;
        spinBtn.classList.add('spinning');
        
        // Play sound effect if enabled
        if (this.config.enableSound) {
            this.playSpinSound();
        }
        
        // Calculate spin parameters
        const minSpins = 5;
        const maxSpins = 8;
        const spins = minSpins + Math.random() * (maxSpins - minSpins);
        const targetRotation = this.currentRotation + (spins * Math.PI * 2);
        
        // Add random offset to avoid landing on segment boundaries
        const segmentSize = (Math.PI * 2) / this.items.length;
        const randomOffset = (Math.random() - 0.5) * segmentSize * 0.8;
        const finalRotation = targetRotation + randomOffset;
        
        const startRotation = this.currentRotation;
        const startTime = performance.now();
        const duration = this.config.spinDuration;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            this.currentRotation = startRotation + (finalRotation - startRotation) * easeOut;
            this.draw();
            
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
        const spinBtn = document.getElementById('spinBtn');
        spinBtn.disabled = false;
        spinBtn.classList.remove('spinning');
        
        // Calculate winner
        const winner = this.getWinner();
        if (winner) {
            this.totalSpins++;
            this.spinHistory.unshift({
                result: winner,
                timestamp: new Date(),
                spin: this.totalSpins
            });
            
            // Update result display
            const resultValue = document.querySelector('.result-value');
            resultValue.textContent = winner;
            resultValue.classList.add('winner');
            setTimeout(() => resultValue.classList.remove('winner'), 600);
            
            // Remove item if option is enabled
            if (this.config.removeAfterSpin && this.items.length > 1) {
                const index = this.items.indexOf(winner);
                if (index > -1) {
                    this.items.splice(index, 1);
                    this.updateTextarea();
                }
            }
            
            this.updateStats();
            this.updateHistoryDisplay();
            
            // Play success sound if enabled
            if (this.config.enableSound) {
                setTimeout(() => this.playSuccessSound(), 200);
            }
            
            this.showNotification(`🎉 Winner: ${winner}`, 'success');
        }
        
        this.draw();
    }
    
    getWinner() {
        if (this.items.length === 0) return null;
        
        // Normalize rotation to 0-2π range
        const normalizedRotation = ((this.currentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        
        // Calculate which segment the pointer (at top) is pointing to
        const segmentSize = (Math.PI * 2) / this.items.length;
        const pointerAngle = Math.PI / 2; // Pointer is at top (90 degrees)
        
        // Adjust for the fact that we're measuring from the top
        const adjustedAngle = (normalizedRotation + pointerAngle) % (Math.PI * 2);
        const segmentIndex = Math.floor(adjustedAngle / segmentSize);
        
        return this.items[segmentIndex] || this.items[0];
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.items.length === 0) {
            this.drawEmptyState();
            return;
        }
        
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.rotate(this.currentRotation);
        
        const segmentAngle = (Math.PI * 2) / this.items.length;
        
        // Draw segments
        for (let i = 0; i < this.items.length; i++) {
            const startAngle = i * segmentAngle;
            const endAngle = startAngle + segmentAngle;
            
            // Draw segment
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.arc(0, 0, this.radius, startAngle, endAngle);
            this.ctx.closePath();
            
            // Fill with color
            this.ctx.fillStyle = this.config.colors[i % this.config.colors.length];
            this.ctx.fill();
            
            // Add border
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // Add text
            this.ctx.save();
            this.ctx.rotate(startAngle + segmentAngle / 2);
            this.ctx.translate(this.radius * 0.7, 0);
            this.ctx.rotate(-this.currentRotation - startAngle - segmentAngle / 2);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 16px Inter, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            this.ctx.shadowBlur = 2;
            
            const text = this.items[i];
            const maxWidth = this.radius * 0.4;
            this.drawFittedText(text, maxWidth);
            
            this.ctx.restore();
        }
        
        this.ctx.restore();
        
        // Draw center circle
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 25, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
        this.ctx.strokeStyle = '#e5e7eb';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    drawFittedText(text, maxWidth) {
        let fontSize = 16;
        this.ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        
        while (this.ctx.measureText(text).width > maxWidth && fontSize > 10) {
            fontSize--;
            this.ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        }
        
        if (this.ctx.measureText(text).width > maxWidth) {
            // Truncate text with ellipsis
            let truncated = text;
            while (this.ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 1) {
                truncated = truncated.slice(0, -1);
            }
            this.ctx.fillText(truncated + '...', 0, 0);
        } else {
            this.ctx.fillText(text, 0, 0);
        }
    }
    
    drawEmptyState() {
        this.ctx.fillStyle = '#f3f4f6';
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#d1d5db';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#6b7280';
        this.ctx.font = 'bold 18px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Add items to start!', this.centerX, this.centerY);
    }
    
    updateStats() {
        document.getElementById('totalSpins').textContent = this.totalSpins;
        document.getElementById('itemsRemaining').textContent = this.items.length;
    }
    
    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        
        if (this.spinHistory.length === 0) {
            historyList.innerHTML = '<div class="history-empty">No spins yet. Start spinning to see your results here!</div>';
            return;
        }
        
        historyList.innerHTML = this.spinHistory
            .slice(0, 20) // Show last 20 results
            .map(entry => `
                <div class="history-item">
                    <span class="history-result">#${entry.spin}: ${this.escapeHtml(entry.result)}</span>
                    <span class="history-time">${this.formatTime(entry.timestamp)}</span>
                </div>
            `).join('');
    }
    
    updateTextarea() {
        document.getElementById('itemsInput').value = this.items.join('\n');
    }
    
    clearHistory() {
        this.spinHistory = [];
        this.totalSpins = 0;
        this.updateStats();
        this.updateHistoryDisplay();
        
        document.getElementById('currentResult').innerHTML = `
            <div class="result-label">Selected:</div>
            <div class="result-value">Click spin to start!</div>
        `;
        
        this.showNotification('History cleared!', 'info');
    }
    
    exportResults() {
        if (this.spinHistory.length === 0) {
            this.showNotification('No results to export!', 'warning');
            return;
        }
        
        const data = {
            exportDate: new Date().toISOString(),
            totalSpins: this.totalSpins,
            results: this.spinHistory.map(entry => ({
                spin: entry.spin,
                result: entry.result,
                timestamp: entry.timestamp.toISOString()
            }))
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spinner-results-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Results exported successfully!', 'success');
    }
    
    playSpinSound() {
        if (!this.config.enableSound) return;
        
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    playSuccessSound() {
        if (!this.config.enableSound) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 1000;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            fontSize: '14px',
            zIndex: '10000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        });
        
        // Set background color based on type
        const colors = {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#6366f1'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the spinner when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const spinner = new SpinnerTool();
    
    // Add some helpful keyboard shortcuts info
    console.log('Spinner Tool Keyboard Shortcuts:');
    console.log('- Spacebar: Spin the wheel');
    console.log('- Made for NameStyler.site with ❤️');
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpinnerTool;
}