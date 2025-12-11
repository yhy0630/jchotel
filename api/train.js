// +----------------------------------------------------------------------
// | 火车票模块API
// +----------------------------------------------------------------------
import request from '../utils/request'

/**
 * 火车票模块API
 * 接口说明：
 * - stationList: 车站列表查询
 * - trainList: 车次列表查询（支持筛选、分页）
 * - trainDetail: 车次详情查询
 */

// 车站列表
export function stationList(data) {
    return request.post('train/stationList', data)
}

// 车次列表
export function trainList(data) {
    return request.post('train/trainList', data)
}

// 车次详情
export function trainDetail(data) {
    return request.post('train/trainDetail', data)
}

