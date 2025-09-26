<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app">
    <header class="app-header">
      <div class="header-brand">
        <h1>JSON Editor & Validator</h1>
        <p class="header-subtitle">Vue 3 component for editing and validating JSON</p>
      </div>
      <nav class="header-nav">
        <RouterLink to="/" class="nav-link nav-link--primary">Demo</RouterLink>
        <a href="https://www.npmjs.com/package/vue-json-miller-editor" target="_blank" class="nav-link nav-link--external">
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H8.595l-.01-10.373H5.113z"/>
          </svg>
          npm
        </a>
        <a href="https://github.com/reddyCe/vue-json-miller-editor" target="_blank" class="nav-link nav-link--external">
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </nav>
    </header>

    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-background);
}

.app-header {
  background: var(--color-surface-elevated);
  border-bottom: 1px solid var(--color-border);
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
  min-height: 80px;
}

.header-brand {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.header-subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-weight: 400;
}

.app-header h1 {
  margin: 0;
  color: var(--color-heading);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-nav {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.nav-link {
  padding: 0.75rem 1.25rem;
  text-decoration: none;
  border-radius: var(--border-radius-lg);
  transition: all 0.15s ease-in-out;
  font-weight: 500;
  font-size: 0.875rem;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link--primary {
  color: var(--color-text-muted);
}

.nav-link--external {
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.nav-link .icon {
  width: 16px;
  height: 16px;
  opacity: 0.8;
}

.nav-link:hover {
  color: var(--color-text);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.nav-link--primary:hover {
  background: var(--color-background-mute);
}

.nav-link--external:hover {
  background: var(--color-surface);
  border-color: var(--color-border-hover);
}

.nav-link:hover .icon {
  opacity: 1;
}

.nav-link.router-link-exact-active {
  background: var(--color-primary);
  color: white;
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.app-main {
  flex: 1;
  padding: 3rem 2rem;
  max-width: var(--content-max-width);
  margin: 0 auto;
  width: 100%;
}
</style>
