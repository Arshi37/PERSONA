# 📝 **Picker Wheel Integration Guide for Blog Posts**

This guide covers how to add the picker wheel to individual blog posts across different platforms and content management systems.

## 🎯 **Quick Overview**

| Platform | Method | Difficulty | Time to Implement |
|----------|--------|------------|-------------------|
| **WordPress** | Shortcode | ⭐ Easy | 5 minutes |
| **React/Next.js** | Component | ⭐⭐ Medium | 10 minutes |
| **HTML/Markdown** | Direct Embed | ⭐ Easy | 2 minutes |
| **Ghost/Medium** | HTML Block | ⭐⭐ Medium | 5 minutes |
| **Notion** | Embed Block | ⭐⭐⭐ Hard | 15 minutes |

---

## 🟦 **Method 1: WordPress Shortcode**

### **Setup (One-time)**

1. **Add to functions.php** or create a plugin:
   - Copy the content from `picker-wheel-shortcode.php`
   - Add to your theme's `functions.php` file
   - Or create a custom plugin

2. **Ensure Font Awesome is loaded** in your theme

### **Usage in Posts**

**Basic Usage:**
```
[picker_wheel]
```

**With Custom Options:**
```
[picker_wheel title="What Should I Eat?" options="Pizza,Burger,Salad,Pasta,Sushi"]
```

**With All Customizations:**
```
[picker_wheel 
    title="Weekend Activity Picker" 
    description="Choose your perfect weekend activity!"
    options="Movie Night,Hiking,Shopping,Gaming,Reading,Cooking"
    width="250"
    height="250"
]
```

### **Examples for Different Post Types:**

**🍕 Food Blog Post:**
```
Struggling to decide what to cook tonight? Let our picker wheel help!

[picker_wheel title="Tonight's Dinner" options="Pasta,Stir-fry,Soup,Sandwich,Salad,Pizza"]
```

**📚 Educational Content:**
```
Let's practice decision making with this interactive tool:

[picker_wheel title="Study Method" options="Flashcards,Reading,Practice Tests,Group Study,Video Learning"]
```

**🎮 Gaming Blog:**
```
Can't decide which game to play? Spin the wheel!

[picker_wheel title="Game Night Picker" options="Fortnite,Minecraft,Among Us,Call of Duty,FIFA,Rocket League"]
```

---

## ⚛️ **Method 2: React Component**

### **Installation**

1. **Copy the component** from `post-integration-guide.md` into your project
2. **Save as** `PickerWheelComponent.jsx`
3. **Import and use** in your blog posts

### **Usage Examples**

**Basic Implementation:**
```jsx
import PickerWheelComponent from './components/PickerWheelComponent';

function BlogPost() {
    return (
        <div>
            <h1>My Blog Post</h1>
            <p>Here's some content...</p>
            
            <PickerWheelComponent 
                initialOptions={['Yes', 'No', 'Maybe']}
                title="Quick Decision Maker"
            />
            
            <p>More content...</p>
        </div>
    );
}
```

**Advanced with Callback:**
```jsx
function BlogPost() {
    const handleResult = (result) => {
        console.log('User selected:', result);
        // Track analytics, save to database, etc.
    };

    return (
        <div>
            <h2>Interactive Decision Making</h2>
            
            <PickerWheelComponent 
                initialOptions={['Option A', 'Option B', 'Option C', 'Option D']}
                title="Choose Your Adventure"
                description="Each choice leads to a different outcome!"
                width={350}
                height={350}
                onResult={handleResult}
            />
        </div>
    );
}
```

**Multiple Wheels in One Post:**
```jsx
function BlogPost() {
    return (
        <div>
            <h1>Decision Overload? We've Got You Covered!</h1>
            
            <h3>What to Eat?</h3>
            <PickerWheelComponent 
                initialOptions={['Pizza', 'Burger', 'Salad', 'Pasta']}
                title="Meal Picker"
                width={250}
                height={250}
            />
            
            <h3>What to Watch?</h3>
            <PickerWheelComponent 
                initialOptions={['Comedy', 'Action', 'Drama', 'Horror']}
                title="Movie Genre Picker"
                width={250}
                height={250}
            />
        </div>
    );
}
```

---

## 📄 **Method 3: Direct HTML Embed**

### **For Static Sites, Ghost, or Custom HTML**

Create a simplified embed for any HTML-based blog:

