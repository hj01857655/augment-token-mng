#!/bin/bash
# Release Script for Augment Token Manager

if [ $# -eq 0 ]; then
    echo "❌ Usage: $0 <version>"
    echo "   Example: $0 1.0.0"
    exit 1
fi

VERSION=$1

# Validate version format
if [[ ! $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "❌ Invalid version format. Use semantic versioning (e.g., 1.0.0)"
    exit 1
fi

echo "🚀 Preparing release v$VERSION..."

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ jq is required but not installed. Please install jq first."
    exit 1
fi

# Update package.json
echo "📝 Updating package.json..."
jq ".version = \"$VERSION\"" package.json > package.json.tmp && mv package.json.tmp package.json

# Update Cargo.toml
echo "📝 Updating Cargo.toml..."
sed -i.bak "s/version = \"[0-9]\+\.[0-9]\+\.[0-9]\+\"/version = \"$VERSION\"/" src-tauri/Cargo.toml
rm src-tauri/Cargo.toml.bak

# Update tauri.conf.json
echo "📝 Updating tauri.conf.json..."
jq ".version = \"$VERSION\"" src-tauri/tauri.conf.json > src-tauri/tauri.conf.json.tmp && mv src-tauri/tauri.conf.json.tmp src-tauri/tauri.conf.json

# Commit changes
echo "📝 Committing version changes..."
git add package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json
git commit -m "chore: bump version to v$VERSION"

# Create and push tag
echo "🏷️ Creating tag v$VERSION..."
git tag "v$VERSION"
git push origin main
git push origin "v$VERSION"

echo "✅ Release v$VERSION initiated!"
echo "🔗 Check GitHub Actions for build progress: https://github.com/YOUR_USERNAME/YOUR_REPO/actions"
