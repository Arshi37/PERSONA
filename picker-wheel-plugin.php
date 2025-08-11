<?php
/**
 * Plugin Name: Picker Wheel
 * Plugin URI: https://namesyler.site
 * Description: Add interactive picker wheels to your posts and pages with a simple shortcode.
 * Version: 1.0.0
 * Author: NameStyler
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class PickerWheelPlugin {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('picker_wheel', array($this, 'picker_wheel_shortcode'));
        
        // Add admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
    }
    
    public function init() {
        // Plugin initialization
    }
    
    public function enqueue_scripts() {
        // Only load on pages that have the shortcode
        global $post;
        if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'picker_wheel')) {
            wp_enqueue_script('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js', array(), '6.0.0', true);
        }
    }
    
    public function picker_wheel_shortcode($atts, $content = null) {
        // Parse shortcode attributes
        $attributes = shortcode_atts(array(
            'title' => 'Random Decision Maker',
            'description' => 'Can\'t decide? Let our picker wheel help you make random choices!',
            'options' => 'Yes,No,Maybe,Ask Again,Definitely,Not Now',
            'width' => '300',
            'height' => '300',
            'colors' => '', // Custom colors (optional)
            'id' => 'picker-' . uniqid(), // Unique ID for multiple wheels
            'size' => 'medium' // small, medium, large
        ), $atts, 'picker_wheel');
        
        // Convert options string to array
        $options_array = array_map('trim', explode(',', $attributes['options']));
        $options_json = wp_json_encode($options_array);
        
        // Handle custom colors
        $default_colors = array(
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        );
        
        if (!empty($attributes['colors'])) {
            $custom_colors = array_map('trim', explode(',', $attributes['colors']));
            $colors_json = wp_json_encode($custom_colors);
        } else {
            $colors_json = wp_json_encode($default_colors);
        }
        
        // Handle size presets
        switch ($attributes['size']) {
            case 'small':
                $attributes['width'] = '200';
                $attributes['height'] = '200';
                break;
            case 'large':
                $attributes['width'] = '400';
                $attributes['height'] = '400';
                break;
            default: // medium
                $attributes['width'] = '300';
                $attributes['height'] = '300';
                break;
        }
        
        // Generate unique IDs
        $unique_id = sanitize_html_class($attributes['id']);
        
        // Start output buffering
        ob_start();
        ?>
        
        <!-- Picker Wheel WordPress Plugin -->
        <div class="wp-picker-wheel-container" id="<?php echo esc_attr($unique_id); ?>">
            <div class="wp-picker-wheel" style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 30px 20px;
                margin: 30px 0;
                border-radius: 15px;
                color: white;
                position: relative;
                overflow: hidden;
                max-width: 100%;
                box-sizing: border-box;
            ">
                <div class="wp-picker-header" style="text-align: center; margin-bottom: 25px;">
                    <h3 style="
                        font-size: 1.8rem;
                        font-weight: 700;
                        margin-bottom: 8px;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                        line-height: 1.2;
                    ">
                        🎯 <?php echo esc_html($attributes['title']); ?>
                    </h3>
                    <p style="
                        font-size: 1rem;
                        opacity: 0.9;
                        margin-bottom: 0;
                        line-height: 1.4;
                    ">
                        <?php echo esc_html($attributes['description']); ?>
                    </p>
                </div>

                <div class="wp-picker-content" style="
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 25px;
                    align-items: start;
                ">
                    <!-- Wheel Area -->
                    <div class="wp-wheel-area" style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 20px;
                    ">
                        <div class="wp-wheel-wrapper" style="
                            position: relative;
                            display: inline-block;
                            padding: 10px;
                            background: white;
                            border-radius: 50%;
                            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                        ">
                            <canvas id="<?php echo esc_attr($unique_id); ?>Canvas" 
                                    width="<?php echo esc_attr($attributes['width']); ?>" 
                                    height="<?php echo esc_attr($attributes['height']); ?>"
                                    style="border-radius: 50%; display: block;">
                            </canvas>
                            
                            <!-- Pointer -->
                            <div style="
                                position: absolute;
                                top: -6px;
                                left: 50%;
                                transform: translateX(-50%);
                                font-size: 1.5rem;
                                color: #ff4757;
                                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                                z-index: 10;
                            ">▼</div>
                            
                            <!-- Spin Button -->
                            <button id="<?php echo esc_attr($unique_id); ?>SpinBtn" style="
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
                            " onmouseover="this.style.transform='translate(-50%, -50%) scale(1.05)'"
                               onmouseout="this.style.transform='translate(-50%, -50%) scale(1)'"
                            >
                                <span class="spin-text">SPIN</span>
                            </button>
                        </div>
                        
                        <!-- Result Display -->
                        <div id="<?php echo esc_attr($unique_id); ?>Result" class="wp-picker-result" style="
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
                            margin-top: 10px;
                        ">
                            <h4 style="
                                color: #666;
                                margin-bottom: 8px;
                                font-weight: 500;
                                font-size: 1rem;
                            ">Result:</h4>
                            <div id="<?php echo esc_attr($unique_id); ?>ResultText" style="
                                font-size: 1.2rem;
                                font-weight: 600;
                                color: #2c3e50;
                                padding: 12px;
                                background: #f8f9fa;
                                border-radius: 8px;
                                border-left: 4px solid #667eea;
                            ">
                                Click SPIN to get a result!
                            </div>
                        </div>
                    </div>

                    <!-- Controls (for posts/pages where editing is useful) -->
                    <div class="wp-picker-controls" style="
                        background: rgba(255, 255, 255, 0.95);
                        border-radius: 15px;
                        padding: 20px;
                        color: #333;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                        max-width: 400px;
                        margin: 0 auto;
                    ">
                        <h4 style="
                            color: #2c3e50;
                            margin-bottom: 15px;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            font-size: 1.1rem;
                        ">📝 Current Options</h4>

                        <div id="<?php echo esc_attr($unique_id); ?>ItemsList" class="wp-options-list" style="
                            max-height: 150px;
                            overflow-y: auto;
                            margin-bottom: 15px;
                        ">
                            <!-- Items will be populated by JavaScript -->
                        </div>

                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button id="<?php echo esc_attr($unique_id); ?>ShuffleBtn" style="
                                flex: 1;
                                min-width: 120px;
                                padding: 8px 12px;
                                background: #5dade2;
                                color: white;
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                                font-weight: 500;
                                font-size: 0.8rem;
                                transition: all 0.3s ease;
                            " onmouseover="this.style.background='#3498db'"
                               onmouseout="this.style.background='#5dade2'"
                            >
                                🔀 Shuffle
                            </button>
                            <button id="<?php echo esc_attr($unique_id); ?>ResetBtn" style="
                                flex: 1;
                                min-width: 120px;
                                padding: 8px 12px;
                                background: #95a5a6;
                                color: white;
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                                font-weight: 500;
                                font-size: 0.8rem;
                                transition: all 0.3s ease;
                            " onmouseover="this.style.background='#7f8c8d'"
                               onmouseout="this.style.background='#95a5a6'"
                            >
                                🔄 Reset
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Confetti Container -->
                <div id="<?php echo esc_attr($unique_id); ?>Confetti" style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 1000;
                "></div>
            </div>
        </div>

        <script>
        (function() {
            // WordPress Picker Wheel Implementation
            class WordPressPicker {
                constructor(containerId, options, colors) {
                    this.containerId = containerId;
                    this.canvas = document.getElementById(containerId + 'Canvas');
                    if (!this.canvas) return;
                    
                    this.ctx = this.canvas.getContext('2d');
                    this.centerX = this.canvas.width / 2;
                    this.centerY = this.canvas.height / 2;
                    this.radius = (Math.min(this.canvas.width, this.canvas.height) / 2) - 15;
                    
                    this.items = [];
                    this.isSpinning = false;
                    this.currentRotation = 0;
                    this.targetRotation = 0;
                    this.animationId = null;
                    
                    this.colors = colors;
                    this.originalOptions = [...options];
                    
                    this.initializeElements();
                    this.attachEventListeners();
                    this.loadOptions(options);
                    this.drawWheel();
                }
                
                initializeElements() {
                    this.itemsList = document.getElementById(this.containerId + 'ItemsList');
                    this.spinBtn = document.getElementById(this.containerId + 'SpinBtn');
                    this.shuffleBtn = document.getElementById(this.containerId + 'ShuffleBtn');
                    this.resetBtn = document.getElementById(this.containerId + 'ResetBtn');
                    this.resultDisplay = document.getElementById(this.containerId + 'Result');
                    this.resultText = document.getElementById(this.containerId + 'ResultText');
                    this.confettiContainer = document.getElementById(this.containerId + 'Confetti');
                }
                
                attachEventListeners() {
                    if (this.spinBtn) {
                        this.spinBtn.addEventListener('click', () => this.spin());
                    }
                    if (this.shuffleBtn) {
                        this.shuffleBtn.addEventListener('click', () => this.shuffleOptions());
                    }
                    if (this.resetBtn) {
                        this.resetBtn.addEventListener('click', () => this.resetOptions());
                    }
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
                
                shuffleOptions() {
                    // Fisher-Yates shuffle
                    const shuffled = [...this.items];
                    for (let i = shuffled.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                    }
                    this.items = shuffled;
                    this.updateItemsList();
                    this.drawWheel();
                }
                
                resetOptions() {
                    this.loadOptions(this.originalOptions);
                }
                
                updateItemsList() {
                    if (!this.itemsList) return;
                    
                    this.itemsList.innerHTML = '';
                    this.items.forEach((item, index) => {
                        const itemElement = document.createElement('div');
                        itemElement.style.cssText = `
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            padding: 8px 10px;
                            background: #f8f9fa;
                            border-radius: 6px;
                            margin-bottom: 5px;
                            transition: all 0.3s ease;
                            font-size: 0.85rem;
                        `;
                        
                        itemElement.innerHTML = `
                            <div style="display: flex; align-items: center;">
                                <div style="
                                    width: 12px;
                                    height: 12px;
                                    border-radius: 50%;
                                    background-color: ${item.color};
                                    margin-right: 8px;
                                    border: 2px solid #fff;
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                                "></div>
                                <span style="font-weight: 500;">${item.text}</span>
                            </div>
                            <span style="color: #666; font-size: 0.7rem;">#${index + 1}</span>
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
                        this.ctx.shadowOffsetX = 1;
                        this.ctx.shadowOffsetY = 1;
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
                    this.ctx.fillText('Ready to spin!', this.centerX, this.centerY);
                }
                
                spin() {
                    if (this.isSpinning || this.items.length === 0) return;
                    
                    this.isSpinning = true;
                    this.spinBtn.disabled = true;
                    this.spinBtn.querySelector('.spin-text').textContent = 'SPINNING...';
                    this.spinBtn.style.background = '#ccc';
                    this.spinBtn.style.cursor = 'not-allowed';
                    
                    const spins = 3 + Math.random() * 3;
                    const finalAngle = Math.random() * 2 * Math.PI;
                    this.targetRotation = this.currentRotation + spins * 2 * Math.PI + finalAngle;
                    
                    const startTime = Date.now();
                    const duration = 2500;
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
                    this.spinBtn.querySelector('.spin-text').textContent = 'SPIN';
                    this.spinBtn.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
                    this.spinBtn.style.cursor = 'pointer';
                    
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
                    this.resultDisplay.style.opacity = '1';
                    this.resultDisplay.style.transform = 'translateY(0)';
                    
                    // Bounce animation
                    setTimeout(() => {
                        this.resultText.style.animation = 'none';
                        this.resultText.offsetHeight; // Trigger reflow
                        this.resultText.style.animation = 'bounce 0.6s ease-in-out';
                    }, 100);
                }
                
                createConfetti() {
                    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
                    
                    for (let i = 0; i < 30; i++) {
                        setTimeout(() => {
                            const confetti = document.createElement('div');
                            confetti.style.cssText = `
                                position: absolute;
                                width: 6px;
                                height: 6px;
                                background: ${colors[Math.floor(Math.random() * colors.length)]};
                                left: ${Math.random() * 100}%;
                                animation: confetti-fall ${Math.random() * 1.5 + 1}s linear forwards;
                            `;
                            
                            this.confettiContainer.appendChild(confetti);
                            
                            setTimeout(() => {
                                if (confetti.parentNode) confetti.parentNode.removeChild(confetti);
                            }, 2500);
                        }, i * 15);
                    }
                }
            }
            
            // Add CSS animations
            const style = document.createElement('style');
            style.textContent = `
                @keyframes confetti-fall {
                    0% { transform: translateY(-50px) rotateZ(0deg); opacity: 1; }
                    100% { transform: translateY(200px) rotateZ(720deg); opacity: 0; }
                }
                @keyframes bounce {
                    0%, 20%, 60%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-10px); }
                    80% { transform: translateY(-5px); }
                }
            `;
            document.head.appendChild(style);
            
            // Initialize wheel when DOM is ready
            document.addEventListener('DOMContentLoaded', function() {
                if (document.getElementById('<?php echo esc_js($unique_id); ?>Canvas')) {
                    window['<?php echo esc_js($unique_id); ?>Wheel'] = new WordPressPicker(
                        '<?php echo esc_js($unique_id); ?>', 
                        <?php echo $options_json; ?>, 
                        <?php echo $colors_json; ?>
                    );
                }
            });
        })();
        </script>
        
        <?php
        return ob_get_clean();
    }
    
    public function add_admin_menu() {
        add_options_page(
            'Picker Wheel Settings',
            'Picker Wheel',
            'manage_options',
            'picker-wheel-settings',
            array($this, 'admin_page')
        );
    }
    
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1>Picker Wheel Plugin</h1>
            
            <div class="card">
                <h2>How to Use</h2>
                <p>Add a picker wheel to any post or page using the shortcode:</p>
                
                <h3>Basic Usage:</h3>
                <code>[picker_wheel]</code>
                
                <h3>Custom Options:</h3>
                <code>[picker_wheel title="What to Eat?" options="Pizza,Burger,Salad,Pasta"]</code>
                
                <h3>All Parameters:</h3>
                <table class="wp-list-table widefat">
                    <thead>
                        <tr>
                            <th>Parameter</th>
                            <th>Description</th>
                            <th>Default</th>
                            <th>Example</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><code>title</code></td>
                            <td>Wheel title</td>
                            <td>Random Decision Maker</td>
                            <td><code>title="What to Eat?"</code></td>
                        </tr>
                        <tr>
                            <td><code>description</code></td>
                            <td>Wheel description</td>
                            <td>Can't decide? Let our...</td>
                            <td><code>description="Choose your meal!"</code></td>
                        </tr>
                        <tr>
                            <td><code>options</code></td>
                            <td>Comma-separated options</td>
                            <td>Yes,No,Maybe,Ask Again...</td>
                            <td><code>options="Pizza,Burger,Salad"</code></td>
                        </tr>
                        <tr>
                            <td><code>size</code></td>
                            <td>Wheel size</td>
                            <td>medium</td>
                            <td><code>size="large"</code> (small, medium, large)</td>
                        </tr>
                        <tr>
                            <td><code>colors</code></td>
                            <td>Custom colors</td>
                            <td>Default palette</td>
                            <td><code>colors="#FF0000,#00FF00,#0000FF"</code></td>
                        </tr>
                    </tbody>
                </table>
                
                <h3>Examples:</h3>
                <p><strong>Food Blog:</strong><br>
                <code>[picker_wheel title="Tonight's Dinner" options="Italian,Chinese,Mexican,Thai" size="large"]</code></p>
                
                <p><strong>Travel Blog:</strong><br>
                <code>[picker_wheel title="Next Destination" options="Paris,Tokyo,New York,London" description="Where should we go next?"]</code></p>
                
                <p><strong>Gaming Blog:</strong><br>
                <code>[picker_wheel title="Game Night" options="Fortnite,Minecraft,Among Us,FIFA" colors="#FF6B6B,#4ECDC4,#45B7D1,#96CEB4"]</code></p>
            </div>
        </div>
        <?php
    }
}

// Initialize the plugin
new PickerWheelPlugin();
?>