```html
<!-- Paste this directly into your blog post HTML -->
<div class="simple-picker-wheel" style="
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
    border-radius: 15px;
    color: white;
    text-align: center;
    margin: 20px 0;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
">
    <h3>🎯 Decision Maker</h3>
    <p>Add your options and spin!</p>
    
    <div style="
        background: white;
        border-radius: 10px;
        padding: 15px;
        margin: 15px 0;
        color: #333;
    ">
        <canvas id="simplePicker" width="200" height="200" style="border-radius: 50%;"></canvas>
        <button onclick="spinWheel()" style="
            background: #ff6b6b;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 10px;
        ">SPIN</button>
        <div id="result" style="margin-top: 10px; font-weight: bold;"></div>
    </div>
    
    <script>
    // Simple picker wheel implementation
    let options = ['Yes', 'No', 'Maybe', 'Ask Again'];
    let currentRotation = 0;
    
    function drawWheel() {
        const canvas = document.getElementById('simplePicker');
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 90;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
        const angleStep = (2 * Math.PI) / options.length;
        
        options.forEach((option, index) => {
            const startAngle = index * angleStep + currentRotation;
            const endAngle = (index + 1) * angleStep + currentRotation;
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
            ctx.stroke();
            
            // Add text
            const textAngle = startAngle + angleStep / 2;
            const textX = centerX + Math.cos(textAngle) * (radius * 0.7);
            const textY = centerY + Math.sin(textAngle) * (radius * 0.7);
            
            ctx.save();
            ctx.translate(textX, textY);
            ctx.rotate(textAngle + Math.PI / 2);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(option, 0, 0);
            ctx.restore();
        });
    }
    
    function spinWheel() {
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
                // Show result
                const normalizedRotation = currentRotation % (2 * Math.PI);
                const angleStep = (2 * Math.PI) / options.length;
                const pointerAngle = (3 * Math.PI / 2) - normalizedRotation;
                let winnerIndex = Math.floor(((pointerAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI) / angleStep);
                winnerIndex = (options.length - winnerIndex - 1) % options.length;
                
                document.getElementById('result').textContent = 'Result: ' + options[winnerIndex];
            }
        }
        
        animate();
    }
    
    // Initialize
    drawWheel();
    </script>
</div>
```

---

## 🎨 **Method 4: Customizable Inline Embed**

### **For Maximum Flexibility**

```html
<!-- Customizable Picker Wheel for Blog Posts -->
<div class="blog-picker-wheel" data-options="Coffee,Tea,Water,Juice" data-title="What to Drink?">
    <!-- Wheel will be inserted here -->
</div>

<script src="https://your-domain.com/js/blog-picker-wheel.js"></script>
<style>
.blog-picker-wheel {
    margin: 30px 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 15px;
    text-align: center;
    color: white;
}
</style>
```

---

## 📱 **Platform-Specific Instructions**

### **Ghost Blog:**
1. Use the HTML card in your post editor
2. Paste the Direct HTML Embed code
3. Publish your post

### **Medium:**
1. Not directly supported (no custom HTML)
2. Alternative: Create screenshots/GIFs of the wheel
3. Link to external hosted version

### **Notion:**
1. Use embed block with hosted version
2. Create full-page picker wheel on your domain
3. Embed the URL in Notion

### **Wix/Squarespace:**
1. Use HTML/Code block
2. Paste the Direct HTML Embed
3. May need to adjust styling

### **Webflow:**
1. Add HTML embed element
2. Paste picker wheel code
3. Style with Webflow's designer

---

## 🎯 **Content Ideas Using Picker Wheels**

### **Lifestyle Blogs:**
```
[picker_wheel title="Weekend Activity" options="Netflix,Hiking,Cooking,Reading,Shopping,Gaming"]
```

### **Food Blogs:**
```
[picker_wheel title="Tonight's Dinner" options="Italian,Chinese,Mexican,Indian,American,Thai"]
```

### **Travel Blogs:**
```
[picker_wheel title="Next Destination" options="Paris,Tokyo,New York,London,Bali,Sydney"]
```

### **Educational Content:**
```
[picker_wheel title="Study Method" options="Flashcards,Reading,Videos,Practice Tests,Group Study"]
```

### **Business/Productivity:**
```
[picker_wheel title="Break Activity" options="Walk,Coffee,Stretch,Meditate,Quick Nap"]
```

### **Entertainment:**
```
[picker_wheel title="Movie Genre" options="Comedy,Action,Drama,Horror,Sci-Fi,Romance"]
```

---

## 🔧 **Advanced Customization**

### **Custom Colors:**
Modify the colors array in the JavaScript:
```javascript
const colors = ['#your-color-1', '#your-color-2', '#your-color-3'];
```

### **Custom Sizes:**
Adjust width and height:
```
[picker_wheel width="400" height="400"]
```

### **Custom Animation:**
Modify the spin duration in the code:
```javascript
const duration = 3000; // 3 seconds
```

---

## 🚀 **Performance Tips**

1. **Load Conditionally:** Only load the picker wheel JavaScript on posts that use it
2. **Optimize Images:** Use CSS instead of images where possible
3. **Minimize Code:** Remove unused features for blog posts
4. **Cache Assets:** Ensure scripts and styles are cached properly

---

## 📊 **Analytics Integration**

Track picker wheel usage:

```javascript
// Google Analytics 4
gtag('event', 'picker_wheel_spin', {
    'custom_parameter': 'blog_post',
    'post_title': document.title
});

// Facebook Pixel
fbq('track', 'ViewContent', {
    content_name: 'Picker Wheel Interaction'
});
```

---

## ✅ **Best Practices**

1. **Context Matters:** Only use picker wheels when they add value to your content
2. **Mobile First:** Test on mobile devices first
3. **Accessibility:** Ensure keyboard navigation works
4. **Loading States:** Show loading indicators for better UX
5. **Fallbacks:** Provide alternatives if JavaScript is disabled

---

## 🆘 **Troubleshooting**

### **Common Issues:**

**Wheel not displaying:**
- Check if JavaScript is enabled
- Verify Font Awesome is loaded
- Check browser console for errors

**Styling conflicts:**
- Use CSS specificity
- Add `!important` declarations if needed
- Use unique class names

**Mobile responsiveness:**
- Test on actual devices
- Check viewport meta tag
- Adjust canvas size for mobile

**Performance issues:**
- Limit animation complexity
- Use `requestAnimationFrame` for smooth animations
- Avoid memory leaks in event listeners

That's it! Choose the method that works best for your platform and start making your blog posts more interactive! 🎯