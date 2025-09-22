import request from '@/utils/request'

// 获取路由
export const getRouters = () => {
  return request({
    url: '/system/api/sys-menu/getRouters',
    method: 'get'
  })
}
