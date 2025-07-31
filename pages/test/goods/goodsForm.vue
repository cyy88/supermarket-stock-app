<template>
  <div class="app-container">
    <div class="main-panel">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="基础信息" name="base">
          <div class="content">
            <el-form ref="baseForm" :model="baseForm" :rules="baseRules" label-width="120px">
              <el-row>
                <el-col :span="24">
                  <el-form-item label="商品类型" prop="cateId">
                    <el-select v-model="baseForm.type" class="input" placeholder="请选择商品类型">
                      <el-option
                        v-for="item in typeOptions"
                        :key="item.key"
                        :label="item.name"
                        :value="item.key"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row v-if="baseForm.type == 'goods'">
                <el-col :span="24">
                  <el-form-item label="计价方式" prop="priceType">
                    <el-radio-group v-model="baseForm.priceType">
                      <el-radio key="piece" label="piece" value="piece">计件商品</el-radio>
                      <el-radio key="weight" label="weight" value="weight">称重商品</el-radio>
                    </el-radio-group>
                    <div class="form-tips">提示：计件商品按数量计价，称重商品按重量计价</div>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label="商品名称" prop="name">
                    <el-input v-model="baseForm.name" class="input" maxlength="200" placeholder="请输入商品名称"/>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label="安全库存" prop="safetyStock">
                    <el-input
                      v-model="baseForm.safetyStock"
                      type="number"
                      class="input"
                      maxlength="200"
                      :min="0"
                      placeholder="请输入商品安全库存"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row v-if="isMemberCardType">
                <el-col :span="24">
                  <el-form-item label="上级推广返利" prop="anti">
                    <el-input v-model="baseForm.anti" class="input" maxlength="10"
                              placeholder="请输入上级推广返利金额"/>
                    <div class="form-tips">提示：输入数字，单位：元</div>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label="商品条码" prop="goodsNo">
                    <el-input v-model="baseForm.goodsNo" class="input"
                              placeholder="请输入商品条码，或使用扫码枪扫描"/>
                    <div class="create-sn" @click="createGoodsSn()">随机生成条码</div>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label="商品分类" prop="cateId">
                    <el-select v-model="baseForm.cateId" class="input" placeholder="请选择商品分类">
                      <el-option
                        v-for="item in cateOptions"
                        :key="item.id"
                        :disabled="item.status !== 'A'"
                        :label="item.name"
                        :value="item.id"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col v-if="storeId == 0" :span="24">
                  <el-form-item label="分配店铺" prop="storeId">
                    <el-select v-model="baseForm.storeId" class="input" clearable filterable multiple
                               placeholder="请选择分配店铺">
                      <el-option
                        v-for="item in storeOptions"
                        :key="item.id+''"
                        :disabled="item.status !== 'A'"
                        :label="item.name"
                        :value="item.id+''"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label="商品图片" prop="images">
                    <el-upload :action="uploadAction"
                               :auto-upload="true"
                               :file-list="uploadFiles"
                               :headers="uploadHeader"
                               :limit="10"
                               :on-remove="handleRemove"
                               :on-success="handleUploadSuccess"
                               class="form__head-icon-upload"
                               list-type="picture-card">
                      <i class="el-icon-plus"></i>
                    </el-upload>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label="显示排序" prop="sort">
                    <el-input-number v-model="baseForm.sort" :min="0"/>
                    <div class="form-tips">提示：数值越小，排行越靠前</div>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label="商品状态">
                    <el-radio-group v-model="baseForm.status">
                      <el-radio key="A" label="A" value="A">上架</el-radio>
                      <el-radio key="N" label="N" value="N">下架</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="扩展信息" name="extend">
          <div class="content">
            <el-form ref="extendForm" :model="extendForm" :rules="extendRules" label-width="120px">
              <el-row>
                <el-col :span="24">
                  <el-form-item label="积分抵扣" prop="canUsePoint">
                    <el-radio-group v-model="extendForm.canUsePoint">
                      <el-radio key="Y" label="Y" value="Y">可用</el-radio>
                      <el-radio key="N" label="N" value="N">不可用</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label="会员折扣" prop="isMemberDiscount">
                    <el-radio-group v-model="extendForm.isMemberDiscount">
                      <el-radio key="Y" label="Y" value="Y">有折扣</el-radio>
                      <el-radio key="N" label="N" value="N">无折扣</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item label="规格类型" prop="isSingleSpec">
                    <el-radio-group v-model="extendForm.isSingleSpec">
                      <el-radio key="Y" label="Y" value="Y">单规格</el-radio>
                      <el-radio key="N" label="N" value="N">多规格</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row v-if="extendForm.isSingleSpec == 'N'">
                <el-col :span="24">
                  <el-form-item label="商品规格" prop="goodsSpec">
                    <Sku ref="Sku" :goodsId="baseForm.goodsId" :priceType="baseForm.priceType" :skuData="skuData"
                         :uploadDomain="uploadDomain" @skuChange="skuChange"/>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row v-if="baseForm.type == 'service'">
                <el-col :span="24">
                  <el-form-item label="服务时长" prop="serviceTime">
                    <el-input v-model="extendForm.serviceTime" class="min-input" maxlength="50"
                              placeholder="请输入服务时长，单位：分钟"/>
                    <div class="form-tips">提示：输入数字，单位：分钟</div>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row v-if="baseForm.type == 'coupon'">
                <el-col :span="24">
                  <el-form-item label="卡券ID" prop="couponIds">
                    <el-input v-model="extendForm.couponIds" class="input" maxlength="1000" placeholder="请输入购买的卡券ID，英文逗号分隔，如：1000,1001,1002"
                              rows="2" type="textarea"/>
                    <div class="form-tips">提示：购买的卡券ID，英文逗号分隔</div>
                  </el-form-item>
                </el-col>
              </el-row>

              <!--              <el-row v-if="extendForm.isSingleSpec == 'Y'">-->
              <!--                <el-col :span="24">-->
              <!--                  <el-form-item label="库存数量" prop="stock">-->
              <!--                    <el-input v-model="extendForm.stock" class="min-input" placeholder="请输入库存数量" maxlength="50"/>-->
              <!--                  </el-form-item>-->
              <!--                </el-col>-->
              <!--              </el-row>-->

              <el-row v-if="extendForm.isSingleSpec == 'Y' && baseForm.priceType == 'piece'">
                <el-col :span="24">
                  <el-form-item label="商品价格" prop="price">
                    <el-input
                      v-model="extendForm.price"
                      class="min-input"
                      maxlength="50"
                      placeholder="请输入商品价格"
                      @blur="formatPrice('price')"
                    />
                    <div class="form-tips">单位：元</div>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row v-if="extendForm.isSingleSpec == 'Y' && baseForm.priceType == 'weight'">
                <el-col :span="24">
                  <el-form-item label="单价(每千克)" prop="price">
                    <el-input
                      v-model="extendForm.price"
                      class="min-input"
                      maxlength="50"
                      placeholder="请输入每千克价格"
                      @blur="formatPrice('price')"
                    />
                    <div class="form-tips">单位：元/千克</div>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row v-if="extendForm.isSingleSpec == 'Y'">
                <el-col :span="24">
                  <el-form-item label="划线价格" prop="linePrice">
                    <el-input
                      v-model="extendForm.linePrice"
                      class="min-input"
                      maxlength="50"
                      placeholder="请输入商品划线，空则不显示"
                      @blur="formatPrice('linePrice')"
                    />
                    <div class="form-tips">单位：元</div>
                  </el-form-item>
                </el-col>
              </el-row>
              <!--              <el-row>-->
              <!--                <el-col :span="24">-->
              <!--                  <el-form-item label="初始销量" prop="initSale">-->
              <!--                    <el-input v-model="extendForm.initSale" class="min-input" placeholder="请输入初始销量" maxlength="10"/>-->
              <!--                    <div class="form-tips">提示：输入数字，虚拟销量</div>-->
              <!--                  </el-form-item>-->
              <!--                </el-col>-->
              <!--              </el-row>-->
              <el-row
                v-if="extendForm.isSingleSpec == 'Y' && baseForm.type == 'goods' && baseForm.priceType == 'piece'">
                <el-col :span="24">
                  <el-form-item label="商品重量" prop="weight">
                    <el-input v-model="extendForm.weight" class="min-input" maxlength="10"
                              placeholder="请输入商品重量"/>
                    <div class="form-tips">提示：输入数字，单位kg（用于物流计算）</div>
                  </el-form-item>
                </el-col>
              </el-row>
              <!--              <el-row v-if="extendForm.isSingleSpec == 'Y' && baseForm.type == 'goods' && baseForm.priceType == 'weight'">-->
              <!--                <el-col :span="24">-->
              <!--                  <el-form-item label="标准重量" prop="weight">-->
              <!--                    <el-input v-model="extendForm.weight" class="min-input" placeholder="请输入标准重量" maxlength="10"/>-->
              <!--                    <div class="form-tips">提示：输入数字，单位kg（用于参考，实际按称重计价）</div>-->
              <!--                  </el-form-item>-->
              <!--                </el-col>-->
              <!--              </el-row>-->
              <el-row>
                <el-col :span="24">
                  <el-form-item label="商品卖点" prop="salePoint">
                    <el-input v-model="extendForm.salePoint" class="input" maxlength="50"
                              placeholder="请输入商品卖点，几个字总结"/>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="商品介绍" name="detail">
          <div class="content" style="width: 480px;margin-left: 80px;">
            <el-form ref="detailForm" :model="detailForm" :rules="detailRules" label-width="120px">
              <editor v-model="detailForm.description" :min-height="550"/>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
      <div slot="footer" class="footer">
        <el-button type="primary" @click="submitForm">确定</el-button>
        <el-button @click="cancel">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {getToken} from '@/utils/auth'
