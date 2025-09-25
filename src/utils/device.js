/**
 * 设备类型检测工具
 */

/**
 * 获取当前域名
 * @returns {string} 当前域名
 */
export function getCurrentDomain() {
  return window.location.hostname || window.location.host || 'localhost'
}

/**
 * 检测设备类型
 * @returns {string} 设备类型 (Windows, Mac, Android, iOS, Linux, 其他)
 */
export function getDeviceType() {
  const userAgent = navigator.userAgent.toLowerCase()
  
  if (userAgent.includes('windows')) {
    return 'Windows'
  } else if (userAgent.includes('mac')) {
    return 'Mac'
  } else if (userAgent.includes('android')) {
    return 'Android'
  } else if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
    return 'iOS'
  } else if (userAgent.includes('linux')) {
    return 'Linux'
  } else {
    return '其他'
  }
}

/**
 * 获取浏览器信息
 * @returns {string} 浏览器类型
 */
export function getBrowserType() {
  const userAgent = navigator.userAgent.toLowerCase()
  
  if (userAgent.includes('chrome')) {
    return 'Chrome'
  } else if (userAgent.includes('firefox')) {
    return 'Firefox'
  } else if (userAgent.includes('safari')) {
    return 'Safari'
  } else if (userAgent.includes('edge')) {
    return 'Edge'
  } else if (userAgent.includes('opera')) {
    return 'Opera'
  } else {
    return '其他'
  }
}
