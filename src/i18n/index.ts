import { createI18n } from 'vue-i18n'
import type { I18nOptions } from 'vue-i18n'

// 导入语言文件
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
}

// 从localStorage获取语言设置
const getLocale = (): string => {
  const stored = localStorage.getItem('app-locale')
  if (stored && stored in messages) {
    return stored
  }
  
  // 检测浏览器语言
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('zh')) {
    return 'zh-CN'
  }
  
  return 'en-US'
}

const i18nOptions: I18nOptions = {
  legacy: false,
  locale: getLocale(),
  fallbackLocale: 'zh-CN',
  messages,
  globalInjection: true,
}

export const i18n = createI18n(i18nOptions)

export default i18n
