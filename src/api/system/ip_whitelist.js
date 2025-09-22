import request from '@/utils/request'

// 查询IP白名单列表
export function listIpWhitelist(query) {
  return request({
    url: '/system/api/sys_ip_whitelist/list',
    method: 'get',
    params: query
  })
}

// 查询IP白名单详细
export function getIpWhitelist(id) {
  return request({
    url: '/system/api/sys_ip_whitelist/' + id,
    method: 'get'
  })
}

// 新增IP白名单
export function addIpWhitelist(data) {
  return request({
    url: '/system/api/sys_ip_whitelist',
    method: 'post',
    data: data
  })
}

// 修改IP白名单
export function updateIpWhitelist(data) {
  return request({
    url: '/system/api/sys_ip_whitelist',
    method: 'put',
    data: data
  })
}

// 删除IP白名单
export function delIpWhitelist(ids) {
  return request({
    url: '/system/api/sys_ip_whitelist/' + ids,
    method: 'delete'
  })
}

// 刷新IP白名单缓存
export function refreshCache() {
  return request({
    url: '/system/api/sys_ip_whitelist/refreshCache',
    method: 'delete'
  })
}
