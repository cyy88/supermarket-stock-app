<template>
  <view class="add-goods-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-content">
        <text class="page-title">✏️ 编辑商品</text>
        <text class="page-subtitle">修改商品信息，快速更新</text>
      </view>
      <view class="progress-bar">
        <view class="progress-step" :class="{ active: currentStep >= 1 }">
          <text class="step-number">1</text>
          <text class="step-text">基本信息</text>
        </view>
        <view class="progress-line" :class="{ active: currentStep >= 2 }"></view>
        <view class="progress-step" :class="{ active: currentStep >= 2 }">
          <text class="step-number">2</text>
          <text class="step-text">扩展信息</text>
        </view>
        <view class="progress-line" :class="{ active: currentStep >= 3 }"></view>
        <view class="progress-step" :class="{ active: currentStep >= 3 }">
          <text class="step-number">3</text>
          <text class="step-text">图片描述</text>
        </view>
        <view class="progress-line" :class="{ active: currentStep >= 4 }"></view>
        <view class="progress-step" :class="{ active: currentStep >= 4 }">
          <text class="step-number">4</text>
          <text class="step-text">完成</text>
        </view>
      </view>
    </view>

    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="goods">
    <!-- 基本信息卡片 -->
    <view class="card" :class="{ active: currentStep === 1 }">
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
            placeholder="请输入商品条码，或使用扫码枪扫描"
            class="input"
            @input="updateStep"
          />
          <button class="generate-btn" @click="generateGoodsNo">
            随机生成
          </button>
        </view>
      </view>

      <view class="form-item">
        <text class="label required">商品名称</text>
        <view class="input-with-ai">
          <input
            v-model="form.name"
            placeholder="请输入商品名称"
            class="input"
            @input="updateStep"
          />
          <button
            class="ai-btn"
            @click="showAIRecognitionModal"
            :disabled="aiRecognizing"
          >
            {{ aiRecognizing ? '🤖 识别中...' : '🤖 AI识别' }}
          </button>
        </view>
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
            @input="updateStep"
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

<!--      <view class="form-item">-->
<!--        <text class="label">库存数量</text>-->
<!--        <view class="input-group" style="width: 50%;">-->
<!--          <input-->
<!--            v-model="form.stock"-->
<!--            type="number"-->
<!--            placeholder="请输入库存数量"-->
<!--            class="input"-->
<!--          />-->
<!--        </view>-->
<!--      </view>-->

      <view class="form-item">
        <text class="label required">安全库存</text>
        <view class="input-group" style="width: 50%;">
          <input
            v-model="form.safetyStock"
            type="number"
            placeholder="请输入安全库存"
            class="input"
            @input="updateStep"
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

<!--      <view class="form-item">-->
<!--        <text class="label">显示排序</text>-->
<!--        <view class="input-group" style="width: 50%;">-->
<!--          <input-->
<!--            v-model="form.sort"-->
<!--            type="number"-->
<!--            placeholder="请输入排序值"-->
<!--            class="input"-->
<!--          />-->
<!--        </view>-->
<!--        <view class="form-tips">提示：数值越小，排行越靠前</view>-->
<!--      </view>-->

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
    <view class="card" :class="{ active: currentStep === 2 }">
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

      <!-- 多规格商品管理 -->
      <view v-if="form.isSingleSpec === 'N'" class="form-item">
        <text class="label">商品规格</text>
        <SkuManager
          :sku-data="skuData"
          :price-type="form.priceType"
          :goods-id="goodsId"
          @sku-change="onSkuChange"
        />
      </view>

<!--      &lt;!&ndash; 单规格商品价格 &ndash;&gt;-->
<!--      <view v-if="form.isSingleSpec === 'Y'" class="form-item">-->
<!--        <text class="label required">商品价格</text>-->
<!--        <view class="input-group" style="width: 50%;">-->
<!--          <input-->
<!--            v-model="form.singlePrice"-->
<!--            type="digit"-->
<!--            placeholder="请输入价格"-->
<!--            class="input"-->
<!--            @input="updateStep"-->
<!--          />-->
<!--          <text class="unit">{{ form.priceType === 'weight' ? '元/千克' : '元' }}</text>-->
<!--        </view>-->
<!--      </view>-->

