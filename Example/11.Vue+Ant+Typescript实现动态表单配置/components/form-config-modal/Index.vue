<template>
  <div>
    <!-- 表单弹窗 -->
    <a-modal
      v-model="showModal"
      :maskClosable="false"
      :centered="true"
      :body-style="{ padding: '15px 0' }"
      width="800px"
      class="form-modal-container"
      @ok="handleOk"
      @cancel="close(false)"
    >
      <div slot="title" class="form-modal__title">{{ title }}</div>
      <div class="form-modal__content">
        <!-- 示例 -->
        <div class="example-container">
          <form-control :props="formControl" @img-preview="handleImgPreview" />
        </div>
        <!-- 表单 -->
        <a-form :form="form" class="form-container">
          <a-row :gutter="12">
            <a-col :span="12">
              <a-form-item label="控件标题">
                <a-input
                  placeholder="请输入控件标题"
                  v-decorator="['name', {                    
                    rules:[{ required:true, validator: validateName }]
                  }]"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="控件类型">
                <a-select
                  v-decorator="['type', {rules:[{required:true, message:'请选择控件类型'}]}]"
                  :options="formControlType"
                  placeholder="请选择报送类型"
                  @change="handleFormControlTypeChange"
                />
              </a-form-item>
            </a-col>
            <!-- 仅数量类型有-start -->
            <template v-if="controlType === 3" :gutter="12">
              <a-col :span="12">
                <a-form-item label="是否实施统计">
                  <a-radio-group
                    name="isImplementStatistics"
                    v-decorator="['isImplementStatistics', {rules:[{required:true, message:'请选择是否实施统计'}]}]"
                  >
                    <a-radio :value="true">是</a-radio>
                    <a-radio :value="false">否</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="是否数量统计">
                  <a-radio-group
                    name="isQuantityStatistics"
                    v-decorator="['isQuantityStatistics', {rules:[{required:true, message:'请选择是否数量统计'}]}]"
                  >
                    <a-radio :value="true">是</a-radio>
                    <a-radio :value="false">否</a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="数值单位">
                  <a-input
                    placeholder="请输入数值单位"
                    v-decorator="['unit', { rules: [{ required: true, message: '请输入数值单位' }] }]"
                  />
                </a-form-item>
              </a-col>
            </template>
            <!-- 仅数量类型有-end -->
            <a-col :span="12">
              <a-form-item label="是否必填" v-if="controlType !== 10">
                <a-radio-group
                  name="isRequired"
                  v-decorator="['isRequired', {rules:[{required:true, message:'请选择是否必填'}]}]"
                  @change="handleIsRequiredChange"
                >
                  <a-radio :value="true">是</a-radio>
                  <a-radio :value="false">否</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="controlType <= 2">
              <a-form-item label="是否只读">
                <a-radio-group
                  name="isReadOnly"
                  v-decorator="['isReadOnly', {rules:[{required:true, message:'请选择是否只读'}]}]"
                  @change="handleIsReadOnlyChange"
                >
                  <a-radio :value="true">是</a-radio>
                  <a-radio :value="false">否</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col :span="12" v-if="controlType !== 10">
              <a-form-item label="是否计入评分">
                <a-radio-group
                  name="isScore"
                  v-decorator="['isScore', {rules:[{required:true, message:'请选择是否计入评分'}]}]"
                >
                  <a-radio :value="true">是</a-radio>
                  <a-radio :value="false">否</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
            <a-col
              :span="12"
              v-if="form.getFieldValue('isScore') && controlType !== 10 && controlType !== 4 && controlType !== 5"
            >
              <a-form-item label="分值">
                <a-input-number
                  placeholder="请输入分值"
                  v-decorator="['score', {rules:[{required:true, message:'请输入分值'}]}]"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <!-- 非单选、多选、上传或下载操作才有-start -->
            <template v-if="controlType < 8 && controlType !== 4 && controlType !== 5">
              <a-col :span="12">
                <a-form-item label="提示信息">
                  <a-input placeholder="请输入提示信息" v-decorator="['placeholder']"></a-input>
                </a-form-item>
              </a-col>
            </template>
            <!-- 非单选、多选、上传或下载操作才有-end -->
          </a-row>
          <!-- 仅单选、多选和附件下载有-start -->
          <a-row v-if="controlType === 4 || controlType === 5 || controlType === 10" :gutter="12">
            <a-col :span="24">
              <a-form-item :label="controlType === 10 ? '附件' : '配置选项'">
                <!-- 仅为了绑定valueArray值，方便后续读取操作-start -->
                <a-radio-group
                  name="valueArray"
                  style="display:none;"
                  v-decorator="['valueArray', { rules: [{ required:true, validator: (rule, value, callback) => callback() }] }]"
                >
                  <a-radio
                    v-for="(item, index) in form.getFieldValue('valueArray')"
                    :key="index"
                    :value="item.value ? item.value : item.localUrl"
                  >{{ item.label? item.label : item.fileName }}</a-radio>
                </a-radio-group>
                <!-- 仅为了绑定valueArray值，方便后续读取操作-end -->

                <!-- 选项配置表格-start -->
                <template v-if="controlType === 4 || controlType === 5">
                  <table border class="table-container">
                    <tbody>
                      <tr>
                        <th>
                          <span class="requried">选项文本(label)</span>
                        </th>
                        <!-- <th>
                          <span class="requried">选项值(value)</span>
                        </th>-->
                        <th v-if="form.getFieldValue('isScore')">
                          <span class="requried">分值(score)</span>
                        </th>
                        <th>操作</th>
                      </tr>
                      <tr
                        v-for="(item, index) in form.getFieldValue('valueArray')"
                        :key="'tr' + index"
                      >
                        <td>
                          <a-form-item label :key="'option-label' + index">
                            <a-input
                              placeholder="请输入选项文本"
                              v-decorator="[`labels[${index}]`, { rules: [{ required: true, message: '请输入选项文本' }] }]"
                              @blur="handleValueArrayBlur($event, index, 'label')"
                            />
                          </a-form-item>
                        </td>
                        <!-- <td>
                          <a-form-item label :key="'option-value' + index">
                            <a-input
                              placeholder="请输入选项值"
                              v-decorator="[`values[${index}]`, { rules: [{ required: true, message: '请输入选项值' }] }]"
                              @blur="handleValueArrayBlur($event, index, 'value')"
                            />
                          </a-form-item>
                        </td>-->
                        <td v-if="form.getFieldValue('isScore')">
                          <a-form-item label :key="'option-score' + index">
                            <a-input-number
                              placeholder="请输入该项分值"
                              v-decorator="[`scores[${index}]`, { rules: [{ required: true, message: '请输入该项分值' }] }]"
                              @blur="handleValueArrayBlur($event, index, 'score')"
                              style="width: 100%"
                            />
                          </a-form-item>
                        </td>
                        <td class="action">
                          <a-popconfirm
                            v-if="form.getFieldValue('valueArray').length > 2"
                            title="是否确认删除该选项？"
                            @confirm="delOption(index)"
                            okText="确认"
                            cancelText="取消"
                          >
                            <a-button size="small" icon="delete" type="link">删除</a-button>
                          </a-popconfirm>
                          <span v-else>-</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div class="add-btn" @click="addOption()">
                    <a-icon type="plus-circle" />添加选项
                  </div>
                </template>
                <!-- 选项配置表格-end -->
                <!-- 附件列表-start -->
                <template v-if="controlType === 10">
                  <table border class="table-container">
                    <tbody>
                      <tr>
                        <th>文件名称</th>
                        <th>操作</th>
                      </tr>
                      <tr
                        v-for="(item, index) in form.getFieldValue('valueArray')"
                        :key="'tr' + index"
                      >
                        <td>{{ item.fileName }}</td>
                        <td class="action">
                          <a-popconfirm
                            v-if="form.getFieldValue('valueArray').length > 1"
                            title="是否确认删除该附件？"
                            @confirm="delFile(index)"
                            okText="确认"
                            cancelText="取消"
                          >
                            <a-button size="small" icon="delete" type="link">删除</a-button>
                          </a-popconfirm>
                          <span v-else>-</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <a-upload
                    class="add-btn"
                    name="file"
                    :action="actionUrl"
                    :headers.sync="headers"
                    :showUploadList="false"
                    @change="handleFileChange"
                  >
                    <a-icon type="upload" style="margin-right:5px" />上传附件
                  </a-upload>
                </template>
                <!-- 附件列表-end -->
              </a-form-item>
            </a-col>
          </a-row>
          <!-- 仅单选、多选和附件下载有-end -->
          <a-row :gutter="12">
            <a-col :span="24">
              <a-form-item label="备注说明">
                <a-textarea
                  placeholder="请输入内容"
                  v-decorator="['remark']"
                  :autosize="{ minRows: 3 }"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-modal>
    <!-- 查看图片 -->
    <a-modal :visible="imgPreview.visible" :footer="null" @cancel="handleImgPreviewCancel">
      <img alt="example" style="width: 100%" :src="imgPreview.img" />
    </a-modal>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from "vue-property-decorator";
