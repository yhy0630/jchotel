# Vue2 动态插槽名兼容性解决方案

## 问题描述
在Vue2环境中使用动态插槽名 `:name="dynamicSlotName"` 时，可能会遇到以下错误：
```
v-slot 不支持动态插槽名，请设置 scopedSlotsCompiler 为 augmented
```

## 解决方案

### 方案1：配置Vue编译器（推荐）
在项目根目录创建或修改 `vue.config.js`：

```javascript
module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.esm.js'
      }
    }
  },
  // 设置scopedSlotsCompiler为augmented
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        options.scopedSlotsCompiler = 'augmented'
        return options
      })
  }
}
```

### 方案2：代码层面解决（已实现）
sl-table组件已经修改为兼容写法：

```vue
<!-- 修改前（有问题） -->
<slot :name="cell.slot" :row="tableData[cell.rowIndex]" :cell="cell">

<!-- 修改后（兼容） -->
<template v-for="slotName in slotList" :key="slotName">
  <slot 
    v-if="cell.slot === slotName" 
    :name="slotName" 
    :row="tableData[cell.rowIndex]" 
    :cell="cell">
  </slot>
</template>
```

### 方案3：uni-app项目配置
如果是uni-app项目，在 `manifest.json` 中添加：

```json
{
  "h5": {
    "devServer": {
      "disableHostCheck": true
    }
  },
  "mp-weixin": {
    "setting": {
      "urlCheck": false
    }
  }
}
```

## 使用示例

### Vue2环境
```vue
<template>
  <sl-table :columns="columns" :tableData="data">
    <template slot="customSlot" slot-scope="{ row, cell }">
      <view>{{ row.name }}</view>
    </template>
  </sl-table>
</template>
```

### 微信小程序环境
```vue
<template>
  <sl-table columns="{{columns}}" tableData="{{data}}">
    <template slot="customSlot" slot-scope="{{slotData}}">
      <view>{{slotData.row.name}}</view>
    </template>
  </sl-table>
</template>
```

## 注意事项
1. 确保Vue版本为2.6+
2. 如果使用方案1，需要重启开发服务器
3. 方案2已经内置在组件中，无需额外配置
4. 微信小程序环境建议使用方案2的代码兼容方式

