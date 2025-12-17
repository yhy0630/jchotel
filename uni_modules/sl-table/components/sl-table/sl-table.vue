<template>
  <view class="data-table-wrapper">
    <scroll-view
      class="data-table-container-wrapper"
      :style="{ '--borderWidth': borderWidth + 'px' }"
      :scroll-y="true"
      :scroll-x="true"
      :show-scrollbar="false"
      ref="scrollView"
      :lower-threshold="enableLoadMore ? loadMoreThreshold : 0"
      @scrolltolower="handleScrollToLower"
      @scroll="handleScroll"
      :scroll-left="scrollLeft"
    >
      <view
        class="data-table-container"
        :style="{ width: (allWidth ? allWidth : clientWidth) + 'px' }"
        v-if="clientWidth"
      >
        <!-- 表头 -->
        <Header
          :columns="columns || []"
          :flattenColumns="flattenColumns"
          :containerWidth="clientWidth"
          :scrollLeft_b="scrollLeft_b"
          :allWidth="allWidth"
          :selection="selection"
          :isAllSelected="isAllSelected"
          :indeterminate="indeterminate"
          :showRowIndex="showRowIndex"
          :rowIndexConfig="rowIndexConfig"
          @select-all="handleSelectAll"
          :debug="debug"
        ></Header>
        <!-- 表体 -->
        <view class="body-container">
          <view class="body-scroll" :style="[bodyStyle]">
            <view class="table-wrapper">
              <view class="table-content">
                <template v-if="flattenedCells.length > 0">
                  <view class="table-grid" :style="[gridStyle]">
                    <!-- 渲染所有单元格，选择列已经作为第一列包含在 flattenedCells 中 -->
                    <template v-for="(cell, index) in flattenedCells">
                      <view
                        v-if="
                          enableLoadMore ||
                          pageNum * pageSize * flattenColumns.length > index
                        "
                        class="table-cell"
                        :class="{
                          'selection-cell': cell.isSelection,
                          'row-index-cell': cell.isRowIndex,
                          'merged-cell': cell.rowspan > 1 || cell.colspan > 1,
                          'row-striped': cell.rowIndex % 2 !== 0,
                          'last-col': isLastColumn(cell),
                          'fixed-left-box-shadow':
                            cell.fixed === 'left' && scrollLeft_b > 0,
                          'fixed-right-box-shadow':
                            cell.fixed === 'right' &&
                            scrollLeft_b < allWidth - clientWidth,
                          'selected-row': selection && isRowSelected(getRowKey(cell.rowIndex)),
                        }"
                        :style="[cellStyles(index)]"
                        @click.stop="cell.isSelection ? null : handleCellClick(cell.rowIndex, cell.colIndex, cell)"
                        :key="index"
                      >
                        <!-- 选择列 -->
                        <template v-if="cell.isSelection">
                          <view class="selection-wrapper" @click.stop="handleRowSelect(cell.rowIndex)">
                            <radio
                              v-if="selection === 'single'"
                              :checked="isRowSelected(getRowKey(cell.rowIndex))"
                              :value="getRowKey(cell.rowIndex)"
                              color="#1890ff"
                              style="transform:scale(0.7)"
                              @click.stop="handleRowSelect(cell.rowIndex)"
                            />
                            <checkbox
                              v-else-if="selection === 'multiple'"
                              :checked="isRowSelected(getRowKey(cell.rowIndex))"
                              :value="getRowKey(cell.rowIndex)"
                              color="#1890ff"
                              style="transform:scale(0.7)"
                              @click.stop="handleRowSelect(cell.rowIndex)"
                            />
                          </view>
                        </template>
                        <!-- 行号列 -->
                        <template v-else-if="cell.isRowIndex">
                          <view class="row-index-wrapper">
                            {{ cell.value }}
                          </view>
                        </template>
                        <!-- 数据列 -->
                        <template v-else>
                          <!-- 注：微信小程序暂时无法适配动态插槽名+参数传递，需要将插槽名具象化的注册到组件中，外部用法不变 -->
                          <!-- #ifdef MP-WEIXIN-->
                          <slot
                            name="customSlot"
                            v-if="cell.slot == 'customSlot'"
                            :row="getRowData(cell.rowIndex)"
                            :cell="cell"
                          >
                          </slot>
                          <slot
                            name="customSlot2"
                            v-else-if="cell.slot == 'customSlot2'"
                            :row="getRowData(cell.rowIndex)"
                            :cell="cell"
                          ></slot>
                          <!-- #endif -->

                          <!-- #ifndef MP-WEIXIN-->
                          <template v-if="cell.slot">
                            <slot
                              :name="cell.slot"
                              :row="getRowData(cell.rowIndex)"
                              :cell="cell"
                            >
                            </slot>
                          </template>
                          <!-- #endif -->
                          <template v-else>
                            {{ cell.value }}
                          </template>
                        </template>
                      </view>
                    </template>
                  </view>
                </template>
                <template v-else>
                  <view class="table-noData">
                    <slot name="empty">
                      <text>暂无数据</text>
                    </slot>
                  </view>
                </template>
              </view>
            </view>
          </view>
        </view>
        <!-- 加载更多 - 在最后一条数据后，不跟随横向滚动 -->
        <view
          class="load-more-container"
          v-if="enableLoadMore"
          :style="{ width: clientWidth + 'px' }"
        >
          <view class="load-more-text">
            <uni-load-more
              :status="loadingMore ? 'loading' : isFinish ? 'no-more' : 'more'"
              :iconSize="18"
            ></uni-load-more>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
/**4edfc v
 * 表格组件
 * @author shiliu
 *
 * @props {table} 表格数据,包含表头和表体{
 * columns:[] 表头列表
 * tableData:[] 数据列表
 * }
 *
 * @tips 示例数据
 */
import Header from "./header/index.vue";
// import Body from './body/index.vue'

// Vue版本检测工具函数
const isVue2 = () => {
  const Vue =
    (typeof window !== "undefined" && window.Vue) ||
    (typeof global !== "undefined" && global.Vue);
  return Vue && Vue.version && Vue.version.startsWith("2.");
};