import FormControl from "@/components/form-config-modal/FormControl.vue";

import config from "@/config";
import moment from "moment";
const UPLOAD_URL = config.get("UPLOAD_URL");

@Component({ components: { FormControl } })
export default class FormConfig extends Vue {
  @Prop({ type: [Boolean], default: () => false }) visible!: Boolean;

  @Prop({ type: [Object], default: () => null }) formData!: any;

  @Prop({ type: [Object], default: () => null }) parentNode!: any;

  @Prop({ type: [String], default: () => {} }) title!: String;

  @Prop({ type: [Array], default: () => [] }) formControlType!: any;

  // 弹窗可见性
  private showModal: Boolean = false;

  // 表单
  private form: any = {};

  // 控件索引
  private formIndex: number = -1;

  // 控件类型
  private controlType: number = 1;

  // 表单控件
  private formControl: any = {};

  // 图片预览
  private imgPreview: any = {
    visible: false,
    img: null
  };

  // 上传地址
  private actionUrl: any = UPLOAD_URL + "api/UploadFile/Upload";

  // 定义选项值ID，由于默认会配置1、2两个值，所以从3递增
  private valId: any = 3;

  private headers: any;

  beforeCreate() {
    const token = this.$ls.get("token");
    const prefix = this.$ls.get("token_type");
    this.headers = {
      authorization: `${prefix} ${token}`
    };
  }

