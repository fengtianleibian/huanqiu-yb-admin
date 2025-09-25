import request from '@/utils/request'

// 登录方法
export function login(username, password, googleCode, domain, deviceType) {
  return request({
    url: '/system/api/sys-user/login', headers: {
      isToken: false, repeatSubmit: false
    }, method: 'post', data: {username, password, googleCode, domain, deviceType}
  })
}

// 注册方法
export function register(data) {
  return request({
    url: '/auth/register', headers: {
      isToken: false
    }, method: 'post', data: data
  })
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/system/api/sys-user/getInfo', method: 'get'
  })
}

// 退出方法
export function logout() {
  return request({
    url: '/system/api/sys-user/logout', method: 'delete'
  })
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/code', headers: {
      isToken: false
    }, method: 'get', timeout: 20000
  })
}

// 验证用户密码
export function verifyUserPassword(data) {
  return request({
    url: '/system/api/sys-user/verifyUserPassword', headers: {
      isToken: false
    }, method: 'post', data: data
  })
}

// 获取谷歌验证码二维码
export function getGoogleCodeImg(data) {
  return request({
    url: '/system/api/sys-user/getCodeImg', headers: {
      isToken: false
    }, method: 'post', data: data, responseType: 'blob'
  })
}

// 绑定谷歌验证码并登录
export function bindGooglePasswordAndLogin(data) {
  return request({
    url: '/system/api/sys-user/bindGooglePasswordAndLogin', headers: {
      isToken: false, repeatSubmit: false
    }, method: 'post', data: data
  })
}