export default {
  name: "SlTable",
  components: {
    Header,
  },
  // Vue3的emits声明（Vue2会忽略此选项）
  emits: ["cell-click", "refresh", "load-more", "selection-change"],
  props: {
    columns: {
      type: Array,
      default: () => [],
    },
    tableData: {
      type: Array,
      default: () => [],
    },
    enableLoadMore: {
      type: Boolean,
      default: false,
    },
    loadMoreThreshold: {
      type: [Number, String],
      default: 100,
    },
    /**
     * 边框宽度
     * @type {Number|String}
     * @default 1
     * @description 边框宽度，单位为px
     */
    borderWidth: {
      type: [Number, String],
      default: 1,
    },
    /**
     * 是否使用动态合并单元格，相邻数据一致就合并，行
     * @type {Boolean}
     * @default true
     * @description 是否使用动态合并单元格，相邻数据一致就合并，行
	 * @tips  目前行合并会出吞囤行的bug，暂时不启用
     */
    useDynamicMergeCellsRow: {
      type: Boolean,
      default: false,
    },
    /**
     * 是否使用动态合并单元格，相邻数据一致就合并，列
     * @type {Boolean}
     * @default true
     * @description 是否使用动态合并单元格，相邻数据一致就合并，列
     */
    useDynamicMergeCellsCol: {
      type: Boolean,
      default: false,
    },
    /**
     * 选择模式
     * @type {String|Boolean}
     * @default false
     * @description 选择模式：'single' 单选，'multiple' 多选，false 不启用选择
     */
    selection: {
      type: [String, Boolean],
      default: false,
      validator: (value) => {
        return value === false || value === 'single' || value === 'multiple';
      },
    },
    /**
     * 已选中的行数据（受控模式）
     * @type {Array}
     * @default []
     * @description 已选中的行数据数组
     */
    selectedRows: {
      type: Array,
      default: () => [],
    },
    /**
     * 行的唯一标识字段
     * @type {String}
     * @default null
     * @description 行的唯一标识字段，如果不提供则使用行索引
     */
    rowKey: {
      type: String,
      default: null,
    },
    /**
     * 是否显示行号列
     * @type {Boolean}
     * @default false
     * @description 是否在表格左侧显示行号列（从1开始）
     */
    showRowIndex: {
      type: Boolean,
      default: false,
    },
    /**
     * 行号列配置
     * @type {Object}
     * @default null
     * @description 行号列的配置项，如 { width: '60px', label: '序号', fixed: 'left' }
     */
    rowIndexConfig: {
      type: Object,
      default: () => ({
        width: '60px',
        label: '序号',
        fixed: 'left',
      }),
    },
    debug: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    slotList() {
      let slotList = [];
      const loop = (columns) => {
        if (!columns || !columns.length) return;
        columns.forEach((item) => {
          if (item.children) {
            loop(item.children);
          }
          if (item.slot) {
            slotList.push(item.slot);
          }
        });
      };
      loop(this.columns);
      return slotList;
    },
    // 微信小程序兼容：将方法转换为计算属性
    gridStyle() {
      if (!this.clientWidth) {
        this.getScrollViewWidth();
      }
      const columnWidths = this.flattenColumns
        .map((col) => {
          const width = col.width || "1fr";
          // 如果是百分比，转换为px
          if (
            typeof width === "string" &&
            width.endsWith("%") &&
            this.clientWidth > 0
          ) {
            const percent = parseFloat(width);
            if (!isNaN(percent)) {
              return `${(this.clientWidth * percent) / 100}px`;
            }
          }
          return width;
        })
        .join(" ");
      return {
        display: "grid",
        gridTemplateColumns: columnWidths,
        width: "100%",
      };
    },
    // 获取显示的行数据
    getDisplayRows() {
      if (this.enableLoadMore) {
        return this.accumulatedData;
      }
      return this.tableData;
    },
    // 半选状态（多选模式下，部分选中时）
    indeterminate() {
      if (this.selection !== 'multiple') return false;
      const totalRows = this.getDisplayRows.length;
      const selectedCount = this.selectedRowKeys.length;
      return selectedCount > 0 && selectedCount < totalRows;
    },
    // 微信小程序兼容：为每个单元格计算样式
    cellStyles() {
      // 返回一个函数，该函数使用缓存来获取样式
      return (index) => {
        // 如果缓存中没有，才计算并缓存
        if (!this._cellStylesCache[index] && this.flattenedCells[index]) {
          this._cellStylesCache[index] = this.getCellStyle(
            this.flattenedCells[index],
            this.flattenedCells[index].colIndex
          );
        }
        return this._cellStylesCache[index] || {};
      };
    },
    bodyStyle() {
      const style = {
        width: "100%",
      };
      return style;
    },
  },
  data() {
    return {
      // multipleSlots: true,
      processedRows: [],
      flattenColumns: [],
      flattenedCells: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      timer: null,
      refresherTriggered: false,
      loadingMore: false,
      // 触摸相关
      touchStartX: 0,
      touchStartY: 0,
      touchDirection: null, // 'horizontal' | 'vertical' | null
      allowScrollX: true,
      allowScrollY: true,
      touchEndTimer: null,
      isFinish: false, // 是否结束上拉加载
      // 上拉加载模式下的累积数据
      accumulatedData: [], // 累积的所有数据
      accumulatedCells: [], // 累积的所有单元格
      currentPage: 1, //可上拉加载时的当前页码
      endIndex: 0, // 结束索引
      clientWidth: 0, //scrollView的实际宽度
      allWidth: 0, //所有列的宽度
      scrollLeft_b: 0, //当前滚动位置
      _cellStylesCache: {}, // 单元格样式缓存
      // 选择相关
      selectedRowKeys: [], // 选中的行键值数组
      isAllSelected: false, // 是否全选（多选模式下）
    };
  },
  created() {
    this.flattenColumns = this.flattenColumnList(this.columns);
  },
  mounted() {
    // Vue2的挂载钩子
    this.$nextTick(() => {
      this.getScrollViewWidth();
    });
  },
  // Vue3的挂载钩子
  onMounted() {
    this.getScrollViewWidth();
  },
  // Vue2和Vue3兼容的生命周期钩子
  beforeDestroy() {
    // Vue2的销毁钩子
    this.cleanup();
  },
  beforeUnmount() {
    // Vue3的销毁钩子
    this.cleanup();
  },
  destroyed() {
    // Vue2的销毁钩子（备用）
    this.cleanup();
  },
  unmounted() {
    // Vue3的销毁钩子（备用）
    this.cleanup();
  },
  methods: {
    // 清理资源的统一方法
    cleanup() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      // 清理触摸相关的定时器
      if (this.touchEndTimer) {
        clearTimeout(this.touchEndTimer);
        this.touchEndTimer = null;
      }
    },
    // 检查插槽是否存在的兼容方法
    hasSlot(slotName) {
      // Vue2检查方式
      if (this.$scopedSlots && this.$scopedSlots[slotName]) {
        return true;
      }
      // Vue3检查方式
      if (this.$slots && this.$slots[slotName]) {
        return true;
      }
      // 兜底检查
      return false;
    },
    /**
     * 获取插槽数据
     * @param slotName 插槽名称
     * @returns {Object} 插槽数据
     */
    getSlotData(slotName) {
      // 这个方法用于获取对应插槽的数据
      return {
        row: this.tableData,
        column: this.columns.find((col) => col.slot === slotName),
      };
    },
    /**
     * 扁平化列列表
     * @param columns 列列表
     * @returns {Array} 扁平化后的列列表
     */
    flattenColumnList(columns) {
      const result = [];
      const flatten = (cols, parent) => {
        cols.forEach((col) => {
          if (col.children && col.children.length) {
            flatten(col.children, col);
          } else {
            // 获取 fixed 属性，优先使用自身的，如果没有则使用父级的
            const fixed = col.fixed || parent?.fixed;
            if (parent?.width && col?.width) {
              let pWidth = Number(parent.width.split("%")[0]) * 0.01;
              let cWidth = Number(col.width.split("%")[0]) * 0.01;
              result.push({
                ...col,
                fixed: fixed, // 传递 fixed 属性
                width: pWidth * cWidth * 100 + "%",
              });
            } else {
              result.push({
                ...col,
                fixed: fixed, // 传递 fixed 属性
              });
            }
            // result.push(col)
          }
        });
      };
      flatten(columns, null);
      
      // 如果启用选择，在最前面添加选择列
      if (this.selection) {
        result.unshift({
          prop: '__selection__',
          label: '',
          width: '50px',
          fixed: 'left',
          isSelection: true,
        });
      }
      
      // 如果启用行号显示，在选择列之后添加行号列
      if (this.showRowIndex) {
        const rowIndexCol = {
          prop: '__rowIndex__',
          label: this.rowIndexConfig?.label || '序号',
          width: this.rowIndexConfig?.width || '60px',
          fixed: this.rowIndexConfig?.fixed || 'left',
          isRowIndex: true,
        };
        // 如果启用了选择，行号列插入到选择列之后；否则插入到最前面
        if (this.selection) {
          result.splice(1, 0, rowIndexCol);
        } else {
          result.unshift(rowIndexCol);
        }
      }
      
      return result;
    },
    /**
     * 获取列宽
     * @param colIndex 列索引
     * @returns {string} 列宽
     */
    getColumnWidth(colIndex) {
      return this.flattenColumns[colIndex]?.width || "auto";
    },
    /**
     * 判断是否是最后一列
     * @param cell 单元格
     * @returns {boolean} 是否是最后一列
     */
    isLastColumn(cell) {
      if (!cell) return false;
      const lastIndex = this.flattenColumns.length - 1;
      if (lastIndex < 0) return false;
      const endIndex = cell.colIndex + (cell.colspan || 1) - 1;
      return endIndex >= lastIndex;
    },
    /**
     * 处理表格数据
     * @param data 数据
     * @param isAppend 是否追加数据
     */
    processTableData(data, isAppend = false) {
      // 如果是上拉加载模式，且是追加数据
      if (this.enableLoadMore && isAppend) {
        // 追加模式：将新数据追加到累积数据
        const startRowIndex = this.accumulatedData.length;
        // 追加新数据到累积列表
        this.accumulatedData = [...this.accumulatedData, ...data];

        // 只处理新增的数据部分
        const newRows = data.length;
        const cols = this.flattenColumns.length;
        const totalRows = this.accumulatedData.length;

        // 初始化新增部分的表格数据
        let newTable = Array(newRows)
          .fill()
          .map(() =>
            Array(cols)
              .fill()
              .map(() => ({
                value: "",
                rowspan: 1,
                colspan: 1,
                display: true,
              }))
          );

        // 处理新增数据和合并
        data.forEach((row, relativeRowIndex) => {
          const absoluteRowIndex = startRowIndex + relativeRowIndex;
          this.flattenColumns.forEach((col, colIndex) => {
            // 如果是选择列，特殊处理
            if (col.isSelection) {
              newTable[relativeRowIndex][colIndex] = {
                value: '',
                rowspan: 1,
                colspan: 1,
                display: true,
                rowIndex: absoluteRowIndex,
                colIndex,
                isSelection: true,
                fixed: col.fixed,
              };
              return;
            }
            
            // 如果是行号列，特殊处理
            if (col.isRowIndex) {
              newTable[relativeRowIndex][colIndex] = {
                value: absoluteRowIndex + 1, // 行号从1开始
                rowspan: 1,
                colspan: 1,
                display: true,
                rowIndex: absoluteRowIndex,
                colIndex,
                isRowIndex: true,
                fixed: col.fixed,
              };
              return;
            }
            
            const cellData = row[col.prop];
            if (typeof cellData === "object" && cellData !== null) {
              // 设置当前单元格
              newTable[relativeRowIndex][colIndex] = {
                ...cellData,
                value: cellData.value,
                rowspan: cellData.rowspan || 1,
                colspan: cellData.colspan || 1,
                display: cellData.display !== false,
                rowIndex: absoluteRowIndex, // 使用绝对行索引
                colIndex,
                slot: col.slot,
                fixed: col.fixed,
              };

              // 处理行合并
              if (cellData.rowspan > 1) {
                for (let i = 1; i < cellData.rowspan; i++) {
                  if (relativeRowIndex + i < newRows) {
                    newTable[relativeRowIndex + i][colIndex] = {
                      ...newTable[relativeRowIndex + i][colIndex],
                      display: false,
                    };
                  }
                }
              }

              // 处理列合并
              if (cellData.colspan > 1) {
                for (let i = 1; i < cellData.colspan; i++) {
                  if (colIndex + i < cols) {
                    newTable[relativeRowIndex][colIndex + i] = {
                      ...newTable[relativeRowIndex][colIndex + i],
                      display: false,
                    };
                  }
                }
              }
            } else {
              newTable[relativeRowIndex][colIndex] = {
                value: cellData,
                rowspan: 1,
                colspan: 1,
                display: true,
                rowIndex: absoluteRowIndex, // 使用绝对行索引
                colIndex,
                slot: col.slot,
                fixed: col.fixed,
              };
            }
          });
        });

        // 如果启用动态合并单元格，则处理动态合并
        if (this.useDynamicMergeCellsRow || this.useDynamicMergeCellsCol) {
          // 先合并新增数据内部
          this.applyDynamicMergeCells(newTable, newRows, cols);

          // 检查新增数据的第一行与之前数据的最后一行是否可以合并（跨页合并）
          if (startRowIndex > 0 && this.accumulatedCells.length > 0) {
            this.mergeWithPreviousPage(newTable, startRowIndex, cols);
          }
        }

        // 将新增的单元格追加到累积列表
        const newCells = newTable.flat().filter((cell) => cell.display);
        // 直接使用 push 方法追加，避免创建新数组，提高性能
        const startCellIndex = this.accumulatedCells.length;
        this.accumulatedCells.push(...newCells);
        // 只更新新增单元格的样式缓存，避免重新计算所有单元格
        newCells.forEach((cell, relativeIndex) => {
          const absoluteIndex = startCellIndex + relativeIndex;
          this._cellStylesCache[absoluteIndex] = this.getCellStyle(
            cell,
            cell.colIndex
          );
        });
        // 更新之前最后一行的单元格样式，因为现在它们不再是最后一行了，需要补齐底部border
        const previousLastRowIndex = startRowIndex - 1;
        if (previousLastRowIndex >= 0) {
          this.accumulatedCells.forEach((cell, cellIndex) => {
            if (cell.rowIndex === previousLastRowIndex && cell.display) {
              // 重新计算样式，因为现在不再是最后一行了
              this._cellStylesCache[cellIndex] = this.getCellStyle(
                cell,
                cell.colIndex
              );
            }
          });
        }
        // 直接更新，不需要 $nextTick，因为已经优化了样式计算
        this.flattenedCells = this.accumulatedCells;
      } else {
        // 非追加模式：重新处理所有数据（一次性加载或首次加载）
        if (this.enableLoadMore) {
          // 上拉加载模式下的首次加载，初始化累积数据
          this.accumulatedData = [...data];
          this.accumulatedCells = [];
        }

        const rows = data.length;
        const cols = this.flattenColumns.length;
        // 初始化表格数据
        let table = Array(rows)
          .fill()
          .map(() =>
            Array(cols)
              .fill()
              .map(() => ({
                value: "",
                rowspan: 1,
                colspan: 1,
                display: true,
              }))
          );
        // 处理数据和合并
        data.forEach((row, rowIndex) => {
          this.flattenColumns.forEach((col, colIndex) => {
            // 如果是选择列，特殊处理
            if (col.isSelection) {
              table[rowIndex][colIndex] = {
                value: '',
                rowspan: 1,
                colspan: 1,
                display: true,
                rowIndex,
                colIndex,
                isSelection: true,
                fixed: col.fixed,
              };
              return;
            }
            
            // 如果是行号列，特殊处理
            if (col.isRowIndex) {
              table[rowIndex][colIndex] = {
                value: rowIndex + 1, // 行号从1开始
                rowspan: 1,
                colspan: 1,
                display: true,
                rowIndex,
                colIndex,
                isRowIndex: true,
                fixed: col.fixed,
              };
              return;
            }
            
            const cellData = row[col.prop];
            if (typeof cellData === "object" && cellData !== null) {
              // 设置当前单元格
              table[rowIndex][colIndex] = {
                ...cellData,
                value: cellData.value,
                rowspan: cellData.rowspan || 1,
                colspan: cellData.colspan || 1,
                display: cellData.display !== false, // 明确检查 display 属性
                rowIndex,
                colIndex,
                slot: col.slot,
                fixed: col.fixed,
              };

              // 处理行合并，将被合并的单元格设置为不显示
              if (cellData.rowspan > 1) {
                for (let i = 1; i < cellData.rowspan; i++) {
                  if (rowIndex + i < rows) {
                    table[rowIndex + i][colIndex] = {
                      ...table[rowIndex + i][colIndex],
                      display: false,
                    };
                  }
                }
              }

              // 处理列合并，将被合并的单元格设置为不显示
              if (cellData.colspan > 1) {
                for (let i = 1; i < cellData.colspan; i++) {
                  if (colIndex + i < cols) {
                    table[rowIndex][colIndex + i] = {
                      ...table[rowIndex][colIndex + i],
                      display: false,
                    };
                  }
                }
              }
            } else {
              table[rowIndex][colIndex] = {
                value: cellData,
                rowspan: 1,
                colspan: 1,
                display: true,
                rowIndex,
                colIndex,
                slot: col.slot,
                fixed: col.fixed,
              };
            }
          });
        });

        // 如果启用动态合并单元格，则处理动态合并
        if (this.useDynamicMergeCellsRow || this.useDynamicMergeCellsCol) {
          this.applyDynamicMergeCells(table, rows, cols);
        }

        this.debug && console.log(table);
        // 将二维数组扁平化，并过滤掉不显示的单元格
        const cells = table.flat().filter((cell) => cell.display);

        // 清空样式缓存，重新计算
        this._cellStylesCache = {};

        if (this.enableLoadMore) {
          // 上拉加载模式：保存到累积列表
          this.accumulatedCells = cells;
          this.flattenedCells = this.accumulatedCells;
        } else {
          // 一次性加载模式：直接使用，并启用内部分页
          this.flattenedCells = cells;
          // 启动内部分页定时器
          if (this.timer) {
            clearInterval(this.timer);
          }
          this.timer = setInterval(() => {
            if (
              this.flattenedCells.length >
              this.pageNum * this.pageSize * this.flattenColumns.length
            ) {
              this.pageNum++;
            }
          }, 500);
        }
      }
    },
    /**
     * 合并新增数据与上一页数据（跨页合并）
     * @param newTable 新增数据的表格二维数组
     * @param startRowIndex 新增数据的起始行索引（绝对索引）
     * @param cols 列数
     */
    mergeWithPreviousPage(newTable, startRowIndex, cols) {
      const previousLastRowIndex = startRowIndex - 1;

      // 遍历每一列
      for (let colIndex = 0; colIndex < cols; colIndex++) {
        // 找到上一页最后一行的对应单元格
        const previousCell = this.accumulatedCells.find(
          (cell) =>
            cell.rowIndex === previousLastRowIndex &&
            cell.colIndex === colIndex &&
            cell.display
        );

        // 如果找不到上一页的单元格，跳过
        if (!previousCell) continue;

        // 获取新增数据第一行的对应单元格
        const newFirstRowCell = newTable[0] && newTable[0][colIndex];
        if (!newFirstRowCell || !newFirstRowCell.display) continue;

        // 比较值是否相同
        const prevValue = String(previousCell.value || "").trim();
        const currentValue = String(newFirstRowCell.value || "").trim();

        // 如果值相同，则合并
        if (prevValue === currentValue && prevValue !== "") {
          // 增加上一页单元格的 rowspan
          if (!previousCell.rowspan) {
            previousCell.rowspan = 1;
          }
          previousCell.rowspan++;

          // 隐藏新增数据第一行的对应单元格
          newFirstRowCell.display = false;
          newFirstRowCell.rowspan = 1;
          newFirstRowCell.colspan = 1;

          // 更新上一页单元格的样式缓存
          const previousCellIndex = this.accumulatedCells.findIndex(
            (cell) => cell === previousCell
          );
          if (previousCellIndex >= 0) {
            this._cellStylesCache[previousCellIndex] = this.getCellStyle(
              previousCell,
              previousCell.colIndex
            );
          }
        }
      }
    },
    /**
     * 应用动态合并单元格
     * 检测相邻单元格的值是否相同，如果相同则自动合并
     * @param table 表格二维数组
     * @param rows 行数
     * @param cols 列数
     */
    applyDynamicMergeCells(table, rows, cols) {
      if (this.useDynamicMergeCellsRow) {
        // 按列遍历，检测相邻行的值是否相同
        for (let colIndex = 0; colIndex < cols; colIndex++) {
          let startRow = 0; // 当前合并组的起始行

          for (let rowIndex = 1; rowIndex < rows; rowIndex++) {
            const prevCell = table[startRow][colIndex];
            const currentCell = table[rowIndex][colIndex];

            // 跳过已经被手动合并的单元格（display: false）
            if (!currentCell.display) {
              // 如果当前单元格已被隐藏，说明它被手动合并了
              // 需要找到下一个可见的单元格作为新的起始行
              startRow = rowIndex;
              continue;
            }

            // 如果前一个单元格已被隐藏，说明它被手动合并了，不能用于动态合并
            if (!prevCell.display) {
              startRow = rowIndex;
              continue;
            }

            // 比较相邻单元格的值（转换为字符串进行比较，支持各种类型）
            const prevValue = String(prevCell.value || "").trim();
            const currentValue = String(currentCell.value || "").trim();

            // 如果值相同，则合并
            if (prevValue === currentValue && prevValue !== "") {
              // 增加起始单元格的 rowspan
              if (!table[startRow][colIndex].rowspan) {
                table[startRow][colIndex].rowspan = 1;
              }
              table[startRow][colIndex].rowspan++;

              // 隐藏当前单元格
              currentCell.display = false;
              // 保持当前单元格的其他属性，但标记为不显示
              currentCell.rowspan = 1;
              currentCell.colspan = 1;
            } else {
              // 值不同，开始新的合并组
              startRow = rowIndex;
            }
          }
        }
      }
      if (this.useDynamicMergeCellsCol) {
        // 第二步：按行遍历，检测相邻列的值是否相同（列合并）
        for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
          let startCol = 0; // 当前合并组的起始列

          for (let colIndex = 1; colIndex < cols; colIndex++) {
            const prevCell = table[rowIndex][startCol];
            const currentCell = table[rowIndex][colIndex];

            // 跳过已经被手动合并或行合并的单元格（display: false）
            if (!currentCell.display) {
              // 如果当前单元格已被隐藏，说明它被手动合并或行合并了
              // 需要找到下一个可见的单元格作为新的起始列
              startCol = colIndex;
              continue;
            }

            // 如果前一个单元格已被隐藏，说明它被手动合并或行合并了，不能用于列合并
            if (!prevCell.display) {
              startCol = colIndex;
              continue;
            }

            // 比较相邻单元格的值（转换为字符串进行比较，支持各种类型）
            const prevValue = String(prevCell.value || "").trim();
            const currentValue = String(currentCell.value || "").trim();

            // 如果值相同，则合并
            if (prevValue === currentValue && prevValue !== "") {
              // 增加起始单元格的 colspan
              if (!table[rowIndex][startCol].colspan) {
                table[rowIndex][startCol].colspan = 1;
              }
              table[rowIndex][startCol].colspan++;

              // 隐藏当前单元格
              currentCell.display = false;
              // 保持当前单元格的其他属性，但标记为不显示
              currentCell.rowspan = 1;
              currentCell.colspan = 1;
            } else {
              // 值不同，开始新的合并组
              startCol = colIndex;
            }
          }
        }
      }
    },
    /**
     * 获取单元格样式
     * @param cell 单元格
     * @param colIndex 列索引
     * @returns {Object} 单元格样式
     */
    getCellStyle(cell, colIndex) {
      const columnMeta = this.flattenColumns[colIndex] || {};
      const baseWidth = this.getColumnWidth(colIndex);
      let width = baseWidth;

      // 处理列合并的宽度
      if (cell.colspan > 1) {
        const colWidths = [];
        for (let i = 0; i < cell.colspan; i++) {
          colWidths.push(this.getColumnWidth(colIndex + i) || "100px");
        }
        width =
          colWidths.reduce((sum, w) => {
            const numWidth = parseInt(w);
            return sum + (isNaN(numWidth) ? 100 : numWidth);
          }, 0) + "px";
      }

      // 判断是否是 fixed='right' 的列
      const isFixedRight = columnMeta.fixed === "right";
      // 判断是否是挨着 fixed='right' 列最近的左侧列
      const isAdjacentToFixedRight = this.isAdjacentToFixedRight(colIndex);

      // 判断是否是最后一行
      const totalRows = this.enableLoadMore
        ? this.accumulatedData.length
        : this.tableData.length;
      const isLastRow =
        cell.rowIndex !== undefined && cell.rowIndex === totalRows - 1;
      
      return {
        //   width: width,
        flex: baseWidth ? "none" : "1",
        gridRow: `span ${cell.rowspan}`,
        gridColumn: `span ${cell.colspan}`,
        position: columnMeta.fixed ? "sticky" : "static",
        left:
          columnMeta.fixed === "left"
            ? this.getStickyOffset(colIndex, "left", cell.colspan)
            : "auto",
        right:
          columnMeta.fixed === "right"
            ? this.getStickyOffset(colIndex, "right", cell.colspan)
            : "auto",
        zIndex: columnMeta.fixed ? 2 : 1,
        borderLeft: isFixedRight ? "1px solid #E7EAF2" : undefined,
        borderRight: isAdjacentToFixedRight ? "none" : undefined,
        // 合并样式
        ...(cell.cellStyle || {}),
        //兼容老版本数据
        backgroundColor: cell.backgroundColor || "#fff",
        color: cell.textColor || "#1A1A1A",
        fontWeight: cell.bold ? "bold" : "normal",
        display: cell.display ? "flex" : "none",
        // borderBottom: isLastRow ? 'none' : undefined
      };
    },
    // 判断当前列是否是挨着 fixed='right' 列最近的左侧列
    isAdjacentToFixedRight(colIndex) {
      const nextColIndex = colIndex + 1;
      if (nextColIndex >= this.flattenColumns.length) {
        return false;
      }
      const currentCol = this.flattenColumns[colIndex] || {};
      const nextCol = this.flattenColumns[nextColIndex] || {};
      // 当前列不是 fixed，且下一列是 fixed='right'
      return !currentCol.fixed && nextCol.fixed === "right";
    },
    /**
     * 解析宽度
     * @param widthStr 宽度字符串
     * @returns {Object} 宽度对象
     */
    parseWidth(widthStr) {
      if (!widthStr) {
        return {
          percent: 0,
          px: 0,
          valid: false,
        };
      }
      const normalized = String(widthStr).trim();
      const numericValue = parseFloat(normalized);
      if (Number.isNaN(numericValue)) {
        return {
          percent: 0,
          px: 0,
          valid: false,
        };
      }

      if (normalized.endsWith("%")) {
        return {
          percent: numericValue,
          px: 0,
          valid: true,
        };
      }

      if (normalized.endsWith("rpx")) {
        if (typeof uni !== "undefined" && typeof uni.upx2px === "function") {
          return {
            percent: 0,
            px: uni.upx2px(numericValue),
            valid: true,
          };
        }
        return {
          percent: 0,
          px: numericValue,
          valid: true,
        };
      }

      if (normalized.endsWith("px")) {
        return {
          percent: 0,
          px: numericValue,
          valid: true,
        };
      }

      return {
        percent: 0,
        px: 0,
        valid: false,
      };
    },
    /**
     * 获取固定列的偏移量
     * @param colIndex 列索引
     * @param direction 方向
     * @param colspan 合并列数
     * @returns {string} 偏移量
     */
    getStickyOffset(colIndex, direction = "left", colspan = 1) {
      const columns = this.flattenColumns || [];
      if (!columns.length) return "0px";

      let percent = 0;
      let px = 0;

      if (direction === "left") {
        for (let i = 0; i < colIndex; i++) {
          const colWidth = columns[i]?.width;
          if (!colWidth) continue;
          
          // 如果是百分比，需要转换为px（使用容器宽度）
          if (typeof colWidth === 'string' && colWidth.endsWith('%') && this.clientWidth > 0) {
            const percentValue = parseFloat(colWidth);
            if (!isNaN(percentValue)) {
              px += (this.clientWidth * percentValue / 100);
            }
          } else {
            const { percent: p, px: x } = this.parseWidth(colWidth);
            percent += p;
            px += x;
          }
        }
      } else {
        for (let i = colIndex + colspan; i < columns.length; i++) {
          const colWidth = columns[i]?.width;
          if (!colWidth) continue;
          
          // 如果是百分比，需要转换为px（使用容器宽度）
          if (typeof colWidth === 'string' && colWidth.endsWith('%') && this.clientWidth > 0) {
            const percentValue = parseFloat(colWidth);
            if (!isNaN(percentValue)) {
              px += (this.clientWidth * percentValue / 100);
            }
          } else {
            const { percent: p, px: x } = this.parseWidth(colWidth);
            percent += p;
            px += x;
          }
        }
      }

      if (percent && px) {
        return `calc(${percent}% + ${px}px)`;
      }

      if (percent) {
        return `${percent}%`;
      }

      return `${px}px`;
    },
    /**
     * 完成加载更多
     * @param isFinish 是否完成
     */
    finishLoadMore(isFinish = false) {
      this.loadingMore = false;
      this.isFinish = isFinish;
    },

    /**
     * 处理单元格点击
     * @param rowIndex 行索引
     * @param colIndex 列索引
     * @param cell 单元格
     */
    handleCellClick(rowIndex, colIndex, cell) {
      this.$emit("cell-click", {
        rowIndex,
        colIndex,
        value: cell.value,
        cell,
      });
    },
    /**
     * 获取行的唯一键值
     * @param rowIndex 行索引
     * @returns {String|Number} 行的唯一键值
     */
    getRowKey(rowIndex) {
      const rowData = this.getRowData(rowIndex);
      if (this.rowKey && rowData && rowData[this.rowKey] !== undefined) {
        return rowData[this.rowKey];
      }
      return rowIndex;
    },
    /**
     * 判断行是否被选中
     * @param rowKey 行的唯一键值
     * @returns {Boolean} 是否被选中
     */
    isRowSelected(rowKey) {
      return this.selectedRowKeys.includes(rowKey);
    },
    /**
     * 处理行选择
     * @param rowIndex 行索引
     */
    handleRowSelect(rowIndex) {
      const rowKey = this.getRowKey(rowIndex);
      const rowData = this.getRowData(rowIndex);
      
      if (this.selection === 'single') {
        // 单选模式：如果已选中则不处理（不允许取消），否则选中当前行
        if (!this.isRowSelected(rowKey)) {
          this.selectedRowKeys = [rowKey];
          // 触发选择变化事件
          this.emitSelectionChange();
        }
      } else if (this.selection === 'multiple') {
        // 多选模式
        const index = this.selectedRowKeys.indexOf(rowKey);
        if (index > -1) {
          // 如果已选中，取消选中
          this.selectedRowKeys.splice(index, 1);
        } else {
          // 选中当前行
          this.selectedRowKeys.push(rowKey);
        }
        // 更新全选状态
        this.updateSelectAllState();
        // 触发选择变化事件
        this.emitSelectionChange();
      }
    },
    /**
     * 处理全选
     * @param checked 是否选中
     */
    handleSelectAll(checked) {
      if (this.selection !== 'multiple') return;
      
      const displayRows = this.getDisplayRows;
      if (checked) {
        // 全选：选中所有行
        const allKeys = [];
        for (let index = 0; index < displayRows.length; index++) {
          const rowKey = this.getRowKey(index);
          // 避免重复添加相同的键值
          if (!allKeys.includes(rowKey)) {
            allKeys.push(rowKey);
          }
        }
        this.selectedRowKeys = [...allKeys];
      } else {
        // 取消全选
        this.selectedRowKeys = [];
      }
      
      // 更新全选状态（而不是直接设置，确保状态准确）
      this.updateSelectAllState();
      // 触发选择变化事件
      this.emitSelectionChange();
    },
    /**
     * 更新全选状态
     */
    updateSelectAllState() {
      if (this.selection !== 'multiple') return;
      const displayRows = this.getDisplayRows;
      const totalRows = displayRows.length;
      
      if (totalRows === 0) {
        this.isAllSelected = false;
        return;
      }
      
      // 检查所有行的键值是否都在 selectedRowKeys 中
      let allSelected = true;
      for (let index = 0; index < totalRows; index++) {
        const rowKey = this.getRowKey(index);
        if (!this.selectedRowKeys.includes(rowKey)) {
          allSelected = false;
          break;
        }
      }
      
      this.isAllSelected = allSelected;
    },
    /**
     * 触发选择变化事件
     */
    emitSelectionChange() {
      const displayRows = this.getDisplayRows;
      const selectedRows = this.selectedRowKeys.map(key => {
        // 遍历所有行，找到匹配的行索引
        for (let index = 0; index < displayRows.length; index++) {
          if (this.getRowKey(index) === key) {
            return this.getRowData(index);
          }
        }
        return null;
      }).filter(row => row !== null);
      
      this.$emit('selection-change', {
        selectedRowKeys: [...this.selectedRowKeys],
        selectedRows: selectedRows,
      });
    },
    /**
     * 同步 selectedRows prop 到 selectedRowKeys
     */
    syncSelectedRows() {
      if (!this.selectedRows || !Array.isArray(this.selectedRows) || this.selectedRows.length === 0) {
        this.selectedRowKeys = [];
        this.isAllSelected = false;
        return;
      }
      
      const displayRows = this.getDisplayRows;
      if (!displayRows || displayRows.length === 0) {
        // 如果数据还没有加载，先清空选中状态
        this.selectedRowKeys = [];
        this.isAllSelected = false;
        return;
      }
      
      // 根据 selectedRows 更新 selectedRowKeys
      this.selectedRowKeys = this.selectedRows.map(row => {
        // 如果 row 是基本类型（数字、字符串）
        if (typeof row === 'number' || typeof row === 'string') {
          // 如果有 rowKey，尝试从数据中找到对应的行（row 作为键值）
          if (this.rowKey) {
            for (let i = 0; i < displayRows.length; i++) {
              const rowData = displayRows[i];
              if (rowData && rowData[this.rowKey] === row) {
                return this.getRowKey(i);
              }
            }
            // 如果找不到，返回 null
            return null;
          }
          // 如果没有 rowKey，将 row 作为索引处理
          const index = typeof row === 'number' ? row : parseInt(row);
          if (index >= 0 && index < displayRows.length) {
            return this.getRowKey(index);
          }
          // 如果索引无效，返回 null
          return null;
        }
        // 如果 row 是对象，尝试获取其键值
        if (this.rowKey && row[this.rowKey] !== undefined) {
          // 找到对应的行索引
          const rowIndex = displayRows.findIndex(r => {
            if (this.rowKey) {
              return r && r[this.rowKey] === row[this.rowKey];
            }
            return r === row;
          });
          return rowIndex >= 0 ? this.getRowKey(rowIndex) : null;
        }
        // 如果没有 rowKey，尝试从 tableData 中找到对应的索引（通过对象引用比较）
        const rowIndex = displayRows.findIndex(r => r === row);
        return rowIndex >= 0 ? this.getRowKey(rowIndex) : null;
      }).filter(key => key !== null);
      
      this.updateSelectAllState();
    },
    /**
     * 获取行数据，支持上拉加载模式的累积数据
     * @param rowIndex 行索引
     * @returns {Object} 行数据
     */
    getRowData(rowIndex) {
      if (this.enableLoadMore && this.accumulatedData.length > 0) {
        return this.accumulatedData[rowIndex] || null;
      }
      return this.tableData[rowIndex] || null;
    },
    /**
     * 处理滚动到底部
     */
    handleScrollToLower() {
      this.debug && console.log(this.enableLoadMore, this.loadingMore, this.isFinish);
      if (!this.enableLoadMore || this.loadingMore || this.isFinish) return;
      this.debug && console.log("handleScrollToLower");
      this.loadingMore = true;
      this.currentPage++;
      this.endIndex = [...this.tableData].length;
      this.$emit("load-more", {
        currentPage: this.currentPage,
        done: (isFinish) => {
          this.finishLoadMore(isFinish);
        },
      });
    },
    /**
     * 处理滚动
     * @param e 滚动事件
     */
    handleScroll(e) {
      // 获取scrollView的实际宽度（不是scrollWidth，而是容器的clientWidth）
      // if (!this.clientWidth) {
      // 	this.getScrollViewWidth()
      // }
      this.allWidth = e.detail.scrollWidth;
      // 更新滚动位置,添加防抖
      this.timer && clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.scrollLeft_b = e.detail.scrollLeft;
      }, 50);
    },
    /**
     * 获取scrollView的实际宽度
     */
    getScrollViewWidth() {
      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(this);
        query
          .select(".data-table-wrapper")
          .boundingClientRect((data) => {
            if (data && data.width && data.width > 0) {
              this.clientWidth = data.width - this.borderWidth * 2;
            }
          })
          .exec();
      });
    },
    /**
     * 获取宽度
     * @returns {string} 宽度
     */
    getWidth() {
      // return "calc(430px + 90px + 75%)"
      // return "calc(175%)"
      // 获取所有列的宽度，列的宽度单位可能是百分比、rpx、px；
      // 当列未设置宽度时，默认使用 100%
      if (!this.flattenColumns || !this.flattenColumns.length) {
        return "100%";
      }

      let totalPx = 0;
      let totalPercent = 0;
      let hasPercentWidth = false;
      let shouldFallbackToFullWidth = false;

      this.flattenColumns.forEach((col) => {
        const colWidth = col?.width;

        if (!colWidth) {
          shouldFallbackToFullWidth = true;
          return;
        }

        const widthStr = String(colWidth).trim();
        const numericValue = parseFloat(widthStr);

        if (Number.isNaN(numericValue)) {
          shouldFallbackToFullWidth = true;
          return;
        }

        if (widthStr.endsWith("%")) {
          hasPercentWidth = true;
          totalPercent += numericValue;
        } else if (widthStr.endsWith("rpx")) {
          if (typeof uni !== "undefined" && typeof uni.upx2px === "function") {
            totalPx += uni.upx2px(numericValue);
          } else {
            totalPx += numericValue;
          }
        } else if (widthStr.endsWith("px")) {
          totalPx += numericValue;
        } else {
          shouldFallbackToFullWidth = true;
        }
      });

      if (shouldFallbackToFullWidth) {
        return "100%";
      }

      if (hasPercentWidth) {
        const percentWidth = totalPercent || 100;
        return `${percentWidth}%`;
      }

      // return `${totalPx || 0}px`
    },
    loadMoreComplate(flag) {
      this.isFinish = flag;
    },
  },
  watch: {
    tableData: {
      immediate: true,
      deep: true,
      handler(newVal, oldVal) {
        // 判断是否是追加数据（上拉加载模式）
        let isAppend = this.enableLoadMore && this.currentPage > 1;
        // if (this.enableLoadMore && oldVal && oldVal.length > 0 && newVal.length > oldVal.length) {
        // 	// 检查新数据的前部分是否与旧数据相同（追加模式的特征）
        // 	// 使用更宽松的判断：检查前几条数据是否相同
        // 	const checkLength = Math.min(oldVal.length, 5) // 至少检查前5条
        // 	const oldSlice = oldVal.slice(0, checkLength)
        // 	const newSlice = newVal.slice(0, checkLength)
        // 	if (JSON.stringify(oldSlice) === JSON.stringify(newSlice)) {
        // 		// 进一步确认：新数据包含所有旧数据
        // 		const oldLastItem = oldVal[oldVal.length - 1]
        // 		const newOldLastIndex = newVal.findIndex(item => JSON.stringify(item) === JSON.stringify(oldLastItem))
        // 		if (newOldLastIndex === oldVal.length - 1) {
        // 			isAppend = true
        // 		}
        // 	}
        // }
        this.debug && console.log(isAppend);
        if (!isAppend) {
          // 非追加模式：重置分页和累积数据
          this.pageNum = 1;
          this.endIndex = 0;
          this.currentPage = 1;
          this.isFinish = false;
          if (this.timer) {
            clearInterval(this.timer);
          }
          this.timer = null;
          if (this.enableLoadMore) {
            // 上拉加载模式：重置累积数据
            this.accumulatedData = [];
            this.accumulatedCells = [];
            this._cellStylesCache = {};
          }
        }

        // 处理数据（追加或重新处理）
        if (isAppend) {
          // 追加模式：只处理最新一页的数据
          this.debug && console.log(newVal.length, oldVal.length);
          const newData = newVal.slice(this.endIndex);
          this.debug && console.log(newData, this.endIndex);
          this.$nextTick(() => {
            this.processTableData(newData, true);
            // 数据加载完成后，重新同步选中状态
            this.syncSelectedRows();
          });
        } else {
          // 非追加模式：处理所有数据
          this.$nextTick(() => {
            this.processTableData(newVal, false);
            // 数据加载完成后，重新同步选中状态
            this.syncSelectedRows();
          });
        }
      },
    },
    columns: {
      handler(newVal) {
        this.flattenColumns = this.flattenColumnList(newVal);
        // 列变化时，重新获取宽度
        this.scrollLeft = 1;
        this.$nextTick(() => {
          this.getScrollViewWidth();
          this.scrollLeft = 0;
        });
        // 列变化时，如果是上拉加载模式，使用累积数据重新处理
        if (this.enableLoadMore && this.accumulatedData.length > 0) {
          this.$nextTick(() => {
            this.processTableData(this.accumulatedData, false);
          });
        } else {
          this.$nextTick(() => {
            this.processTableData(this.tableData, false);
          });
        }
        this.finishLoadMore();
      },
      immediate: true,
    },
    // 监听受控模式下的 selectedRows
    selectedRows: {
      handler() {
        // 使用 $nextTick 确保数据已经处理完成
        this.$nextTick(() => {
          this.syncSelectedRows();
        });
      },
      immediate: true,
      deep: true,
    },
  },
};
</script>

