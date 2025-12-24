import request from '@/utils/request'

// 获取会员升级配置
export function getMemberUpgradeOptions(params = {}) {
  return request.get('member/upgradeOptions', params)
}

