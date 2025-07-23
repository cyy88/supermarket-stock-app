<template>
  <view v-if="showDialog" class="dialog-overlay" @click="close">
    <view class="dialog-container" @click.stop>
      <view class="dialog-header">
        <text class="dialog-title">选择商品</text>
        <text class="close-btn" @click="close">×</text>
      </view>
      
      <view class="search-section">
        <view class="search-box">
          <input 
            v-model="params.keyword" 
            placeholder="请输入商品关键字" 
            class="search-input"
            @confirm="handleQuery"
          />
          <button class="search-btn" @click="handleQuery">搜索</button>
        </view>
      </view>

      <view class="goods-list">
        <view v-if="loading" class="loading">加载中...</view>
        <view v-else-if="goodsList.length === 0" class="empty">暂无商品数据</view>
        <view v-else>
          <view 
            v-for="(item, index) in goodsList" 
            :key="item.id + '_' + item.skuId" 
            class="goods-item"
            @click="toggleSelect(index, item)"
          >
            <view class="checkbox-wrapper" @click.stop="toggleSelect(index, item)">
              <!-- 使用自定义选择框，确保跨平台兼容性 -->
              <view class="custom-checkbox" :class="{ 'checked': item.checked }">
                <text v-if="item.checked" class="check-icon">✓</text>
              </view>
              <!-- 保留原生checkbox作为备用，但隐藏 -->
              <checkbox
                :checked="item.checked"
                :value="item.id + '_' + item.skuId"
                @change="handleCheckboxChange(index, item, $event)"
                style="display: none;"
              />
            </view>
            <image
              :src="getGoodsImageUrl(item)"
              class="goods-image"
              mode="aspectFill"
            />
            <view class="goods-info">
              <text class="goods-name">{{ item.name || '--' }}</text>
              <text class="goods-no">条码: {{ item.goodsNo }}</text>
              <view class="goods-spec">
                <text v-if="item.specList">
                  <text v-for="spec in item.specList" :key="spec.id" class="spec-item">
                    {{ spec.value }}
                  </text>
                </text>
                <text v-else>--</text>
              </view>
              <view class="stock-info">
                <text v-if="item.priceType === 'weight'">
                  库存: {{ item.stock ? (item.stock / 100).toFixed(2) : '0.00' }}kg
                </text>
                <text v-else>
                  库存: {{ item.stock || '0' }}件
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="pagination" v-if="total > 0">
        <button 
          class="page-btn" 
          :disabled="params.page <= 1"
          @click="prevPage"
        >上一页</button>
        <text class="page-info">{{ params.page }}/{{ Math.ceil(total / params.pageSize) }}</text>
        <button 
          class="page-btn" 
          :disabled="params.page >= Math.ceil(total / params.pageSize)"
          @click="nextPage"
        >下一页</button>
      </view>

      <view class="dialog-footer">
        <button class="cancel-btn" @click="close">取消</button>
        <button class="confirm-btn" @click="doSave">确定({{ selectData.length }})</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { selectGoodsList } from '@/api/stock'

// 修复可能包含重复域名的URL
const fixMalformedUrl = (url) => {
  if (!url || typeof url !== 'string') return url
  
  // 查找URL中是否包含重复的域名
  const domainPattern = /(https?:\/\/[^\/]+)(https?:\/\/[^\/]+)/
  const match = url.match(domainPattern)
  
  if (match) {
    // 如果找到重复的域名，只保留第二个域名
    return url.replace(match[1], '')
  }
  
  return url
}

const props = defineProps({
  showDialog: {
    type: Boolean,
    default: false
  },
  storeId: {
    type: [Number, String],
    default: 0
  },
  dataList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['closeDialog', 'submit'])

const params = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
  storeId: 0
})

const selectData = ref([])
const loading = ref(false)
const goodsList = ref([])
const imagePath = ref('')
const total = ref(0)

// 监听对话框显示状态
watch(() => props.showDialog, (value) => {
  if (value) {
    selectData.value = []
    getGoodsList()
  }
})

