<template>
	<view class="header-container">
		<view :style="[getGridStyle]" class="header-grid">
			<!-- 选择列 -->
			<view
				v-if="selection"
				class="header-item selection-header"
				:style="[getSelectionHeaderStyle]"
				@click.stop="handleSelectAllClick"
			>
				<view class="header-item-label selection-label" @click.stop="handleSelectAllClick">
					<checkbox
						style="transform:scale(0.7)"
						v-if="selection === 'multiple'"
						:checked="isAllSelected"
						:indeterminate="indeterminate"
						color="#1890ff"
						@click.stop="handleSelectAllClick"
					/>
					<text v-else>—</text>
				</view>
			</view>
			<!-- 行号列 -->
			<view
				v-if="showRowIndex"
				class="header-item row-index-header"
				:style="[getRowIndexHeaderStyle]"
			>
				<view class="header-item-label">{{ rowIndexConfig?.label || '序号' }}</view>
			</view>
			<!-- 数据列 -->
			<view v-for="(header, index) in gridCell" :key="index" :class="[
				'header-item',
				header.fixed === 'left' && scrollLeft_b > 0 ? 'fixed-left-box-shadow' : '',
				header.fixed === 'right' && scrollLeft_b < allWidth - containerWidth ? 'fixed-right-box-shadow' : '',
				header.isLastColumn ? 'last-header-item' : ''
			]" :style="[cellStyles(index)]">
				<view class="header-item-label">{{ header.label }}</view>
			</view>
		</view>

	</view>
</template>