  created() {
    const _this = this;
    this.form = this.$form.createForm(this, {
      onValuesChange: (props, scores) => {
        _this.$nextTick(() => {
          // 获取表单所有变动值
          _this.formControl = _this.form.getFieldsValue();
        });
      }
    });
  }

  @Watch("visible") visibleChange() {
    this.showModal = this.visible;
    this.form.resetFields();

    if (this.visible) {
      let data: any = {};

      // 编辑
      if (this.formData) {
        data = JSON.parse(JSON.stringify(this.formData));
        this.controlType = data.type;
        this.formIndex = data.index;
      }
      // 新增
      else {
        data = {
          name: null,
          type: 1,
          isRequired: false,
          isReadOnly: false,
          isScore: false,
          score: null,
          placeholder: null,
          valueArray: [],
          remark: null
        };

        this.controlType = 1;
        this.formIndex = -1;
      }

      this.$nextTick(() => {
        this.handleFormData(data);
      });
    }
  }

  @Emit("cancel") close(visible: Boolean) {}

  @Emit("ok") comfir(data: any, index: number) {}

  // 校验控件名称
  validateName(rule: any, value: any, callback: any) {
    if (!value) callback("请输入控件标题");

    // if (!this.parentNode || !this.parentNode.formControls.length) {
    //   callback();
    // }

    // this.parentNode.formControls.forEach((e, index) => {
    //   if (e.name === value && this.formIndex !== index) {
    //     callback(`名称“${value}”已存在`);
    //   }
    // });

    callback();
  }

  // 是否显示备注
  showRemark() {
    const remark = this.form.getFieldValue("remark");
    if (!remark || remark == "" || remark == null || remark == undefined)
      return false;
    return true;
  }

  // 处理表单数据
  handleFormData(data) {
    const {
      name,
      type,
      isRequired,
      isReadOnly,
      isScore,
      score,
      placeholder,
      valueArray,
      remark,
      isImplementStatistics,
      isQuantityStatistics,
      unit,
      index
    } = data;

    // 通有属性
    this.form.setFieldsValue({ name, type, remark });

    // 仅单行、多行、数字和日期控件
    if (type < 4 || type === 6 || type === 7) {
      this.form.setFieldsValue({ placeholder });
    }
    // 单行文本、多行文本
    if (type <= 2) {
      this.form.setFieldsValue({ isReadOnly });
    }
    // 数字
    if (type === 3) {
      this.form.setFieldsValue({
        isImplementStatistics,
        isQuantityStatistics,
        unit
      });
    }
    // 下载
    if (type === 10) {
      this.form.setFieldsValue({ valueArray });
    }

    // 需要最后判断才能绑定isScore的值
    else {
      this.form.setFieldsValue({ isRequired });
      this.$nextTick(() => {
        // 绑定完isScore后才能绑定score的值
        this.form.setFieldsValue({ isScore });

        this.$nextTick(() => {
          // 单选、多选分值配置在选项中
          if (type === 4 || type === 5) {
            let labels: any = [];
            let scores: any = [];

            valueArray.forEach(e => {
              labels.push(e.label);
              scores.push(e.score);
            });

            this.setOptions(valueArray, labels, data.isScore ? scores : null);
          } else {
            if (data.isScore) {
              this.form.setFieldsValue({ score });
            }
          }
        });
      });
    }
  }

