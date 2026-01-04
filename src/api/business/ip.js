import request from '@/utils/request'

// 查询上游信息列表
export function listIp(query) {
  return request({
    url: '/business/ip/list',
    method: 'get',
    params: query
  })
}

// 查询上游信息详细
export function getIp(id) {
  return request({
    url: '/business/ip/' + id,
    method: 'get'
  })
}

// 新增上游信息
export function addIp(data) {
  return request({
    url: '/business/ip',
    method: 'post',
    data: data
  })
}

// 修改上游信息
export function updateIp(data) {
  return request({
    url: '/business/ip',
    method: 'put',
    data: data
  })
}

// 删除上游信息
export function delIp(id) {
  return request({
    url: '/business/ip/' + id,
    method: 'delete'
  })
}