<script>
	/**
	 * 表头组件
   * 支持最多三级表头
	 * @author shiliu
	 *
	 * @props {columns} 表头数据列表 
	 *
	 * @tips 示例数据：columns: [
          {
            label: '分类',
            children: [],
            prop: 'type',
            width:'40%',
          },
          {
            label: '总实收营业额（元）',
            width:'30%',
            children: [
              { label: '数值（占比）', prop: 'totalPercent', slot: 'customSlot',width:'100%', },
            ]
          },
          {
            label: '总毛利额（元）',
            width:'30%',
            children: [
              { label: '数值（占比）', prop: 'name',width:'100%' },
            ]
          },
        ],
   * 
	 */
	// Vue版本检测工具函数
	const isVue2 = () => {
		const Vue = (typeof window !== 'undefined' && window.Vue) || (typeof global !== 'undefined' && global.Vue)
		return Vue && Vue.version && Vue.version.startsWith('2.')
	}

	export default {
		name: 'DataTableHeader',
		props: {
			columns: {
				type: Array,
				default: () => []
			},
			flattenColumns: {
				type: Array,
				default: () => []
			},
			containerWidth: {
				type: Number,
				default: 0
			},
			scrollLeft_b: {
				type: Number,
				default: 0
			},
			allWidth: {
				type: Number,
				default: 0
			},
			selection: {
				type: [String, Boolean],
				default: false
			},
			isAllSelected: {
				type: Boolean,
				default: false
			},
			indeterminate: {
				type: Boolean,
				default: false
			},
			showRowIndex: {
				type: Boolean,
				default: false
			},
			rowIndexConfig: {
				type: Object,
				default: () => ({
					width: '60px',
					label: '序号',
					fixed: 'left',
				})
			},
			debug: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				timer: null,
				// scrollLeft: 0
			}
		},
		destroyed() {
			this.timer && clearTimeout(this.timer)
			this.timer = null
		},
		computed: {
			getGridStyle() {
				// 使用 flattenColumns（包含选择列）
				const columnWidths = this.flattenColumns.map(col => {
					const width = col.width || '1fr'
					// 如果是百分比，转换为px
					if (typeof width === 'string' && width.endsWith('%') && this.containerWidth > 0) {
						const percent = parseFloat(width)
						if (!isNaN(percent)) {
							return `${(this.containerWidth * percent / 100)}px`
						}
					}
					return width
				}).join(' ')
				return {
					display: 'grid',
					gridTemplateColumns: columnWidths,
					width: '100%'
				}
			},
			getSelectionHeaderStyle() {
				// 获取最大层级，选择列需要跨所有层级
				const getMaxLevel = (cols, currentLevel = 1) => {
					let max = currentLevel
					cols.forEach(item => {
						if (item.children?.length) {
							const childLevel = getMaxLevel(item.children, currentLevel + 1)
							max = Math.max(max, childLevel)
						}
					})
					return max
				}
				const maxLevel = getMaxLevel(this.columns, 1)
				
				return {
					gridColumn: '1',
					gridRow: `1 / span ${maxLevel}`,
					position: 'sticky',
					left: '0',
					zIndex: 1001,
					backgroundColor: '#F5F6FA',
				}
			},
			getRowIndexHeaderStyle() {
				// 获取最大层级，行号列需要跨所有层级
				const getMaxLevel = (cols, currentLevel = 1) => {
					let max = currentLevel
					cols.forEach(item => {
						if (item.children?.length) {
							const childLevel = getMaxLevel(item.children, currentLevel + 1)
							max = Math.max(max, childLevel)
						}
					})
					return max
				}
				const maxLevel = getMaxLevel(this.columns, 1)
				
				// 找到行号列在 flattenColumns 中的索引
				const rowIndexColIndex = this.flattenColumns.findIndex(col => col.isRowIndex)
				
				// 计算左侧偏移量
				let leftOffset = 'auto'
				if (rowIndexColIndex >= 0 && this.rowIndexConfig?.fixed === 'left') {
					// 使用 getStickyOffset 方法计算正确的偏移量
					leftOffset = this.getStickyOffset(rowIndexColIndex, 'left', 1)
				}
				
				// 计算右侧偏移量
				let rightOffset = 'auto'
				if (rowIndexColIndex >= 0 && this.rowIndexConfig?.fixed === 'right') {
					rightOffset = this.getStickyOffset(rowIndexColIndex, 'right', 1)
				}
				
				// 确定 gridColumn 位置
				let gridColumn = '1'
				if (this.selection && rowIndexColIndex >= 0) {
					// 如果启用了选择列，行号列应该在第二列
					gridColumn = '2'
				} else if (rowIndexColIndex >= 0) {
					// 如果没有选择列，行号列在第一列
					gridColumn = '1'
				}
				
				// zIndex 层级：选择列(1001) > 行号列(1002) > 数据列(1000)
				// 确保行号列不会被数据列覆盖
				const zIndexValue = this.rowIndexConfig?.fixed ? 1002 : 1
				
				return {
					gridColumn: gridColumn,
					gridRow: `1 / span ${maxLevel}`,
					position: this.rowIndexConfig?.fixed ? 'sticky' : 'static',
					left: leftOffset,
					right: rightOffset,
					zIndex: zIndexValue,
					backgroundColor: '#F5F6FA',
				}
			},
			gridCell() {
				// 递归计算最大层级
				const getMaxLevel = (cols, currentLevel = 1) => {
					let max = currentLevel
					cols.forEach(item => {
						if (item.children?.length) {
							const childLevel = getMaxLevel(item.children, currentLevel + 1)
							max = Math.max(max, childLevel)
						}
					})
					return max
				}
				const maxLevel = getMaxLevel(this.columns, 1)

				// 递归计算列的实际跨度（计算所有叶子节点的数量）
				const getColspan = (item) => {
					if (!item.children?.length) {
						return 1
					}
					return item.children.reduce((sum, child) => sum + getColspan(child), 0)
				}

				// 计算最底层的列数（所有叶子节点的数量）
				const getTotalCols = (cols) => {
					return cols.reduce((sum, item) => {
						if (!item.children?.length) {
							return sum + 1
						}
						return sum + getTotalCols(item.children)
					}, 0)
				}
				const totalCols = getTotalCols(this.columns)

				// 初始化cells数组，为每一层创建足够的单元格
				let cells = Array(maxLevel).fill().map(() => Array(totalCols).fill(null).map(() => ({})))

				// 填充实际的单元格数据
				const fillCells = (columns, level, startIndex) => {
					let currentIndex = startIndex
					columns.forEach((item) => {
						const colspan = getColspan(item)

						if (!item.children?.length) {
							// 没有子列，需要计算rowspan（跨到最底层）
							const rowspan = maxLevel - level
							cells[level][currentIndex] = {
								...item,
								rowspan: rowspan,
								colspan: 1,
								display: true,
								rowIndex: level,
								colIndex: currentIndex,
							}
							// 填充下方被合并的行
							for (let i = 1; i < rowspan; i++) {
								if (level + i < maxLevel) {
									cells[level + i][currentIndex] = {
										...cells[level + i][currentIndex],
										display: false,
										rowIndex: level,
										colIndex: currentIndex,
									}
								}
							}
							// 移动到下一个索引
							currentIndex++
						} else {
							// 有子列，需要合并列
							cells[level][currentIndex] = {
								...item,
								rowspan: 1,
								colspan: colspan,
								display: true,
								rowIndex: level,
								colIndex: currentIndex,
							}
							// 填充右侧被合并的列
							for (let i = 1; i < colspan; i++) {
								cells[level][currentIndex + i] = {
									...cells[level][currentIndex + i],
									display: false,
									rowIndex: level,
									colIndex: currentIndex + i,
								}
							}
							// 递归处理子列
							item.children.forEach((child) => {
								currentIndex = fillCells([child], level + 1, currentIndex)
							})
						}
					})
					return currentIndex
				}

				fillCells(this.columns, 0, 0)
				const flattened = cells.flat().filter(cell => cell && cell.display)
				flattened.forEach(cell => {
					if (!cell) return
					const colIndex = cell.colIndex ?? 0
					const span = cell.colspan ?? 1
					// 调整 colIndex 以匹配 flattenColumns 中的实际索引
					// flattenColumns 的顺序：选择列(0) + 行号列(1) + 数据列(2+)
					let adjustedColIndex = colIndex
					if (this.selection) {
						adjustedColIndex += 1 // 加上选择列
					}
					if (this.showRowIndex) {
						adjustedColIndex += 1 // 加上行号列
					}
					cell.colIndex = adjustedColIndex
					// 判断是否是最后一列
					if (colIndex + span >= totalCols) {
						cell.isLastColumn = true
					}
				})
				return flattened
			},
			flattenColumnList() {
				const result = []
				const flatten = (cols, parent) => {
					cols.forEach(col => {
						if (col.children && col.children.length) {
							flatten(col.children, col)
						} else {
							if (parent?.width && col?.width) {
								let pWidth = Number(parent.width.split('%')[0]) * 0.01
								let cWidth = Number(col.width.split('%')[0]) * 0.01
								result.push({
									...col,
									width: pWidth * cWidth * 100 + '%'
								})
							} else {
								result.push(col)
							}
							// result.push(col)
						}
					})
				}
				flatten(this.columns, null)
				return result
			},
			cellStyles() {
				return function(index) {
					const styles = {}
					this.gridCell.forEach((cell, index) => {
						styles[index] = this.getCellStyle(cell, cell.colIndex)
					})
					return styles[index]
				}
			}
		},
		methods: {
			parseWidth(widthStr) {
				if (!widthStr) {
					return {
						percent: 0,
						px: 0,
						valid: false
					}
				}
				const normalized = String(widthStr).trim()
				const numericValue = parseFloat(normalized)
				if (Number.isNaN(numericValue)) {
					return {
						percent: 0,
						px: 0,
						valid: false
					}
				}

				if (normalized.endsWith('%')) {
					return {
						percent: numericValue,
						px: 0,
						valid: true
					}
				}

				if (normalized.endsWith('rpx')) {
					if (typeof uni !== 'undefined' && typeof uni.upx2px === 'function') {
						return {
							percent: 0,
							px: uni.upx2px(numericValue),
							valid: true
						}
					}
					return {
						percent: 0,
						px: numericValue,
						valid: true
					}
				}

				if (normalized.endsWith('px')) {
					return {
						percent: 0,
						px: numericValue,
						valid: true
					}
				}

				return {
					percent: 0,
					px: 0,
					valid: false
				}
			},
			getStickyOffset(colIndex, direction = 'left', colspan = 1) {
				const columns = this.flattenColumns || []
				if (!columns.length) return '0px'

				let percent = 0
				let px = 0

				if (direction === 'left') {
					for (let i = 0; i < colIndex; i++) {
						const colWidth = columns[i]?.width
						if (!colWidth) continue
						
						// 如果是百分比，需要转换为px（使用容器宽度）
						if (typeof colWidth === 'string' && colWidth.endsWith('%') && this.containerWidth > 0) {
							const percentValue = parseFloat(colWidth)
							if (!isNaN(percentValue)) {
								px += (this.containerWidth * percentValue / 100)
							}
						} else {
							const { percent: p, px: x } = this.parseWidth(colWidth)
							percent += p
							px += x
						}
					}
				} else {
					for (let i = colIndex + colspan; i < columns.length; i++) {
						const colWidth = columns[i]?.width
						if (!colWidth) continue
						
						// 如果是百分比，需要转换为px（使用容器宽度）
						if (typeof colWidth === 'string' && colWidth.endsWith('%') && this.containerWidth > 0) {
							const percentValue = parseFloat(colWidth)
							if (!isNaN(percentValue)) {
								px += (this.containerWidth * percentValue / 100)
							}
						} else {
							const { percent: p, px: x } = this.parseWidth(colWidth)
							percent += p
							px += x
						}
					}
				}

				if (percent && px) {
					return `calc(${percent}% + ${px}px)`
				}

				if (percent) {
					return `${percent}%`
				}

				return `${px}px`
			},
			handleScroll(e) {
				//添加防抖
				this.timer && clearTimeout(this.timer)
				this.timer = setTimeout(() => {
					let scrollLeft = e.detail.scrollLeft
					this.$emit('scroll', scrollLeft)
				}, 100)
			},
			// 计算每个label的高度
			getCellStyle(cell, colIndex) {
				// colIndex 已经是调整后的索引（在 gridCell 中已经考虑了选择列和行号列）
				// 直接使用 colIndex 作为 flattenColumns 中的索引
				const actualColIndex = colIndex
				
				const columnMeta = this.flattenColumns[actualColIndex] || {}
				const baseWidth = columnMeta.width
				let width = baseWidth

				// 处理列合并的宽度
				if (cell.colspan > 1) {
					const colWidths = []
					for (let i = 0; i < cell.colspan; i++) {
						const actualIndex = actualColIndex + i
						colWidths.push(this.flattenColumns[actualIndex]?.width || '100px')
					}
					width = colWidths.reduce((sum, w) => {
						const numWidth = parseInt(w)
						return sum + (isNaN(numWidth) ? 100 : numWidth)
					}, 0) + 'px'
				}

				// 判断是否是 fixed='right' 的列
				const isFixedRight = cell.fixed === 'right' || columnMeta.fixed === 'right'
				// 判断是否是挨着 fixed='right' 列最近的左侧列
				const isAdjacentToFixedRight = this.isAdjacentToFixedRight(actualColIndex)
				this.debug && console.log(cell)
				return {
					//   width: width,
					flex: baseWidth ? 'none' : '1',
					display: cell.display ? 'flex' : 'none',
					color: cell.textColor || '#333',
					fontWeight: cell.bold ? 'bold' : 'normal',
					gridRow: `span ${cell.rowspan}`,
					gridColumn: `span ${cell.colspan}`,
					position: cell.fixed ? 'sticky' : 'static',
					left: cell.fixed === 'left' ? this.getStickyOffset(actualColIndex, 'left', cell.colspan) : 'auto',
					right: cell.fixed === 'right' ? this.getStickyOffset(actualColIndex, 'right', cell.colspan) : 'auto',
					zIndex: cell.fixed ? 1000 : 1,
					backgroundColor: '#F5F6FA',
					borderLeft: isFixedRight ? '1px solid #E7EAF2' : undefined,
					borderRight: isAdjacentToFixedRight ? 'none' : undefined,
					...(cell.headerStyle||{}),
				}
			},
			// 判断当前列是否是挨着 fixed='right' 列最近的左侧列
			isAdjacentToFixedRight(colIndex) {
				const nextColIndex = colIndex + 1
				if (nextColIndex >= this.flattenColumns.length) {
					return false
				}
				const currentCol = this.flattenColumns[colIndex] || {}
				const nextCol = this.flattenColumns[nextColIndex] || {}
				// 当前列不是 fixed，且下一列是 fixed='right'
				return !currentCol.fixed && nextCol.fixed === 'right'
			},
			// 处理全选点击
			handleSelectAllClick() {
				if (this.selection === 'multiple') {
					this.$emit('select-all', !this.isAllSelected)
				}
			},
		}
	}
