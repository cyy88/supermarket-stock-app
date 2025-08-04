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
                  v-for="(value, valueIndex) in getValidSpecValues(spec.child)"
                  :key="valueIndex"
                  class="spec-value-item"
                >
                  <text class="value-text">{{ value.name || value.value }}</text>
                  <text
                    v-if="!disabled"
                    class="value-delete"
                    @click="removeSpecValue(specIndex, getOriginalValueIndex(spec.child, valueIndex))"
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

    <!-- SKU卡片列表 -->
    <view v-if="(localSkuData.skuList || []).length > 0" class="sku-table-container">
      <view class="sku-table-header">
        <text class="table-title">商品规格设置</text>
        <text class="table-desc">为每个规格组合设置具体信息</text>
      </view>

      <view class="sku-table">
        <view class="table-header">
        </view>

        <view
          v-for="(sku, index) in localSkuData.skuList || []"
          :key="index"
          class="table-row"
        >
          <!-- 卡片头部：序号和图片 -->
          <view class="sku-card-header">
            <view class="sku-index">{{ index + 1 }}</view>
            <view class="sku-image-container">
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
          </view>

          <!-- 规格标签区域 -->
          <view class="sku-spec-section">
            <text class="spec-label">商品规格</text>
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

          <!-- 输入字段区域 -->
          <view class="sku-fields">
            <!-- 第一行：SKU编码 -->
            <view class="field-row">
              <view class="field-item">
                <text class="field-label">SKU编码</text>
                <input
                  v-model="sku.skuNo"
                  class="field-input"
                  placeholder="请输入SKU编码"
                  :disabled="disabled"
                />
              </view>
            </view>

            <!-- 第二行：价格和划线价格 -->
            <view class="field-row">
              <view class="field-item">
                <text class="field-label">{{ priceType === 'weight' ? '单价(元/千克)' : '销售价格(元)' }}</text>
                <input
                  v-model="sku.price"
                  class="field-input"
                  type="digit"
                  placeholder="0.00"
                  :disabled="disabled"
                />
              </view>
              <view class="field-item">
                <text class="field-label">{{ priceType === 'weight' ? '划线单价(元/千克)' : '划线价格(元)' }}</text>
                <input
                  v-model="sku.linePrice"
                  class="field-input"
                  type="digit"
                  placeholder="0.00"
                  :disabled="disabled"
                />
              </view>
            </view>

            <!-- 第三行：重量 -->
            <view class="field-row">
              <view class="field-item">
                <text class="field-label">重量(千克)</text>
                <input
                  v-model="sku.weight"
                  class="field-input"
                  type="digit"
                  placeholder="0.00"
                  :disabled="disabled"
                />
              </view>
            </view>
          </view>

          <view style="display: none;">
            <view class="td td-index">{{ index + 1 }}</view>
            <view class="td td-image"></view>
            <view class="td td-spec"></view>
            <view class="td td-sku"></view>
            <view class="td td-price"></view>
            <view class="td td-line-price"></view>
            <view class="td td-weight"></view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, watch, computed, nextTick, onMounted } from 'vue'
import { uploadImage, saveSpecName, saveSpecValue, deleteSpec, deleteSpecValue } from '@/api/goods'


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

const getValidSpecValues = (childArray) => {
  if (!Array.isArray(childArray)) return [];
  return childArray.filter(value => value && (value.name || value.value));
}

const getOriginalValueIndex = (childArray, filteredIndex) => {
  if (!Array.isArray(childArray)) return filteredIndex;
  const validValues = getValidSpecValues(childArray);
  const targetValue = validValues[filteredIndex];
  return childArray.findIndex(value => value === targetValue);
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
  console.log('=== 初始化SKU数据 ===');
  console.log('父组件传递的skuData:', props.skuData);
  console.log('attrList数据:', props.skuData?.attrList);

  try {
    const safeSkuData = props.skuData || { attrList: [], skuList: [], initSkuList: [] };

    localSkuData.attrList = Array.isArray(safeSkuData.attrList) ?
      JSON.parse(JSON.stringify(safeSkuData.attrList)) : [];
    localSkuData.skuList = Array.isArray(safeSkuData.skuList) ?
      JSON.parse(JSON.stringify(safeSkuData.skuList)) : [];
    localSkuData.initSkuList = Array.isArray(safeSkuData.initSkuList) ?
      JSON.parse(JSON.stringify(safeSkuData.initSkuList)) : [];

    localSkuData.attrList.forEach((attr, index) => {
      if (attr.child && attr.child.length > 0) {
        attr.child.forEach((child, childIndex) => {
        });
      }
    });

    updateMaxId();
  } catch (error) {
    localSkuData.attrList = [];
    localSkuData.skuList = [];
    localSkuData.initSkuList = [];
  }
}


