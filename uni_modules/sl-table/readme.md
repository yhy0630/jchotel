# sl-table

一个支持Vue2和Vue3的高性能表格组件

## 特性

- ✅ **Vue2/Vue3兼容**: 同时支持Vue2和Vue3环境
- ✅ **表头合并**: 支持多级表头和单元格合并
- ✅ **单元格合并**: 支持行合并和列合并
- ✅ **自定义插槽**: 支持单元格自定义内容
- ✅ **响应式**: 自适应不同屏幕尺寸
- ✅ **虚拟滚动**: 支持大量数据的分页加载
- ✅ **样式自定义**: 支持自定义单元格样式
- ✅ **横向滚动**: 支持表格横向滚动，自动处理宽度计算
- ✅ **固定列**: 支持左侧和右侧固定列，滚动时显示阴影提示
- ✅ **动态合并单元格**: 横竖向列合并单元格
- ✅ **单选/多选**: 支持单选和多选表格行

## 兼容性

| Vue版本 | 支持状态 | 说明 |
|---------|----------|------|
| Vue 2.6+ | ✅ 完全支持 | 使用Options API |
| Vue 3.0+ | ✅ 完全支持 | 使用Options API，兼容Composition API |

| 平台 | 支持状态 | 说明 |
|------|----------|------|
| H5 | ✅ 完全支持 | 所有功能正常 |
| 微信小程序 | ✅ 完全支持 | 插槽需要提前注册 |
| App | ✅ 完全支持 | 所有功能正常 |

## 安装

```bash
# 将sl-table文件夹复制到项目的uni_modules目录下，插件中有examples文件夹，可查看示例
```

## 基础用法

### Vue3风格（推荐）
```vue
<template>
  <sl-table 
    :columns="columns" 
    :tableData="tableData"
    @cell-click="handleCellClick"
    :enableLoadMore="true"
    selection="multiple"
    :showRowIndex="true"
    @load-more="handleLoadMore"
    :selectedRows="selectedRows"
    @selection-change="handleSelectionChange"
  >
    <!-- Vue3自定义插槽 -->
    <template #customSlot="{ row, cell }">
      <view class="custom-content">
        {{ row.customField }}
      </view>
    </template>
     <template #empty>
      <view class="empty-content">
        暂无数据插槽展示
      </view>
    </template>
  </sl-table>
</template>
```

### Vue2风格
```vue
<template>
  <sl-table 
    :columns="columns" 
    :tableData="tableData"
    @cell-click="handleCellClick"
    :enableLoadMore="true"
    selection="multiple"
    @load-more="handleLoadMore"
    :selectedRows="selectedRows"
    @selection-change="handleSelectionChange"
  >
    <!-- VUE2自定义插槽 -->
      <template #customSlot="{ row, cell }">
        <view class="custom-slot">
          <text class="highlight">{{ row.customField }}</text>
        </view>
      </template>
  </sl-table>
</template>

<script>
   export default {
    //```你的代码```
    methods:{
      handleLoadMore({pageNum,done}){
        //进行分页获取
        let isLastPage = true  //是否是最后一页
        done(isLastPage)  //结束后一定要执行这个方法，isLastPage默认为false
      },
      handleSelectionChange(e) {
        console.log('选择变化', e)
      }
    }
   }
   
</script>
```

### 固定列

支持左侧和右侧固定列，在横向滚动时固定列会保持可见，并显示阴影提示：

```javascript
columns: [
  {
    label: '姓名',
    prop: 'name',
    width: '100px',
    fixed: 'left'  // 固定在左侧
  },
  {
    label: '年龄',
    prop: 'age',
    width: '80px'
    // 不固定，可横向滚动
  },
  {
    label: '操作',
    prop: 'action',
    width: '100px',
    fixed: 'right'  // 固定在右侧
  }
]
```

**固定列特性**：
- 支持 `fixed: 'left'` 左侧固定
- 支持 `fixed: 'right'` 右侧固定
- 横向滚动时，固定列会显示阴影效果，提示用户有固定列存在
- 左侧固定列在滚动后显示右侧阴影
- 右侧固定列在未滚动到最右时显示左侧阴影