  // 确认
  handleOk() {
    if (this.controlType === 10) {
      const valueArray = this.form.getFieldValue("valueArray");

      if (!valueArray || !valueArray.length) {
        this.$message.error("至少要上传一个附件");
        return false;
      }
    }

    this.form.validateFields((err: any, values: any) => {
      if (!err) {
        let data = { ...values };

        if (this.controlType === 4 || this.controlType === 5) {
          data.valueArray = values.valueArray.map((e, i) => {
            return values.isScore
              ? {
                  label: values.labels[i],
                  value: `val${i + 1}`,
                  score: values.scores[i]
                }
              : {
                  label: values.labels[i],
                  value: `val${i + 1}`
                };
          });
        } else {
          // 不计分清空分数
          if (!values.isScore) {
            data.score = 0;
          }
        }

        this.formIndex > -1
          ? this.comfir(data, this.formIndex)
          : this.comfir(data, -1);
      } else {
        this.$message.error("请检查输入项");
      }
    });
  }

  // 表单控件类型改变
  handleFormControlTypeChange(type) {
    this.controlType = type;

    this.$nextTick(() => {
      // 非下载控件
      if (type !== 10) {
        this.form.setFieldsValue({
          isRequired: false
        });
        this.$nextTick(() => {
          this.form.setFieldsValue({ isScore: false });

          // 单选、多选
          if (type === 4 || type === 5) {
            const valueArray = [
              {
                label: "选项一",
                value: "val1",
                score: ""
              },
              {
                label: "选项二",
                value: "val2",
                score: ""
              }
            ];
            const labels = ["选项一", "选项二"];

            const isScore = this.form.getFieldValue("isScore");
            const scores = isScore ? ["", ""] : null;

            this.$nextTick(() => {
              this.setOptions(valueArray, labels, scores);
            });

            return;
          }
        });
      }

      // 单行文本、多行文本
      if (type === 1 || type === 2) {
        this.form.setFieldsValue({
          isReadOnly: false
        });
        return;
      }
      // 数字
      if (type === 3) {
        this.form.setFieldsValue({
          isImplementStatistics: false,
          isQuantityStatistics: false
        });
        return;
      }
    });
  }

  // 是否必填
  handleIsRequiredChange(e) {
    if (this.controlType > 2) return;

    this.form.setFieldsValue({
      isReadOnly: false
    });
  }

  // 是否只读
  handleIsReadOnlyChange(e) {
    this.form.setFieldsValue({
      isRequired: false
    });
  }

  // 是否统计字段
  handleIsStatisticsChange(e) {
    const value = e.target.value;
    if (value) {
      this.$nextTick(() => {
        this.form.setFieldsValue({
          isImplementStatistics: false,
          isQuantityStatistics: false
        });
      });
    }
  }

  // 删除选项
  delOption(index) {
    const { valueArray, labels, scores } = this.getOptions();
    const isScore = this.form.getFieldValue("isScore");

    valueArray.splice(index, 1);
    labels.splice(index, 1);

    if(isScore){
      scores.splice(index, 1);
      this.setOptions(valueArray, labels, scores);
    }
    else{
      this.setOptions(valueArray, labels, null);
    } 
  }

  // 添加选项
  addOption() {
    const { valueArray, labels, scores } = this.getOptions();

    const nextValueArray = valueArray.concat({
      label: "",
      value: `val${this.valId++}`,
      score: ""
    });
    const nextLabels = labels.concat("");

    const isScore = this.form.getFieldValue("isScore");
    const nextScores = isScore && scores ? scores.concat("") : null;

    this.setOptions(nextValueArray, nextLabels, nextScores);
  }

  // 获取选项配置
  getOptions() {
    const labels = this.form.getFieldValue("labels");
    const scores = this.form.getFieldValue("scores");
    const valueArray = this.form.getFieldValue("valueArray");

    return { valueArray, labels, scores };
  }

  // 配置选项
  setOptions(valueArray, labels, scores) {
    // console.log(valueArray, labels, scores);

    this.form.setFieldsValue({ valueArray });

    const params = scores ? { labels, scores } : { labels };
    this.$nextTick(() => {
      this.form.setFieldsValue(params);
    });
  }

