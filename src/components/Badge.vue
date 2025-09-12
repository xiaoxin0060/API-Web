<template>
  <span 
    class="badge" 
    :class="[
      `badge--${type}`,
      `badge--${size}`,
      { 'badge--dot': dot }
    ]"
  >
    <slot v-if="!dot"></slot>
  </span>
</template>

<script setup>
withDefaults(defineProps(), {
  type: 'default',
  size: 'medium',
  dot: false
})
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  white-space: nowrap;
  border-radius: 9999px;
  transition: all 0.2s ease;
  font-family: inherit;
}

/* === 徽章类型 === */
.badge--default {
  background: var(--color-badge-bg);
  color: var(--color-badge-text);
}

.badge--success {
  background: rgba(134, 239, 172, 0.15);
  color: var(--color-success);
}

.badge--warning {
  background: rgba(251, 191, 36, 0.15);
  color: var(--color-warning);
}

.badge--error {
  background: rgba(248, 113, 113, 0.15);
  color: var(--color-error);
}

.badge--info {
  background: rgba(147, 197, 253, 0.15);
  color: var(--color-info);
}

.badge--primary {
  background: rgba(96, 165, 250, 0.15);
  color: var(--color-accent-blue);
}

/* === 徽章尺寸 === */
.badge--small {
  padding: 0.125rem 0.375rem;
  font-size: 0.75rem;
  min-height: 1.25rem;
}

.badge--medium {
  padding: 0.25rem 0.5rem;
  font-size: 0.8125rem;
  min-height: 1.5rem;
}

.badge--large {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  min-height: 1.75rem;
}

/* === 点状徽章 === */
.badge--dot {
  width: 8px;
  height: 8px;
  min-height: 8px;
  padding: 0;
  border-radius: 50%;
}

.badge--dot.badge--small {
  width: 6px;
  height: 6px;
  min-height: 6px;
}

.badge--dot.badge--large {
  width: 10px;
  height: 10px;
  min-height: 10px;
}

/* === 悬停效果 === */
.badge:not(.badge--dot):hover {
  transform: scale(1.05);
}
</style>
