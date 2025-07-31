<template>
  <view class="sku-manager">
    <!-- 规格设置标题 -->
    <view class="spec-header">
      <text class="spec-title">商品规格</text>
      <button v-if="!disabled" class="add-spec-btn" @click="addSpecRow">
        <text class="add-icon">+</text>
        <text>添加规格</text>
      </button>
    </view>

    <!-- 规格列表 -->
    <view class="spec-list">
      <view
        v-for="(spec, specIndex) in localSkuData.attrList || []"
        :key="specIndex"
        class="spec-item"
      >
        <view class="spec-header-row">
          <text class="spec-index">规格{{ specIndex + 1 }}</text>
          <button
            v-if="!disabled"
            class="delete-spec-btn"
            @click="removeSpecRow(specIndex)"
          >删除规格</button>
        </view>

        <view class="spec-content">
          <view class="spec-name-row">
            <text class="label">规格名</text>
            <input
              v-model="spec.name"
              class="spec-name-input"
              placeholder="请输入规格名称"
              :disabled="disabled"
              @input="onSpecNameChange"
            />
          </view>

          <view class="spec-values-row">
            <text class="label">规格值</text>
            <view class="spec-values-container">
              <view class="spec-values-list">
                <view
                  v-for="(value, valueIndex) in spec.child || []"
                  :key="valueIndex"
                  class="spec-value-item"
                  v-if="value && value.name"
                >
                  <text class="value-text">{{ value.name }}</text>
                  <text
                    v-if="!disabled"
                    class="value-delete"
                    @click="removeSpecValue(specIndex, valueIndex)"
                  >×</text>
                </view>
              </view>
              <button
                v-if="!disabled"
                class="add-value-btn"
                @click="addSpecValue(specIndex)"
              >+ 添加规格值</button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 批量设置 -->
    <view v-if="(localSkuData.skuList || []).length > 0 && !disabled" class="batch-setting">
      <view class="batch-header">
        <text class="batch-title">批量设置</text>
        <text class="batch-desc">快速为所有规格设置相同的信息</text>
      </view>

      <view class="batch-form">
        <view class="batch-row">
          <view class="batch-item">
            <text class="batch-label">SKU编码</text>
            <view class="batch-input-group">
              <input
                v-model="batch.skuNo"
                class="batch-input"
                placeholder="输入前缀"
              />
              <button class="generate-btn" @click="generateSkuNo">随机生成</button>
            </view>
          </view>
        </view>

        <view class="batch-row">
          <view class="batch-item">
            <text class="batch-label">{{ priceType === 'weight' ? '单价(元/千克)' : '销售价格(元)' }}</text>
            <input
              v-model="batch.price"
              class="batch-input"
              type="digit"
              placeholder="0.00"
            />
          </view>

          <view class="batch-item">
            <text class="batch-label">{{ priceType === 'weight' ? '划线单价(元/千克)' : '划线价格(元)' }}</text>
            <input
              v-model="batch.linePrice"
              class="batch-input"
              type="digit"
              placeholder="0.00"
            />
          </view>
        </view>

        <view class="batch-row">
          <view class="batch-item">
            <text class="batch-label">商品重量(千克)</text>
            <input
              v-model="batch.weight"
              class="batch-input"
              type="digit"
              placeholder="0.00"
            />
          </view>

          <view class="batch-item">
            <button class="batch-apply-btn" @click="batchSetSku">确认设置</button>
          </view>
        </view>
      </view>
    </view>

    <!-- SKU表格 -->
    <view v-if="(localSkuData.skuList || []).length > 0" class="sku-table-container">
      <view class="sku-table-header">
        <text class="table-title">商品规格设置</text>
        <text class="table-desc">为每个规格组合设置具体信息</text>
      </view>

      <view class="sku-table">
        <view class="table-header">
          <view class="th th-index">序号</view>
          <view class="th th-image">图片</view>
          <view class="th th-spec">规格</view>
          <view class="th th-sku">SKU编码</view>
          <view class="th th-price">{{ priceType === 'weight' ? '单价(元/千克)' : '销售价格(元)' }}</view>
          <view class="th th-line-price">{{ priceType === 'weight' ? '划线单价(元/千克)' : '划线价格(元)' }}</view>
          <view class="th th-weight">重量(千克)</view>
        </view>

        <view
          v-for="(sku, index) in localSkuData.skuList || []"
          :key="index"
          class="table-row"
        >
          <view class="td td-index">{{ index + 1 }}</view>

          <view class="td td-image">
            <view class="image-upload" @click="chooseSkuImage(index)">
              <image
                v-if="sku.logo"
                :src="sku.logo"
                class="sku-image"
                mode="aspectFill"
              />
              <view v-else class="upload-placeholder">
                <text class="upload-icon">+</text>
              </view>
            </view>
          </view>

          <view class="td td-spec">
            <view class="spec-tags">
              <view
                v-for="(spec, specIdx) in sku.specList || []"
                :key="specIdx"
                class="spec-tag"
              >
                <text class="spec-tag-text">{{ spec && spec.value ? spec.value : '' }}</text>
              </view>
            </view>
          </view>

          <view class="td td-sku">
            <input
              v-model="sku.skuNo"
              class="table-input"
              placeholder="请输入SKU编码"
              :disabled="disabled"
            />
          </view>

          <view class="td td-price">
            <input
              v-model="sku.price"
              class="table-input"
              type="digit"
              placeholder="0.00"
              :disabled="disabled"
            />
          </view>

          <view class="td td-line-price">
            <input
              v-model="sku.linePrice"
              class="table-input"
              type="digit"
              placeholder="0.00"
              :disabled="disabled"
            />
          </view>

          <view class="td td-weight">
            <input
              v-model="sku.weight"
              class="table-input"
              type="digit"
              placeholder="0.00"
              :disabled="disabled"
            />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, watch, computed, nextTick, onMounted } from 'vue'