  // 选项值失去焦点
  handleValueArrayBlur(e, index, type) {
    const value = e.target.value;
    const { valueArray, labels, scores } = this.getOptions();

    if (!value || value === "") {
      if (type === "label") {
        this.form.setFields({
          [`labels[${index}]`]: {
            value,
            errors: [new Error("请输入选项文本")]
          }
        });
      }
      // else if (type === "value") {
      //   this.form.setFields({
      //     [`values[${index}]`]: {
      //       value,
      //       errors: [new Error("请输入选项值")]
      //     }
      //   });
      // }

      return false;
    }

    // 对比内容
    valueArray.forEach((e, i) => {
      if (index != i) {
        if (e.label === value && type === "label") {
          this.form.setFields({
            [`labels[${index}]`]: {
              value,
              errors: [new Error("选项文本不能重复")]
            }
          });
          return false;
        }
        // else if (e.score == value && type === "value") {
        //   this.form.setFields({
        //     [`values[${index}]`]: {
        //       value,
        //       errors: [new Error("选项值不能重复")]
        //     }
        //   });
        //   return false;
        // }
      }
    });

    // 配置demo选项
    if (this.controlType === 4 || this.controlType === 5) {
      let nextValueArray: any = [];

      const isScore = this.form.getFieldValue("isScore");

      labels.forEach((e, i) => {
        isScore
          ? nextValueArray.push({
              label: labels[i],
              value: `val${i + 1}`,
              score: scores[i]
            })
          : nextValueArray.push({
              label: labels[i],
              value: `val${i + 1}`
            });
      });

      this.form.setFieldsValue({ valueArray: nextValueArray });
      this.formControl.valueArray = nextValueArray;
    }
  }

  // 取消预览图片
  handleImgPreviewCancel() {
    this.imgPreview.visible = false;
  }

  // 预览图片
  handleImgPreview(file) {
    this.imgPreview.img = file.url || file.thumbUrl;
    this.imgPreview.visible = true;
  }

  // 删除附件
  delFile(index) {
    const valueArray = this.form.getFieldValue("valueArray");
    valueArray.splice(index, 1);
    this.form.setFieldsValue({ valueArray });
  }

  // 上传可下载的附件
  handleFileChange(info) {
    if (info.event) return;
    let valueArray = this.form.getFieldValue("valueArray");

    if (info.file.status === "error") {
      this.$message.success("上传失败！请重试");
      return;
    }

    if (info.file.response) {
      let data = { ...info.file.response.data };
      data.size = info.file.size;
      // data.size = (info.file.size / 1024).toFixed(2);

      if (valueArray && valueArray.length) {
        valueArray.push(data);
      } else {
        valueArray = [data];
      }
    }

    this.form.setFieldsValue({ valueArray });
  }
}
</script>
<style lang="less">
.form-modal {
  &-container {
    /deep/ .ant-form-item {
      display: flex;
    }

    /deep/ .ant-form-item-label {
      min-width: 120px;
    }

    /deep/ .ant-form-item-control-wrapper {
      width: 100%;
    }
  }

  &__title {
    width: 90%;
  }
}
</style>
<style lang="less" scoped>
@import "./../../assets/theme/styles/rubbish-score/scroll-bar.less";

.form-container {
  padding: 0 20px 0 15px;
  margin-top: 20px;
  max-height: calc(100vh - 400px);
  overflow-y: auto;
  overflow-x: hidden;

  .add-btn {
    display: block;
    border: 1px dashed #dfe6ec;
    width: 100%;
    text-align: center;
    height: 45px;
    line-height: 45px;
    cursor: pointer;
    position: relative;
    z-index: 10;
    color: #1da57a;
    margin-top: -1px;

    /deep/ .ant-upload {
      width: 100%;
      display: block;
      height: 45px;
      line-height: 45px;
      color: #1da57a;
    }

    &:hover {
      border-color: #1da57a;
    }

    & > i {
      margin-right: 5px;
    }
  }
}

.example-container {
  background: #f2f2f2;
  padding: 20px;

  /deep/ .control {
    width: 65%;
  }
}
@border: 1px solid #e8e8e8;

.table-container {
  border: @border;
  width: 100%;

  /deep/ th {
    text-align: center;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    background: #fafafa;
    border: @border;
  }
  /deep/ td {
    padding: 8px 10px 0 10px;
    border: @border;
  }

  .action {
    text-align: center;
    padding-top: 0;
  }
}

.requried {
  &::before {
    display: inline-block;
    margin-right: 4px;
    color: hsl(357, 91%, 55%);
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 1;
    content: "*";
  }
}
</style>