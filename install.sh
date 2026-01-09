#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 OmO Extension Auto-Installer${NC}"
echo ""

# Check for VSIX file
VSIX_FILE="/home/frappe/antigravity-omo-extension/antigravity-omo-0.3.0.vsix"

if [ ! -f "$VSIX_FILE" ]; then
    echo -e "${RED}❌ VSIX file not found: $VSIX_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found VSIX: $VSIX_FILE${NC}"
echo ""

# Try different VSCode/Antigravity CLI commands
VSCODE_CMD=""

if command -v code &> /dev/null; then
    VSCODE_CMD="code"
elif command -v code-server &> /dev/null; then
    VSCODE_CMD="code-server"
elif command -v antigravity &> /dev/null; then
    VSCODE_CMD="antigravity"
elif [ -f "$HOME/.vscode-server/bin/*/bin/code-server" ]; then
    VSCODE_CMD=$(ls -t "$HOME/.vscode-server/bin/"*/bin/code-server 2>/dev/null | head -1)
fi

if [ -z "$VSCODE_CMD" ]; then
    echo -e "${RED}❌ VSCode/Antigravity CLI not found${NC}"
    echo ""
    echo "Manual installation required:"
    echo "1. Press Ctrl+Shift+X (Extensions)"
    echo "2. Click ⋯ menu → 'Install from VSIX...'"
    echo "3. Select: $VSIX_FILE"
    echo "4. Reload window"
    exit 1
fi

echo -e "${GREEN}✓ Using CLI: $VSCODE_CMD${NC}"
echo ""

# Uninstall old version if exists
echo "📦 Checking for old version..."
if $VSCODE_CMD --list-extensions | grep -q "antigravity-omo.antigravity-omo"; then
    echo "🗑️  Uninstalling old version..."
    $VSCODE_CMD --uninstall-extension antigravity-omo.antigravity-omo --force
    echo -e "${GREEN}✓ Old version uninstalled${NC}"
else
    echo "No previous version found"
fi

echo ""

# Install new version
echo "📥 Installing new version..."
$VSCODE_CMD --install-extension "$VSIX_FILE" --force

echo ""
echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Reload Antigravity window (Ctrl+Shift+P → 'Reload Window')"
echo "2. Check status bar in bottom right corner"
echo "3. Run: Ctrl+Shift+P → 'OmO: Show Status'"