import { uploadImage } from '@/api/goods'

const props = defineProps({
  skuData: {
    type: Object,
    default: () => ({ attrList: [], skuList: [], initSkuList: [] })
  },
  disabled: {
    type: Boolean,
    default: false
  },
  priceType: {
    type: String,
    default: 'piece'
  },
  goodsId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['skuChange'])


// 使用本地数据，避免直接修改props
const localSkuData = reactive({
  attrList: [],
  skuList: [],
  initSkuList: []
})

// 批量设置数据
const batch = reactive({
  skuNo: '',
  price: '',
  linePrice: '',
  weight: ''
})

// 在初始化本地数据后添加一个获取当前最大ID的函数，确保新生成的ID不重复
let currentMaxId = 1;

// 修改generateSafeId函数，保证ID唯一并且是数字类型
const generateSafeId = () => {
  // 返回自增的ID，确保唯一性
  return currentMaxId++;
}

// 初始化本地数据时同时更新最大ID
const updateMaxId = () => {
  // 从attrList中找最大ID
  if (Array.isArray(localSkuData.attrList)) {
    localSkuData.attrList.forEach(attr => {
      if (attr && typeof attr.id === 'number' && attr.id > currentMaxId) {
        currentMaxId = attr.id + 1;
      }
      
      // 检查child数组
      if (Array.isArray(attr.child)) {
        attr.child.forEach(child => {
          if (child && typeof child.id === 'number' && child.id > currentMaxId) {
            currentMaxId = child.id + 1;
          }
        });
      }
    });
  }
  
  // 从skuList中找最大ID
  if (Array.isArray(localSkuData.skuList)) {
    localSkuData.skuList.forEach(sku => {
      if (sku && typeof sku.id === 'number' && sku.id > currentMaxId) {
        currentMaxId = sku.id + 1;
      }
    });
  }
  
  // 如果没找到任何ID，从500开始（避免与其他自动生成ID冲突）
  if (currentMaxId <= 1) {
    currentMaxId = 500;
  }
}

// 初始化本地数据
const initLocalData = () => {
  try {
    const safeSkuData = props.skuData || { attrList: [], skuList: [], initSkuList: [] };
    
    localSkuData.attrList = Array.isArray(safeSkuData.attrList) ? 
      JSON.parse(JSON.stringify(safeSkuData.attrList)) : [];
    localSkuData.skuList = Array.isArray(safeSkuData.skuList) ? 
      JSON.parse(JSON.stringify(safeSkuData.skuList)) : [];
    localSkuData.initSkuList = Array.isArray(safeSkuData.initSkuList) ? 
      JSON.parse(JSON.stringify(safeSkuData.initSkuList)) : [];
      
    // 更新当前最大ID
    updateMaxId();
  } catch (error) {
    console.error('初始化SKU数据失败:', error);
    localSkuData.attrList = [];
    localSkuData.skuList = [];
    localSkuData.initSkuList = [];
  }
}

// 监听props变化之前添加初始化代码
// 立即初始化数据
initLocalData();

// 监听props变化
watch(() => props.skuData, (newVal) => {
  initLocalData();
}, { deep: true, immediate: true });

// 添加规格行
const addSpecRow = () => {
  uni.showModal({
    title: '添加规格',
    content: '请输入规格名称',
    editable: true,
    placeholderText: '例如：颜色、尺寸',
    success: (res) => {
      if (res.confirm && res.content) {
        const newSpec = {
          id: generateSafeId(), // 使用安全的ID生成方法
          name: res.content,
          child: []
        }
        if (!Array.isArray(localSkuData.attrList)) {
          localSkuData.attrList = [];
        }
        localSkuData.attrList.push(newSpec);
        nextTick(() => {
          updateSkuList();
        });
      }
    }
  });
}

// 删除规格行
const removeSpecRow = (index) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个规格吗？',
    success: (res) => {
      if (res.confirm) {
        if (!Array.isArray(localSkuData.attrList)) {
          localSkuData.attrList = [];
          return;
        }
        localSkuData.attrList.splice(index, 1);
        nextTick(() => {
          updateSkuList();
        });
      }
    }
  });
}

