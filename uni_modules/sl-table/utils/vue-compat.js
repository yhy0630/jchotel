/**
 * Vue2/Vue3 兼容性工具
 * @author shiliu
 * 
 * 提供Vue2和Vue3之间的兼容性处理
 */

// 检测Vue版本
export const getVueVersion = () => {
  // 尝试获取Vue实例
  const Vue = (typeof window !== 'undefined' && window.Vue) || 
             (typeof global !== 'undefined' && global.Vue) ||
             (typeof self !== 'undefined' && self.Vue)
  
  if (Vue && Vue.version) {
    return Vue.version
  }
  
  // 如果无法直接获取，尝试通过其他方式检测
  try {
    // Vue3的特征检测
    if (typeof createApp !== 'undefined') {
      return '3.x'
    }
    // Vue2的特征检测  
    if (typeof Vue !== 'undefined' && Vue.config) {
      return '2.x'
    }
  } catch (e) {
    // 忽略错误
  }
  
  return 'unknown'
}

// 检测是否为Vue2
export const isVue2 = () => {
  const version = getVueVersion()
  return version.startsWith('2.')
}

// 检测是否为Vue3
export const isVue3 = () => {
  const version = getVueVersion()
  return version.startsWith('3.')
}

// 兼容性生命周期钩子映射
export const lifecycleHooks = {
  // Vue2 -> Vue3 映射
  beforeDestroy: 'beforeUnmount',
  destroyed: 'unmounted'
}

// 获取当前环境支持的生命周期钩子
export const getLifecycleHook = (hookName) => {
  if (isVue3() && lifecycleHooks[hookName]) {
    return lifecycleHooks[hookName]
  }
  return hookName
}

// 兼容性事件处理
export const createCompatEmit = (instance) => {
  if (isVue2()) {
    // Vue2使用$emit
    return (event, ...args) => {
      instance.$emit(event, ...args)
    }
  } else {
    // Vue3使用emit函数
    return (event, ...args) => {
      instance.emit(event, ...args)
    }
  }
}

// 兼容性响应式数据处理
export const createCompatReactive = (data) => {
  if (isVue2()) {
    // Vue2直接返回数据对象
    return data
  } else {
    // Vue3可能需要reactive包装（在组合式API中）
    // 但在选项式API中，data函数返回的对象会自动变成响应式
    return data
  }
}

// 检查组件是否需要emits声明
export const needsEmitsDeclaration = () => {
  return isVue3()
}

// 生成兼容的组件选项
export const createCompatOptions = (options) => {
  const compatOptions = { ...options }
  
  if (isVue3()) {
    // Vue3需要emits声明
    if (!compatOptions.emits && options.methods) {
      // 自动检测可能的emit事件
      const emits = []
      const methods = options.methods
      
      Object.keys(methods).forEach(methodName => {
        const methodStr = methods[methodName].toString()
        // 简单的正则匹配$emit调用
        const emitMatches = methodStr.match(/\$emit\(['"`]([^'"`]+)['"`]/g)
        if (emitMatches) {
          emitMatches.forEach(match => {
            const eventName = match.match(/\$emit\(['"`]([^'"`]+)['"`]/)[1]
            if (!emits.includes(eventName)) {
              emits.push(eventName)
            }
          })
        }
      })
      
      if (emits.length > 0) {
        compatOptions.emits = emits
      }
    }
  }
  
  return compatOptions
}

export default {
  getVueVersion,
  isVue2,
  isVue3,
  lifecycleHooks,
  getLifecycleHook,
  createCompatEmit,
  createCompatReactive,
  needsEmitsDeclaration,
  createCompatOptions
}