initLocalData();

//
// watch(
//     () => props.skuData,
//     (newVal) => {
//       console.log('接收到新数据', newVal);
//       if (newVal && newVal.attrList?.length > 0) {
//         initLocalData(JSON.parse(JSON.stringify(newVal)) // 深拷贝
//       }
//     },
//     { immediate: true, deep: true }
// )

watch(() => props.skuData, (newVal) => {
  // console.log('=== 接收到父组件skuData变化 ===');
  // console.log('完整数据:', newVal);
  // console.log('attrList:', newVal?.attrList);
  // console.log('attrList类型:', typeof newVal?.attrList);
  // console.log('attrList是否为数组:', Array.isArray(newVal?.attrList));

  initLocalData();
}, { deep: true, immediate: true });

watch(() => localSkuData, () => {
  emitSkuChange();
}, { deep: true });

// 添加规格行
const addSpecRow = () => {
  uni.showModal({
    title: '添加规格',
    content: '请输入规格名称',
    editable: true,
    placeholderText: '例如：颜色、尺寸',
    success: async (res) => {
      if (res.confirm && res.content) {
        let specId;

        if (props.goodsId) {
          try {
            uni.showLoading({ title: '保存中...' });

            const response = await saveSpecName({
              goodsId: props.goodsId,
              name: res.content
            });

            if (response && response.data && response.data.id) {
              specId = Number(response.data.id); // 确保是数字类型
              uni.hideLoading();
              uni.showToast({
                title: '添加成功',
                icon: 'success'
              });
            } else {
              throw new Error('API返回数据格式错误');
            }
          } catch (error) {
            uni.hideLoading();
            console.error('保存规格名称失败:', error);
            // 使用本地ID作为备选方案
            specId = generateSafeId();
            uni.showToast({
              title: '使用本地ID，保存商品时会同步',
              icon: 'none'
            });
          }
        } else {
          specId = generateSafeId();
        }

        const newSpec = {
          id: specId,
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
  if (!Array.isArray(localSkuData.attrList) || !localSkuData.attrList[specIndex]) {
    uni.showToast({
      title: '规格不存在',
      icon: 'none'
    });
    return;
  }

  uni.showModal({
    title: '添加规格值',
    content: '请输入规格值',
    editable: true,
    placeholderText: '例如：红色、大号',
    success: async (res) => {
      if (res.confirm && res.content) {
        let valueId;

        if (props.goodsId && localSkuData.attrList[specIndex].name) {
          try {
            uni.showLoading({ title: '保存中...' });

            const response = await saveSpecValue({
              goodsId: props.goodsId,
              specName: localSkuData.attrList[specIndex].name,
              value: res.content
            });

            if (response && response.data && response.data.id) {
              valueId = Number(response.data.id);
              uni.hideLoading();
              uni.showToast({
                title: '添加成功',
                icon: 'success'
              });
            } else {
              throw new Error('API返回数据格式错误');
            }
          } catch (error) {
            uni.hideLoading();
            valueId = generateSafeId();
            uni.showToast({
              title: '使用本地ID，保存商品时会同步',
              icon: 'none'
            });
          }
        } else {
          valueId = generateSafeId();
        }

        if (!Array.isArray(localSkuData.attrList[specIndex].child)) {
          localSkuData.attrList[specIndex].child = [];
        }

        const newValue = {
          id: valueId,
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
    const table = [];
    const attrValueAry = [];
    const arr = [];

    const tmpSkuData = (localSkuData.attrList || []).filter(
      (d) => d.name != "" && d.child && d.child.length > 0
    );

    if (!tmpSkuData || tmpSkuData.length == 0) {
      return [];
    }

    tmpSkuData.forEach((item) => {
      attrValueAry.push(item.child);
    });

    function func(skuArr = [], i) {
      for (let j = 0; j < attrValueAry[i].length; j++) {
        if (i < attrValueAry.length - 1) {
          skuArr[i] = attrValueAry[i][j];
          func(skuArr, i + 1);
        } else {
          arr.push([...skuArr, attrValueAry[i][j]]);
        }
      }
    }
    func([], 0);

    arr.forEach((item) => {
      let specIds = "",
          specList = [],
          findItem,
          tableItem;

      item.forEach((d) => {
        const numericId = Number(d.id);
        specIds += specIds ? `-${numericId}` : `${numericId}`;
        specList.push({ id: numericId, name: d.name, value: d.name });
      });

      findItem = (Array.isArray(localSkuData.initSkuList) ? localSkuData.initSkuList : []).find((item) => {
        return specIds.includes(item.specIds);
      }) || {};

      tableItem = Object.assign(
        {
          price: '',
          linePrice: '',
          skuNo: '',
          stock: '',
          logo: '',
          weight: '0',
          specList: specList
        },
        findItem,
        {
          specIds,
        }
      );
      tableItem.specList = specList;
      table.push(tableItem);
    });

    return table;
  } catch (error) {
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
  border-radius: 16rpx;
  overflow: hidden;
  margin: 20rpx 0;
}

// 规格设置头部
.spec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;

  .spec-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #fff;
  }

  .add-spec-btn {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    border: 2rpx solid rgba(255, 255, 255, 0.3);
    border-radius: 50rpx;
    padding: 16rpx 28rpx;
    font-size: 26rpx;
    backdrop-filter: blur(10rpx);
    transition: all 0.3s ease;

    &:active {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0.95);
    }

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
  margin: 20rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;

  &:last-child {
    margin-bottom: 0;
  }

  .spec-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 28rpx;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: #fff;

    .spec-index {
      font-size: 30rpx;
      font-weight: 600;
      color: #fff;
    }

    .delete-spec-btn {
      background: rgba(255, 255, 255, 0.2);
      border: 2rpx solid rgba(255, 255, 255, 0.3);
      color: #fff;
      font-size: 24rpx;
      padding: 12rpx 20rpx;
      border-radius: 30rpx;
      backdrop-filter: blur(10rpx);
      transition: all 0.3s ease;

      &:active {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0.95);
      }
    }
  }

  .spec-content {
    padding: 28rpx;
  }

  .spec-name-row {
    margin-bottom: 32rpx;

    .label {
      display: block;
      font-size: 28rpx;
      color: #333;
      font-weight: 600;
      margin-bottom: 16rpx;
    }

    .spec-name-input {
      width: 100%;
      height: 88rpx;
      padding: 0 24rpx;
      border: 2rpx solid #e8e8e8;
      border-radius: 16rpx;
      font-size: 30rpx;
      background: #fafafa;
      transition: all 0.3s ease;

      &:focus {
        border-color: #667eea;
        background: #fff;
        box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.1);
      }
    }
  }

  .spec-values-row {
    .label {
      display: block;
      font-size: 28rpx;
      color: #333;
      font-weight: 600;
      margin-bottom: 20rpx;
    }

    .spec-values-container {
      .spec-values-list {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;
        margin-bottom: 24rpx;

        .spec-value-item {
          display: flex;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 30rpx;
          padding: 16rpx 24rpx;
          box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);

          .value-text {
            font-size: 26rpx;
            color: #fff;
            margin-right: 12rpx;
            font-weight: 500;
          }

          .value-delete {
            color: rgba(255, 255, 255, 0.8);
            font-size: 28rpx;
            font-weight: bold;
            line-height: 1;
            cursor: pointer;
            transition: all 0.3s ease;

            &:active {
              color: #fff;
              transform: scale(1.2);
            }
          }
        }
      }

      .add-value-btn {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        border: none;
        color: #fff;
        border-radius: 24rpx;
        padding: 12rpx 24rpx;
        font-size: 24rpx;
        font-weight: 500;
        box-shadow: 0 2rpx 8rpx rgba(240, 147, 251, 0.25);
        transition: all 0.3s ease;
        margin-top: 16rpx;

        &:active {
          transform: scale(0.95);
          box-shadow: 0 1rpx 4rpx rgba(240, 147, 251, 0.3);
        }
      }
    }
  }
}

// 批量设置
.batch-setting {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  overflow: hidden;

  .batch-header {
    padding: 28rpx;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: #fff;

    .batch-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #fff;
      display: block;
      margin-bottom: 8rpx;
    }

    .batch-desc {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .batch-form {
    padding: 28rpx;

    .batch-row {
      margin-bottom: 32rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .batch-item {
        margin-bottom: 24rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .batch-label {
          display: block;
          font-size: 28rpx;
          color: #333;
          margin-bottom: 16rpx;
          font-weight: 600;
        }

        .batch-input {
          width: 100%;
          height: 88rpx;
          padding: 0 24rpx;
          border: 2rpx solid #e8e8e8;
          border-radius: 16rpx;
          font-size: 30rpx;
          background: #fafafa;
          transition: all 0.3s ease;

          &:focus {
            border-color: #4facfe;
            background: #fff;
            box-shadow: 0 0 0 6rpx rgba(79, 172, 254, 0.1);
          }
        }

        .batch-input-group {
          display: flex;
          gap: 16rpx;
          align-items: flex-end;

          .batch-input {
            flex: 1;
          }

          .generate-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            border: none;
            border-radius: 16rpx;
            padding: 0 24rpx;
            height: 88rpx;
            font-size: 26rpx;
            white-space: nowrap;
            box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;

            &:active {
              transform: scale(0.95);
            }
          }
        }

        .batch-apply-btn {
          width: 100%;
          height: 88rpx;
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: #fff;
          border: none;
          border-radius: 16rpx;
          font-size: 30rpx;
          font-weight: 600;
          box-shadow: 0 4rpx 12rpx rgba(17, 153, 142, 0.3);
          transition: all 0.3s ease;

          &:active {
            transform: scale(0.98);
            box-shadow: 0 2rpx 8rpx rgba(17, 153, 142, 0.4);
          }
        }
      }
    }
  }
}

// SKU表格容器 - 改为卡片式布局
.sku-table-container {
  background: transparent;
  margin: 20rpx;

  .sku-table-header {
    padding: 28rpx;
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(250, 112, 154, 0.3);

    .table-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #fff;
      display: block;
      margin-bottom: 8rpx;
    }

    .table-desc {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .sku-table {
    // 移除表格样式，改为卡片列表
    .table-header {
      display: none; // 隐藏表头
    }

    .table-row {
      background: #fff;
      border-radius: 16rpx;
      margin-bottom: 20rpx;
      padding: 28rpx;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
      border: none;
      display: block; // 改为块级布局

      &:last-child {
        margin-bottom: 0;
      }

      // 卡片头部 - 序号和图片
      .sku-card-header {
        display: flex;
        align-items: center;
        margin-bottom: 24rpx;
        padding-bottom: 20rpx;
        border-bottom: 2rpx solid #f5f5f5;

        .sku-index {
          width: 60rpx;
          height: 60rpx;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 26rpx;
          font-weight: 600;
          margin-right: 20rpx;
        }

        .sku-image-container {
          flex: 1;
          display: flex;
          justify-content: center;
        }
      }

      // 规格标签区域
      .sku-spec-section {
        margin-bottom: 24rpx;

        .spec-label {
          font-size: 26rpx;
          color: #666;
          margin-bottom: 12rpx;
          font-weight: 500;
        }

        .spec-tags {
          justify-content: flex-start;
        }
      }

      // 输入字段区域
      .sku-fields {
        .field-row {
          display: flex;
          margin-bottom: 20rpx;
          gap: 16rpx;

          &:last-child {
            margin-bottom: 0;
          }

          .field-item {
            flex: 1;

            .field-label {
              display: block;
              font-size: 26rpx;
              color: #333;
              margin-bottom: 12rpx;
              font-weight: 500;
            }

            .field-input {
              width: 100%;
              height: 72rpx;
              padding: 0 20rpx;
              border: 2rpx solid #e8e8e8;
              border-radius: 12rpx;
              font-size: 28rpx;
              background: #fafafa;
              transition: all 0.3s ease;

              &:focus {
                border-color: #667eea;
                background: #fff;
                box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
              }
            }
          }
        }
      }

      // 移除原有的td样式，因为不再使用表格布局
      .td {
        display: none;
      }
    }
  }
}

// 图片上传样式
.image-upload {
  width: 120rpx;
  height: 120rpx;
  border: 3rpx dashed #e8e8e8;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  cursor: pointer;
  transition: all 0.3s ease;

  &:active {
    border-color: #667eea;
    transform: scale(0.95);
  }

  .sku-image {
    width: 100%;
    height: 100%;
    border-radius: 12rpx;
    object-fit: cover;
  }

  .upload-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    .upload-icon {
      font-size: 40rpx;
      color: rgba(255, 255, 255, 0.8);
      font-weight: bold;
    }
  }
}

.spec-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  justify-content: flex-start;

  .spec-tag {
    .spec-tag-text {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 12rpx 20rpx;
      border-radius: 30rpx;
      font-size: 24rpx;
      font-weight: 500;
      box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
    }
  }
}

.table-input {
  width: 100%;
  height: 72rpx;
  padding: 0 20rpx;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  font-size: 28rpx;
  text-align: center;
  background: #fafafa;
  transition: all 0.3s ease;

  &:focus {
    border-color: #667eea;
    background: #fff;
    box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #f5f5f5;
    color: #ccc;
    border-color: #f0f0f0;
  }
}
</style>
