import request from '@/utils/request'

// 查询轮播图列表
export function listBanner(query) {
  return request({
    url: '/system/api/banner/list', method: 'get', params: query
  })
}

// 新增轮播图
export function addBanner(data) {
  return request({
    url: '/system/api/banner', method: 'post', data: data
  })
}

// 轮播图详情
export function info(id) {
  return request({
    url: '/system/api/banner/info/' + id, method: 'get'
  })
}

// 修改轮播图
export function updateBanner(data) {
  return request({
    url: '/system/api/banner', method: 'put', data: data
  })
}

// 删除轮播图
export function delBanner(bannerIds) {
  return request({
    url: '/system/api/banner/' + bannerIds, method: 'post'
  })
}
