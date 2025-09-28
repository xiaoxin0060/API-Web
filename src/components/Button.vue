<template>
  <button 
    class="btn performant-animation" 
    :class="[
      `btn--${type}`,
      `btn--${size}`,
      {
        'btn--disabled': disabled,
        'btn--loading': loading,
        'btn-primary': type === 'primary'
      }
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="btn__loading">
      <svg viewBox="0 0 20 20" width="16" height="16" class="loading-spinner">
        <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
        <path d="M10,3 A7,7 0 0,1 17,10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
    </span>
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
interface Props {
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  disabled: false,
  loading: false
})

defineEmits(['click'])
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: inherit;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  outline: none;
  position: relative;
}

.btn:focus {
  outline: 2px solid var(--color-accent-blue);
  outline-offset: 2px;
}

/* === 按钮类型 === */
.btn--primary {
  background: var(--color-button-primary);
  color: var(--color-button-primary-text);
  box-shadow: var(--color-shadow-sm);
}

.btn--primary:hover:not(.btn--disabled):not(.btn--loading) {
  background: var(--color-button-primary-hover);
  transform: translateY(-1px);
}

.btn--primary:active:not(.btn--disabled):not(.btn--loading) {
  background: var(--color-button-primary-active);
  transform: translateY(0);
}

.btn--secondary {
  background: var(--color-button-secondary);
  color: var(--color-button-secondary-text);
  box-shadow: var(--color-shadow-sm);
}

.btn--secondary:hover:not(.btn--disabled):not(.btn--loading) {
  background: var(--color-button-secondary-hover);
  transform: translateY(-1px);
}

.btn--success {
  background: var(--color-button-success);
  color: var(--color-button-success-text);
  box-shadow: var(--color-shadow-sm);
}

.btn--success:hover:not(.btn--disabled):not(.btn--loading) {
  background: var(--color-button-success-hover);
  transform: translateY(-1px);
}

.btn--warning {
  background: var(--color-button-warning);
  color: var(--color-button-warning-text);
  box-shadow: var(--color-shadow-sm);
}

.btn--warning:hover:not(.btn--disabled):not(.btn--loading) {
  background: var(--color-button-warning-hover);
  transform: translateY(-1px);
}

.btn--destructive {
  background: var(--color-button-destructive);
  color: var(--color-button-destructive-text);
  box-shadow: var(--color-shadow-sm);
}

.btn--destructive:hover:not(.btn--disabled):not(.btn--loading) {
  background: var(--color-button-destructive-hover);
  transform: translateY(-1px);
}

.btn--info {
  background: var(--color-button-info);
  color: var(--color-button-info-text);
  box-shadow: var(--color-shadow-sm);
}

.btn--info:hover:not(.btn--disabled):not(.btn--loading) {
  background: var(--color-button-info-hover);
  transform: translateY(-1px);
}

/* === 按钮尺寸 === */
.btn--small {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.btn--medium {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}

.btn--large {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

/* === 按钮状态 === */
.btn--disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none !important;
}

.btn--loading {
  cursor: wait;
  color: transparent;
}

.btn__loading {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: currentColor;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