// 添加规格值
const addSpecValue = (specIndex) => {
  uni.showModal({
    title: '添加规格值',
    content: '请输入规格值',
    editable: true,
    placeholderText: '例如：红色、大号',
    success: (res) => {
      if (res.confirm && res.content) {
        if (!Array.isArray(localSkuData.attrList)) {
          localSkuData.attrList = [];
          return;
        }
        
        if (!localSkuData.attrList[specIndex]) {
          return;
        }
        
        if (!Array.isArray(localSkuData.attrList[specIndex].child)) {
          localSkuData.attrList[specIndex].child = [];
        }
        
        const newValue = {
          id: generateSafeId(), // 使用安全的ID生成方法
          name: res.content,
          value: res.content
        };
        
        localSkuData.attrList[specIndex].child.push(newValue);
        nextTick(() => {
          updateSkuList();
        });
      }
    }
  });
}

// 删除规格值
const removeSpecValue = (specIndex, valueIndex) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个规格值吗？',
    success: (res) => {
      if (res.confirm) {
        if (!Array.isArray(localSkuData.attrList) || 
            !localSkuData.attrList[specIndex] ||
            !Array.isArray(localSkuData.attrList[specIndex].child)) {
          return;
        }
        
        localSkuData.attrList[specIndex].child.splice(valueIndex, 1);
        nextTick(() => {
          updateSkuList();
        });
      }
    }
  });
}

// 规格名称变更时更新
const onSpecNameChange = () => {
  nextTick(() => {
    updateSkuList();
  });
}

