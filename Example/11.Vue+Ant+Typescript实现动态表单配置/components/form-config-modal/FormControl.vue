<template>
  <div class="form-item-container">
    <div
      class="form-item"
      :class="{'label-top-normal': props.type >= 8 || props.type === 2 || showRemark(props) || (props.type === 3 && (props.isImplementStatistics || props.isQuantityStatistics)) }"
    >
      <div class="form-item__label">
        <span class="form-item__required" v-if="props.isRequired">*</span>
        {{ props.name }}
        <!-- <a-tooltip
          v-if="showRemark(props)"
          :title="props.remark"
          class="form-item__question"
        >
          <a-icon type="question-circle-o" />
        </a-tooltip>-->
        :
      </div>
      <div class="control">
        <div class="form-item__control">
          <!-- 单行文本 -->
          <template v-if="props.type === 1">
            <a-input
              v-model="props.value"
              style="width:300px"
              :read-only="props.isReadOnly"
              :placeholder="props.placeholder"
            />
          </template>
          <!-- 多行文本 -->
          <template v-if="props.type === 2">
            <a-textarea
              v-model="props.value"
              style="width:300px"
              :read-only="props.isReadOnly"
              :placeholder="props.placeholder"
            />
          </template>
          <!-- 数字 -->
          <template v-if="props.type === 3">
            <a-input-number
              v-model="props.value"
              :min="0"
              :placeholder="props.placeholder"
              style="min-width: 300px"
            />
          </template>
          <!-- 单选 -->
          <template v-if="props.type === 4">
            <a-radio-group v-if="props.valueArray && props.valueArray.length" v-model="props.value">
              <a-radio v-for="(item, index) in props.valueArray" :key="index" :value="item.value">
                <span>{{ item.label }}</span>
                  <span
                    v-if="props.isScore && item.score !== 0"
                    class="is-score"
                  >({{ item.score }}分)</span>
              </a-radio>
            </a-radio-group>
            <span v-else>无选项可选，请配置</span>
          </template>
          <!-- 多选 -->
          <template v-if="props.type === 5">
            <template v-if="props.valueArray && props.valueArray.length">
              <a-checkbox-group v-model="props.value">
                <a-checkbox
                  v-for="(item, index) in props.valueArray"
                  :key="index"
                  :value="item.value"
                >
                  <span>{{ item.label }}</span>
                  <span
                    v-if="props.isScore && item.score !== 0"
                    class="is-score"
                  >({{ item.score }}分)</span>
                </a-checkbox>
              </a-checkbox-group>
              <!-- 开发的时候有误,做成select了,保留使用 -->
              <!-- <a-select
                  v-if="defaultValueIsNull()"
                  :options="props.valueArray"
                  :placeholder="props.placeholder"
                  style="min-width: 300px"
                />
                <a-select
                  v-else
                  v-model="props.defaultValue"
                  :options="props.valueArray"
                  :placeholder="props.placeholder"
                  style="min-width: 300px"
              />-->
            </template>
            <span v-else>无选项可选，请配置</span>
          </template>
          <!-- 日期、时间日期 -->
          <template v-if="props.type === 6 || props.type === 7">
            <a-date-picker
              :showTime="props.type === 7"
              v-model="props.value"
              :placeholder="props.placeholder"
              style="min-width: 300px"
            />
          </template>
          <!-- 图片上传 -->
          <template v-if="props.type === 8">
            <div class="clearfix img-upload-container">
              <a-upload
                accept=".jpg, .jpeg, .png, .gif"
                listType="picture-card"
                :action="actionUrl"
                :headers.sync="headers"
                :fileList="fileList"
                @preview="imgPreview"
                @change="handleUploadChange"
              >
                <a-icon type="plus" />
                <div class="ant-upload-text">上传图片</div>
              </a-upload>
              <span v-if="props.isScore && props.score !== 0" class="is-score">({{ props.score }}分)</span>
            </div>
          </template>
          <!-- 附件上传 -->
          <template v-if="props.type === 9">
            <a-upload
              class="file-upload-container"
              :action="actionUrl"
              :headers.sync="headers"
              :fileList="fileList"
              @change="handleUploadChange"
            >
              <a-button>
                <a-icon type="upload" />上传附件
              </a-button>
              <span v-if="props.isScore && props.score !== 0" class="is-score">({{ props.score }}分)</span>
            </a-upload>
          </template>
          <!-- 附件下载 -->
          <template v-if="props.type === 10">
            <file-list v-if="props.valueArray && props.valueArray.length" :list="props.valueArray" />
            <span v-else style="color: #888;">暂无附件可下载</span>
          </template>
          <span class="hint">
            <template
              v-if="props.type !== 4 && props.type !== 5 && props.type !== 8 && props.type !== 9"
            >
              <span v-if="props.isScore && props.score !== 0" class="is-score">({{ props.score }}分)</span>
            </template>
            <template v-if="props.type < 3">
              <span v-if="props.isReadOnly" class="is-readonly">(文本只读)</span>
            </template>
            <template v-if="props.type === 3">
              <span v-if="props.unit" class="unit">(单位: {{ props.unit }})</span>
            </template>
          </span>
        </div>
        <div class="form-item__statisstics-type">
          <a-tag color="purple" v-if="props.isImplementStatistics" class="statisstics-type-tag">实施统计</a-tag>
          <a-tag color="purple" v-if="props.isQuantityStatistics" class="statisstics-type-tag">数量统计</a-tag>
        </div>
        <div class="form-item__remark" v-if="showRemark(props)">
          <div class="form-control__remark">(提示：{{ props.remark }})</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from "vue-property-decorator";
