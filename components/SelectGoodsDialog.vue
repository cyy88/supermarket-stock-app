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
              <view class="custom-checkbox" :class="{ 'checked': item.checked }">
                <text v-if="item.checked" class="check-icon">✓</text>
              </view>
              <checkbox
                :checked="item.checked"
                :value="item.id + '_' + item.skuId"
                @change="handleCheckboxChange(index, item, $event)"
                style="display: none;"
              />
            </view>
            <image 
              :src="imagePath + item.logo" 
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
      
      selectData.value = []
      
      if (props.dataList && props.dataList.length > 0) {
        goodsList.value.forEach((item, key) => {
          const matchedItem = props.dataList.find(row => 
            row.id === item.id && (row.skuId === item.skuId || (!row.skuId && !item.skuId))
          )
          if (matchedItem) {
            goodsList.value[key].checked = true
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

const handleCheckboxChange = (index, item, event) => {

  let checked = false

  // 兼容不同平台的事件对象结构
  if (event && event.detail) {
    if (Array.isArray(event.detail.value)) {
      checked = event.detail.value.length > 0
    } else if (typeof event.detail.value === 'boolean') {
      checked = event.detail.value
    } else if (event.detail.checked !== undefined) {
      checked = event.detail.checked
    }
  } else if (event && event.target) {
    checked = event.target.checked
  } else if (event && typeof event === 'boolean') {
    checked = event
  }

  goodsList.value[index].checked = checked

  if (checked) {
    const isExist = selectData.value.some(selected =>
      selected.id === item.id && (selected.skuId === item.skuId || (!selected.skuId && !item.skuId))
    )

    if (!isExist) {
      const newItem = JSON.parse(JSON.stringify(goodsList.value[index]))
      selectData.value.push(newItem)
    }
  } else {
    selectData.value = selectData.value.filter(selected =>
      !(selected.id === item.id && (selected.skuId === item.skuId || (!selected.skuId && !item.skuId)))
    )
  }
}

const toggleSelect = (index, item) => {
  goodsList.value[index].checked = !goodsList.value[index].checked
  const checked = goodsList.value[index].checked

  if (checked) {
    const isExist = selectData.value.some(selected =>
      selected.id === item.id && (selected.skuId === item.skuId || (!selected.skuId && !item.skuId))
    )
    if (!isExist) {
      const newItem = JSON.parse(JSON.stringify(goodsList.value[index]))
      selectData.value.push(newItem)
    }
  } else {
    // 从选中列表中移除
    selectData.value = selectData.value.filter(selected =>
      !(selected.id === item.id && (selected.skuId === item.skuId || (!selected.skuId && !item.skuId)))
    )
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