// 获取商品列表
const getGoodsList = async () => {
  loading.value = true
  try {
    params.storeId = props.storeId
    const response = await selectGoodsList(params)
    
    if (response.data) {
      goodsList.value = response.data.paginationResponse.content.map(goods => ({
        ...goods,
        checked: false
      }))
      
      // 重置选中数据，确保每次打开对话框时都是干净的状态
      selectData.value = []
      
      // 检查之前已选择的商品，并标记为选中状态
      if (props.dataList && props.dataList.length > 0) {
        goodsList.value.forEach((item, key) => {
          const matchedItem = props.dataList.find(row => 
            row.id === item.id && (row.skuId === item.skuId || (!row.skuId && !item.skuId))
          )
          
          if (matchedItem) {
            // 标记为选中
            goodsList.value[key].checked = true
            // 添加到选中数据中
            selectData.value.push(JSON.parse(JSON.stringify(item)))
          }
        })
      }
      
      total.value = response.data.paginationResponse.totalElements
      imagePath.value = response.data.imagePath
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    uni.showToast({
      title: '获取商品列表失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 处理checkbox变化事件 - 兼容多平台
const handleCheckboxChange = (index, item, event) => {
  console.log('📋 checkbox事件:', item.name, 'platform:', uni.getSystemInfoSync().platform)

  let checked = false

  // 兼容不同平台的事件对象结构
  if (event && event.detail) {
    // 微信小程序环境
    if (Array.isArray(event.detail.value)) {
      checked = event.detail.value.length > 0
    } else if (typeof event.detail.value === 'boolean') {
      checked = event.detail.value
    } else if (event.detail.checked !== undefined) {
      checked = event.detail.checked
    }
  } else if (event && event.target) {
    // H5/App 环境
    checked = event.target.checked
  } else if (event && typeof event === 'boolean') {
    // 直接传递布尔值
    checked = event
  }

  console.log('📋 checkbox最终状态:', checked, 'for:', item.name)

  // 更新商品的选中状态
  goodsList.value[index].checked = checked

  if (checked) {
    // 添加到选中列表，确保不重复添加
    const isExist = selectData.value.some(selected =>
      selected.id === item.id && (selected.skuId === item.skuId || (!selected.skuId && !item.skuId))
    )

    if (!isExist) {
      // 使用更新后的商品对象
      const newItem = JSON.parse(JSON.stringify(goodsList.value[index]))
      selectData.value.push(newItem)
      console.log('✅ checkbox添加:', newItem.name, '数量:', selectData.value.length)
    }
  } else {
    // 从选中列表中移除
    selectData.value = selectData.value.filter(selected =>
      !(selected.id === item.id && (selected.skuId === item.skuId || (!selected.skuId && !item.skuId)))
    )
    console.log('❌ checkbox移除:', item.name, '数量:', selectData.value.length)
  }
}

const toggleSelect = (index, item) => {
  console.log('🔄 toggleSelect:', item.name, '当前状态:', goodsList.value[index].checked)

  // 切换选中状态
  goodsList.value[index].checked = !goodsList.value[index].checked
  const checked = goodsList.value[index].checked

  if (checked) {
    // 添加到选中列表，确保不重复添加
    const isExist = selectData.value.some(selected =>
      selected.id === item.id && (selected.skuId === item.skuId || (!selected.skuId && !item.skuId))
    )

    if (!isExist) {
      // 使用更新后的商品对象
      const newItem = JSON.parse(JSON.stringify(goodsList.value[index]))
      selectData.value.push(newItem)
      console.log('✅ 添加商品:', newItem.name, '选择数量:', selectData.value.length)
    }
  } else {
    // 从选中列表中移除
    selectData.value = selectData.value.filter(selected =>
      !(selected.id === item.id && (selected.skuId === item.skuId || (!selected.skuId && !item.skuId)))
    )
    console.log('❌ 移除商品:', item.name, '选择数量:', selectData.value.length)
  }
}

const checkRow = (event, index, row) => {
}

// 搜索商品
const handleQuery = () => {
  params.page = 1
  getGoodsList()
}

const prevPage = () => {
  if (params.page > 1) {
    params.page--
    getGoodsList()
  }
}

const nextPage = () => {
  if (params.page < Math.ceil(total.value / params.pageSize)) {
    params.page++
    getGoodsList()
  }
}

// 获取商品图片URL
const getGoodsImageUrl = (item) => {
  if (!item.logo) return ''

  // 所有图片URL都应该是完整URL，但可能存在域名重复问题
  return fixMalformedUrl(item.logo)
}

// 关闭对话框
const close = () => {
  emit('closeDialog')
}

// 保存选择
const doSave = () => {
  if (selectData.value.length === 0) {
    uni.showToast({
      title: '请至少选择一个商品',
      icon: 'none'
    })
    return
  }
  const selectedGoodsData = JSON.parse(JSON.stringify(selectData.value))
  
  emit('submit', selectedGoodsData)
  
  nextTick(() => {
    emit('closeDialog')
  })
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-container {
  width: 90%;
  max-width: 600px;
  max-height: 80%;
  background-color: white;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.dialog-title {
  font-size: 18px;
  font-weight: bold;
}

.close-btn {
  font-size: 24px;
  color: #999;
  cursor: pointer;
}

.search-section {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.search-box {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-btn {
  padding: 8px 16px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 4px;
}

.goods-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #999;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.goods-item:active {
  background-color: #f8f8f8;
}

.checkbox-wrapper {
  margin-right: 12px;
  cursor: pointer;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  transition: all 0.3s ease;
}

.custom-checkbox.checked {
  background-color: #007aff;
  border-color: #007aff;
}

.check-icon {
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.goods-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  margin-right: 12px;
}

.goods-info {
  flex: 1;
}

.goods-name {
  font-size: 16px;
  font-weight: bold;
  display: block;
  margin-bottom: 4px;
}

.goods-no {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 4px;
}

.goods-spec {
  margin-bottom: 4px;
}

.spec-item {
  font-size: 12px;
  color: #999;
  margin-right: 8px;
}

.stock-info {
  font-size: 14px;
  color: #007aff;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #eee;
  gap: 16px;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.page-btn:disabled {
  opacity: 0.5;
}

.page-info {
  font-size: 14px;
  color: #666;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #eee;
}

.cancel-btn {
  padding: 8px 24px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.confirm-btn {
  padding: 8px 24px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 4px;
}
</style>