// 生成SKU列表
const generateSkuList = () => {
  try {
    if (!Array.isArray(localSkuData.attrList)) {
      return [];
    }
    
    const attrList = localSkuData.attrList.filter(attr => 
      attr && attr.name && attr.child && attr.child.length > 0
    );
    
    if (attrList.length === 0) {
      return [];
    }
    
    const combinations = [];
    const attrValues = attrList.map(attr => attr.child || []);
    
    const cartesian = (arr, i = 0, current = []) => {
      if (i === arr.length) {
        combinations.push([...current]);
        return;
      }
      
      for (const item of arr[i]) {
        if (item) {
          current[i] = item;
          cartesian(arr, i + 1, current);
        }
      }
    }
    
    cartesian(attrValues);
    
    if (combinations.length === 0) {
      return [];
    }
    
    return combinations.map((combination, index) => {
      // 使用组合中第一个规格值的ID作为specIds
      const specId = combination[0] ? combination[0].id : generateSafeId();
      const specIds = String(specId); // 确保是字符串格式
      
      // 构建规格列表，确保ID是数字类型
      const specList = combination.map(item => {
        if (!item) return { id: 0, name: '', value: '' };
        return {
          id: Number(item.id),
          name: item.name || '',
          value: item.value || ''
        };
      });
      
      // 查找已存在的SKU数据
      const existingSku = Array.isArray(localSkuData.skuList) && localSkuData.skuList.find(sku => 
        sku && sku.specIds === specIds
      ) || Array.isArray(localSkuData.initSkuList) && localSkuData.initSkuList.find(sku => 
        sku && sku.specIds === specIds
      );
      
      // 创建或更新SKU对象
      return {
        id: existingSku?.id || 0, // 保留已有ID或设为0（新增时后端会分配）
        specIds,
        specList,
        skuNo: existingSku?.skuNo || `${Date.now()}${index}`.slice(-16), // 生成有效的SKU编号
        goodsId: props.goodsId || '',
        price: existingSku?.price || '',
        linePrice: existingSku?.linePrice || '',
        weight: existingSku?.weight || '0',
        stock: existingSku?.stock || '',
        logo: existingSku?.logo || ''
      };
    });
  } catch (error) {
    console.error('生成SKU列表出错:', error);
    return [];
  }
}

// 更新SKU列表
const updateSkuList = () => {
  try {
    const newSkuList = generateSkuList();
    localSkuData.skuList = newSkuList;
    
    // 通知父组件数据变化
    emitSkuChange();
  } catch (error) {
  }
}

// 通知父组件数据变化
const emitSkuChange = () => {
  try {
    const emitData = {
      attrList: Array.isArray(localSkuData.attrList) ? localSkuData.attrList : [],
      skuList: Array.isArray(localSkuData.skuList) ? localSkuData.skuList : [],
      initSkuList: Array.isArray(localSkuData.initSkuList) ? localSkuData.initSkuList : []
    };
    
    emit('skuChange', emitData);
  } catch (error) {
    console.error('通知数据变化失败:', error);
  }
}

// 批量设置SKU
const batchSetSku = () => {
  if (!Array.isArray(localSkuData.skuList) || localSkuData.skuList.length === 0) {
    uni.showToast({
      title: '没有可用的SKU列表',
      icon: 'none'
    });
    return;
  }

  localSkuData.skuList.forEach((sku, index) => {
    if (sku) {
      if (batch.skuNo) {
        sku.skuNo = batch.skuNo + index;
      }
      if (batch.price) {
        sku.price = batch.price;
      }
      if (batch.linePrice) {
        sku.linePrice = batch.linePrice;
      }
      if (batch.weight) {
        sku.weight = batch.weight;
      }
    }
  });
  
  emitSkuChange();
  
  uni.showToast({
    title: '批量设置成功',
    icon: 'success'
  });
}

// 生成随机SKU编码
const generateSkuNo = () => {
  const randomNum = Math.floor(Math.random() * 10000000000000) + 1000000000000;
  batch.skuNo = randomNum.toString();
}

// 选择SKU图片
const chooseSkuImage = (index) => {
  if (props.disabled) return;
  
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: (res) => {
      uni.showLoading({ title: '上传中...' });
      
      uploadImage(res.tempFilePaths[0])
        .then(imageUrl => {
          if (!Array.isArray(localSkuData.skuList)) {
            localSkuData.skuList = [];
          }
          
          if (localSkuData.skuList[index]) {
            localSkuData.skuList[index].logo = imageUrl;
            emitSkuChange();
          }
          
          uni.hideLoading();
          uni.showToast({
            title: '上传成功',
            icon: 'success'
          });
        })
        .catch(error => {
          console.error('图片上传失败:', error);
          uni.hideLoading();
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          });
        });
    }
  });
}

