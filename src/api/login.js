import request from '@/utils/request'

// 登录方法
export function login(username, password, googleCode) {
  return request({
    url: '/system/api/sys-user/login', headers: {
      isToken: false, repeatSubmit: false
    }, method: 'post', data: {username, password, googleCode}
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
