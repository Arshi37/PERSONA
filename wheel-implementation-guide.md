# 🎡 Wheel of Choice - Implementation Guide

## Overview
This Wheel of Choice tool is a complete, interactive spinning wheel that you can easily integrate into your website. It's similar to pickerwheel.com and includes all the essential features.

## ✨ Features Included
- **Interactive Spinning Wheel** - Smooth animations with realistic physics
- **Customizable Options** - Add, remove, and edit wheel segments
- **Color Customization** - Each segment can have its own color
- **Sound Effects** - Optional spinning sound using Web Audio API
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Keyboard Support** - Press spacebar to spin
- **Settings Panel** - Adjust spin duration and other preferences
- **Visual Feedback** - Winning segment flashes and result animation

## 🚀 Quick Start (3 Easy Steps)

### Step 1: Basic Integration
The simplest way to add the wheel to your website:

1. **Download the file**: Save `wheel-of-choice.html` to your website directory
2. **Link it**: Add a link to the wheel page from your main website
3. **Test it**: Open the file in a browser to make sure it works

### Step 2: Embed in Existing Page
To integrate the wheel into an existing webpage:

1. **Copy the CSS**: Extract the `<style>` content and add it to your existing CSS file
2. **Copy the HTML**: Extract the wheel HTML structure and place it where you want the wheel
3. **Copy the JavaScript**: Extract the `<script>` content and add it to your JS file

### Step 3: Customize for Your Needs
Modify the default options in the JavaScript:

```javascript
this.options = [
    { text: 'Your Option 1', color: '#FF6B6B' },
    { text: 'Your Option 2', color: '#4ECDC4' },
    // Add your own options here
];
```

## 📁 File Structure
```
your-website/
├── wheel-of-choice.html          # Complete standalone wheel
├── wheel-implementation-guide.md # This guide
├── css/
│   └── wheel-styles.css          # Extracted CSS (optional)
├── js/
│   └── wheel-script.js           # Extracted JS (optional)
└── index.html                    # Your main website
```

## 🔧 Integration Methods

### Method 1: Standalone Page (Easiest)
Perfect if you want the wheel on its own page:

1. Upload `wheel-of-choice.html` to your website
2. Link to it: `<a href="wheel-of-choice.html">Spin the Wheel!</a>`
3. Done! ✅

### Method 2: Iframe Embed
Embed the wheel in any existing page:

```html
<iframe src="wheel-of-choice.html" width="100%" height="800px" frameborder="0"></iframe>
```

### Method 3: Direct Integration
For maximum customization, integrate directly into your existing page:

#### Step 3a: Add CSS to your stylesheet
```css
/* Copy the entire <style> section from wheel-of-choice.html */
/* and paste it into your main CSS file */
```

#### Step 3b: Add HTML structure
```html
<!-- Copy the wheel HTML structure from wheel-of-choice.html -->
<div class="container">
    <h1 class="title">🎡 Wheel of Choice</h1>
    <!-- ... rest of the wheel HTML ... -->
</div>
```

#### Step 3c: Add JavaScript functionality
```javascript
// Copy the entire <script> section from wheel-of-choice.html
// and paste it into your main JS file or in a <script> tag
```

## 🎨 Customization Options

### Change Default Options
Edit the `options` array in the JavaScript:

```javascript
this.options = [
    { text: 'Pizza', color: '#FF6B6B' },
    { text: 'Burger', color: '#4ECDC4' },
    { text: 'Sushi', color: '#45B7D1' },
    { text: 'Tacos', color: '#96CEB4' }
];
```

### Modify Colors and Styling
Key CSS classes to customize:

- `.wheel-container` - Wheel size and positioning
- `.wheel-segment` - Individual segment styling
- `.spin-button` - Spin button appearance
- `.result` - Result display styling

### Example: Change Wheel Size
```css
.wheel-container {
    width: 500px;    /* Increase from 400px */
    height: 500px;   /* Increase from 400px */
}
```

### Example: Change Color Scheme
```css
body {
    background: linear-gradient(135deg, #your-color1, #your-color2);
}

.spin-button {
    background: linear-gradient(135deg, #your-button-color1, #your-button-color2);
}
```

## 📱 Responsive Design
The wheel automatically adapts to different screen sizes:

- **Desktop**: Full 400px wheel with side-by-side options
- **Mobile**: Smaller 300px wheel with stacked options
- **Tablet**: Optimized layout for medium screens

## 🔊 Sound Configuration
Control the spinning sound:

```javascript
// In the spin() method, modify this condition:
if (document.getElementById('spinSound').value === 'true') {
    this.playSpinSound();
}
```

## ⚙️ Advanced Customization

### Add More Settings
Extend the settings panel:

```html
<div class="setting-item">
    <label for="newSetting">Your New Setting</label>
    <input type="text" id="newSetting">
</div>
```

### Modify Spin Physics
Adjust the spinning behavior in the `spin()` method:

```javascript
// Change rotation range
const minRotation = 720;   // 2 full rotations minimum
const maxRotation = 1800;  // 5 full rotations maximum

// Change easing curve
this.wheel.style.transition = `transform ${this.spinDuration}s ease-out`;
```

### Save User Preferences
Add localStorage to remember user settings:

```javascript
// Save settings
localStorage.setItem('wheelOptions', JSON.stringify(this.options));

// Load settings
const savedOptions = localStorage.getItem('wheelOptions');
if (savedOptions) {
    this.options = JSON.parse(savedOptions);
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Wheel not spinning**: Check that JavaScript is enabled
2. **Segments not showing**: Verify CSS is loading correctly
3. **Mobile display issues**: Ensure viewport meta tag is present
4. **Sound not working**: Modern browsers require user interaction before playing audio

### Browser Compatibility
- **Supported**: Chrome, Firefox, Safari, Edge (modern versions)
- **Partial Support**: Internet Explorer 11 (some features may not work)

### Performance Tips
- Reduce number of segments for better mobile performance
- Use simpler colors/gradients for older devices
- Test on various devices and browsers

## 🎯 Usage Examples

### Restaurant Menu Picker
```javascript
this.options = [
    { text: 'Italian', color: '#FF6B6B' },
    { text: 'Chinese', color: '#4ECDC4' },
    { text: 'Mexican', color: '#45B7D1' },
    { text: 'Indian', color: '#96CEB4' }
];
```

### Team Activity Selector
```javascript
this.options = [
    { text: 'Team Building', color: '#FF6B6B' },
    { text: 'Code Review', color: '#4ECDC4' },
    { text: 'Brainstorming', color: '#45B7D1' },
    { text: 'Coffee Break', color: '#96CEB4' }
];
```

### Random Prize Giveaway
```javascript
this.options = [
    { text: '$10 Gift Card', color: '#FF6B6B' },
    { text: 'Free Coffee', color: '#4ECDC4' },
    { text: 'Company T-Shirt', color: '#45B7D1' },
    { text: 'Try Again', color: '#96CEB4' }
];
```

## 📞 Support
If you need help implementing the wheel:

1. Check this guide first
2. Test the standalone HTML file
3. Verify all files are uploaded correctly
4. Check browser console for errors

## 🚀 Next Steps
Once you have the basic wheel working:

1. Customize the options for your use case
2. Match the colors to your website theme
3. Add your own branding/logo
4. Consider adding analytics tracking
5. Test thoroughly on different devices

That's it! You now have a fully functional Wheel of Choice tool for your website. Happy spinning! 🎉