// 在组件挂载后确保数据初始化
onMounted(() => {
  console.log('SkuManager组件挂载完成');
  try {
    initLocalData();
    updateSkuList();
  } catch (error) {
    console.error('组件挂载后初始化失败:', error);
  }
});
</script>

<style lang="scss" scoped>
.sku-manager {
  background: #f8f9fa;
  border-radius: 12rpx;
  overflow: hidden;
}

// 规格设置头部
.spec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: #fff;
  border-bottom: 2rpx solid #f0f0f0;

  .spec-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #303133;
  }

  .add-spec-btn {
    display: flex;
    align-items: center;
    background: #409eff;
    color: #fff;
    border: none;
    border-radius: 8rpx;
    padding: 16rpx 24rpx;
    font-size: 26rpx;

    .add-icon {
      margin-right: 8rpx;
      font-size: 28rpx;
      font-weight: bold;
    }
  }
}

// 规格列表
.spec-list {
  background: #fff;
}

.spec-item {
  border-bottom: 2rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  .spec-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 30rpx 16rpx;
    background: #fafbfc;

    .spec-index {
      font-size: 28rpx;
      font-weight: bold;
      color: #303133;
    }

    .delete-spec-btn {
      background: none;
      border: none;
      color: #f56c6c;
      font-size: 26rpx;
      padding: 8rpx 16rpx;
    }
  }

  .spec-content {
    padding: 20rpx 30rpx 30rpx;
  }

  .spec-name-row {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;

    .label {
      width: 120rpx;
      font-size: 28rpx;
      color: #606266;
      font-weight: 500;
    }

    .spec-name-input {
      flex: 1;
      height: 72rpx;
      padding: 0 20rpx;
      border: 2rpx solid #dcdfe6;
      border-radius: 8rpx;
      font-size: 28rpx;
      background: #fff;

      &:focus {
        border-color: #409eff;
      }
    }
  }

  .spec-values-row {
    .label {
      display: block;
      width: 120rpx;
      font-size: 28rpx;
      color: #606266;
      font-weight: 500;
      margin-bottom: 16rpx;
    }

    .spec-values-container {
      .spec-values-list {
        display: flex;
        flex-wrap: wrap;
        gap: 12rpx;
        margin-bottom: 20rpx;

        .spec-value-item {
          display: flex;
          align-items: center;
          background: #e1f3ff;
          border: 2rpx solid #b3d8ff;
          border-radius: 6rpx;
          padding: 12rpx 16rpx;

          .value-text {
            font-size: 26rpx;
            color: #409eff;
            margin-right: 8rpx;
          }

          .value-delete {
            color: #f56c6c;
            font-size: 32rpx;
            font-weight: bold;
            line-height: 1;
            cursor: pointer;
          }
        }
      }

      .add-value-btn {
        background: #f0f9ff;
        border: 2rpx dashed #409eff;
        color: #409eff;
        border-radius: 6rpx;
        padding: 12rpx 20rpx;
        font-size: 26rpx;
      }
    }
  }
}

// 批量设置
.batch-setting {
  background: #fff;
  border-top: 2rpx solid #f0f0f0;
  padding: 30rpx;
  margin-bottom: 30rpx;

  .batch-header {
    margin-bottom: 24rpx;

    .batch-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #303133;
      display: block;
      margin-bottom: 8rpx;
    }

    .batch-desc {
      font-size: 24rpx;
      color: #909399;
    }
  }

  .batch-form {
    .batch-row {
      display: flex;
      margin-bottom: 24rpx;
      gap: 20rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .batch-item {
        flex: 1;

        .batch-label {
          display: block;
          font-size: 26rpx;
          color: #606266;
          margin-bottom: 12rpx;
          font-weight: 500;
        }

        .batch-input {
          width: 100%;
          height: 72rpx;
          padding: 0 20rpx;
          border: 2rpx solid #dcdfe6;
          border-radius: 8rpx;
          font-size: 28rpx;
          background: #fff;

          &:focus {
            border-color: #409eff;
          }
        }

        .batch-input-group {
          display: flex;
          gap: 12rpx;

          .batch-input {
            flex: 1;
          }

          .generate-btn {
            background: #909399;
            color: #fff;
            border: none;
            border-radius: 8rpx;
            padding: 0 20rpx;
            font-size: 24rpx;
            white-space: nowrap;
          }
        }

        .batch-apply-btn {
          width: 100%;
          height: 72rpx;
          background: #67c23a;
          color: #fff;
          border: none;
          border-radius: 8rpx;
          font-size: 28rpx;
          font-weight: bold;
        }
      }
    }
  }
}

