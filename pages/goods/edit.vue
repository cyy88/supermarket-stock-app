<template>
  <view class="edit-goods-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-content">
        <text class="page-title">✏️ 编辑商品</text>
        <text class="page-subtitle">修改商品信息</text>
      </view>
    </view>

    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="goods" class="edit-form">
      <!-- 基本信息卡片 -->
      <view class="card">
        <view class="card-header">
          <view class="card-title">
            <text class="title-icon">📋</text>
            <text class="title-text">基本信息</text>
          </view>
          <view class="card-badge required">必填</view>
        </view>

        <!-- 商品类型 -->
        <view class="form-item">
          <text class="label required">商品类型</text>
          <picker
            style="width: 85%;"
            :range="typeOptions"
            range-key="name"
            @change="onTypeChange"
            :value="selectedTypeIndex"
          >
            <view class="input select">
              <text :class="{ placeholder: !form.typeName }">
                {{ form.typeName || '请选择商品类型' }}
              </text>
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>

        <!-- 计价方式 -->
        <view class="form-item" v-if="form.type === 'goods'">
          <text class="label required">计价方式</text>
          <radio-group @change="onPriceTypeChange">
            <view class="radio-group">
              <label class="radio-item">
                <radio value="piece" :checked="form.priceType === 'piece'" color="#007AFF" />
                <text>计件商品</text>
              </label>
              <label class="radio-item">
                <radio value="weight" :checked="form.priceType === 'weight'" color="#007AFF" />
                <text>称重商品</text>
              </label>
            </view>
          </radio-group>
          <view class="form-tips">提示：计件商品按数量计价，称重商品按重量计价</view>
        </view>

        <view class="form-item">
          <text class="label required">商品条码</text>
          <view class="input-with-generate">
            <input
              style="width: 70%;"
              v-model="form.goodsNo"
              placeholder="请输入商品条码"
              class="input"
            />
            <button class="generate-btn" @click="generateGoodsNo">
              随机生成
            </button>
          </view>
        </view>

        <view class="form-item">
          <text class="label required">商品名称</text>
          <input
            style="width: 85%;"
            v-model="form.name"
            placeholder="请输入商品名称"
            class="input"
          />
        </view>

        <view class="form-item">
          <text class="label required">商品分类</text>
          <picker
            style="width: 85%;"
            :range="categoryList"
            range-key="name"
            @change="onCategoryChange"
            :value="selectedCategoryIndex"
          >
            <view class="input select">
              <text :class="{ placeholder: !form.cateName }">
                {{ form.cateName || '请选择商品分类' }}
              </text>
              <text class="arrow">▼</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label required">商品价格</text>
          <view class="input-group" style="width: 50%;">
            <input
              v-model="form.price"
              type="digit"
              placeholder="请输入价格"
              class="input"
            />
            <text class="unit">{{ form.priceType === 'weight' ? '元/千克' : '元' }}</text>
          </view>
        </view>

        <view class="form-item">
          <text class="label">划线价格</text>
          <view class="input-group" style="width: 50%;">
            <input
              v-model="form.linePrice"
              type="digit"
              placeholder="请输入划线价格，空则不显示"
              class="input"
            />
            <text class="unit">元</text>
          </view>
        </view>

        <view class="form-item">
          <text class="label">库存数量</text>
          <view class="input-group" style="width: 50%;">
            <input
              v-model="form.stock"
              type="number"
              placeholder="请输入库存数量"
              class="input"
            />
          </view>
        </view>

        <view class="form-item">
          <text class="label required">安全库存</text>
          <view class="input-group" style="width: 50%;">
            <input
              v-model="form.safetyStock"
              type="number"
              placeholder="请输入安全库存"
              class="input"
            />
          </view>
        </view>

        <!-- 商品重量 -->
        <view class="form-item" v-if="form.type === 'goods' && form.priceType === 'piece'">
          <text class="label">商品重量</text>
          <view class="input-group" style="width: 50%;">
            <input
              v-model="form.weight"
              type="digit"
              placeholder="请输入商品重量"
              class="input"
            />
            <text class="unit">千克</text>
          </view>
          <view class="form-tips">提示：输入数字，单位kg（用于物流计算）</view>
        </view>

        <!-- 商品卖点 -->
        <view class="form-item">
          <text class="label">商品卖点</text>
          <input
            style="width: 85%;"
            v-model="form.salePoint"
            placeholder="请输入商品卖点，几个字总结"
            class="input"
            maxlength="50"
          />
        </view>

        <view class="form-item">
          <text class="label">显示排序</text>
          <view class="input-group" style="width: 50%;">
            <input
              v-model="form.sort"
              type="number"
              placeholder="请输入排序值"
              class="input"
            />
          </view>
          <view class="form-tips">提示：数值越小，排行越靠前</view>
        </view>

        <!-- 商品状态 -->
        <view class="form-item">
          <text class="label">商品状态</text>
          <radio-group @change="onStatusChange">
            <view class="radio-group">
              <label class="radio-item">
                <radio value="A" :checked="form.status === 'A'" color="#007AFF" />
                <text>上架</text>
              </label>
              <label class="radio-item">
                <radio value="N" :checked="form.status === 'N'" color="#007AFF" />
                <text>下架</text>
              </label>
            </view>
          </radio-group>
        </view>
      </view>

      <!-- 扩展信息卡片 -->
      <view class="card">
        <view class="card-header">
          <view class="card-title">
            <text class="title-icon">⚙️</text>
            <text class="title-text">扩展信息</text>
          </view>
          <view class="card-badge optional">可选</view>
        </view>

        <!-- 积分抵扣 -->
        <view class="form-item">
          <text class="label">积分抵扣</text>
          <radio-group @change="onCanUsePointChange">
            <view class="radio-group">
              <label class="radio-item">
                <radio value="Y" :checked="form.canUsePoint === 'Y'" color="#007AFF" />
                <text>可用</text>
              </label>
              <label class="radio-item">
                <radio value="N" :checked="form.canUsePoint === 'N'" color="#007AFF" />
                <text>不可用</text>
              </label>
            </view>
          </radio-group>
        </view>

        <!-- 会员折扣 -->
        <view class="form-item">
          <text class="label">会员折扣</text>
          <radio-group @change="onMemberDiscountChange">
            <view class="radio-group">
              <label class="radio-item">
                <radio value="Y" :checked="form.isMemberDiscount === 'Y'" color="#007AFF" />
                <text>有折扣</text>
              </label>
              <label class="radio-item">
                <radio value="N" :checked="form.isMemberDiscount === 'N'" color="#007AFF" />
                <text>无折扣</text>
              </label>
            </view>
          </radio-group>
        </view>

        <!-- 规格类型 -->
        <view class="form-item">
          <text class="label">规格类型</text>
          <radio-group @change="onSingleSpecChange">
            <view class="radio-group">
              <label class="radio-item">
                <radio value="Y" :checked="form.isSingleSpec === 'Y'" color="#007AFF" />
                <text>单规格</text>
              </label>
              <label class="radio-item">
                <radio value="N" :checked="form.isSingleSpec === 'N'" color="#007AFF" />
                <text>多规格</text>
              </label>
            </view>
          </radio-group>
        </view>

        <!-- 服务时长 -->
        <view class="form-item" v-if="form.type === 'service'">
          <text class="label">服务时长</text>
          <view class="input-group" style="width: 50%;">
            <input
              v-model="form.serviceTime"
              type="number"
              placeholder="请输入服务时长"
              class="input"
            />
            <text class="unit">分钟</text>
          </view>
          <view class="form-tips">提示：输入数字，单位：分钟</view>
        </view>
      </view>

      <!-- 商品图片卡片 -->
      <view class="card">
        <view class="card-title">🖼️ 商品图片</view>
        <view class="image-upload">
          <view class="image-list">
            <view 
              v-for="(image, index) in imageList" 
              :key="index"
              class="image-item"
            >
              <image :src="image" mode="aspectFill" class="image" />
              <view class="image-delete" @click="deleteImage(index)">✕</view>
            </view>
            
            <view 
              v-if="imageList.length < 5" 
              class="image-add"
              @click="chooseImage"
            >
              <text class="add-icon">📷</text>
              <text class="add-text">添加图片</text>
            </view>
          </view>
          <text class="image-tip">最多可上传5张图片</text>
        </view>
      </view>

      <!-- 商品描述卡片 -->
      <view class="card">
        <view class="card-title">📝 商品描述</view>
        <textarea 
          v-model="form.description"
          placeholder="请输入商品描述（可选）"
          class="textarea"
          maxlength="500"
        />
        <view class="char-count">{{ form.description.length }}/500</view>
      </view>

      <!-- 保存按钮 -->
      <view class="form-actions">
        <button
          class="save-btn"
          :class="{ loading: saving }"
          @click="handleUpdateGoods"
          :disabled="saving"
        >
          {{ saving ? '保存中...' : '💾 更新商品' }}
        </button>
      </view>

      <picker
        v-if="showCategoryPicker"
        :range="categoryList"
        range-key="name"
        @change="onCategoryChange"
        @cancel="showCategoryPicker = false"
      >
        <view></view>
      </picker>
    </view>
    
    <view v-else class="error-state">
      <text class="error-text">商品不存在或加载失败</text>
      <button class="retry-btn" @click="loadGoodsDetail">重试</button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import goodsStore from '@/stores/goods'
