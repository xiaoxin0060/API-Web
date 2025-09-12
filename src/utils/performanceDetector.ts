/**
 * 设备性能检测工具
 * 根据硬件配置动态降级动画效果
 */

interface PerformanceInfo {
  isLowPerformance: boolean
  deviceMemory?: number
  hardwareConcurrency?: number
  connectionEffectiveType?: string
  batteryLevel?: number
  isCharging?: boolean
  userAgent: string
}

class PerformanceDetector {
  private performanceInfo: PerformanceInfo = {
    isLowPerformance: false,
    userAgent: navigator.userAgent
  }

  constructor() {
    this.detectPerformance()
  }

  /**
   * 综合检测设备性能
   */
  private async detectPerformance(): Promise<void> {
    // 检测内存
    if ('deviceMemory' in navigator) {
      this.performanceInfo.deviceMemory = (navigator as any).deviceMemory
    }

    // 检测CPU核心数
    this.performanceInfo.hardwareConcurrency = navigator.hardwareConcurrency

    // 检测网络连接
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      this.performanceInfo.connectionEffectiveType = connection?.effectiveType
    }

    // 检测电池状态
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery()
        this.performanceInfo.batteryLevel = battery?.level
        this.performanceInfo.isCharging = battery?.charging
      }
    } catch (error) {
      // 电池API可能不可用
    }

    // 综合判断是否为低性能设备
    this.performanceInfo.isLowPerformance = this.isLowPerformanceDevice()

    // 应用降级策略
    if (this.performanceInfo.isLowPerformance) {
      this.applyLowPerformanceMode()
    }

    // 监听性能变化
    this.setupPerformanceMonitoring()
  }

  /**
   * 判断是否为低性能设备
   */
  private isLowPerformanceDevice(): boolean {
    const {
      deviceMemory = 4,
      hardwareConcurrency = 4,
      connectionEffectiveType,
      batteryLevel,
      isCharging,
      userAgent
    } = this.performanceInfo

    // 基础硬件阈值
    const isLowHardware = deviceMemory < 4 || hardwareConcurrency < 4

    // 网络连接质量差
    const isSlowConnection = connectionEffectiveType === 'slow-2g' || 
                            connectionEffectiveType === '2g'

    // 电池电量低且未充电
    const isLowBattery = batteryLevel !== undefined && 
                        batteryLevel < 0.2 && 
                        !isCharging

    // 检测移动设备
    const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

    // 检测低端移动设备
    const isLowEndMobile = isMobileDevice && (
      /Android [1-6]\./i.test(userAgent) ||
      /iPhone OS [1-9]_/i.test(userAgent) ||
      userAgent.includes('Opera Mini')
    )

    return isLowHardware || isSlowConnection || isLowBattery || isLowEndMobile
  }

  /**
   * 应用低性能模式
   */
  private applyLowPerformanceMode(): void {
    document.documentElement.classList.add('low-performance')
    
    console.log('🐌 Low performance mode activated:', {
      deviceMemory: this.performanceInfo.deviceMemory,
      hardwareConcurrency: this.performanceInfo.hardwareConcurrency,
      connectionType: this.performanceInfo.connectionEffectiveType
    })
  }

  /**
   * 移除低性能模式
   */
  public removeLowPerformanceMode(): void {
    document.documentElement.classList.remove('low-performance')
    this.performanceInfo.isLowPerformance = false
  }

  /**
   * 强制启用低性能模式（用于演示）
   */
  public forceLowPerformanceMode(): void {
    document.documentElement.classList.add('low-performance')
    this.performanceInfo.isLowPerformance = true
    console.log('🎛️ Low performance mode forced for demo')
  }

  /**
   * 监听性能变化
   */
  private setupPerformanceMonitoring(): void {
    // 监听电池状态变化
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        battery.addEventListener('levelchange', () => {
          this.performanceInfo.batteryLevel = battery.level
          this.performanceInfo.isCharging = battery.charging
          
          // 重新评估性能
          const shouldBeLowPerf = this.isLowPerformanceDevice()
          if (shouldBeLowPerf !== this.performanceInfo.isLowPerformance) {
            this.performanceInfo.isLowPerformance = shouldBeLowPerf
            if (shouldBeLowPerf) {
              this.applyLowPerformanceMode()
            } else {
              this.removeLowPerformanceMode()
            }
          }
        })

        battery.addEventListener('chargingchange', () => {
          this.performanceInfo.isCharging = battery.charging
        })
      }).catch(() => {
        // 电池API不可用
      })
    }

    // 监听连接状态变化
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection?.addEventListener('change', () => {
        this.performanceInfo.connectionEffectiveType = connection.effectiveType
      })
    }
  }

  /**
   * 获取性能信息
   */
  public getPerformanceInfo(): PerformanceInfo {
    return { ...this.performanceInfo }
  }

  /**
   * 检测是否支持减少动画偏好
   */
  public static hasReducedMotionPreference(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * 监听减少动画偏好变化
   */
  public static onReducedMotionChange(callback: (prefersReduced: boolean) => void): () => void {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    
    const handler = (event: MediaQueryListEvent) => {
      callback(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    
    // 返回清理函数
    return () => {
      mediaQuery.removeEventListener('change', handler)
    }
  }
}

// 创建单例实例
export const performanceDetector = new PerformanceDetector()

// 导出类型
export type { PerformanceInfo }

// 导出工具函数
export const {
  hasReducedMotionPreference,
  onReducedMotionChange
} = PerformanceDetector
