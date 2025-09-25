# Publishing Guide - GitHub Packages

This guide explains how to publish the Vue JSON Editor as a private package to GitHub Packages.

## Prerequisites

1. **GitHub Organization**: You need a GitHub organization account
2. **Repository**: Create a private repository in your organization
3. **Permissions**: You need `write:packages` permission in the organization

## Setup Steps

### 1. Replace Placeholders

Before publishing, replace these placeholders in the codebase:

- `@reddyce` → Your actual GitHub username/organization name (e.g., `@acme-corp`)
- `reddyce` → Your username/organization name in URLs
- `Your Name` → Your actual name in package.json

**Files to update:**
- `package.json` - name, repository URLs, author
- `.npmrc` - organization scope
- `README.md` - installation instructions
- `.github/workflows/*.yml` - organization scope

### 2. Create GitHub Repository

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: Vue JSON Editor"

# Add remote repository
git remote add origin https://github.com/reddyce/vue-json-editor.git
git branch -M main
git push -u origin main
```

### 3. Configure GitHub Packages Access

#### For Publishing (Repository Settings):
1. Go to repository Settings → Actions → General
2. Set "Workflow permissions" to "Read and write permissions"
3. Enable "Allow GitHub Actions to create and approve pull requests"

#### For Team Access:
1. Go to Organization Settings → Packages
2. Configure package visibility and access permissions
3. Add teams/users who should have access

### 4. Set up Local Authentication

Create a GitHub Personal Access Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with these scopes:
   - `write:packages` (for publishing)
   - `read:packages` (for installing)
   - `repo` (for accessing private repositories)

3. Add token to your environment:
```bash
export NPM_PUBLISH_TOKEN=your_token_here
```

Or add to your local `.npmrc`:
```bash
//npm.pkg.github.com/:_authToken=your_token_here
```

## Publishing Methods

### Method 1: Automated Publishing (Recommended)

1. **Create a Release** (triggers automatic publishing):
```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0

# Or create release via GitHub UI
```

2. **Manual Workflow Dispatch**:
   - Go to Actions tab in GitHub
   - Select "Publish to GitHub Packages" workflow
   - Click "Run workflow"
   - Choose version bump type (patch/minor/major)

### Method 2: Manual Publishing

1. **Build the package**:
```bash
npm run build
```

2. **Publish to GitHub Packages**:
```bash
npm publish
```

## Installation for Consumers

### 1. Configure Consumer Projects

Each project that needs to install the package must configure GitHub Packages:

**Create `.npmrc` in project root:**
```bash
@reddyce:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_PUBLISH_TOKEN}
```

**Or configure via npm:**
```bash
npm config set @reddyce:registry https://npm.pkg.github.com
npm config set //npm.pkg.github.com/:_authToken YOUR_TOKEN
```

### 2. Install the Package

```bash
npm install @reddyce/vue-json-edtr
```

### 3. Use in Vue Project

```vue
<template>
  <JsonEditor v-model="data" />
</template>

<script setup>
import { JsonEditor } from '@reddyce/vue-json-edtr'
import '@reddyce/vue-json-edtr/dist/vue-json-edtr.css'

const data = ref({ example: 'data' })
</script>
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Configure GitHub Packages
  run: |
    echo "@reddyce:registry=https://npm.pkg.github.com" >> .npmrc
    echo "//npm.pkg.github.com/:_authToken=\${NPM_PUBLISH_TOKEN}" >> .npmrc
  env:
    NPM_PUBLISH_TOKEN: ${{ secrets.NPM_PUBLISH_TOKEN }}

- name: Install dependencies
  run: npm ci
```

### Docker Example

```dockerfile
# Set GitHub token as build arg
ARG NPM_PUBLISH_TOKEN

# Configure npm for GitHub Packages
RUN echo "@reddyce:registry=https://npm.pkg.github.com" >> .npmrc
RUN echo "//npm.pkg.github.com/:_authToken=${NPM_PUBLISH_TOKEN}" >> .npmrc

# Install dependencies
RUN npm ci

# Clean up credentials
RUN rm .npmrc
```

## Version Management

### Semantic Versioning

- **Patch** (1.0.1): Bug fixes, minor improvements
- **Minor** (1.1.0): New features, backward compatible
- **Major** (2.0.0): Breaking changes

### Release Process

1. **Update version**:
```bash
npm version patch  # or minor/major
```

2. **Update CHANGELOG.md** with new features/fixes

3. **Create release**:
```bash
git push origin main --tags
```

4. **Create GitHub Release** with release notes

## Troubleshooting

### Common Issues

1. **403 Forbidden**: Check token permissions and package access
2. **Package not found**: Verify organization name and registry configuration
3. **Authentication failed**: Regenerate GitHub token with correct scopes

### Debug Commands

```bash
# Check npm configuration
npm config list

# Test authentication
npm whoami --registry=https://npm.pkg.github.com

# View package info
npm view @reddyce/vue-json-edtr --registry=https://npm.pkg.github.com
```

## Security Best Practices

1. **Never commit tokens** to repository
2. **Use environment variables** for tokens in CI/CD
3. **Regularly rotate** GitHub tokens
4. **Limit token scopes** to minimum required
5. **Use organization secrets** for shared workflows

## Support

For issues with:
- **Package functionality**: Create issue in this repository
- **GitHub Packages**: Check [GitHub Packages documentation](https://docs.github.com/en/packages)
- **npm configuration**: Check [npm documentation](https://docs.npmjs.com/)