#!/bin/bash
# Quick Fix Script for OmO Extension Activation Issue

echo "🔧 OmO Extension - Quick Fix Script"
echo "===================================="
echo ""

cd /home/frappe/antigravity-omo-extension

echo "Step 1: Changing activation event to wildcard (*)"
# Backup original package.json
cp package.json package.json.backup

# Change activation event to wildcard for immediate activation
sed -i 's/"onStartupFinished"/"*"/' package.json
echo "✓ Activation event changed to wildcard"
echo ""

echo "Step 2: Rebuilding extension..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Restoring backup..."
    mv package.json.backup package.json
    exit 1
fi
echo "✓ Build successful"
echo ""

echo "Step 3: Repackaging extension..."
npx -y @vscode/vsce package --allow-missing-repository --no-yarn
if [ $? -ne 0 ]; then
    echo "❌ Packaging failed!"
    exit 1
fi
echo "✓ Package created"
echo ""

echo "Step 4: Uninstalling old extension..."
antigravity --uninstall-extension antigravity-omo.antigravity-omo 2>/dev/null
echo "✓ Old extension uninstalled"
echo ""

echo "Step 5: Installing new extension..."
antigravity --install-extension antigravity-omo-0.1.0.vsix
if [ $? -ne 0 ]; then
    echo "❌ Installation failed!"
    exit 1
fi
echo "✓ Extension installed successfully"
echo ""

echo "=========================================="
echo "✅ QUICK FIX COMPLETE!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Restart Antigravity: antigravity ."
echo "2. Check status bar for: 🆓 OmO | 4 agents | 0 mem"
echo "3. Test command: Ctrl+Shift+P → 'OmO: Show Status'"
echo ""
echo "The extension should now activate immediately on startup!"
echo ""
