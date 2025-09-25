import request from '@/utils/request'

// 查询域名列表
export function listDomain(query) {
  return request({
    url: '/system/api/domain/list',
    method: 'get',
    params: query
  })
}

// 查询域名详细
export function getDomain(id) {
  return request({
    url: '/system/api/domain/' + id,
    method: 'get'
  })
}

// 新增域名
export function addDomain(data) {
  return request({
    url: '/system/api/domain',
    method: 'post',
    data: data
  })
}

// 修改域名
export function updateDomain(data) {
  return request({
    url: '/system/api/domain',
    method: 'put',
    data: data
  })
}

// 删除域名
export function delDomain(ids) {
  return request({
    url: '/system/api/domain/' + ids,
    method: 'delete'
  })
}

// 刷新域名缓存
export function refreshCache() {
  return request({
    url: '/system/api/domain/refreshCache',
    method: 'post'
  })
}
