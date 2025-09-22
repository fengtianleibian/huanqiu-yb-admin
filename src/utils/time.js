/**
 * 时间工具类
 */

/**
 * 时间格式化方法（带时区）
 * @param {string|number} timestamp - Unix时间戳（秒）
 * @param {number} timezone - 时区偏移（小时），默认0
 * @returns {string} 格式化后的时间字符串
 */
export function formatTimeWithTimezone(timestamp, timezone = 0) {
  if (!timestamp) return '无';
  
  // 创建UTC时间对象
  let date = new Date(parseInt(timestamp) * 1000);
  
  // 加上时区偏移（小时）
  const utcHours = date.getUTCHours() + timezone;
  
  // 处理时区偏移后的日期变化
  let adjustedDate = new Date(date.getTime() + (timezone * 60 * 60 * 1000));
  
  // 使用调整后的时间
  const year = adjustedDate.getUTCFullYear();
  const month = String(adjustedDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(adjustedDate.getUTCDate()).padStart(2, '0');
  const hours = String(adjustedDate.getUTCHours()).padStart(2, '0');
  const minutes = String(adjustedDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(adjustedDate.getUTCSeconds()).padStart(2, '0');
  
  const timezoneStr = timezone >= 0 ? `+${timezone}` : `${timezone}`;
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC${timezoneStr}`;
}

/**
 * 获取当前时间戳（秒）
 * @returns {number} 当前Unix时间戳
 */
export function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000);
}

/**
 * 获取当前时间戳（毫秒）
 * @returns {number} 当前毫秒时间戳
 */
export function getCurrentTimestampMs() {
  return Date.now();
}

/**
 * 将日期字符串转换为时间戳
 * @param {string} dateString - 日期字符串
 * @returns {number} Unix时间戳（秒）
 */
export function dateStringToTimestamp(dateString) {
  return Math.floor(new Date(dateString).getTime() / 1000);
}

/**
 * 将时间戳转换为日期字符串
 * @param {string|number} timestamp - Unix时间戳（秒）
 * @param {string} format - 格式字符串，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化的日期字符串
 */
export function timestampToDateString(timestamp, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!timestamp) return '';
  
  const date = new Date(parseInt(timestamp) * 1000);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}
