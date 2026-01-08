import request from '@/utils/request'

// 查询银行信息列表
export function listBankInfo(query) {
  return request({
    url: '/business/bankInfo/list',
    method: 'get',
    params: query
  })
}

// 查询银行信息详细
export function getBankInfo(id) {
  return request({
    url: '/business/bankInfo/' + id,
    method: 'get'
  })
}

// 新增银行信息
export function addBankInfo(data) {
  return request({
    url: '/business/bankInfo',
    method: 'post',
    data: data
  })
}

// 修改银行信息
export function updateBankInfo(data) {
  return request({
    url: '/business/bankInfo',
    method: 'put',
    data: data
  })
}

// 删除银行信息
export function delBankInfo(id) {
  return request({
    url: '/business/bankInfo/' + id,
    method: 'delete'
  })
}
