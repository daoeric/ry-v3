import request from '@/utils/request'

// 查询额度变更列表
export function listCreditLog(query) {
  return request({
    url: '/business/creditLog/list',
    method: 'get',
    params: query
  })
}

// 查询额度变更详细
export function getCreditLog(id) {
  return request({
    url: '/business/creditLog/' + id,
    method: 'get'
  })
}

// 新增额度变更
export function addCreditLog(data) {
  return request({
    url: '/business/creditLog',
    method: 'post',
    data: data
  })
}

// 修改额度变更
export function updateCreditLog(data) {
  return request({
    url: '/business/creditLog',
    method: 'put',
    data: data
  })
}

// 删除额度变更
export function delCreditLog(id) {
  return request({
    url: '/business/creditLog/' + id,
    method: 'delete'
  })
}
