import request from '@/utils/request'

// 查询轮播图列表
export function listCarousel(query) {
  return request({
    url: '/system/api/carousel/list', method: 'get', params: query
  })
}

// 新增轮播图
export function addCarousel(data) {
  return request({
    url: '/system/api/carousel', method: 'post', data: data
  })
}

// 新增轮播图
export function info(id) {
  return request({
    url: '/system/api/carousel/info/' + id, method: 'get'
  })
}

// 修改轮播图
export function updateCarousel(data) {
  return request({
    url: '/system/api/carousel', method: 'put', data: data
  })
}

// 删除轮播图
export function delCarousel(carouselIds) {
  return request({
    url: '/system/api/carousel/' + carouselIds, method: 'post'
  })
}
