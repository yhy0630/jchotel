// 从 area.js 中提取城市数据
// 注意：这个文件需要从服务器端复制 area.js 的内容，或者通过接口获取

// 热门城市列表（用于标识）
const hotCityNames = ['北京', '上海', '广州', '深圳', '成都', '重庆', '杭州', '南京', '青岛', '厦门', '武汉', '西安', '天津', '苏州', '长沙', '郑州', '济南', '大连', '沈阳', '哈尔滨', '昆明', '南宁', '海口', '三亚', '乌鲁木齐', '拉萨', '银川', '西宁', '呼和浩特']

// 城市代码映射（用于飞机票和火车票）
const cityCodeMap = {
  '北京': { flight: 'BJS', train: 'BJP' },
  '上海': { flight: 'SHA', train: 'SHH' },
  '广州': { flight: 'CAN', train: 'GZQ' },
  '深圳': { flight: 'SZX', train: 'SZQ' },
  '成都': { flight: 'CTU', train: 'CDW' },
  '重庆': { flight: 'CKG', train: 'CQW' },
  '杭州': { flight: 'HGH', train: 'HZH' },
  '南京': { flight: 'NKG', train: 'NJH' },
  '青岛': { flight: 'TAO', train: 'QDK' },
  '厦门': { flight: 'XMN', train: 'XMS' },
  '武汉': { flight: 'WUH', train: 'WHN' },
  '西安': { flight: 'XIY', train: 'XAY' },
  '天津': { flight: 'TSN', train: 'TJP' },
  '苏州': { flight: 'SZV', train: 'SZH' },
  '长沙': { flight: 'CSX', train: 'CSQ' },
  '郑州': { flight: 'CGO', train: 'ZZF' },
  '济南': { flight: 'TNA', train: 'JNK' },
  '大连': { flight: 'DLC', train: 'DLT' },
  '沈阳': { flight: 'SHE', train: 'SYT' },
  '哈尔滨': { flight: 'HRB', train: 'HBB' },
  '昆明': { flight: 'KMG', train: 'KMM' },
  '南宁': { flight: 'NNG', train: 'NNZ' },
  '海口': { flight: 'HAK', train: 'VUQ' },
  '三亚': { flight: 'SYX', train: 'SEQ' },
  '乌鲁木齐': { flight: 'URC', train: 'WAR' },
  '拉萨': { flight: 'LXA', train: 'LSO' },
  '银川': { flight: 'INC', train: 'YIJ' },
  '西宁': { flight: 'XNN', train: 'XNO' },
  '呼和浩特': { flight: 'HET', train: 'HHC' }
}

/**
 * 从 area.js 数据中提取城市列表（level=2）
 * @param {Array} areasData area.js 的原始数据
 * @returns {Array} 城市列表
 */
export function extractCitiesFromAreas(areasData) {
  if (!areasData || !Array.isArray(areasData)) {
    return []
  }
  
  const cities = []
  const cityNameSet = new Set()
  
  // 提取 level=2 的城市数据
  areasData.forEach(area => {
    if (area.level === 2) {
      const cityName = area.short || area.name || ''
      // 去掉"市"、"地区"、"自治州"等后缀
      let displayName = cityName
      if (cityName.endsWith('市')) {
        displayName = cityName.slice(0, -1)
      } else if (cityName.endsWith('地区')) {
        displayName = cityName.slice(0, -2)
      } else if (cityName.endsWith('自治州')) {
        displayName = cityName.slice(0, -3)
      } else if (cityName.endsWith('盟')) {
        displayName = cityName.slice(0, -1)
      }
      
      // 去重
      if (displayName && !cityNameSet.has(displayName)) {
        cityNameSet.add(displayName)
        
        const cityInfo = cityCodeMap[displayName] || cityCodeMap[cityName] || {}
        
        cities.push({
          cityName: displayName,
          fullName: cityName,
          cityCode: cityInfo.flight || '',
          stationCode: cityInfo.train || '',
          cityCodeValue: area.city_code || '',
          pinyinName: generatePinyin(displayName),
          isHot: hotCityNames.includes(displayName) || hotCityNames.includes(cityName) ? 1 : 0,
          id: area.id,
          parentId: area.parent_id
        })
      }
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
  extractCitiesFromAreas,
  searchCities,
  getHotCities
}

