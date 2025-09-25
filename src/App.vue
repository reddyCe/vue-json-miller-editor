<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>JSON Editor & Validator</h1>
      <nav>
        <RouterLink to="/">Demo</RouterLink>
        <RouterLink to="/about">About</RouterLink>
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
}

.app-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

nav {
  display: flex;
  gap: 1rem;
}

nav a {
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: #6c757d;
  border-radius: 4px;
  transition: all 0.2s ease;
}

nav a:hover {
  background: #e9ecef;
  color: #495057;
}

nav a.router-link-exact-active {
  background: #007bff;
  color: white;
}

.app-main {
  flex: 1;
  padding: 2rem;
}
</style>
