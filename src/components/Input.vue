<template>
  <div class="input-wrapper" :class="{ 'input-wrapper--error': error, invalid: error }">
    <label v-if="label" :for="inputId" class="input-label">{{ label }}</label>
    <div class="input-container">
      <input
        :id="inputId"
        class="input performant-animation"
        :class="{ 
          'search-input': type === 'search',
          invalid: error
        }"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
        @keydown="$emit('keydown', $event)"
      />
    </div>
    <div v-if="error" class="input-error">{{ error }}</div>
    <div v-else-if="helper" class="input-helper">{{ helper }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = withDefaults(defineProps(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  error: '',
  helper: '',
  label: '',
  modelValue: ''
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'keydown'])

// 生成唯一ID
const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.input-container {
  position: relative;
}

.input {
  width: 100%;
  padding: 0.5rem;
  background: var(--color-input-bg);
  border: 1px solid var(--color-input-border);
  border-radius: 0.5rem;
  color: var(--color-input-text);
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s ease;
  outline: none;
}

.input:focus {
  border-color: var(--color-input-border-focus);
  /* 移除静态阴影，使用增强的呼吸动画 */
}

.input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.input::placeholder {
  color: var(--color-input-placeholder);
  opacity: 1;
}

/* 错误状态 */
.input-wrapper--error .input {
  border-color: var(--color-error);
}

.input-wrapper--error .input:focus {
  border-color: var(--color-error);
  box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.2);
}

.input-error {
  font-size: 0.875rem;
  color: var(--color-error);
  margin-top: 0.25rem;
}

.input-helper {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-top: 0.25rem;
}

/* 浏览器自动填充样式重置 */
.input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 1000px var(--color-input-bg) inset !important;
  -webkit-text-fill-color: var(--color-input-text) !important;
  transition: background-color 5000s ease-in-out 0s;
}

.input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 1000px var(--color-input-bg) inset !important;
  -webkit-text-fill-color: var(--color-input-text) !important;
}
</style>
