<template>
  <view class="test-container">
    <view class="test-title">插槽兼容性测试</view>
    
    <view class="vue-version">
      当前Vue版本: {{ vueVersion }}
    </view>
    
    <!-- 测试表格 -->
    <sl-table 
      :columns="testColumns" 
      :tableData="testData"
      @cell-click="handleCellClick"
    >
      <!-- Vue2语法 -->
      <template slot="vue2Slot" slot-scope="slotProps">
        <view class="vue2-slot">
          <text style="color: #1890ff; font-weight: bold;">Vue2插槽: {{ slotProps.row.vue2Data }}</text>
        </view>
      </template>
      
      <!-- Vue3语法 -->
      <template #vue3Slot="slotProps">
        <view class="vue3-slot">
          <text style="color: #52c41a; font-weight: bold;">Vue3插槽: {{ slotProps.row.vue3Data }}</text>
        </view>
      </template>
      
      <!-- 通用插槽 -->
      <template slot="universalSlot" slot-scope="slotProps">
        <view class="universal-slot">
          <view style="display: flex; align-items: center; justify-content: center;">
            <text style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px;">
              通用: {{ slotProps.row.universalData }}
            </text>
          </view>
        </view>
      </template>
    </sl-table>
    
    <!-- 调试信息 -->
    <view class="debug-info">
      <view class="debug-title">调试信息:</view>
      <view>$slots: {{ JSON.stringify(Object.keys($slots || {})) }}</view>
      <view>$scopedSlots: {{ JSON.stringify(Object.keys($scopedSlots || {})) }}</view>
    </view>
  </view>
</template>

<script>
import { getVueVersion } from '../utils/vue-compat.js'

export default {
  name: 'SlotTest',
  data() {
    return {
      vueVersion: getVueVersion(),
      testColumns: [
        {
          label: '基础列',
          prop: 'name',
          width: '25%'
        },
        {
          label: 'Vue2插槽',
          prop: 'vue2Data',
          slot: 'vue2Slot',
          width: '25%'
        },
        {
          label: 'Vue3插槽', 
          prop: 'vue3Data',
          slot: 'vue3Slot',
          width: '25%'
        },
        {
          label: '通用插槽',
          prop: 'universalData',
          slot: 'universalSlot',
          width: '25%'
        }
      ],
      testData: [
        {
          name: '测试行1',
          vue2Data: 'Vue2数据1',
          vue3Data: 'Vue3数据1',
          universalData: '通用数据1'
        },
        {
          name: '测试行2',
          vue2Data: 'Vue2数据2', 
          vue3Data: 'Vue3数据2',
          universalData: '通用数据2'
        },
        {
          name: '测试行3',
          vue2Data: 'Vue2数据3',
          vue3Data: 'Vue3数据3', 
          universalData: '通用数据3'
        }
      ]
    }
  },
  mounted() {
    console.log('Vue版本:', this.vueVersion)
    console.log('$slots:', this.$slots)
    console.log('$scopedSlots:', this.$scopedSlots)
  },
  methods: {
    handleCellClick(event) {
      console.log('插槽测试 - 单元格点击:', event)
    }
  }
}
</script>

<style lang="scss" scoped>
.test-container {
  padding: 20px;
  
  .test-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
    text-align: center;
  }
  
  .vue-version {
    font-size: 14px;
    color: #666;
    margin-bottom: 20px;
    text-align: center;
  }
  
  .vue2-slot, .vue3-slot, .universal-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
  }
  
  .debug-info {
    margin-top: 20px;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 4px;
    
    .debug-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    view {
      font-size: 12px;
      margin-bottom: 2px;
      word-break: break-all;
    }
  }
}
</style>