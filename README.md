# World Clock Desktop Gadget

A beautiful, native Windows desktop gadget for displaying world clocks with an elegant glass UI theme.

## Features

- **Native Windows Application**: Standalone executable - no web server required
- **Glass UI Design**: Modern glassmorphism effects with warm tones and blur
- **Analog & Digital Clocks**: Toggle between beautiful analog and digital clock displays
- **Multiple Time Zones**: Add and display multiple world clocks simultaneously
- **Desktop Gadget Experience**: 
  - Transparent background
  - Always stays on top
  - No taskbar icon
  - Frameless window
  - Auto-positioning
- **Interactive Interface**: Easy-to-use controls for adding/removing clocks
- **Real-time Updates**: Clocks update every second
- **Modern Typography**: Clean Inter font for excellent readability

## Quick Start

### Option 1: One-Click Launch (Recommended)
```bash
# Double-click to run
run-gadget.bat
```

This will automatically:
1. Launch the standalone executable if available
2. Build the application if needed
3. Handle all dependencies automatically

### Option 2: Create Desktop Shortcut
```bash
# Run once to create a desktop shortcut
Create Desktop Shortcut.bat
```

Then simply double-click "World Clock Gadget" on your desktop.

### Option 3: Direct Executable
After building, you can run directly:
```
dist\win-unpacked\World Clock Gadget.exe
```

## 🛠️ Development

### Requirements
- Node.js (for building the executable)
- Windows 10/11 (for running the native app)

### Building from Source
```bash
# Install dependencies
npm install

# Build standalone executable
npm run build

# Run in development mode
npm start
```

### Build Output
- `dist/win-unpacked/World Clock Gadget.exe` - Standalone executable
- `dist/World Clock Gadget Setup 1.0.0.exe` - Installer package

## 🎨 Customization

### Changing the Glass UI Theme
Edit `styles.css` to customize:
- Glass blur effects and transparency
- Warm color palette
- Typography and spacing
- Animation effects

### Adding New Time Zones
1. Click the "+" button
2. Select from the comprehensive dropdown list
3. Toggle between analog and digital views
4. Remove clocks with the "×" button

### Window Behavior
Modify `main.js` to change:
- Window size and position
- Always-on-top behavior
- Transparency settings
- Frame/frameless mode

## 🔧 Troubleshooting

### Build Issues
- **Build fails**: Ensure Node.js is installed and run `npm install`
- **Missing executable**: Check `dist/win-unpacked/` folder after build
- **Dependencies error**: Delete `node_modules` and run `npm install` again

### Runtime Issues
- **App won't start**: Run as administrator if needed
- **Transparency not working**: Update graphics drivers
- **Window positioning**: Check display scaling settings
- **Performance issues**: Close other applications using GPU

### General Issues
- **Clocks not updating**: Check system time and internet connection
- **Analog clocks not showing**: Ensure JavaScript is enabled
- **Display problems**: Restart the application

## 🚀 Distribution

### Portable Version
The `dist/win-unpacked/` folder contains a portable version:
- Copy the entire folder to any location
- Run `World Clock Gadget.exe` directly
- No installation required

### Installer Version
Use `dist/World Clock Gadget Setup 1.0.0.exe` for:
- System-wide installation
- Start menu integration
- Automatic updates (if configured)

## 🎨 Theme Customization

The hourglass theme uses CSS custom properties that can be easily modified:

```css
:root {
  --primary-gold: #ffd700;
  --glass-bg: rgba(0, 0, 0, 0.8);
  --accent-blue: rgba(20, 20, 40, 0.9);
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
}
```

## 📱 Mobile Support

While designed for desktop, the gadget is responsive and works on:
- **Tablets** in landscape mode
- **Mobile browsers** with adjusted layout
- **Touch devices** with tap interactions

---

**Enjoy your modern world clock desktop gadget!** ⏰✨