import userStore from '@/stores/user'
import { saveGoods as saveGoodsApi, getGoodsCateList, uploadImage, getGoodsDetail } from '@/api/goods'

const loading = ref(true)
const saving = ref(false)
const showCategoryPicker = ref(false)
const categoryList = ref([])
const typeOptions = ref([
  { key: 'goods', name: '实物商品' },
  { key: 'service', name: '服务商品' }
])
const imageList = ref([])
const goods = ref(null)
const goodsId = ref('')
const selectedCategoryIndex = ref(0)
const selectedTypeIndex = ref(0)

const form = reactive({
  // 基础信息
  type: 'goods',
  typeName: '实物商品',
  priceType: 'piece',
  goodsNo: '',
  name: '',
  cateId: '',
  cateName: '',
  price: '',
  linePrice: '',
  stock: '',
  safetyStock: '',
  weight: '',
  salePoint: '',
  sort: 0,
  status: 'A',

  // 扩展信息
  canUsePoint: 'Y',
  isMemberDiscount: 'Y',
  isSingleSpec: 'Y',
  serviceTime: 0,

  // 商品描述
  description: ''
})

onLoad((options) => {
  if (options.id) {
    goodsId.value = options.id
    loadGoodsDetail()
    loadCategoryList()
  } else {
    uni.showToast({
      title: '参数错误',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})

const loadGoodsDetail = async () => {
  try {
    loading.value = true

    // 首先尝试从本地加载
    const localGoods = goodsStore.localGoods.find(item => item.id === goodsId.value)
    if (localGoods) {
      goods.value = localGoods
      fillForm(localGoods)
      return
    }

    // 如果本地没有，尝试从服务器加载
    try {
      const response = await getGoodsDetail(goodsId.value)

      if (response.code === 200 && response.data && response.data.goodsInfo) {
        const goodsData = response.data.goodsInfo
        goods.value = goodsData
        fillForm(goodsData)

        // 将服务器数据保存到本地，方便下次编辑
        const localGoodsData = {
          ...goodsData,
          id: goodsId.value,
          syncStatus: 1, // 标记为已同步
          createTime: goodsData.createTime || Date.now(),
          updateTime: goodsData.updateTime || Date.now()
        }

        // 检查本地是否已存在，如果不存在则添加
        const existingIndex = goodsStore.localGoods.findIndex(item => item.id === goodsId.value)
        if (existingIndex === -1) {
          goodsStore.localGoods.push(localGoodsData)
          uni.setStorageSync('localGoods', goodsStore.localGoods)
        }
      } else {
        throw new Error(response.message || '获取商品详情失败')
      }
    } catch (serverError) {
      uni.showToast({
        title: '商品不存在或网络错误',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error) {
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

const fillForm = (goodsData) => {
  // 基础信息
  form.type = goodsData.type || 'goods'
  form.typeName = form.type === 'goods' ? '实物商品' : '服务商品'
  form.priceType = goodsData.priceType || 'piece'
  form.goodsNo = goodsData.goodsNo || ''
  form.name = goodsData.name || ''
  form.cateId = goodsData.cateId?.toString() || ''
  form.cateName = goodsData.cateName || ''
  form.price = goodsData.price?.toString() || ''
  form.linePrice = goodsData.linePrice?.toString() || ''
  form.stock = goodsData.stock?.toString() || ''
  form.safetyStock = goodsData.safetyStock?.toString() || ''
  form.weight = goodsData.weight?.toString() || ''
  form.salePoint = goodsData.salePoint || ''
  form.sort = goodsData.sort || 0
  form.status = goodsData.status || 'A'

  // 扩展信息
  form.canUsePoint = goodsData.canUsePoint || 'Y'
  form.isMemberDiscount = goodsData.isMemberDiscount || 'Y'
  form.isSingleSpec = goodsData.isSingleSpec || 'Y'
  form.serviceTime = goodsData.serviceTime || 0

  // 商品描述
  form.description = goodsData.description || ''

  // 设置商品类型选择器索引
  const typeIndex = typeOptions.value.findIndex(type => type.key === form.type)
  if (typeIndex !== -1) {
    selectedTypeIndex.value = typeIndex
  }

  // 设置分类选择器索引
  if (form.cateId && categoryList.value.length > 0) {
    const categoryIndex = categoryList.value.findIndex(cat => cat.id.toString() === form.cateId)
    if (categoryIndex !== -1) {
      selectedCategoryIndex.value = categoryIndex
      form.cateName = categoryList.value[categoryIndex].name
    }
  }

  // 处理图片 - 支持多种格式
  if (goodsData.images) {
    if (Array.isArray(goodsData.images)) {
      imageList.value = goodsData.images.filter(img => img)
    } else if (typeof goodsData.images === 'string') {
      try {
        // 尝试解析JSON字符串
        const parsedImages = JSON.parse(goodsData.images)
        imageList.value = Array.isArray(parsedImages) ? parsedImages.filter(img => img) : []
      } catch (e) {
        // 如果不是JSON，当作单个图片URL处理
        imageList.value = goodsData.images ? [goodsData.images] : []
      }
    } else {
      imageList.value = []
    }
  } else {
    imageList.value = []
  }
}

const loadCategoryList = async () => {
  try {
    const res = await getGoodsCateList({
      page: 1,
      pageSize: 100,
      status: 'A'
    })

    if (res.code === 200 && res.data && res.data.paginationResponse) {
      categoryList.value = res.data.paginationResponse.content || []
      goodsStore.saveCategories(categoryList.value)
    }
  } catch (error) {
    console.error('获取分类失败:', error)
    categoryList.value = goodsStore.categories
  }
}

const onCategoryChange = (e) => {
  const selectedCategory = categoryList.value[e.detail.value]
  if (selectedCategory) {
    form.cateId = selectedCategory.id
    form.cateName = selectedCategory.name
    selectedCategoryIndex.value = e.detail.value
  }
  showCategoryPicker.value = false
}

// 商品类型选择
const onTypeChange = (e) => {
  const selectedType = typeOptions.value[e.detail.value]
  if (selectedType) {
    form.type = selectedType.key
    form.typeName = selectedType.name
    selectedTypeIndex.value = e.detail.value

    // 如果选择服务商品，默认设置为计件
    if (form.type === 'service') {
      form.priceType = 'piece'
    }
  }
}

// 设置计价方式
const setPriceType = (type) => {
  form.priceType = type
  // 如果切换计价方式，清空条码让用户重新生成
  if (form.goodsNo) {
    form.goodsNo = ''
  }
}

// 计价方式改变事件
const onPriceTypeChange = (e) => {
  const newPriceType = e.detail.value
  setPriceType(newPriceType)
}

// 商品状态改变事件
const onStatusChange = (e) => {
  form.status = e.detail.value
}

// 积分抵扣改变事件
const onCanUsePointChange = (e) => {
  form.canUsePoint = e.detail.value
}

// 会员折扣改变事件
const onMemberDiscountChange = (e) => {
  form.isMemberDiscount = e.detail.value
}

// 规格类型改变事件
const onSingleSpecChange = (e) => {
  form.isSingleSpec = e.detail.value
}

// 生成随机条码
const generateGoodsNo = () => {
  if (form.priceType === 'weight') {
    // 称重商品生成4位随机码 (1000-9999)
    form.goodsNo = Math.floor(1000 + Math.random() * 9000).toString()
  } else {
    // 计件商品生成长条码
    let sn = (Math.random() + 1) * 100000000000000
    form.goodsNo = sn.toFixed(0)
  }
}

const chooseImage = () => {
  uni.chooseImage({
    count: 5 - imageList.value.length,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: (res) => {
      uploadImages(res.tempFilePaths)
    }
  })
}

const uploadImages = async (filePaths) => {
  uni.showLoading({
    title: '上传中...'
  })

  try {
    for (const filePath of filePaths) {
      const imageUrl = await uploadImage(filePath)
      imageList.value.push(imageUrl)
    }
  } catch (error) {
    uni.showToast({
      title: '图片上传失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

const deleteImage = (index) => {
  imageList.value.splice(index, 1)
}

const validateForm = () => {
  if (!form.name.trim()) {
    uni.showToast({
      title: '请输入商品名称',
      icon: 'none'
    })
    return false
  }

  if (!form.goodsNo.trim()) {
    uni.showToast({
      title: '请输入商品条码',
      icon: 'none'
    })
    return false
  }

  // 验证条码格式
  if (form.priceType === 'weight') {
    if (!/^\d{4}$/.test(form.goodsNo)) {
      uni.showToast({
        title: '称重商品条码必须是4位数字',
        icon: 'none'
      })
      return false
    }
  } else {
    if (!/^\d+$/.test(form.goodsNo)) {
      uni.showToast({
        title: '计件商品条码必须是数字',
        icon: 'none'
      })
      return false
    }
  }

  if (!form.cateId) {
    uni.showToast({
      title: '请选择商品分类',
      icon: 'none'
    })
    return false
  }

  if (!form.price || parseFloat(form.price) <= 0) {
    uni.showToast({
      title: '请输入正确的商品价格',
      icon: 'none'
    })
    return false
  }

  if (form.safetyStock === '' || parseInt(form.safetyStock) < 0) {
    uni.showToast({
      title: '请输入正确的安全库存',
      icon: 'none'
    })
    return false
  }

  return true
}

// 更新商品
const handleUpdateGoods = async () => {
  try {
    if (!validateForm()) return

    saving.value = true

    // 获取用户信息
    const userInfo = userStore.userInfo
    if (!userInfo || !userInfo.storeId || !userInfo.merchantId) {
      uni.showToast({
        title: '用户信息不完整，请重新登录',
        icon: 'none'
      })
      return
    }

    // 处理图片URL
    const imageUrls = imageList.value.map(item => {
      if (typeof item === 'string') {
        return item
      } else if (item && item.url) {
        return item.url
      }
      return null
    }).filter(url => url)

    const updatedData = {
      goodsId: goods.value.id || goodsId.value,
      // 基础信息
      name: form.name.trim(),
      goodsNo: form.goodsNo.trim(),
      cateId: parseInt(form.cateId),
      type: form.type,
      priceType: form.priceType,
      status: form.status,
      price: parseFloat(form.price),
      linePrice: form.linePrice ? parseFloat(form.linePrice) : null,
      stock: parseInt(form.stock) || 0,
      safetyStock: parseInt(form.safetyStock),
      weight: form.weight ? parseFloat(form.weight) : null,
      salePoint: form.salePoint.trim(),
      sort: parseInt(form.sort) || 0,

      // 店铺和商户信息
      storeId: userInfo.storeId,
      merchantId: userInfo.merchantId,

      // 扩展信息
      canUsePoint: form.canUsePoint,
      isMemberDiscount: form.isMemberDiscount,
      isSingleSpec: form.isSingleSpec,
      serviceTime: form.type === 'service' ? parseInt(form.serviceTime) || 0 : 0,

      // 固定字段
      isItaconsumableitem: 2,

      // 图片和描述
      images: imageUrls,
      description: form.description.trim()
    }

    // 先更新本地数据
    const localUpdatedData = {
      ...updatedData,
      cateName: form.cateName
    }
    goodsStore.updateLocalGoods(goodsId.value, localUpdatedData)

    try {
      // 调用API更新商品
      const response = await saveGoodsApi(updatedData)
      if (response.code === 200) {
        goodsStore.updateSyncStatus(goodsId.value, 1)
        uni.showToast({
          title: '更新成功',
          icon: 'success'
        })
      } else {
        throw new Error(response.message || '更新失败')
      }
    } catch (apiError) {
      uni.showToast({
        title: '已保存到本地，稍后同步',
        icon: 'none'
      })
    }

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)

  } catch (error) {
    uni.showToast({
      title: error.message || '更新失败，请重试',
      icon: 'none'
    })
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.edit-goods-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.page-header {
  padding: 40rpx 30rpx;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10rpx);
  margin-bottom: 30rpx;

  .header-content {
    text-align: center;

    .page-title {
      display: block;
      font-size: 48rpx;
      font-weight: bold;
      color: #fff;
      margin-bottom: 10rpx;
    }

    .page-subtitle {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

.card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-radius: 30rpx;
  margin: 30rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid rgba(255, 255, 255, 0.2);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40rpx;

    .card-title {
      display: flex;
      align-items: center;
      gap: 15rpx;

      .title-icon {
        font-size: 36rpx;
      }

      .title-text {
        font-size: 36rpx;
        font-weight: bold;
        color: #303133;
      }
    }

    .card-badge {
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      color: #fff;

      &.required {
        background: linear-gradient(135deg, #f56c6c 0%, #e85a4f 100%);
      }

      &.optional {
        background: linear-gradient(135deg, #909399 0%, #73767a 100%);
      }
    }
  }
}

.form-item {
  margin-bottom: 40rpx;

  .label {
    display: block;
    font-size: 30rpx;
    font-weight: 600;
    color: #303133;
    margin-bottom: 20rpx;

    &.required::after {
      content: ' *';
      color: #f56c6c;
    }
  }

  .input {
    width: 100%;
    height: 88rpx;
    padding: 0 24rpx;
    border: 2rpx solid #e4e7ed;
    border-radius: 15rpx;
    font-size: 30rpx;
    background: #fff;
    transition: all 0.3s;

    &:focus {
      border-color: #409eff;
      box-shadow: 0 0 0 4rpx rgba(64, 158, 255, 0.1);
    }

    &.readonly {
      background: #f5f7fa;
      color: #909399;
    }

    &.select {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;

      .placeholder {
        color: #c0c4cc;
      }

      .arrow {
        color: #c0c4cc;
        font-size: 24rpx;
      }
    }
  }

  .input-group {
    display: flex;
    align-items: center;
    gap: 20rpx;

    .input {
      flex: 1;
    }

    .unit {
      font-size: 28rpx;
      color: #909399;
      white-space: nowrap;
    }
  }

  .input-with-generate {
    display: flex;
    align-items: center;
    gap: 20rpx;

    .input {
      flex: 1;
    }

    .generate-btn {
      padding: 0 24rpx;
      height: 88rpx;
      background: linear-gradient(135deg, #409eff 0%, #36cfc9 100%);
      color: #fff;
      border: none;
      border-radius: 15rpx;
      font-size: 24rpx;
      white-space: nowrap;
      transition: all 0.3s;

      &:active {
        transform: scale(0.95);
      }
    }
  }

  .radio-group {
    display: flex;
    gap: 40rpx;
    margin-top: 20rpx;

    .radio-item {
      display: flex;
      align-items: center;
      gap: 10rpx;
      cursor: pointer;

      radio {
        transform: scale(1.2);
      }

      text {
        font-size: 28rpx;
        color: #606266;
      }
    }
  }

  .form-tips {
    font-size: 24rpx;
    color: #909399;
    margin-top: 10rpx;
    line-height: 1.4;
  }
}

.image-upload {
  .image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
    margin-bottom: 20rpx;
  }

  .image-item {
    position: relative;
    width: 150rpx;
    height: 150rpx;

    .image {
      width: 100%;
      height: 100%;
      border-radius: 10rpx;
    }

    .image-delete {
      position: absolute;
      top: -10rpx;
      right: -10rpx;
      width: 40rpx;
      height: 40rpx;
      background: #f56c6c;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      cursor: pointer;
    }
  }

  .image-add {
    width: 150rpx;
    height: 150rpx;
    border: 2rpx dashed #dcdfe6;
    border-radius: 10rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    .add-icon {
      font-size: 48rpx;
      color: #c0c4cc;
      margin-bottom: 10rpx;
    }

    .add-text {
      font-size: 24rpx;
      color: #c0c4cc;
    }
  }

  .image-tip {
    font-size: 24rpx;
    color: #909399;
  }
}

.textarea {
  width: 100%;
  min-height: 200rpx;
  padding: 24rpx;
  border: 2rpx solid #e4e7ed;
  border-radius: 15rpx;
  font-size: 30rpx;
  background: #fff;
  resize: none;
  transition: all 0.3s;

  &:focus {
    border-color: #409eff;
    box-shadow: 0 0 0 4rpx rgba(64, 158, 255, 0.1);
  }
}

.char-count {
  text-align: right;
  font-size: 24rpx;
  color: #909399;
  margin-top: 10rpx;
}

.form-actions {
  padding: 40rpx 30rpx;
  background: transparent;

  .save-btn {
    width: 100%;
    height: 100rpx;
    background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
    color: #fff;
    border: none;
    border-radius: 25rpx;
    font-size: 32rpx;
    font-weight: bold;
    transition: all 0.3s;
    box-shadow: 0 8rpx 24rpx rgba(103, 194, 58, 0.3);

    &:active {
      transform: translateY(2rpx);
      box-shadow: 0 4rpx 12rpx rgba(103, 194, 58, 0.3);
    }

    &.loading {
      background: #c0c4cc;
      transform: none;
      box-shadow: none;
    }

    &:disabled {
      background: #c0c4cc;
      transform: none;
      box-shadow: none;
    }
  }
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400rpx;
  color: #909399;

  .loading-text, .error-text {
    font-size: 28rpx;
    margin-bottom: 20rpx;
  }

  .retry-btn {
    padding: 20rpx 40rpx;
    background: #409eff;
    color: #fff;
    border: none;
    border-radius: 10rpx;
    font-size: 28rpx;
  }
}
</style>
