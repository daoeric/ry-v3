import request from '@/utils/request'

// 查询扫描订单列表
export function listScanOrder(query) {
  return request({
    url: '/business/scanOrder/list',
    method: 'get',
    params: query
  })
}

// 查询扫描订单详细
export function getScanOrder(orderNo) {
  return request({
    url: '/business/scanOrder/' + orderNo,
    method: 'get'
  })
}

// 新增扫描订单
export function addScanOrder(data) {
  return request({
    url: '/business/scanOrder',
    method: 'post',
    data: data
  })
}

// 修改扫描订单
export function updateScanOrder(data) {
  return request({
    url: '/business/scanOrder',
    method: 'put',
    data: data
  })
}

// 删除扫描订单
export function delScanOrder(orderNo) {
  return request({
    url: '/business/scanOrder/' + orderNo,
    method: 'delete'
  })
}
