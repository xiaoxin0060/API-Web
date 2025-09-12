// 清除欢迎动画缓存的工具脚本
// 在浏览器控制台中运行这段代码，或者在应用启动时调用

function clearWelcomeCache() {
  // 清除所有可能的欢迎动画相关缓存
  localStorage.removeItem('hasVisitedBefore')
  localStorage.removeItem('appColdStart')
  
  console.log('✅ 欢迎动画缓存已清除！')
  console.log('🎬 现在刷新页面即可看到炫酷欢迎动画')
  console.log('💡 新特性：品牌文字智能隐藏，介绍文字同位置展示')
  console.log('📱 时序优化：介绍文字 → 品牌文字重现 → 互动按钮')
  
  // 可选：自动刷新页面
  if (confirm('是否要立即刷新页面以查看更新的欢迎动画？')) {
    location.reload()
  }
}

// 立即执行清除
clearWelcomeCache()