<!--      &lt;!&ndash; 单规格划线价格 &ndash;&gt;-->
<!--      <view v-if="form.isSingleSpec === 'Y'" class="form-item">-->
<!--        <text class="label">划线价格</text>-->
<!--        <view class="input-group" style="width: 50%;">-->
<!--          <input-->
<!--            v-model="form.singleLinePrice"-->
<!--            type="digit"-->
<!--            placeholder="请输入划线价格，空则不显示"-->
<!--            class="input"-->
<!--          />-->
<!--          <text class="unit">元</text>-->
<!--        </view>-->
<!--      </view>-->

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

      <!-- 规格描述 -->
      <view class="form-item">
        <text class="label">规格描述</text>
        <input
          style="width: 85%;"
          v-model="form.spec"
          placeholder="请输入规格描述，如水多少mL"
          class="input"
          maxlength="100"
        />
      </view>

      <!-- 形状描述 -->
      <view class="form-item">
        <text class="label">形状描述</text>
        <input
          style="width: 85%;"
          v-model="form.shape"
          placeholder="请输入形状描述，如杯个"
          class="input"
          maxlength="100"
        />
      </view>

      <!-- 品牌 -->
      <view class="form-item">
        <text class="label">品牌</text>
        <input
          style="width: 85%;"
          v-model="form.brand"
          placeholder="请输入品牌名称"
          class="input"
          maxlength="50"
        />
      </view>

      <!-- 供应商 -->
      <view class="form-item">
        <text class="label">供应商</text>
        <input
          style="width: 85%;"
          v-model="form.supplier"
          placeholder="请输入供应商名称"
          class="input"
          maxlength="100"
        />
      </view>
    </view>

    <!-- 商品图片卡片 -->
    <view class="card" :class="{ active: currentStep === 3 }">
      <view class="card-header">
        <view class="card-title">
          <text class="title-icon">🖼️</text>
          <text class="title-text">商品图片</text>
        </view>
        <view class="card-badge optional">可选</view>
      </view>
      <view class="image-upload">
        <view class="image-list">
          <view
            v-for="(image, index) in imageList"
            :key="index"
            class="image-item"
          >
            <image :src="image.url || image" mode="aspectFill" class="image" />
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
    <view class="card" :class="{ active: currentStep === 4 }">
      <view class="card-header">
        <view class="card-title">
          <text class="title-icon">📝</text>
          <text class="title-text" >商品描述</text>
        </view>
        <view class="card-badge optional">可选</view>
      </view>
      <textarea
          style="width: 90%;"
        v-model="form.description"
        placeholder="请输入商品描述（可选）"
        class="textarea"
        maxlength="500"
        @input="updateStep"
      />
      <view class="char-count">{{ form.description.length }}/500</view>
    </view>

    <!-- 保存按钮 -->
    <view class="form-actions">
      <button
        class="save-btn"
        :class="{ loading: saving }"
        @click="handleSaveGoods"
        :disabled="saving"
      >
        {{ saving ? '更新中...' : '💾 更新商品' }}
      </button>
    </view>

    <!-- AI识别模态框 -->
    <view v-if="showAIModal" class="ai-modal-overlay" @click="closeAIModal">
      <view class="ai-modal" @click.stop>
        <view class="ai-modal-header">
          <text class="ai-modal-title">🤖 AI智能识别</text>
          <text class="ai-modal-close" @click="closeAIModal">✕</text>
        </view>

        <view class="ai-modal-content">
          <view v-if="!aiRecognizing && !aiResult" class="ai-upload-area">
            <view class="ai-upload-icon">📷</view>
            <text class="ai-upload-text">选择商品图片进行AI识别</text>
            <text class="ai-upload-tip">支持JPG、PNG格式，识别约需12秒</text>
            <button class="ai-upload-btn" @click="chooseImageForAI">选择图片</button>
          </view>

          <view v-if="aiRecognizing" class="ai-recognizing">
            <view class="ai-loading">
              <view class="ai-loading-spinner"></view>
            </view>
            <text class="ai-recognizing-text">AI正在识别中...</text>
            <text class="ai-recognizing-tip">请稍候，大约需要12秒</text>
            <view class="ai-progress">
              <view class="ai-progress-bar" :style="{ width: aiProgress + '%' }"></view>
            </view>
          </view>

          <view v-if="aiResult && !aiRecognizing" class="ai-result">
            <view v-if="aiResult.success" class="ai-result-success">
              <text class="ai-result-title">✅ 识别成功</text>
              <view class="ai-result-item">
                <text class="ai-result-label">商品名称：</text>
                <text class="ai-result-value">{{ aiResult.data.name }}</text>
              </view>
              <view class="ai-result-item">
                <text class="ai-result-label">商品条码：</text>
                <text class="ai-result-value">{{ aiResult.data.num }}</text>
              </view>
              <view class="ai-result-actions">
                <button class="ai-result-btn apply" @click="applyAIResult">应用结果</button>
                <button class="ai-result-btn retry" @click="retryAIRecognition">重新识别</button>
              </view>
            </view>

            <view v-else class="ai-result-error">
              <text class="ai-result-title">❌ 识别失败</text>
              <text class="ai-result-error-msg">{{ aiResult.error }}</text>
              <view class="ai-result-actions">
                <button class="ai-result-btn retry" @click="retryAIRecognition">重新识别</button>
                <button class="ai-result-btn cancel" @click="closeAIModal">取消</button>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="error-state">
      <text class="error-text">商品不存在或加载失败</text>
      <button class="retry-btn" @click="loadGoodsDetail">重试</button>
    </view>
  </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import goodsStore from '@/stores/goods'