// SKU表格容器
.sku-table-container {
  background: #fff;
  border-top: 2rpx solid #f0f0f0;

  .sku-table-header {
    padding: 30rpx;
    border-bottom: 2rpx solid #f0f0f0;

    .table-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #303133;
      display: block;
      margin-bottom: 8rpx;
    }

    .table-desc {
      font-size: 24rpx;
      color: #909399;
    }
  }

  .sku-table {
    overflow-x: auto;

    .table-header {
      display: flex;
      background: #fafbfc;
      border-bottom: 2rpx solid #e4e7ed;

      .th {
        padding: 20rpx 12rpx;
        font-size: 26rpx;
        font-weight: bold;
        color: #606266;
        text-align: center;
        border-right: 2rpx solid #e4e7ed;

        &:last-child {
          border-right: none;
        }

        &.th-index {
          width: 80rpx;
          min-width: 80rpx;
        }

        &.th-image {
          width: 120rpx;
          min-width: 120rpx;
        }

        &.th-spec {
          width: 200rpx;
          min-width: 200rpx;
        }

        &.th-sku {
          width: 180rpx;
          min-width: 180rpx;
        }

        &.th-price {
          width: 160rpx;
          min-width: 160rpx;
        }

        &.th-line-price {
          width: 160rpx;
          min-width: 160rpx;
        }

        &.th-weight {
          width: 120rpx;
          min-width: 120rpx;
        }
      }
    }

    .table-row {
      display: flex;
      border-bottom: 2rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      &:nth-child(even) {
        background: #fafbfc;
      }

      .td {
        padding: 20rpx 12rpx;
        border-right: 2rpx solid #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;

        &:last-child {
          border-right: none;
        }

        &.td-index {
          width: 80rpx;
          min-width: 80rpx;
          font-size: 26rpx;
          color: #606266;
        }

        &.td-image {
          width: 120rpx;
          min-width: 120rpx;
        }

        &.td-spec {
          width: 200rpx;
          min-width: 200rpx;
        }

        &.td-sku {
          width: 180rpx;
          min-width: 180rpx;
        }

        &.td-price {
          width: 160rpx;
          min-width: 160rpx;
        }

        &.td-line-price {
          width: 160rpx;
          min-width: 160rpx;
        }

        &.td-weight {
          width: 120rpx;
          min-width: 120rpx;
        }
      }
    }
  }
}

// 表格内部元素样式
.image-upload {
  width: 80rpx;
  height: 80rpx;
  border: 2rpx dashed #dcdfe6;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  cursor: pointer;

  &:hover {
    border-color: #409eff;
  }

  .sku-image {
    width: 100%;
    height: 100%;
    border-radius: 6rpx;
    object-fit: cover;
  }

  .upload-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    .upload-icon {
      font-size: 32rpx;
      color: #c0c4cc;
      font-weight: bold;
    }
  }
}

.spec-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  justify-content: center;

  .spec-tag {
    .spec-tag-text {
      background: #e1f3ff;
      color: #409eff;
      padding: 6rpx 12rpx;
      border-radius: 6rpx;
      font-size: 22rpx;
      border: 2rpx solid #b3d8ff;
    }
  }
}

.table-input {
  width: 100%;
  height: 60rpx;
  padding: 0 12rpx;
  border: 2rpx solid #dcdfe6;
  border-radius: 6rpx;
  font-size: 24rpx;
  text-align: center;
  background: #fff;

  &:focus {
    border-color: #409eff;
  }

  &:disabled {
    background: #f5f7fa;
    color: #c0c4cc;
  }
}
</style>