<style lang="scss" scoped>
$tb-pd: 4px 8px;
$tb-color: rgb(81, 82, 83);

@mixin isFlex() {
  display: flex;
  justify-content: center;
  align-items: center;
}

.data-table-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.data-table-container-wrapper {
  border: var(--borderWidth) solid #e7eaf2;
  height: 100%;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
  border-bottom: 0;
  /* 启用iOS弹性滚动 */
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
    background: transparent;
    /* Chrome/Safari/Webkit */
  }
}
.load-more-container {
  position: sticky;
  left: 0;
  z-index: 100;
  background-color: #fff;
  // border-top: 1px solid #E7EAF2;
  box-sizing: border-box;

  .load-more-text {
    padding: 10px 0;
    text-align: center;
  }
}
::v-deep .uni-scroll-view {
  overscroll-behavior: none;
}

::v-deep .fixed-left-box-shadow {
  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: -1px;
    width: 30px;
    transform: translate(100%);
    transition: box-shadow 0.3s;
    pointer-events: none;
    box-shadow: inset 10px 0 8px -8px rgba(217, 217, 217, 0.8);
  }
}

::v-deep .fixed-right-box-shadow {
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    bottom: -1px;
    width: 30px;
    transform: translate(-100%);
    transition: box-shadow 0.3s;
    pointer-events: none;
    box-shadow: inset -10px 0 8px -8px rgba(217, 217, 217, 0.8);
  }
}