import userStore from '@/stores/user'
import { getGoodsDetail, saveGoods, getGoodsCateList, uploadImage } from '@/api/goods'
import SkuManager from '@/components/SkuManager.vue'



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
const currentStep = ref(1)

// SKU数据
const skuData = ref({
  attrList: [],
  skuList: [],
  initSkuList: []
})

const skuDataBackup = ref({
  attrList: [],
  skuList: [],
  initSkuList: []
})

const form = reactive({
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

  canUsePoint: 'Y',
  isMemberDiscount: 'Y',
  isSingleSpec: 'Y',
  serviceTime: 0,

  // 新增字段
  spec: '',
  shape: '',
  brand: '',
  supplier: '',

  // 单规格商品价格
  singlePrice: '',
  singleLinePrice: '',

  description: ''
})

onLoad(async (options) => {
  if (options.id) {
    goodsId.value = options.id
    await loadCategoryList()
    await loadGoodsDetail()
  } else {
    uni.showToast({
      title: '商品ID参数缺失',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})

// 加载商品详情
const loadGoodsDetail = async () => {
  try {
    loading.value = true

    const response = await getGoodsDetail(goodsId.value)

    if (response.code === 200 && response.data && response.data.goods) {
      goods.value = response.data.goods

      if (response.data.cateList && Array.isArray(response.data.cateList)) {
        categoryList.value = response.data.cateList
        goodsStore.saveCategories(categoryList.value)
      }

      fillForm(goods.value, response.data.cateList)
    } else {
      throw new Error(response.message || '获取商品详情失败')
    }
  } catch (error) {
    uni.showToast({
      title: error.message || '商品不存在或网络错误',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } finally {
    loading.value = false
  }
}

// 填充表单数据
const fillForm = (goodsData, cateList = null) => {
  form.type = goodsData.type || 'goods'
  form.typeName = form.type === 'goods' ? '实物商品' : '服务商品'
  form.priceType = goodsData.priceType || 'piece'
  form.goodsNo = goodsData.goodsNo || ''
  form.name = goodsData.name || ''
  form.cateId = String(goodsData.cateId || '')

  let cateName = goodsData.cateName || ''
  if (goodsData.cateId && (cateList || categoryList.value)) {
    const categories = cateList || categoryList.value
    const category = categories.find(cat => String(cat.id) === String(goodsData.cateId))
    if (category) {
      cateName = category.name
    } else {
      console.warn('未找到对应分类，cateId:', goodsData.cateId)
    }
  }
  form.cateName = cateName

  form.price = goodsData.price ? String(goodsData.price) : ''
  form.linePrice = goodsData.linePrice ? String(goodsData.linePrice) : ''
  form.stock = goodsData.stock ? String(goodsData.stock) : '0'
  form.safetyStock = goodsData.safetyStock ? String(goodsData.safetyStock) : '0'
  form.weight = goodsData.weight ? String(goodsData.weight) : ''
  form.salePoint = goodsData.salePoint || ''
  form.sort = goodsData.sort || 0
  form.status = goodsData.status || 'A'

  form.canUsePoint = goodsData.canUsePoint || 'Y'
  form.isMemberDiscount = goodsData.isMemberDiscount || 'Y'
  form.serviceTime = goodsData.serviceTime ? String(goodsData.serviceTime) : '0'

  form.spec = goodsData.spec || ''
  form.shape = goodsData.shape || ''
  form.brand = goodsData.brand || ''
  form.supplier = goodsData.supplier || ''

  form.singlePrice = form.price
  form.singleLinePrice = form.linePrice

  form.description = goodsData.description || ''

  // 设置图片
  imageList.value = []
  if (goodsData.images) {
    try {
      let images = []

      if (typeof goodsData.images === 'string') {
        try {
          images = JSON.parse(goodsData.images)
        } catch (e) {
          images = [goodsData.images]
        }
      } else if (Array.isArray(goodsData.images)) {
        images = goodsData.images
      }

      images.forEach(url => {
        if (url) {
          imageList.value.push({
            url: url
          })
        }
      })
    } catch (e) {
      console.error('解析商品图片失败:', e)
    }
  }

  // 设置商品分类
  const categories = categoryList.value
  if (categories && categories.length > 0 && form.cateId) {
    const categoryIndex = categories.findIndex(item => String(item.id) === String(form.cateId))
    if (categoryIndex >= 0) {
      selectedCategoryIndex.value = categoryIndex
      form.cateName = categories[categoryIndex].name
    } else {
      selectedCategoryIndex.value = 0
      console.warn('未找到对应的分类，cateId:', form.cateId)
    }
  } else {
    selectedCategoryIndex.value = 0
  }

  // 设置商品类型
  selectedTypeIndex.value = form.type === 'goods' ? 0 : 1

  // 处理SKU数据
  handleSkuData(goodsData)
  skuData.value = handleSkuData(goodsData);
  console.log("填充后的skuData:", skuData.value);
  form.isSingleSpec = goodsData.isSingleSpec || 'Y'

  if (form.isSingleSpec === 'N' && skuData.value) {
    skuDataBackup.value = {
      attrList: [...(skuData.value.attrList || [])],
      skuList: [...(skuData.value.skuList || [])],
      initSkuList: [...(skuData.value.initSkuList || [])]
    }
  }

  // 更新步骤
  updateStep()
}

// 处理SKU数据
const handleSkuData = (goodsData) => {
  try {
    // 转换规格数据（attrList）
    const attrList = Array.isArray(goodsData.specList)
        ? goodsData.specList.reduce((result, spec) => {
          // 检查是否已存在该规格名
          const existingSpec = result.find(item => item.name === spec.name);

          if (existingSpec) {
            const existingValue = existingSpec.child.find(child => child.value === spec.value);
            if (!existingValue) {
              existingSpec.child.push({
                id: spec.id,
                name: spec.value,
                value: spec.value
              });
            }
          } else {
            const specId = Date.now() + Math.random();
            result.push({
              id: specId,
              name: spec.name,
              child: [{
                id: spec.id,
                name: spec.value,
                value: spec.value
              }]
            });
          }
          return result;
        }, [])
        : [];

    // SKU数据直接使用
    const skuList = Array.isArray(goodsData.skuList)
        ? goodsData.skuList.map(sku => ({
          ...sku,
          // 添加specList数组（规格组合）
          specList: (sku.specIds || "").split("-").map(id => {
            const spec = goodsData.specList?.find(s => String(s.id) === id);
            return {
              id,
              name: spec?.name || "",
              value: spec?.value || ""
            };
          })
        }))
        : [];

    // 深拷贝创建初始SKU列表
    const initSkuList = JSON.parse(JSON.stringify(skuList));

    attrList.forEach((attr, index) => {
    });

    return {
      attrList,
      skuList,
      initSkuList
    };
  } catch (error) {
    return {
      attrList: [],
      skuList: [],
      initSkuList: []
    };
  }
}

const updateStep = () => {
  // 步骤1：基本信息必填项
  let hasPrice = false
  if (form.isSingleSpec === 'Y') {
    hasPrice = form.singlePrice && parseFloat(form.singlePrice) > 0
  } else {
    hasPrice = skuData.value.skuList && skuData.value.skuList.length > 0
  }

  if (form.name && form.cateId && hasPrice && form.goodsNo && form.safetyStock !== '') {
    currentStep.value = 2
  } else {
    currentStep.value = 1
    return
  }

  // 步骤2：扩展信息（可选）
  currentStep.value = 2

  // 步骤3：图片上传（可选）
  if (imageList.value.length > 0) {
    currentStep.value = 3
  }

  // 步骤4：商品描述（可选）
  if (form.description) {
    currentStep.value = 4
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
      const categories = res.data.paginationResponse.content || []
      categoryList.value = categories
      goodsStore.saveCategories(categoryList.value)
    } else {
      throw new Error(res.message || '获取分类失败')
    }
  } catch (error) {
    categoryList.value = goodsStore.categories

    if (categoryList.value.length === 0) {
      uni.showToast({
        title: '获取分类失败，请检查网络连接',
        icon: 'none'
      })
    }
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
  updateStep()
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
  updateStep()
}

// 设置计价方式
const setPriceType = (type) => {
  form.priceType = type
  updateStep()
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
  const newValue = e.detail.value
  const oldValue = form.isSingleSpec

  if (oldValue === 'N' && newValue === 'Y') {
    skuDataBackup.value = {
      attrList: [...(skuData.value.attrList || [])],
      skuList: [...(skuData.value.skuList || [])],
      initSkuList: [...(skuData.value.initSkuList || [])]
    }

    skuData.value = {
      attrList: [],
      skuList: [],
      initSkuList: []
    }

  }

  if (oldValue === 'Y' && newValue === 'N') {
    form.singlePrice = ''
    form.singleLinePrice = ''

    if (skuDataBackup.value.attrList.length > 0 || skuDataBackup.value.skuList.length > 0) {
      skuData.value = {
        attrList: [...skuDataBackup.value.attrList],
        skuList: [...skuDataBackup.value.skuList],
        initSkuList: [...skuDataBackup.value.initSkuList]
      }
    }
  }

  form.isSingleSpec = newValue
  updateStep()
}

// 修改onSkuChange函数，确保数据格式正确
const onSkuChange = (newSkuData) => {
  console.log('SKU数据已更新:', newSkuData)

  // 直接使用组件返回的数据，不做类型转换
  // 组件内部已经确保ID格式正确
  skuData.value = {
    attrList: newSkuData.attrList || [],
    skuList: newSkuData.skuList || [],
    initSkuList: newSkuData.initSkuList || []
  }

  if (form.isSingleSpec === 'N') {
    skuDataBackup.value = {
      attrList: [...(newSkuData.attrList || [])],
      skuList: [...(newSkuData.skuList || [])],
      initSkuList: [...(newSkuData.initSkuList || [])]
    }
  }

  updateStep()
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
  updateStep()
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
      if (imageUrl && imageUrl.trim()) {
        imageList.value.push({
          url: imageUrl,
          tempPath: filePath
        })
      } else {
        throw new Error('图片URL为空')
      }
    }
    updateStep()
  } catch (error) {
    console.error('图片上传失败:', error)
    uni.showToast({
      title: error.message || '图片上传失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

const deleteImage = (index) => {
  imageList.value.splice(index, 1)
  updateStep()
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

  // 单规格商品价格验证
  if (form.isSingleSpec === 'Y') {
    if (!form.singlePrice || parseFloat(form.singlePrice) <= 0) {
      uni.showToast({
        title: '请输入正确的商品价格',
        icon: 'none'
      })
      return false
    }
  }

  // 多规格商品验证
  if (form.isSingleSpec === 'N') {
    if (!skuData.value.skuList || skuData.value.skuList.length === 0) {
      uni.showToast({
        title: '请添加商品规格',
        icon: 'none'
      })
      return false
    }

    // 验证每个SKU的必填项
    for (let i = 0; i < skuData.value.skuList.length; i++) {
      const sku = skuData.value.skuList[i]
      if (!sku.skuNo || sku.skuNo.trim() === '') {
        uni.showToast({
          title: `第${i + 1}个规格的SKU编码不能为空`,
          icon: 'none'
        })
        return false
      }
      if (!sku.price || parseFloat(sku.price) <= 0) {
        uni.showToast({
          title: `第${i + 1}个规格的价格必须大于0`,
          icon: 'none'
        })
        return false
      }
    }
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

// 修改handleSaveGoods函数
const handleSaveGoods = async () => {
  try {
    if (!validateForm()) return

    saving.value = true

    const imageUrls = imageList.value.map(item => {
      if (typeof item === 'string') {
        return item
      } else if (item && item.url) {
        return item.url
      }
      return null
    }).filter(url => url)

    // 获取用户信息
    const userInfo = userStore.userInfo
    if (!userInfo || !userInfo.storeId || !userInfo.merchantId) {
      uni.showToast({
        title: '用户信息不完整，请重新登录',
        icon: 'none'
      })
      return
    }

    // 多规格商品时，使用第一个SKU的价格作为商品主价格
    let mainPrice = 0
    let mainLinePrice = null

    if (form.isSingleSpec === 'N' && Array.isArray(skuData.value.skuList) && skuData.value.skuList.length > 0) {
      const firstSku = skuData.value.skuList[0]
      if (firstSku && firstSku.price) {
        mainPrice = Number(firstSku.price)
        if (firstSku.linePrice) {
          mainLinePrice = Number(firstSku.linePrice)
        }
      }
    }

    const updatedData = {
      // ID
      id: goods.value.id,
      goodsId: goods.value.goodsId || goods.value.id,

      // 基础信息
      name: form.name.trim(),
      goodsNo: form.goodsNo.trim(),
      cateId: parseInt(form.cateId),
      type: form.type,
      priceType: form.priceType,
      status: form.status,
      price: form.isSingleSpec === 'Y' ? parseFloat(form.singlePrice) : mainPrice,
      linePrice: form.isSingleSpec === 'Y' && form.singleLinePrice ? parseFloat(form.singleLinePrice) : mainLinePrice,
      stock: parseInt(form.stock) || 0,
      safetyStock: parseInt(form.safetyStock),
      weight: form.weight ? parseFloat(form.weight) : 0,
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

      // 新增字段
      spec: form.spec.trim(),
      shape: form.shape.trim(),
      brand: form.brand.trim(),
      supplier: form.supplier.trim(),

      // 多规格数据，直接使用skuData，不做额外处理
      skuData: form.isSingleSpec === 'N' ? skuData.value.skuList : [],
      specData: form.isSingleSpec === 'N' ? skuData.value.attrList : [],

      // 保持原有的消耗品标识
      isItaconsumableitem: goods.value.isItaconsumableitem || 0,

      // 初始销量
      initSale: goods.value.initSale || 0,

      // 优惠券IDs
      couponIds: goods.value.couponIds || "",

      // 图片和描述
      images: imageUrls,
      description: form.description.trim()
    }

    try {
      const response = await saveGoods(updatedData)
      if (response.code === 200) {
        uni.showToast({
          title: '更新成功',
          icon: 'success'
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } else {
        throw new Error(response.message || '更新失败')
      }
    } catch (apiError) {
      uni.showToast({
        title: apiError.message || '更新失败，请重试',
        icon: 'none'
      })
    }
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
.add-goods-container {
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
    margin-bottom: 40rpx;

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

  .progress-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 20rpx;

    .progress-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      opacity: 0.5;
      transition: all 0.3s;

      &.active {
        opacity: 1;
      }

      .step-number {
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
        font-weight: bold;
        margin-bottom: 10rpx;
        transition: all 0.3s;
      }

      &.active .step-number {
        background: #fff;
        color: #667eea;
        transform: scale(1.1);
      }

      .step-text {
        font-size: 22rpx;
        color: #fff;
      }
    }

    .progress-line {
      width: 80rpx;
      height: 4rpx;
      background: rgba(255, 255, 255, 0.3);
      margin: 0 20rpx;
      transition: all 0.3s;

      &.active {
        background: #fff;
      }
    }
  }
}

.card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25rpx;
  padding: 0;
  margin: 0 20rpx 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10rpx);
  border: 2rpx solid transparent;
  transition: all 0.3s;

  &.active {
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-4rpx);
    box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.15);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 30rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .card-title {
    display: flex;
    align-items: center;

    .title-icon {
      font-size: 36rpx;
      margin-right: 15rpx;
    }

    .title-text {
      font-size: 32rpx;
      font-weight: bold;
      color: #303133;
    }
  }

  .card-badge {
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-size: 22rpx;
    color: #fff;

    &.required {
      background: linear-gradient(135deg, #f56c6c 0%, #ff4757 100%);
    }

    &.optional {
      background: linear-gradient(135deg, #19be6b 0%, #52c41a 100%);
    }
  }
}

.card .form-item,
.card .image-upload,
.card .textarea,
.card .char-count {
  margin: 0 20rpx;
}

.card .form-item:first-of-type {
  margin-top: 30rpx;
}

.card .form-item:last-of-type,
.card .image-upload,
.card .char-count {
  margin-bottom: 30rpx;
}



.form-item {
  margin-bottom: 30rpx;
  padding: 0 10rpx;

  .label {
    display: block;
    font-size: 28rpx;
    color: #606266;
    margin-bottom: 15rpx;

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
    font-size: 28rpx;
    background: #fff;
    transition: all 0.3s;

    &:focus {
      border-color: #667eea;
      outline: none;
      box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
    }

    &.readonly {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      color: #6c757d;
      border-color: #dee2e6;
    }

    &.select {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;

      .placeholder {
        color: #adb5bd;
      }

      .arrow {
        color: #6c757d;
        font-size: 24rpx;
        transition: transform 0.3s;
      }

      &:active .arrow {
        transform: rotate(180deg);
      }
    }
  }

  .input-group {
    display: flex;
    align-items: center;
    border: 2rpx solid #dcdfe6;
    border-radius: 10rpx;
    background: #fff;

    &:focus-within {
      border-color: #3c9cff;
    }

    .input {
      flex: 1;
      border: none;
      background: transparent;
    }

    .unit {
      padding: 0 20rpx;
      color: #909399;
      font-size: 28rpx;
    }
  }

  .input-with-ai {
    display: flex;
    align-items: center;
    gap: 20rpx;

    .input {
      flex: 1;
    }

    .ai-btn {
      padding: 0 24rpx;
      height: 88rpx;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      border: none;
      border-radius: 15rpx;
      font-size: 24rpx;
      white-space: nowrap;
      transition: all 0.3s;

      &:active {
        transform: scale(0.95);
      }

      &:disabled {
        background: #c0c4cc;
        transform: none;
      }
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
        transform: scale(0.9);
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
  padding: 20rpx;
  border: 2rpx solid #dcdfe6;
  border-radius: 10rpx;
  font-size: 28rpx;
  background: #fff;
  resize: none;

  &:focus {
    border-color: #3c9cff;
    outline: none;
  }
}

.char-count {
  text-align: right;
  font-size: 24rpx;
  color: #909399;
  margin-top: 10rpx;
}

.form-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  padding: 30rpx 40rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.2);
  z-index: 100;
}

.save-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 25rpx;
  font-size: 32rpx;
  font-weight: bold;
  transition: all 0.3s;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.4);

    &::before {
      left: 100%;
    }
  }

  &.loading {
    background: linear-gradient(135deg, #adb5bd 0%, #6c757d 100%);
    box-shadow: none;
  }

  &:disabled {
    background: linear-gradient(135deg, #adb5bd 0%, #6c757d 100%);
    box-shadow: none;
  }
}

// AI识别模态框样式
.ai-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40rpx;
}

.ai-modal {
  background: #fff;
  border-radius: 25rpx;
  width: 100%;
  max-width: 600rpx;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
}

.ai-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .ai-modal-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #fff;
  }

  .ai-modal-close {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    cursor: pointer;
    transition: all 0.3s;

    &:active {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0.9);
    }
  }
}

.ai-modal-content {
  padding: 40rpx 30rpx;
  min-height: 300rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.ai-upload-area {
  text-align: center;

  .ai-upload-icon {
    font-size: 120rpx;
    margin-bottom: 30rpx;
    opacity: 0.6;
  }

  .ai-upload-text {
    display: block;
    font-size: 32rpx;
    color: #303133;
    margin-bottom: 15rpx;
    font-weight: bold;
  }

  .ai-upload-tip {
    display: block;
    font-size: 24rpx;
    color: #909399;
    margin-bottom: 40rpx;
  }

  .ai-upload-btn {
    padding: 20rpx 60rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 50rpx;
    font-size: 28rpx;
    font-weight: bold;
    transition: all 0.3s;

    &:active {
      transform: scale(0.95);
    }
  }
}

.ai-recognizing {
  text-align: center;

  .ai-loading {
    margin-bottom: 30rpx;

    .ai-loading-spinner {
      width: 80rpx;
      height: 80rpx;
      border: 6rpx solid #f3f3f3;
      border-top: 6rpx solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
  }

  .ai-recognizing-text {
    display: block;
    font-size: 32rpx;
    color: #303133;
    margin-bottom: 15rpx;
    font-weight: bold;
  }

  .ai-recognizing-tip {
    display: block;
    font-size: 24rpx;
    color: #909399;
    margin-bottom: 30rpx;
  }

  .ai-progress {
    width: 100%;
    height: 8rpx;
    background: #f0f0f0;
    border-radius: 4rpx;
    overflow: hidden;

    .ai-progress-bar {
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
      border-radius: 4rpx;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.ai-result {
  .ai-result-success,
  .ai-result-error {
    text-align: center;
  }

  .ai-result-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 30rpx;
  }

  .ai-result-success .ai-result-title {
    color: #19be6b;
  }

  .ai-result-error .ai-result-title {
    color: #f56c6c;
  }

  .ai-result-item {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    padding: 20rpx;
    background: #f8f9fa;
    border-radius: 15rpx;

    .ai-result-label {
      font-size: 28rpx;
      color: #606266;
      min-width: 160rpx;
    }

    .ai-result-value {
      flex: 1;
      font-size: 28rpx;
      color: #303133;
      font-weight: bold;
    }
  }

  .ai-result-error-msg {
    display: block;
    font-size: 28rpx;
    color: #f56c6c;
    margin-bottom: 30rpx;
    padding: 20rpx;
    background: #fef0f0;
    border-radius: 15rpx;
  }

  .ai-result-actions {
    display: flex;
    gap: 20rpx;
    margin-top: 30rpx;

    .ai-result-btn {
      flex: 1;
      padding: 20rpx;
      border: none;
      border-radius: 15rpx;
      font-size: 28rpx;
      font-weight: bold;
      transition: all 0.3s;

      &:active {
        transform: scale(0.95);
      }

      &.apply {
        background: linear-gradient(135deg, #19be6b 0%, #52c41a 100%);
        color: #fff;
      }

      &.retry {
        background: linear-gradient(135deg, #ff9900 0%, #ffad33 100%);
        color: #fff;
      }

      &.cancel {
        background: #f5f7fa;
        color: #606266;
        border: 2rpx solid #dcdfe6;
      }
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