import {getGoodsInfo, saveGoods} from "@/api/goods";
import Sku from '../components/Sku';

export default {
  name: "GoodsForm",
  components: {Sku},
  data() {
    return {
      storeId: this.$store.getters.storeId,
      // 遮罩层
      loading: false,
      activeTab: 'base',
      storeOptions: [],
      cateOptions: [],
      typeOptions: [],
      skuData: {attrList: [], skuList: [], initSkuList: []},
      // 基础信息表单
      baseForm: {
        type: 'goods',
        priceType: 'piece',
        goodsId: '',
        name: '',
        safetyStock: '',
        anti: '',
        storeId: (this.$store.getters.storeId ? [this.$store.getters.storeId] : []),
        cateId: '',
        goodsNo: '',
        images: [],
        status: "A",
        sort: 0
      },
      // 扩展信息表单
      extendForm: {
        goodsId: '',
        canUsePoint: 'Y',
        isMemberDiscount: 'Y',
        isSingleSpec: 'Y',
        serviceTime: 0,
        couponIds: '',
        stock: 0,
        price: '',
        linePrice: '',
        salePoint: '',
        initSale: 0,
        weight: '',
        skuData: null
      },
      // 详情信息表单
      detailForm: {goodsId: '', description: ''},
      // 上传地址
      uploadAction: process.env.VUE_APP_SERVER_URL + 'backendApi/file/upload',
      uploadHeader: {'Access-Token': getToken()},
      // 上传域名
      uploadDomain: '',
      // 上传文件列表
      uploadFiles: [],
      // 基础信息表单校验
      baseRules: {
        name: [
          {required: true, message: "商品名称不能为空", trigger: "blur"},
          {min: 2, max: 30, message: '商品名称长度必须介于2和200 之间', trigger: 'blur'}
        ],
        safetyStock: [
          { required: true, message: '安全库存不能为空', trigger: 'blur' },
          {
            pattern: /^(0|[1-9]\d*)$/,
            message: '安全库存必须为大于等于0的整数',
            trigger: 'blur'
          }
        ],
        goodsNo: [
          {required: true, message: "商品条码不能为空", trigger: "blur"},
          // 动态校验规则
          {
            validator: (rule, value, callback) => this.validateGoodsNo(rule, value, callback),
            trigger: 'blur'
          }
        ],
        cateId: [
          {required: true, message: "请选择商品分类", trigger: "blur"}
        ],
        images: [
          {required: true, message: "请上传商品图片", trigger: "blur"}
        ],
        anti: [
          {pattern: /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/, message: `上级推广返利必须大于等于0`, trigger: 'blur'}
        ],
      },
      // 扩展信息表单校验
      extendRules: {
        couponIds: [
          {required: true, message: "卡券ID不能为空", trigger: "blur"},
          {min: 1, max: 1000, message: '卡券ID长度必须介于1和100之间', trigger: 'blur'}
        ],
        canUsePoint: [
          {required: true, message: "请选择", trigger: "blur"}
        ],
        isMemberDiscount: [
          {required: true, message: "请选择", trigger: "blur"}
        ],
        isSingleSpec: [
          {required: true, message: "请选择", trigger: "blur"}
        ],
        price: [
          {required: true, message: "请输入商品价格", trigger: "blur"},
          {
            pattern: /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/,
            message: "价格必须大于等于0，且最多保留两位小数",
            trigger: 'blur'
          }],
        stock: [
          {required: true, message: "请输入库存数量", trigger: "blur"}, {
            pattern: /^[0-9]{1,10}$/,
            message: `库存数量必须是正整数`,
            trigger: 'blur'
          }
        ],
        initSale: [
          {pattern: /^[0-9]{1,10}$/, message: `初始销量必须是正整数`, trigger: 'blur'}
        ],
        weight: [
          {pattern: /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/, message: `重量必须大于等于0`, trigger: 'blur'}
        ],
        linePrice: [
          {
            pattern: /(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/,
            message: "划线价格必须大于等于0，且最多保留两位小数",
            trigger: 'blur'
          }],
      },
      detailRules: {
        description: [
          {required: true, message: "请输入商品详情", trigger: "blur"}
        ],
      }
    };
  },
  computed: {
    // 判断是否为会员卡类型
    isMemberCardType() {
      // 支持多种可能的会员卡类型key值
      const memberCardTypes = ['会员卡', 'member'];
      return memberCardTypes.includes(this.baseForm.type);
    }
  },
  created() {
    const goodsId = this.$route.query.goodsId ? this.$route.query.goodsId : '0'
    this.getGoodsInfo(goodsId);
  },
  methods: {
    handleTabClick() {
      // empty
    },
    getGoodsInfo(goodsId) {
      const app = this;
      getGoodsInfo(goodsId).then(response => {
        const goodsInfo = response.data.goods;
        const imagePath = response.data.imagePath;
        this.uploadDomain = imagePath;
        if (goodsInfo) {
          // 商品基础信息
          this.baseForm.goodsId = goodsInfo.id + '';
          this.baseForm.type = goodsInfo.type;
          this.baseForm.safetyStock = goodsInfo.safetyStock !== null ? goodsInfo.safetyStock : 0;
          // 修改：保留原有的价格类型
          if (goodsInfo.priceType) {
            this.baseForm.priceType = goodsInfo.priceType;
          } else {
            // 只有新商品才设置默认值
            if (!this.baseForm.priceType) {
              this.baseForm.priceType = 'piece'; // 默认为计件商品
            }
          }

          this.baseForm.name = goodsInfo.name;
          // 只有当anti不为null且为会员卡类型时才设置anti值
          this.baseForm.anti = (goodsInfo.anti !== null && goodsInfo.anti !== undefined) ? goodsInfo.anti : '';
          this.baseForm.goodsNo = goodsInfo.goodsNo;
          this.baseForm.cateId = goodsInfo.cateId;
          this.baseForm.storeId = goodsInfo.storeIds ? goodsInfo.storeIds.split(",") : [];
          this.baseForm.sort = goodsInfo.sort;
          this.baseForm.status = goodsInfo.status;

          // 商品图片
          this.baseForm.images = response.data.images;
          const images = this.baseForm.images;
          app.uploadFiles = [];
          if (images && images.length > 0) {
            images.forEach(function (url) {
              app.uploadFiles.push({url: imagePath + url})
            })
          }

          // 扩展信息
          this.extendForm.goodsId = goodsInfo.id;
          this.extendForm.canUsePoint = goodsInfo.canUsePoint == null ? 'Y' : goodsInfo.canUsePoint;
          this.extendForm.isMemberDiscount = goodsInfo.isMemberDiscount == null ? 'Y' : goodsInfo.isMemberDiscount;
          this.extendForm.isSingleSpec = goodsInfo.isSingleSpec == null ? 'Y' : goodsInfo.isSingleSpec;
          this.extendForm.stock = goodsInfo.stock;
          this.extendForm.price = goodsInfo.price;
          this.extendForm.linePrice = goodsInfo.linePrice;
          this.extendForm.initSale = goodsInfo.initSale;
          this.extendForm.salePoint = goodsInfo.salePoint;
          this.extendForm.weight = goodsInfo.weight;
          this.extendForm.serviceTime = goodsInfo.serviceTime;
          this.extendForm.couponIds = goodsInfo.couponIds;

          // 多规格
          this.skuData.attrList = response.data.specData;
          this.skuData.skuList = response.data.skuData;
          this.skuData.initSkuList = response.data.skuData;

          // 商品详情
          this.detailForm.goodsId = goodsInfo.id;
          this.detailForm.description = goodsInfo.description;
        }
        this.cateOptions = response.data.cateList;
        this.storeOptions = response.data.storeList;
        this.typeOptions = response.data.typeList;
      });
    },
    cancel() {
      this.$store.dispatch('tagsView/delView', this.$route)
      this.$router.push({path: '/goods/goods/index'});
    },
    skuChange(skuData) {
      // empty
    },
    // 格式化价格为两位小数
    formatPrice(field) {
      // 特殊处理划线价格：允许为空
      if (field === 'linePrice' && (this.extendForm[field] === '' || this.extendForm[field] === null)) {
        return;
      }
      // 获取当前值
      const value = this.extendForm[field];
      // 如果值为空或null
      if (value === '' || value === null) {
        // 对于划线价格，设置为空字符串；其他价格字段设置为0.00
        this.extendForm[field] = field === '0.00';
        return;
      }

      // 尝试转换为数字
      const num = parseFloat(value);

      // 如果是有效数字
      if (!isNaN(num)) {
        // 格式化为两位小数
        this.extendForm[field] = num.toFixed(2);
      } else {
        // 对于无效数字，划线价格设置为空字符串，其他价格字段设置为0.00
        this.extendForm[field] = field === 'linePrice' ? '' : '0.00';
      }
    },
    // 提交按钮
    submitForm: function () {
      const app = this;
      if (app.activeTab == 'base') {
        app.$refs["baseForm"].validate(valid => {
          if (valid) {
            app.baseForm.storeId = app.baseForm.storeId ? app.baseForm.storeId.join(",") : '';

            // 构建提交数据
            const submitData = {...app.baseForm};

            // 如果不是会员卡类型，则不发送anti字段
            if (!app.isMemberCardType) {
              delete submitData.anti;
            }

            saveGoods(submitData).then(response => {
              app.$modal.msgSuccess("保存成功！");
              app.getGoodsInfo(response.data.goodsInfo.id);
            });

          }
        });
      } else if (app.activeTab == 'extend') {
        if (!app.extendForm.goodsId) {
          app.$modal.msgError("请先提交商品基础信息");
          app.activeTab = 'base';
          return false;
        }
        // 添加这行关键代码：设置价格类型
        app.extendForm.priceType = app.baseForm.priceType;
        // 多规格商品验证
        if (app.skuData.skuList && app.skuData.skuList.length > 0) {
          let isValid0 = true;
          let isValid1 = true;
          let isValid2 = true;
          app.skuData.skuList.forEach(function (item) {
            if (!item.skuNo || item.skuNo.length < 1) {
              isValid0 = false;
            }
            if (item.stock < 0) {
              isValid1 = false;
            }
            if (item.price < 0) {
              isValid2 = false;
            }
          })
          if (!isValid1) {
            app.$modal.alert("商品sku编码长度需大于1，请仔细核对！");
            return false;
          }
          if (!isValid1) {
            app.$modal.alert("商品库存须大于等于0，请仔细核对！");
            return false;
          }
          if (!isValid2) {
            app.$modal.alert("商品价格须大于等于0，请仔细核对！");
            return false;
          }
        }

        app.extendForm.skuData = app.skuData.skuList;
        app.extendForm.specData = app.skuData.attrList;
        app.$refs["extendForm"].validate(valid => {
          if (valid) {
            saveGoods(app.extendForm).then(response => {
              app.$modal.msgSuccess("保存成功！");
              app.getGoodsInfo(response.data.goodsInfo.id);
            });
          }
        });
      } else {
        if (!app.detailForm.goodsId) {
          app.$modal.msgError("请先提交商品基础信息");
          app.activeTab = 'base';
          return false;
        }
        app.$refs["detailForm"].validate(valid => {
          if (valid) {
            saveGoods(app.detailForm).then(response => {
              app.$modal.msgSuccess("保存成功！");
              app.getGoodsInfo(response.data.goodsInfo.id);
            });
          }
        });
      }
    },
    // 文件上传成功
    handleUploadSuccess(file) {
      this.baseForm.images.push(file.data.fileName)
    },
    // 文件删除处理
    handleRemove(file) {
      const newImages = [];
      if (this.baseForm.images && this.baseForm.images.length > 0) {
        this.baseForm.images.forEach(function (item) {
          if (file.url.indexOf(item) == -1) {
            newImages.push(item);
          }
        })
      }
      this.baseForm.images = newImages;
    },
    // 自定义条码校验方法
    validateGoodsNo(rule, value, callback) {
      if (!value) {
        return callback(new Error('商品条码不能为空'));
      }
      // 根据计价方式应用不同规则
      if (this.baseForm.priceType === 'weight') {
        // 称重商品：必须是4位数字
        if (!/^\d{4}$/.test(value)) {
          callback(new Error('称重商品条码必须是4位数字'));
        } else {
          callback();
        }
      } else {
        // 计件商品：允许任意长度数字
        if (!/^\d+$/.test(value)) {
          callback(new Error('计件商品条码必须是数字'));
        } else {
          callback();
        }
      }
    },
    // 生成随机条码
    createGoodsSn() {
      if (this.baseForm.priceType === 'weight') {
        // 称重商品生成4位随机码
        this.baseForm.goodsNo = Math.floor(1000 + Math.random() * 9000).toString();
      } else {
        // 计件商品保持原有逻辑
        let sn = (Math.random() + 1) * 100000000000000;
        this.baseForm.goodsNo = sn.toFixed(0);
      }
    }
  }
};
</script>
<style lang="scss" rel="stylesheet/scss">
.main-panel {
  padding-top: 5px;

  .content {
    margin-top: 30px;
    margin-left: 20px;
  }

  .footer {
    margin-top: 20px;
  }

  .create-sn {
    font-size: 12px;
    color: blue;
    cursor: pointer;
    width: 100px;
  }
}
</style>
