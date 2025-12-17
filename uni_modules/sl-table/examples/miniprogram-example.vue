<!-- Vue2 使用示例（兼容微信小程序） -->
<template>
  <view class="example-container">
    <view class="example-title">Vue2兼容示例</view>
    
    <!-- 基础表格 -->
    <view class="section">
      <view class="section-title">基础表格</view>
      <sl-table 
        :columns="basicColumns" 
        :tableData="basicData"
        @cell-click="handleCellClick"
      />
    </view>

    <!-- 合并单元格表格 -->
    <view class="section">
      <view class="section-title">合并单元格表格</view>
      <sl-table 
        :columns="mergeColumns" 
        :tableData="mergeData"
        @cell-click="handleCellClick"
      >
        <!-- Vue2插槽写法（兼容微信小程序） -->
        <template slot="customSlot" slot-scope="{ row, cell }">
          <view class="custom-slot">
            <text class="highlight">{{ row.customField }}</text>
          </view>
        </template>
				<template slot="customSlot2" slot-scope="{ row, cell }">
				  <view class="custom-slot">
				    <text class="highlight">{{ row.customField }}</text>
				  </view>
				</template>
      </sl-table>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Vue2Example',
  data() {
    return {
      // 基础表格配置
      basicColumns: [
        {
          label: '姓名',
          prop: 'name',
          width: '30%'
        },
        {
          label: '年龄',
          prop: 'age',
          width: '20%'
        },
        {
          label: '职位',
          prop: 'position',
          width: '25%'
        },
        {
          label: '部门',
          prop: 'department',
          width: '25%'
        }
      ],
      basicData: [
        { name: '张三', age: 28, position: '前端工程师', department: '技术部' },
        { name: '李四', age: 32, position: '后端工程师', department: '技术部' },
        { name: '王五', age: 29, position: '产品经理', department: '产品部' },
        { name: '赵六', age: 35, position: '设计师', department: '设计部' }
      ],

      // 合并表格配置
      mergeColumns: [
        {
          label: '基本信息',
          width: '40%',
          children: [
            { label: '姓名', prop: 'name', width: '50%' },
            { label: '年龄', prop: 'age', width: '50%' }
          ]
        },
        {
          label: '工作信息',
          width: '60%', 
          children: [
            { label: '职位', prop: 'position', width: '50%' },
            { label: '自定义', prop: 'customField', slot: 'customSlot', width: '25%' },
            { label: '自定义', prop: 'customField', slot: 'customSlot2', width: '25%' },	
          ]
        }
      ],
      mergeData: [
        { 
          name: '张三', 
          age: {
            value: '28岁',
            rowspan: 2,
            backgroundColor: '#e8f4fd',
            textColor: '#1890ff'
          },
          position: '前端工程师',
          customField: '优秀员工'
        },
        { 
          name: '李四',
          age: {
            display: false  // 被合并的单元格
          },
          position: '后端工程师',
          customField: '技术专家'
        },
        {
          name: {
            value: '王五',
            backgroundColor: '#fff2e8',
            textColor: '#fa8c16',
            bold: true
          },
          age: '29岁',
          position: '产品经理',
          customField: '产品达人'
        }
      ]
    }
  },
  methods: {
    handleCellClick(event) {
      console.log('Vue2 - 单元格点击事件:', event)
      this.$emit('cell-clicked', event)
    }
  },
  
  // 微信小程序兼容说明：
  // 1. slot用法：使用 slot="slotName" slot-scope="{ row, cell }" 而不是 #slotName
  // 2. 数据绑定：微信小程序中使用 {{}} 语法
  // 3. 事件绑定：微信小程序中使用 bind:eventName 语法
  // 4. 样式绑定：组件内部已优化，:style="method()" 改为计算属性
  // 5. 动态插槽：组件内部已优化，避免动态插槽名问题
  // 6. 组件注册：微信小程序中使用 Page() 函数而不是 export default
}
</script>

<style lang="scss" scoped>
.example-container {
  padding: 20px;
  
  .example-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #1890ff;
  }
  
  .section {
    margin-bottom: 30px;
    
    .section-title {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #333;
    }
  }
  
  .custom-slot {
    display: flex;
    align-items: center;
    justify-content: center;
    
    .highlight {
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      font-weight: bold;
    }
  }
}
</style>