</script>

<style lang="scss">
	.header-container {
		display: flex;
		// width: max-content;
		background-color: #F5F6FA;
		// border-top: 1px solid #E7EAF2;
		// border-left: 1px solid #E7EAF2;
		box-sizing: border-box;
		position: sticky;
		top: 0;
		z-index: 3;
		.header-grid {
			display: grid;
		}

		.header-item {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: center;
			border-right: 1px solid #E7EAF2;
			border-bottom: 1px solid #E7EAF2;
			box-sizing: border-box;
			position: relative;
			.header-item-label {
				// display: flex;
				// align-items: center;
				// justify-content: center;
				background-color: #F5F6FA;
				padding: 8px;
				font-size: 10px;
				color: #1A1A1A;
				text-align: center;
				word-break: break-all;
				box-sizing: border-box;

				&+.header-item-label {
					border-top: 1px solid #E7EAF2;
				}
			}

			.flex {
				display: flex;
				border-top: 1px solid #E7EAF2; // 添加边框以确保对齐
			}

			.flex .header-item-label {
				flex: 1;

				&+.header-item-label {
					border-left: 1px solid #E7EAF2;
				}
			}
			&.last-header-item{
				border-right: none;
			}
			
			&.selection-header {
				cursor: pointer;
				
				.selection-label {
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}
		}
	}
</style>