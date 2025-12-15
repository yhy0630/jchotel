// 全国城市数据工具
// 从 uview-ui 的城市数据中提取城市列表

import cityData from '@/components/uview-ui/libs/util/city.js'

// 热门城市列表（用于标识）
const hotCityNames = ['北京', '上海', '广州', '深圳', '成都', '重庆', '杭州', '南京', '青岛', '厦门', '武汉', '西安', '天津', '苏州', '长沙', '郑州', '济南', '大连', '沈阳', '哈尔滨', '昆明', '南宁', '海口', '三亚', '乌鲁木齐', '拉萨', '银川', '西宁', '呼和浩特']

// 城市代码映射（用于飞机票）
const cityCodeMap = {
  '北京': 'BJS',
  '上海': 'SHA',
  '广州': 'CAN',
  '深圳': 'SZX',
  '成都': 'CTU',
  '重庆': 'CKG',
  '杭州': 'HGH',
  '南京': 'NKG',
  '青岛': 'TAO',
  '厦门': 'XMN',
  '武汉': 'WUH',
  '西安': 'XIY',
  '天津': 'TSN',
  '苏州': 'SZV',
  '长沙': 'CSX',
  '郑州': 'CGO',
  '济南': 'TNA',
  '大连': 'DLC',
  '沈阳': 'SHE',
  '哈尔滨': 'HRB',
  '昆明': 'KMG',
  '南宁': 'NNG',
  '海口': 'HAK',
  '三亚': 'SYX',
  '乌鲁木齐': 'URC',
  '拉萨': 'LXA',
  '银川': 'INC',
  '西宁': 'XNN',
  '呼和浩特': 'HET'
}

/**
 * 从城市数据中提取所有城市列表
 * @returns {Array} 城市列表 [{cityName, cityCode, pinyinName, isHot}]
 */
export function getAllCities() {
  const cities = []
  const cityNameSet = new Set() // 用于去重
  
  // 遍历所有省份的城市数据
  cityData.forEach(provinceCities => {
    if (Array.isArray(provinceCities)) {
      provinceCities.forEach(city => {
        const cityName = city.label || ''
        // 过滤掉"市辖区"、"县"等非城市名称
        if (cityName && !cityNameSet.has(cityName) && 
            cityName !== '市辖区' && cityName !== '县' && 
            cityName.includes('市') || cityName.includes('盟') || cityName.includes('州')) {
          cityNameSet.add(cityName)
          
          // 提取城市名称（去掉"市"字）
          let displayName = cityName
          if (cityName.endsWith('市')) {
            displayName = cityName.slice(0, -1)
          }
          
          // 生成拼音（简单处理，实际应该使用拼音库）
          const pinyinName = generatePinyin(displayName)
          
          cities.push({
            cityName: displayName,
            fullName: cityName,
            cityCode: cityCodeMap[displayName] || cityCodeMap[cityName] || '',
            pinyinName: pinyinName,
            isHot: hotCityNames.includes(displayName) || hotCityNames.includes(cityName) ? 1 : 0,
            value: city.value || ''
          })
        }
      })
    }
  })
  
  // 按热门程度和名称排序
  cities.sort((a, b) => {
    if (a.isHot !== b.isHot) {
      return b.isHot - a.isHot
    }
    return a.cityName.localeCompare(b.cityName, 'zh-CN')
  })
  
  return cities
}

/**
 * 简单的拼音生成（用于搜索）
 * 注意：这是一个简化版本，实际应该使用专业的拼音库
 */
function generatePinyin(text) {
  // 这里只是返回原文本，实际应该转换为拼音
  // 可以使用 pinyin-pro 或其他拼音库
  return text.toLowerCase()
}

/**
 * 根据关键词搜索城市
 * @param {String} keyword 搜索关键词
 * @param {Array} cities 城市列表
 * @returns {Array} 搜索结果
 */
export function searchCities(keyword, cities) {
  if (!keyword) return cities
  
  const lowerKeyword = keyword.toLowerCase()
  return cities.filter(city => 
    city.cityName.includes(keyword) ||
    (city.pinyinName && city.pinyinName.includes(lowerKeyword)) ||
    (city.fullName && city.fullName.includes(keyword))
  )
}

/**
 * 获取热门城市
 * @param {Array} cities 城市列表
 * @returns {Array} 热门城市列表
 */
export function getHotCities(cities) {
  return cities.filter(city => city.isHot === 1)
}

export default {
  getAllCities,
  searchCities,
  getHotCities
}