.data-table-container {
  // width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  .body-container {
    // width: max-content;
    font-size: 10px;
    // flex: 1;
    // overflow: hidden;
    box-sizing: border-box;

    .body-scroll {
      // width: 100%;
      box-sizing: border-box;
      // height: 100%;
    }

    .table-wrapper {
      // width: 100%;
      // border-left: 1px solid #E7EAF2;
      // border-top: 1px solid #E7EAF2;

      .table-content {
        // width: 100%;
        min-width: 0;
      }

      .table-grid {
        display: grid;
      }

      .table-cell {
        box-sizing: border-box;
        padding: 8px;
        border-right: 1px solid #e7eaf2;
        border-bottom: 1px solid #e7eaf2;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        word-break: break-all;
        word-wrap: break-word;
        min-height: 40px;
        height: auto;
        transition: background-color 0.2s;
        position: relative;

        &.row-striped {
          background-color: #fafafa;
        }

        &:hover {
          background-color: #f0f0f0;
        }

        &.merged-cell {
          background-color: #f5f5f5;
          font-weight: 500;
        }

        &.last-col {
          border-right: none;
        }

        &.selection-cell {
          cursor: pointer;
          user-select: none;
          
          .selection-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }

        &.row-index-cell {
          user-select: none;
          text-align: center;
          
          .row-index-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 500;
          }
        }

        // &.selected-row {
        //   background-color: #e6f7ff !important;
        // }
      }

      .table-noData {
        padding: 8px;
        text-align: center;
        border-bottom: 1px solid #e7eaf2;
        color: #aaaab4;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>

