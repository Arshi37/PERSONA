<?php
// Add this to your theme's functions.php file

// Picker Wheel Shortcode
function namesyler_picker_wheel_shortcode($atts) {
    $attributes = shortcode_atts(array(
        'title' => 'Random Decision Maker',
        'description' => 'Can\'t decide? Let our picker wheel help you make random choices!',
        'options' => 'Yes,No,Maybe,Ask Again,Definitely,Not Now',
        'size' => 'medium', // small, medium, large
        'colors' => '',
        'id' => 'picker-' . uniqid()
    ), $atts, 'picker_wheel');
    
    // Convert options string to array
    $options_array = array_map('trim', explode(',', $attributes['options']));
    $options_json = wp_json_encode($options_array);
    
    // Handle colors
    $default_colors = array('#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD');
    if (!empty($attributes['colors'])) {
        $custom_colors = array_map('trim', explode(',', $attributes['colors']));
        $colors_json = wp_json_encode($custom_colors);
    } else {
        $colors_json = wp_json_encode($default_colors);
    }
    
    // Handle size
    switch ($attributes['size']) {
        case 'small': $width = $height = '200'; break;
        case 'large': $width = $height = '400'; break;
        default: $width = $height = '300'; break;
    }
    
    $unique_id = sanitize_html_class($attributes['id']);
    
    ob_start();
    ?>
    <div class="namesyler-picker-wheel" id="<?php echo esc_attr($unique_id); ?>" style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        margin: 20px 0;
        border-radius: 15px;
        color: white;
        text-align: center;
        position: relative;
        overflow: hidden;
    ">
        <h3 style="margin-bottom: 5px;">🎯 <?php echo esc_html($attributes['title']); ?></h3>
        <p style="margin-bottom: 20px; opacity: 0.9;"><?php echo esc_html($attributes['description']); ?></p>
        
        <div style="position: relative; display: inline-block; margin-bottom: 15px;">
            <canvas id="<?php echo esc_attr($unique_id); ?>Canvas" width="<?php echo $width; ?>" height="<?php echo $height; ?>" 
                    style="border-radius: 50%; background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.3);"></canvas>
            
            <div style="position: absolute; top: -5px; left: 50%; transform: translateX(-50%); font-size: 1.5rem; color: #ff4757; z-index: 10;">▼</div>
            
            <button id="<?php echo esc_attr($unique_id); ?>SpinBtn" style="
                position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                width: 50px; height: 50px; border-radius: 50%; border: none;
                background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: white;
                font-weight: bold; cursor: pointer; z-index: 10;
            ">SPIN</button>
        </div>
        
        <div id="<?php echo esc_attr($unique_id); ?>Result" style="
            background: white; color: #333; padding: 15px; border-radius: 10px;
            opacity: 0; transition: all 0.5s ease; margin-top: 10px;
        ">
            <strong>Result: </strong><span id="<?php echo esc_attr($unique_id); ?>ResultText">Click SPIN!</span>
        </div>
        
        <div id="<?php echo esc_attr($unique_id); ?>Confetti" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1000;"></div>
    </div>

    <script>
    (function() {
        function createSimplePicker(id, options, colors) {
            const canvas = document.getElementById(id + 'Canvas');
            const ctx = canvas.getContext('2d');
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = (canvas.width / 2) - 10;
            
            let currentRotation = 0;
            let isSpinning = false;
            const items = options.map((text, index) => ({
                text: text,
                color: colors[index % colors.length]
            }));
            
            function drawWheel() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const angleStep = (2 * Math.PI) / items.length;
                
                items.forEach((item, index) => {
                    const startAngle = index * angleStep + currentRotation;
                    const endAngle = (index + 1) * angleStep + currentRotation;
                    
                    ctx.beginPath();
                    ctx.moveTo(centerX, centerY);
                    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                    ctx.closePath();
                    ctx.fillStyle = item.color;
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    
                    // Text
                    const textAngle = startAngle + angleStep / 2;
                    const textX = centerX + Math.cos(textAngle) * (radius * 0.7);
                    const textY = centerY + Math.sin(textAngle) * (radius * 0.7);
                    
                    ctx.save();
                    ctx.translate(textX, textY);
                    ctx.rotate(textAngle + Math.PI / 2);
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(item.text, 0, 0);
                    ctx.restore();
                });
                
                // Center circle
                ctx.beginPath();
                ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
                ctx.fillStyle = '#2c3e50';
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            
            function spin() {
                if (isSpinning) return;
                isSpinning = true;
                
                const spinBtn = document.getElementById(id + 'SpinBtn');
                spinBtn.textContent = 'SPINNING...';
                spinBtn.disabled = true;
                
                const spins = 3 + Math.random() * 3;
                const finalAngle = Math.random() * 2 * Math.PI;
                const targetRotation = currentRotation + spins * 2 * Math.PI + finalAngle;
                
                const startTime = Date.now();
                const duration = 2000;
                const startRotation = currentRotation;
                
                function animate() {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    
                    currentRotation = startRotation + (targetRotation - startRotation) * easeOut;
                    drawWheel();
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        finishSpin();
                    }
                }
                animate();
            }
            
            function finishSpin() {
                isSpinning = false;
                document.getElementById(id + 'SpinBtn').textContent = 'SPIN';
                document.getElementById(id + 'SpinBtn').disabled = false;
                
                const normalizedRotation = currentRotation % (2 * Math.PI);
                const angleStep = (2 * Math.PI) / items.length;
                const pointerAngle = (3 * Math.PI / 2) - normalizedRotation;
                let winnerIndex = Math.floor(((pointerAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI) / angleStep);
                winnerIndex = (items.length - winnerIndex - 1) % items.length;
                
                const winner = items[winnerIndex];
                const resultDiv = document.getElementById(id + 'Result');
                const resultText = document.getElementById(id + 'ResultText');
                
                resultText.textContent = winner.text;
                resultDiv.style.opacity = '1';
                
                // Simple confetti
                createConfetti(id);
            }
            
            function createConfetti(id) {
                const container = document.getElementById(id + 'Confetti');
                const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
                
                for (let i = 0; i < 20; i++) {
                    setTimeout(() => {
                        const confetti = document.createElement('div');
                        confetti.style.cssText = `
                            position: absolute; width: 5px; height: 5px;
                            background: ${colors[Math.floor(Math.random() * colors.length)]};
                            left: ${Math.random() * 100}%; top: 0;
                            animation: fall ${Math.random() * 2 + 1}s linear forwards;
                        `;
                        container.appendChild(confetti);
                        setTimeout(() => confetti.remove(), 3000);
                    }, i * 10);
                }
            }
            
            // Add CSS for confetti animation
            if (!document.getElementById('confetti-styles')) {
                const style = document.createElement('style');
                style.id = 'confetti-styles';
                style.textContent = '@keyframes fall { to { transform: translateY(200px) rotate(720deg); opacity: 0; } }';
                document.head.appendChild(style);
            }
            
            // Initialize
            drawWheel();
            document.getElementById(id + 'SpinBtn').addEventListener('click', spin);
        }
        
        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', function() {
            if (document.getElementById('<?php echo esc_js($unique_id); ?>Canvas')) {
                createSimplePicker('<?php echo esc_js($unique_id); ?>', <?php echo $options_json; ?>, <?php echo $colors_json; ?>);
            }
        });
    })();
    </script>
    <?php
    return ob_get_clean();
}

// Register the shortcode
add_shortcode('picker_wheel', 'namesyler_picker_wheel_shortcode');

// Enqueue Font Awesome if needed (optional)
function namesyler_picker_wheel_scripts() {
    global $post;
    if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'picker_wheel')) {
        wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');
    }
}
add_action('wp_enqueue_scripts', 'namesyler_picker_wheel_scripts');
?>