import FileList from "@/components/text-content/FileList.vue";

import moment from "moment";

import config from "@/config";
const SERVER_URL = config.get("SERVER_URL");
const UPLOAD_URL = config.get("UPLOAD_URL");

@Component({ components: { FileList } })
export default class FormControl extends Vue {
  // 属性
  @Prop({ type: [Object] }) props!: any;
  // 使用类型 模板配置 module 填报 report
  @Prop({ type: [String], default: () => "module" }) usageType!: any;

  // 上传文件列表
  private fileList: any = [
    // {
    //   uid: "-1",
    //   name: "xxx.png",
    //   status: "done",
    //   url:
    //     "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
    // }
  ];

  // 默认已上传的文件列表
  private defaultValueFiles: any = [];

  // 服务器地址
  private serveUrl: any = SERVER_URL;
  // 上传地址
  private actionUrl: any = UPLOAD_URL + "api/UploadFile/Upload";

  // 上传请求头
  private headers: any;

  beforeCreate() {
    const token = this.$ls.get("token");
    const prefix = this.$ls.get("token_type");
    this.headers = {
      authorization: `${prefix} ${token}`
    };
  }

  created() {
    this.formatData(this.props);
  }

  @Watch("props") propsChange() {
    this.formatData(this.props);
  }

  @Emit("img-preview") imgPreview(file: any) {}

  // 数据格式化
  formatData(data) {
    // 日期控件
    if (data.type === 6 || data.type === 7) {
      data.value = data.value ? moment(data.value) : null;
      return;
    }
    // 上传控件
    if (data.type === 8 || data.type === 9) {
      if (data.value && data.value.length) {
        this.fileList = data.value.map((e, i) => ({
          uid: i + 1,
          name: e.fileName,
          fileName: e.fileName,
          status: "done",
          url: this.serveUrl + e.localUrl,
          localUrl: e.localUrl
        }));
      }
    }
  }

  // 默认值是否为空
  defaultValueIsNull() {
    const defaultValue = this.props.defaultValue;
    if (
      !defaultValue ||
      defaultValue == "" ||
      defaultValue == null ||
      defaultValue == undefined
    )
      return true;
    return false;
  }

  // 判断是否显示备注说明
  showRemark(item) {
    if (
      !item.remark ||
      item.remark == "" ||
      item.remark == null ||
      item.remark == undefined
    )
      return false;
    return true;
  }

  // 上传文件改变
  handleUploadChange(info) {
    if (info.event) return;

    if (info.file.status === "error") {
      this.$message.success("上传失败！请重试");
      return;
    }

    this.fileList = info.fileList;

    this.props.value = this.fileList.map(e => {
      let { uid, name, fileName, size, localUrl } = e;

      if (uid) {
        fileName = name;

        if (e.response) {
          localUrl = e.response.data.localUrl;
        }
      }

      return {
        uid,
        fileName,
        size,
        localUrl
      };
    });
  }
}
</script>
<style lang="less" scoped>
.form-item {
  width: 100%;
  display: flex;
  align-items: center;
  // padding: 10px 0;
  position: relative;

  &.label-top-normal {
    align-items: normal;

    .form-item__label {
      margin-top: 3px;
    }
  }

  &__label {
    text-align: right;
    margin-right: 10px;
    min-width: 35%;
    max-width: 35%;
  }

  &__required {
    color: #f5222d;
    font-family: SimSun, sans-serif;
  }

  &__question {
    margin-right: 5px;
  }

  &__remark {
    margin-top: 5px;
    color: #56b7f7;
    font-size: 12px;
  }

  .control {
    width: 50%;
  }

  &-container {
    width: 100%;
    display: flex;
    align-items: center;

    .hint {
      span {
        font-size: 12px;
        margin-left: 5px;
      }

      .is-required {
        color: #f5222d;
      }

      .unit,
      .is-statisstics,
      .is-readonly {
        color: #56b7f7;
      }
    }
  }
}
.img-upload-container {
  /deep/ .ant-upload-list-item {
    display: table;
  }

  /deep/ .ant-upload-list-item-info {
    display: table-cell;
    vertical-align: middle;
    &:before {
      top: 0;
    }
  }

  /deep/ .ant-upload-list-item-thumbnail {
    text-align: center;
    img {
      display: inline-block;
      max-width: 86px;
      width: auto;
      max-height: 86px;
      height: auto;
    }
  }

  /deep/ .ant-upload-list-picture-card {
    float: inherit;
  }
}

.file-upload-container {
  /deep/ .ant-upload-list {
    min-width: 400px;
  }
}

.is-score {
  font-size: 12px;
  margin-left: 5px;
  color: #f5222d;
}

.statisstics-type-tag {
  margin: 5px 5px 0 0;
}
</style>
