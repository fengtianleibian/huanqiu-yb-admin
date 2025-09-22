import request from '@/utils/request'

// 查询站点列表
export function sitePage(query) {
  return request({
    url: '/system/api/site/page',
    method: 'get',
    params: query
  })
}

// 查询站点详细
export function getSite(siteId) {
  return request({
    url: '/system/api/site/' + siteId,
    method: 'get'
  })
}

// 新增站点
export function addSite(data) {
  return request({
    url: '/system/api/site/add',
    method: 'post',
    data: data
  })
}

// 修改站点
export function updateSite(data) {
  return request({
    url: '/system/api/site',
    method: 'put',
    data: data
  })
}

// 删除站点
export function delSite(siteIds) {
  return request({
    url: '/system/api/site/' + siteIds,
    method: 'post'
  })
}

// 同步站点库存
export function syncSiteOdds(siteId) {
  return request({
    url: '/system/api/site/syncOdds/' + siteId,
    method: 'post'
  })
}
