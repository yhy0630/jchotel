<template>
  <view class="page">
    <u-calendar 
      v-model="showCalendar"
      mode="date"
      :min-date="minDate"
      :max-date="maxDate"
      @change="onDateChange"
    ></u-calendar>
  </view>
</template>

<script>
export default {
  data() {
    return {
      showCalendar: true,
      minDate: '',
      maxDate: '',
      currentDate: '',
      type: '',
      activeTab: ''
    }
  },
  onLoad(options) {
    this.currentDate = options.current || this.formatDate(new Date())
    this.type = options.type || 'departure'
    this.activeTab = options.activeTab || 'flight'
    this.minDate = this.formatDate(new Date())
    // 设置结束日期为一年后
    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() + 1)
    this.maxDate = this.formatDate(endDate)
  },
  methods: {
    formatDate(date) {
      if (typeof date === 'string') {
        return date
      }
      const d = new Date(date)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    },
    onDateChange(e) {
      // u-calendar 返回单选字符串，或范围数组，或对象 {year,month,day}
      let selectedDate = Array.isArray(e) ? (e[0] || '') : e
      if (selectedDate && typeof selectedDate === 'object') {
        // 兼容对象格式
        selectedDate = this.formatDate(selectedDate)
      }
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage && prevPage.$vm) {
        if (this.activeTab === 'flight') {
          if (this.type === 'departure') {
            prevPage.$vm.flightForm.departureDate = selectedDate
          } else {
            prevPage.$vm.flightForm.returnDate = selectedDate
          }
        } else {
          if (this.type === 'departure') {
            prevPage.$vm.trainForm.departureDate = selectedDate
          } else {
            prevPage.$vm.trainForm.returnDate = selectedDate
          }
        }
      }
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>


    <u-calendar 
      v-model="showCalendar"
      mode="date"
      :min-date="minDate"
      :max-date="maxDate"
      @change="onDateChange"
    ></u-calendar>
  </view>
</template>

<script>
export default {
  data() {
    return {
      showCalendar: true,
      minDate: '',
      maxDate: '',
      currentDate: '',
      type: '',
      activeTab: ''
    }
  },
  onLoad(options) {
    this.currentDate = options.current || this.formatDate(new Date())
    this.type = options.type || 'departure'
    this.activeTab = options.activeTab || 'flight'
    this.minDate = this.formatDate(new Date())
    // 设置结束日期为一年后
    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() + 1)
    this.maxDate = this.formatDate(endDate)
  },
  methods: {
    formatDate(date) {
      if (typeof date === 'string') {
        return date
      }
      const d = new Date(date)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    },
    onDateChange(e) {
      // u-calendar 返回单选字符串，或范围数组，这里只取单日期
      const selectedDate = Array.isArray(e) ? (e[0] || '') : e
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage && prevPage.$vm) {
        if (this.activeTab === 'flight') {
          if (this.type === 'departure') {
            prevPage.$vm.flightForm.departureDate = selectedDate
          } else {
            prevPage.$vm.flightForm.returnDate = selectedDate
          }
        } else {
          if (this.type === 'departure') {
            prevPage.$vm.trainForm.departureDate = selectedDate
          } else {
            prevPage.$vm.trainForm.returnDate = selectedDate
          }
        }
      }
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
}
</style>

