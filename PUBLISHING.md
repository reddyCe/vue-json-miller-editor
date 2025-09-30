# Publishing Guide - NPM Automated Publishing

This guide explains the automated npm publishing setup for the Vue JSON Editor package.

## Overview

The project now has **automated npm publishing** that triggers on every commit to the `main` branch. It:

1. **Automatically determines version bump type** based on commit messages
2. **Runs full test suite** (tests, type-checking, linting)
3. **Builds the package**
4. **Bumps version** in package.json
5. **Publishes to npm**
6. **Creates GitHub release** with auto-generated notes
7. **Pushes version tag** back to repository

## Automated Publishing Workflow

### Triggers
- **Push to main branch** (auto-publish.yml)
- **Manual workflow dispatch** (publish.yml)

### Version Bump Logic

The automated workflow analyzes commit messages (excluding merge commits) to determine version bump type:

| Commit Message Pattern | Version Bump | Examples |
|------------------------|--------------|----------|
| `BREAKING:`, `feat!:`, `fix!:`, contains `!` | **major** | `BREAKING: remove deprecated API`<br>`feat!: change API interface` |
| `feat:`, contains `feature`, `add ` | **minor** | `feat: add new validation mode`<br>`add new feature to editor` |
| `fix:`, `docs:`, `test:`, `chore:`, `style:`, `perf:`, `refactor:`, contains `fix `, `bug`, `patch` | **patch** | `fix: resolve input validation bug`<br>`fix workflow issues`<br>`docs: update README` |
| Any other message | **patch** | `update dependencies`<br>`bump version` |

**Key Improvements:**
- ✅ **Ignores merge commits** - Only analyzes actual feature/fix commits
- ✅ **Case insensitive** - Works with any capitalization
- ✅ **Flexible patterns** - Supports both conventional commits and natural language
- ✅ **Prevents duplicate bumps** - Skips version bumping if commit already contains version bump

### Workflow Files

1. **`.github/workflows/auto-publish.yml`** - Automatic publishing on main branch commits
2. **`.github/workflows/publish.yml`** - Manual publishing with options
3. **`.github/workflows/ci.yml`** - Continuous integration testing

## Setup Requirements

### 1. NPM Authentication Token

You need to configure the `NPM_PUBLISH_TOKEN` secret in GitHub:

1. Create an NPM automation token:
   ```bash
   npm login
   npm token create --type=automation
   ```

2. Add the token to GitHub repository secrets:
   - Go to Repository Settings → Secrets and variables → Actions
   - Create new secret: `NPM_PUBLISH_TOKEN`
   - Paste the token value

### 2. Repository Permissions

Ensure the GitHub Actions have proper permissions:
- Go to Repository Settings → Actions → General
- Set "Workflow permissions" to "Read and write permissions"
- Enable "Allow GitHub Actions to create and approve pull requests"

## Using the Automated Publishing

### Automatic Publishing (Recommended)

Simply push commits to the `main` branch with descriptive commit messages:

```bash
# This will trigger a patch version bump
git commit -m "fix: resolve validation error display issue"
git push origin main

# This will trigger a minor version bump  
git commit -m "feat: add dark theme support"
git push origin main

# This will trigger a major version bump
git commit -m "BREAKING: change JsonEditor API interface"
git push origin main
```

### Manual Publishing

You can also trigger publishing manually via GitHub Actions:

1. Go to the **Actions** tab in GitHub
2. Select **"Manual Publish to NPM"** workflow
3. Click **"Run workflow"**
4. Choose options:
   - **Version bump type**: patch/minor/major
   - **Skip version bump**: publish current version without bumping

### Skip CI

To commit without triggering auto-publish, add `[skip ci]` to your commit message:

```bash
git commit -m "docs: update README [skip ci]"
```

## Monitoring Publishing

### Check Workflow Status

1. Go to **Actions** tab in GitHub repository
2. Monitor workflow runs in real-time
3. Check logs for any failures

### Verify Publication

After successful workflow:

1. **NPM Package**: https://www.npmjs.com/package/vue-json-miller-editor
2. **GitHub Releases**: Repository → Releases tab
3. **Version Tags**: Repository → Tags tab

## Version History

The automated system maintains:
- **Git tags** for each version (e.g., `v1.2.3`)
- **GitHub releases** with auto-generated changelogs
- **NPM package versions** with proper semver

## Troubleshooting

### Common Issues

1. **NPM Authentication Failed**
   ```
   Error: 401 Unauthorized
   ```
   **Solution**: Regenerate NPM token and update GitHub secret

2. **Git Push Failed**
   ```
   Error: Permission denied
   ```
   **Solution**: Check workflow permissions in repository settings

3. **Tests/Linting Failed**
   ```
   Error: npm test returned non-zero exit code
   ```
   **Solution**: Fix failing tests before pushing to main

4. **Version Bump Failed**
   ```
   Error: Git working directory not clean
   ```
   **Solution**: Ensure no uncommitted changes before workflow runs

5. **Version Not Bumping**
   ```
   Latest commit: Merge remote-tracking branch 'origin/main'
   ```
   **Solution**: The workflow now ignores merge commits and analyzes the most recent actual commit. Ensure your commit messages follow the patterns above.

### Debug Commands

```bash
# Check current version
npm version

# Test build locally
npm run build

# Run full test suite
npm test && npm run type-check && npm run lint:check

# Check npm authentication
npm whoami

# View package info
npm view vue-json-miller-editor
```

## Best Practices

### Commit Messages

Use conventional commit format for accurate version bumping:

```bash
# Good examples
git commit -m "feat: add schema validation support"
git commit -m "fix: resolve memory leak in editor"
git commit -m "docs: update API documentation"
git commit -m "BREAKING: remove deprecated showTabs option"

# Avoid generic messages
git commit -m "updates"
git commit -m "fixes"
```

### Release Strategy

1. **Feature branches**: Develop features in separate branches
2. **Pull requests**: Review changes before merging to main
3. **Main branch**: Keep main stable and always publishable
4. **Hotfixes**: Apply critical fixes directly to main for immediate publishing

### Security

1. **Never commit** NPM tokens to repository
2. **Rotate tokens** regularly (every 6 months)
3. **Monitor** published packages for unauthorized changes
4. **Use organization secrets** for shared repositories

## Manual Publishing (Fallback)

If automated publishing fails, you can publish manually:

```bash
# 1. Ensure you're on main branch with latest changes
git checkout main
git pull origin main

# 2. Run full test suite
npm test
npm run type-check  
npm run lint:check

# 3. Build package
npm run build

# 4. Bump version
npm version patch  # or minor/major

# 5. Publish to npm
npm publish

# 6. Push changes and tags
git push origin main --tags
```

## Support

For issues with:
- **Automated workflows**: Check workflow logs in Actions tab
- **NPM publishing**: Verify token and package configuration  
- **Version management**: Check git tags and package.json
- **Package functionality**: Create issue in this repository