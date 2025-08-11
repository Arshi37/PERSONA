<?php
/**
 * Picker Wheel Shortcode for WordPress
 * Usage: [picker_wheel] or [picker_wheel title="Custom Title" options="Yes,No,Maybe"]
 */

function picker_wheel_shortcode($atts) {
    // Set default attributes
    $attributes = shortcode_atts(array(
        'title' => 'Random Decision Maker',
        'description' => 'Can\'t decide? Let our picker wheel help you make random choices!',
        'options' => 'Yes,No,Maybe,Ask Again,Definitely,Not Now',
        'width' => '300',
        'height' => '300',
        'id' => 'picker-' . uniqid() // Unique ID for multiple wheels on same page
    ), $atts);
    
    // Convert options string to array
    $options_array = explode(',', $attributes['options']);
    $options_json = json_encode(array_map('trim', $options_array));
    
    // Generate unique IDs
    $unique_id = $attributes['id'];
    
    ob_start(); ?>
    
    <!-- Picker Wheel Post Embed -->
    <div class="post-picker-wheel" id="<?php echo $unique_id; ?>">
        <div class="post-picker-container">
            <div class="post-picker-header">
                <h3><i class="fas fa-circle-notch"></i> <?php echo esc_html($attributes['title']); ?></h3>
                <p><?php echo esc_html($attributes['description']); ?></p>
            </div>

            <div class="post-picker-content">
                <div class="post-wheel-area">
                    <div class="post-wheel-wrapper">
                        <canvas id="<?php echo $unique_id; ?>Canvas" width="<?php echo $attributes['width']; ?>" height="<?php echo $attributes['height']; ?>"></canvas>
                        <div class="post-wheel-pointer">
                            <i class="fas fa-caret-down"></i>
                        </div>
                        <button id="<?php echo $unique_id; ?>SpinBtn" class="post-spin-button">
                            <i class="fas fa-play"></i>
                            SPIN
                        </button>
                    </div>
                    
                    <div class="post-picker-result" id="<?php echo $unique_id; ?>Result">
                        <div class="result-content">
                            <h4>Result:</h4>
                            <div class="result-text" id="<?php echo $unique_id; ?>ResultText">Click spin to get a result!</div>
                        </div>
                    </div>
                </div>

                <div class="post-picker-controls">
                    <div class="post-input-area">
                        <h4><i class="fas fa-list"></i> Options</h4>
                        <div class="post-add-option">
                            <input type="text" id="<?php echo $unique_id; ?>ItemInput" placeholder="Add option..." maxlength="30">
                            <button id="<?php echo $unique_id; ?>AddBtn"><i class="fas fa-plus"></i></button>
                        </div>
                        
                        <div class="post-options-list" id="<?php echo $unique_id; ?>ItemsList">
                            <!-- Items will be dynamically added here -->
                        </div>
                        
                        <div class="post-list-actions">
                            <button id="<?php echo $unique_id; ?>ClearBtn" class="post-clear-btn">
                                <i class="fas fa-trash"></i> Clear
                            </button>
                            <button id="<?php echo $unique_id; ?>DefaultBtn" class="post-default-btn">
                                <i class="fas fa-refresh"></i> Reset
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="post-picker-confetti" id="<?php echo $unique_id; ?>Confetti"></div>
    </div>

    <style>
    .post-picker-wheel {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 30px 20px;
        margin: 30px 0;
        border-radius: 15px;
        color: white;
        position: relative;
        overflow: hidden;
        max-width: 800px;
    }

    .post-picker-container {
        max-width: 100%;
        margin: 0 auto;
    }

    .post-picker-header {
        text-align: center;
        margin-bottom: 25px;
    }

    .post-picker-header h3 {
        font-size: 1.8rem;
        font-weight: 700;
        margin-bottom: 8px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .post-picker-header h3 i {
        margin-right: 10px;
        color: #ffd700;
    }

    .post-picker-header p {
        font-size: 1rem;
        opacity: 0.9;
        margin-bottom: 0;
    }

    .post-picker-content {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 25px;
        align-items: start;
    }

    .post-wheel-area {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
    }

    .post-wheel-wrapper {
        position: relative;
        display: inline-block;
        padding: 10px;
        background: white;
        border-radius: 50%;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    }

    .post-wheel-wrapper canvas {
        border-radius: 50%;
        display: block;
    }

    .post-wheel-pointer {
        position: absolute;
        top: -6px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 1.5rem;
        color: #ff4757;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        z-index: 10;
    }

    .post-spin-button {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        color: white;
        font-weight: 600;
        font-size: 0.7rem;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
        z-index: 10;
    }

    .post-spin-button:hover {
        transform: translate(-50%, -50%) scale(1.05);
        box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
    }

    .post-spin-button:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: translate(-50%, -50%);
        box-shadow: none;
    }

    .post-picker-result {
        background: white;
        border-radius: 12px;
        padding: 15px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        text-align: center;
        color: #333;
        min-width: 250px;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.5s ease;
    }

    .post-picker-result.show {
        opacity: 1;
        transform: translateY(0);
    }

    .post-picker-result h4 {
        color: #666;
        margin-bottom: 8px;
        font-weight: 500;
        font-size: 1rem;
    }

    .post-picker-result .result-text {
        font-size: 1.2rem;
        font-weight: 600;
        color: #2c3e50;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #667eea;
    }

    .post-picker-controls {
        background: rgba(255, 255, 255, 0.95);
        border-radius: 15px;
        padding: 20px;
        color: #333;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .post-input-area h4 {
        color: #2c3e50;
        margin-bottom: 15px;
        font-weight: 600;
        display: flex;
        align-items: center;
        font-size: 1.1rem;
    }

    .post-input-area h4 i {
        margin-right: 8px;
        color: #667eea;
    }

    .post-add-option {
        display: flex;
        gap: 8px;
        margin-bottom: 15px;
    }

    .post-add-option input {
        flex: 1;
        padding: 10px 12px;
        border: 2px solid #e1e8ed;
        border-radius: 8px;
        font-size: 0.9rem;
        transition: border-color 0.3s ease;
    }

    .post-add-option input:focus {
        outline: none;
        border-color: #667eea;
    }

    .post-add-option button {
        padding: 10px 15px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
    }

    .post-add-option button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .post-options-list {
        max-height: 150px;
        overflow-y: auto;
        margin-bottom: 15px;
    }

    .post-picker-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 10px;
        background: #f8f9fa;
        border-radius: 6px;
        margin-bottom: 5px;
        transition: all 0.3s ease;
        font-size: 0.85rem;
    }

    .post-picker-item:hover {
        background: #e9ecef;
        transform: translateX(3px);
    }

    .post-picker-item-color {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 8px;
        border: 2px solid #fff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .post-picker-item-text {
        flex: 1;
        font-weight: 500;
    }

    .post-picker-delete-btn {
        background: #ff4757;
        color: white;
        border: none;
        border-radius: 3px;
        padding: 3px 5px;
        cursor: pointer;
        font-size: 0.6rem;
        transition: all 0.3s ease;
    }

    .post-picker-delete-btn:hover {
        background: #ff3838;
        transform: scale(1.1);
    }

    .post-list-actions {
        display: flex;
        gap: 8px;
    }

    .post-clear-btn,
    .post-default-btn {
        flex: 1;
        padding: 8px 12px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        font-size: 0.8rem;
        transition: all 0.3s ease;
    }

    .post-clear-btn {
        background: #ff4757;
        color: white;
    }

    .post-clear-btn:hover {
        background: #ff3838;
        transform: translateY(-2px);
    }

    .post-default-btn {
        background: #5dade2;
        color: white;
    }

    .post-default-btn:hover {
        background: #3498db;
        transform: translateY(-2px);
    }

    .post-picker-confetti {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
    }

    .post-confetti-piece {
        position: absolute;
        width: 6px;
        height: 6px;
        background: #ff6b6b;
        animation: post-confetti-fall 2s linear forwards;
    }

    @keyframes post-confetti-fall {
        0% {
            transform: translateY(-100px) rotateZ(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(200px) rotateZ(720deg);
            opacity: 0;
        }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .post-picker-content {
            grid-template-columns: 1fr;
            gap: 20px;
        }
        
        .post-picker-controls {
            order: -1;
        }
        
        .post-picker-header h3 {
            font-size: 1.5rem;
        }
        
        .post-add-option {
            flex-direction: column;
        }
    }

    @keyframes post-bounce {
        0%, 20%, 60%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-10px);
        }
        80% {
            transform: translateY(-5px);
        }
    }

    .post-bounce {
        animation: post-bounce 0.6s ease-in-out;
    }
    </style>

    <script>
    (function() {
        class PostPickerWheel {
            constructor(containerId, options) {
                this.containerId = containerId;
                this.canvas = document.getElementById(containerId + 'Canvas');
                this.ctx = this.canvas.getContext('2d');
                this.centerX = this.canvas.width / 2;
                this.centerY = this.canvas.height / 2;
                this.radius = (this.canvas.width / 2) - 15;
                
                this.items = [];
                this.isSpinning = false;
                this.currentRotation = 0;
                this.targetRotation = 0;
                this.animationId = null;
                
                this.colors = [
                    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
                    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
                ];
                
                this.initializeElements();
                this.attachEventListeners();
                this.loadOptions(options);
                this.drawWheel();
            }
            
            initializeElements() {
                this.itemInput = document.getElementById(this.containerId + 'ItemInput');
                this.addBtn = document.getElementById(this.containerId + 'AddBtn');
                this.itemsList = document.getElementById(this.containerId + 'ItemsList');
                this.spinBtn = document.getElementById(this.containerId + 'SpinBtn');
                this.clearBtn = document.getElementById(this.containerId + 'ClearBtn');
                this.defaultBtn = document.getElementById(this.containerId + 'DefaultBtn');
                this.resultDisplay = document.getElementById(this.containerId + 'Result');
                this.resultText = document.getElementById(this.containerId + 'ResultText');
                this.confettiContainer = document.getElementById(this.containerId + 'Confetti');
            }
            
            attachEventListeners() {
                this.addBtn.addEventListener('click', () => this.addItem());
                this.itemInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.addItem();
                });
                this.spinBtn.addEventListener('click', () => this.spin());
                this.clearBtn.addEventListener('click', () => this.clearItems());
                this.defaultBtn.addEventListener('click', () => this.loadOptions(<?php echo $options_json; ?>));
            }
            
            loadOptions(options) {
                this.items = options.map((text, index) => ({
                    text: text.trim(),
                    color: this.colors[index % this.colors.length],
                    id: Date.now() + index
                }));
                this.updateItemsList();
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
                }
            }
            
            removeItem(id) {
                this.items = this.items.filter(item => item.id !== id);
                this.updateItemsList();
                this.drawWheel();
            }
            
            clearItems() {
                this.items = [];
                this.updateItemsList();
                this.drawWheel();
                this.resultDisplay.classList.remove('show');
            }
            
            updateItemsList() {
                this.itemsList.innerHTML = '';
                this.items.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'post-picker-item';
                    itemElement.innerHTML = `
                        <div class="post-picker-item-color" style="background-color: ${item.color}"></div>
                        <span class="post-picker-item-text">${item.text}</span>
                        <button class="post-picker-delete-btn" onclick="window.${this.containerId}Wheel.removeItem(${item.id})">
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
                    this.ctx.font = 'bold 11px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    this.ctx.shadowBlur = 1;
                    this.ctx.fillText(item.text, 0, 0);
                    this.ctx.restore();
                });
                
                // Draw center circle
                this.ctx.beginPath();
                this.ctx.arc(this.centerX, this.centerY, 20, 0, 2 * Math.PI);
                this.ctx.fillStyle = '#2c3e50';
                this.ctx.fill();
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            }
            
            drawEmptyWheel() {
                this.ctx.beginPath();
                this.ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
                this.ctx.fillStyle = '#ecf0f1';
                this.ctx.fill();
                this.ctx.strokeStyle = '#bdc3c7';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                this.ctx.fillStyle = '#7f8c8d';
                this.ctx.font = 'bold 14px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('Add options!', this.centerX, this.centerY);
            }
            
            spin() {
                if (this.isSpinning || this.items.length === 0) return;
                
                this.isSpinning = true;
                this.spinBtn.disabled = true;
                this.spinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SPINNING';
                
                const spins = 3 + Math.random() * 3;
                const finalAngle = Math.random() * 2 * Math.PI;
                this.targetRotation = this.currentRotation + spins * 2 * Math.PI + finalAngle;
                
                const startTime = Date.now();
                const duration = 2000;
                const startRotation = this.currentRotation;
                
                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
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
                
                const normalizedRotation = this.currentRotation % (2 * Math.PI);
                const angleStep = (2 * Math.PI) / this.items.length;
                const pointerAngle = (3 * Math.PI / 2) - normalizedRotation;
                let winnerIndex = Math.floor(((pointerAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI) / angleStep);
                winnerIndex = (this.items.length - winnerIndex - 1) % this.items.length;
                
                const winner = this.items[winnerIndex];
                this.showResult(winner);
                this.createConfetti();
            }
            
            showResult(winner) {
                this.resultText.textContent = winner.text;
                this.resultText.style.borderLeftColor = winner.color;
                this.resultDisplay.classList.add('show');
                
                setTimeout(() => {
                    this.resultText.classList.add('post-bounce');
                    setTimeout(() => this.resultText.classList.remove('post-bounce'), 600);
                }, 100);
            }
            
            createConfetti() {
                const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
                
                for (let i = 0; i < 30; i++) {
                    setTimeout(() => {
                        const confetti = document.createElement('div');
                        confetti.className = 'post-confetti-piece';
                        confetti.style.left = Math.random() * 100 + '%';
                        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                        confetti.style.animationDuration = (Math.random() * 1.5 + 1) + 's';
                        
                        this.confettiContainer.appendChild(confetti);
                        
                        setTimeout(() => {
                            if (confetti.parentNode) confetti.parentNode.removeChild(confetti);
                        }, 2500);
                    }, i * 15);
                }
            }
        }
        
        // Initialize the wheel when DOM is ready
        document.addEventListener('DOMContentLoaded', function() {
            if (document.getElementById('<?php echo $unique_id; ?>Canvas')) {
                window.<?php echo $unique_id; ?>Wheel = new PostPickerWheel('<?php echo $unique_id; ?>', <?php echo $options_json; ?>);
            }
        });
    })();
    </script>
    
    <?php
    return ob_get_clean();
}

// Register the shortcode
add_shortcode('picker_wheel', 'picker_wheel_shortcode');
?>