### 横向滚动

表格支持横向滚动，当列宽度总和超过容器宽度时自动启用：

```javascript
columns: [
  {
    label: '列1',
    prop: 'col1',
    width: '200px'  // 固定宽度
  },
  {
    label: '列2',
    prop: 'col2',
    width: '30%'  // 百分比宽度，会自动转换为px
  },
  {
    label: '列3',
    prop: 'col3',
    width: '1fr'  // 自适应宽度
  }
]
```

**宽度说明**：
- 支持 `px`、`rpx`、`%` 等单位
- 百分比宽度会根据容器实际宽度自动转换为 `px`
- 未设置宽度时默认使用 `1fr` 自适应

### 微信小程序插槽注册
在微信小程序中使用自定义插槽时，需要在组件中提前注册插槽：

```vue
<script>
export default {
  data() {
    return {
      columns: [
        {
          label: '姓名',
          prop: 'name',
          width: '30%',
          fixed: 'left',
          headerStyle:{
            backgroundColor: '#f0f0f0',
            color: '#333',
            fontWeight: 'bold',
          },
        },
        {
          label: '自定义',
          prop: 'custom',
          slot: 'customSlot',  // 使用注册的插槽
          width: '70%'
        }
      ],
      tableData: [
        { name: '张三', custom: 'custom data' },
        { name: '李四', custom: 'another data' }
      ]
    }
  }
}
</script>
```

<script>
export default {
  data() {
    return {
      columns: [
        {
          label: '姓名',
          prop: 'name',
          width: '30%',
          fixed: 'left',
          headerStyle:{
            backgroundColor: '#f0f0f0',
            color: '#333',
            fontWeight: 'bold',
          },
        },
        {
          label: '信息',
          width: '70%',
          children: [
            { 
              label: '年龄', 
              prop: 'age',
              width: '50%'
            },
            { 
              label: '自定义', 
              prop: 'custom',
              slot: 'customSlot',
              width: '50%'
            }
          ]
        }
      ],
      tableData: [
        { 
          name: '张三', 
          age: 25,
          custom: 'custom data'
        },
        { 
          name: '李四', 
          age: 30,
          custom: 'another data'
        }
      ]
    }
  },
  methods: {
    handleCellClick(event) {
      console.log('单元格点击:', event)
    }
  }
}
</script>
```

## 高级用法

### 单元格合并

```javascript
tableData: [
  {
    name: '张三',
    info: {
      value: '合并单元格',
      rowspan: 2,  // 跨2行
      colspan: 1,  // 跨1列
      cellStyle:{
        backgroundColor: '#f0f0f0',
        color: '#333',
        fontWeight: 'bold',
      }
    }
  },
  {
    name: '李四',
    info: {
      display: false  // 被合并的单元格设为不显示
    }
  }
]
```

### 自定义样式

```javascript
tableData: [
  {
    name: {
      value: '重要数据',
      cellStyle:{
        backgroundColor: '#f0f0f0',
        color: '#333',
        fontWeight: 'bold',
      }
    }
  }
]
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| columns | 表头配置 | Array | [] |
| tableData | 表格数据 | Array | [] |
| enableLoadMore | 是否开启上拉加载 | Boolean | false |
| useDynamicMergeCellsCol | 是否使用动态横向合并单元格 | Boolean | false |
| useDynamicMergeCellsRow | 是否使用动态竖向合并单元格 | Boolean | false |
| selection | 选择模式：'single' 单选，'multiple' 多选，false 不启用选择 | String\|Boolean | false |
| selectedRows | 已选中的行数据（受控模式），支持传入行数据对象数组、索引数组或键值数组 | Array | [] |
| rowKey | 行的唯一标识字段，如果不提供则使用行索引 | String | null |
| showRowIndex | 是否在表格左侧显示行号列（从1开始） | Boolean | false |
| rowIndexConfig | 行号列配置，如 { width: '60px', label: '序号', fixed: 'left' } | Object | { width: '60px', label: '序号', fixed: 'left' } |

### Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| cell-click | 单元格点击事件 | { rowIndex, colIndex, value, cell } |
| load-more | 上拉加载事件 | {pageNum,done} |
| selection-change | 选择变化事件 | { selectedRowKeys: Array, selectedRows: Array } |

### Columns配置

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| label | 表头显示文本 | String | - |
| prop | 对应数据字段 | String | - |
| width | 列宽度（支持px、rpx、%、1fr） | String | '1fr' |
| fixed | 固定列（'left' 或 'right'） | String | - |
| slot | 自定义插槽名 | String | - |
| children | 子列配置 | Array | - |
| headerStyle | 表头样式 | Object | {} |

### 单元格数据配置

> **注意**：以下带删除线的配置项已废弃，请使用 `cellStyle` 对象来设置单元格样式。

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| value | 显示值 | Any | - |
| rowspan | 行合并数 | Number | 1 |
| colspan | 列合并数 | Number | 1 |
| ~~display~~ | ~~是否显示~~ | ~~Boolean~~ | ~~true~~ |
| ~~backgroundColor~~ | ~~背景色~~ | ~~String~~ | ~~'#fff'~~ |
| ~~textColor~~ | ~~文字颜色~~ | ~~String~~ | ~~'#1A1A1A'~~ |
| ~~bold~~ | ~~是否加粗~~ | ~~Boolean~~ | ~~false~~ |
| cellStyle | 单元格样式 | Object | {} |

## 兼容性处理

组件内部会自动检测Vue版本并进行相应的兼容性处理：

- **生命周期钩子**: 同时支持Vue2的`destroyed`和Vue3的`unmounted`
- **事件声明**: Vue3环境下自动添加`emits`声明
- **响应式数据**: 兼容两个版本的响应式系统

## 注意事项

1. 在uni-app项目中使用时，确保已正确配置easycom
2. **插槽语法**：
   - 请使用 `<template #name="props">` 语法
   - 自定义插槽的作用域数据在两个版本中保持一致
3. **微信小程序特殊要求**：
   - 使用自定义插槽时，必须在组件中提前注册
   - 不支持动态插槽，所有插槽都需要在sl-table页面中静态注册
4. 样式使用scss编写，确保项目支持scss编译
5. 组件会自动检测Vue版本并适配相应的插槽渲染方式

## 更新日志

### v1.5

- ✅ 单选/多选：新增单选和多选功能，支持受控模式（selectedRows）
- ✅ 序号列：新增行号列功能（showRowIndex），支持自定义配置

### v1.4.1

- ✅ 动态合并单元格：支持竖向动态合并单元格

### v1.4

- ✅ 动态合并单元格：支持横向动态合并单元格

### v1.3.3

- ✅ empty插槽：支持空数据插槽配置
- ✅ 更新columns表头样式配置项和tableData单元格样式配置项

### v1.3.1

- ✅ 多级表头：支持到三级表头

### v1.3.0
- ✅ **新增横向滚动支持**：表格支持横向滚动，自动处理宽度计算
- ✅ **新增固定列功能**：支持左侧和右侧固定列
- ✅ **固定列阴影效果**：滚动时固定列显示阴影提示
- ✅ **百分比宽度优化**：百分比宽度自动转换为px，确保精确显示
- ✅ **性能优化**：优化追加数据时的渲染性能，使用样式缓存机制
- ✅ **加载更多优化**：加载更多提示固定在可视区域，不随横向滚动


### v1.2.2
- ✅ 表格体验优化：固定高度场景下表头不参与滚动
- ✅ 功能升级：新增上拉加载能力（需手动引入uni-load-more）

### v1.2.0
- ✅ 新增微信小程序适配支持
- ✅ 优化插槽注册机制
- ✅ 完善小程序平台兼容性

### v1.1.0
- ✅ 新增Vue2/Vue3兼容性支持
- ✅ 优化生命周期钩子处理
- ✅ 改进事件系统兼容性

### v1.0.0
- ✅ 基础表格功能
- ✅ 表头合并支持
- ✅ 单元格合并支持
- ✅ 自定义插槽支持