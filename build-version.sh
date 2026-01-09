#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📦 OmO Extension - Auto Version Builder${NC}"
echo ""

# Parse bump type (patch, minor, major)
BUMP_TYPE="${1:-patch}"

if [[ ! "$BUMP_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo -e "${YELLOW}Usage: ./build-version.sh [patch|minor|major]${NC}"
    echo "  patch: 0.3.0 → 0.3.1 (default)"
    echo "  minor: 0.3.0 → 0.4.0"
    echo "  major: 0.3.0 → 1.0.0"
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "Current version: ${YELLOW}${CURRENT_VERSION}${NC}"

# Bump version using npm
echo -e "\n${BLUE}Bumping version (${BUMP_TYPE})...${NC}"
npm version "$BUMP_TYPE" --no-git-tag-version

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}✓ New version: ${NEW_VERSION}${NC}"

# Build
echo -e "\n${BLUE}Building extension...${NC}"
npm run build

# Package
echo -e "\n${BLUE}Packaging VSIX...${NC}"
echo "y" | npm run package 2>&1 || npx vsce package --no-interactive

# List all VSIX files
echo -e "\n${GREEN}✅ Build complete!${NC}"
echo -e "\n${BLUE}Available versions:${NC}"
ls -lh *.vsix | awk '{print "  " $9 " (" $5 ")"}'

echo -e "\n${GREEN}Latest: antigravity-omo-${NEW_VERSION}.vsix${NC}"
echo ""
echo "Next steps:"
echo "  ./install.sh                     # Install latest version"
echo "  ./build-version.sh minor         # Bump to next minor version"
echo "  git add package.json && git commit -m 'chore: bump version to ${NEW_VERSION}'"
