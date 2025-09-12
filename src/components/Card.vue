<template>
  <div class="card" :class="{ 'card--hoverable': hoverable }">
    <div v-if="$slots.header" class="card__header">
      <slot name="header"></slot>
    </div>
    <div class="card__body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
withDefaults(defineProps(), {
  hoverable: false
})
</script>

<style scoped>
.card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--color-shadow-md);
}

.card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--color-shadow-lg);
  border-color: var(--color-border-strong);
}

.card__header {
  background: var(--color-bg-tertiary);
  border-bottom: 1px solid var(--color-border);
  padding: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.card__body {
  padding: 1.5rem;
  color: var(--color-text-primary);
}

.card__footer {
  background: var(--color-bg-tertiary);
  border-top: 1px solid var(--color-border);
  padding: 1rem 1.5rem;
  color: var(--color-text-secondary);
}

/* 让卡片内的内容具有默认间距 */
.card__body > *:not(:last-child) {
  margin-bottom: 1rem;
}

.card__body p {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.card__body h1,
.card__body h2,
.card__body h3,
.card__body h4,
.card__body h5,
.card__body h6 {
  margin-bottom: 0.75rem;
}
</style>
