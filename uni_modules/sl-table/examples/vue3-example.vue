<!-- Vue3 使用示例 -->
<template>
  <view class="example-container">
    <view class="example-title">Vue3兼容示例</view>
    
    <!-- 基础表格 -->
    <view class="section">
      <view class="section-title">基础表格</view>
      <sl-table 
        :columns="basicColumns" 
        :tableData="basicData"
        @cell-click="handleCellClick"
      />
    </view>

    <!-- 固定列表格 -->
    <view class="section">
      <view class="section-title">固定列表格（支持横向滚动）</view>
      <sl-table 
        :columns="fixedColumns" 
        :tableData="fixedData"
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
        <!-- Vue3风格的自定义插槽 -->
        <template #customSlot="{ row, cell }">
          <view class="custom-slot">
            <text class="highlight">{{ row.customField }}</text>
          </view>
        </template>
      </sl-table>
    </view>

    <!-- 上拉加载表格 -->
    <view class="section">
      <view class="section-title">上拉加载表格</view>
      <sl-table 
        :columns="basicColumns" 
        :tableData="loadMoreData"
        :enableLoadMore="true"
        @load-more="handleLoadMore"
        @cell-click="handleCellClick"
      />
    </view>

    <!-- 空数据插槽 -->
    <view class="section">
      <view class="section-title">空数据插槽</view>
      <sl-table 
        :columns="basicColumns" 
        :tableData="[]"
        @cell-click="handleCellClick"
      >
        <template #empty>
          <view class="empty-container">
            <text class="empty-icon">📭</text>
            <text class="empty-text">暂无数据，请稍后再试</text>
          </view>
        </template>
      </sl-table>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Vue3Example',
  // Vue3的emits声明
  emits: ['cell-clicked'],
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

      // 固定列表格配置
      fixedColumns: [
        {
          label: '姓名',
          prop: 'name',
          width: '100px',
          fixed: 'left'
        },
        {
          label: '年龄',
          prop: 'age',
          width: '80px'
        },
        {
          label: '职位',
          prop: 'position',
          width: '150px'
        },
        {
          label: '部门',
          prop: 'department',
          width: '120px'
        },
        {
          label: '邮箱',
          prop: 'email',
          width: '200px'
        },
        {
          label: '操作',
          prop: 'action',
          width: '100px',
          fixed: 'right'
        }
      ],
      fixedData: [
        { name: '张三', age: 28, position: '前端工程师', department: '技术部', email: 'zhangsan@example.com', action: '编辑' },
        { name: '李四', age: 32, position: '后端工程师', department: '技术部', email: 'lisi@example.com', action: '编辑' },
        { name: '王五', age: 29, position: '产品经理', department: '产品部', email: 'wangwu@example.com', action: '编辑' }
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
            { label: '自定义', prop: 'customField', slot: 'customSlot', width: '50%' }
          ]
        }
      ],
      mergeData: [
        { 
          name: '张三', 
          age: {
            value: '28岁',
            rowspan: 2,
            cellStyle: {
              backgroundColor: '#e8f4fd',
              color: '#1890ff'
            }
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
            cellStyle: {
              backgroundColor: '#fff2e8',
              color: '#fa8c16',
              fontWeight: 'bold'
            }
          },
          age: '29岁',
          position: '产品经理',
          customField: '产品达人'
        }
      ],

      // 上拉加载数据
      loadMoreData: [
        { name: '张三', age: 28, position: '前端工程师', department: '技术部' },
        { name: '李四', age: 32, position: '后端工程师', department: '技术部' },
        { name: '王五', age: 29, position: '产品经理', department: '产品部' }
      ],
      loadMorePage: 1
    }
  },
  methods: {
    handleCellClick(event) {
      console.log('Vue3 - 单元格点击事件:', event)
      uni.showToast({
        title: `点击了第${event.rowIndex + 1}行第${event.colIndex + 1}列`,
        icon: 'none'
      })
    },
    handleLoadMore({ pageNum, done }) {
      console.log('Vue3 - 上拉加载，当前页码:', pageNum)
      // 模拟异步加载数据
      setTimeout(() => {
        const newData = [
          { name: `新用户${pageNum}-1`, age: 25, position: '测试工程师', department: '技术部' },
          { name: `新用户${pageNum}-2`, age: 27, position: 'UI设计师', department: '设计部' }
        ]
        this.loadMoreData.push(...newData)
        // 模拟加载到第3页后结束
        const isLastPage = pageNum >= 3
        done(isLastPage)
      }, 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
.example-container {
  padding: 20px;
  
  .example-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
    color: #52c41a;
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
      background: linear-gradient(45deg, #52c41a, #1890ff);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      font-weight: bold;
    }
  }

  .empty-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;

    .empty-icon {
      font-size: 48px;
      margin-bottom: 10px;
    }

    .empty-text {
      font-size: 14px;
      color: #999;
    }
  }
}
</style>