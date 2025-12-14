import request from '@/utils/request'

// 查询VIP管理列表
export function listVip(query) {
  return request({
    url: '/business/vip/list',
    method: 'get',
    params: query
  })
}

// 查询VIP管理详细
export function getVip(id) {
  return request({
    url: '/business/vip/' + id,
    method: 'get'
  })
}

// 新增VIP管理
export function addVip(data) {
  return request({
    url: '/business/vip',
    method: 'post',
    data: data
  })
}

// 修改VIP管理
export function updateVip(data) {
  return request({
    url: '/business/vip',
    method: 'put',
    data: data
  })
}

// 删除VIP管理
export function delVip(id) {
  return request({
    url: '/business/vip/' + id,
    method: 'delete'
  })
}
