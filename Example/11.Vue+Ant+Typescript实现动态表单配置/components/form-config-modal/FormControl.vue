<template>
  <div class="form-control-container">
    <!-- 单行文本 -->
    <template v-if="props.type === 1">
      <a-input
        v-model="props.defaultValue"
        style="width:300px"
        :read-only="props.isReadOnly"
        :placeholder="props.placeholder"
      />
    </template>
    <!-- 多行文本 -->
    <template v-if="props.type === 2">
      <a-textarea
        v-model="props.defaultValue"
        style="width:300px"
        :read-only="props.isReadOnly"
        :placeholder="props.placeholder"
      />
    </template>
    <!-- 数字 -->
    <template v-if="props.type === 3">
      <a-input-number
        v-model="props.defaultValue"
        :min="0"
        :placeholder="props.placeholder"
        style="min-width: 300px"
      />
    </template>
    <!-- 单选 -->
    <template v-if="props.type === 4">
      <a-radio-group
        v-if="props.valueArray && props.valueArray.length"
        v-model="props.defaultValue"
      >
        <a-radio
          v-for="(item, index) in props.valueArray"
          :key="index"
          :value="item.value"
        >{{ item.label }}</a-radio>
      </a-radio-group>
      <span v-else>请配置选项</span>
    </template>
    <!-- 多选 -->
    <template v-if="props.type === 5">
      <template v-if="props.valueArray && props.valueArray.length">
        <a-select
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
        />
      </template>
      <span v-else>请配置选项</span>
    </template>
    <!-- 日期、时间日期 -->
    <template v-if="props.type === 6 || props.type === 7">
      <a-date-picker
        :showTime="props.type === 7"
        :value="formatDate(props.defaultValue)"
        :placeholder="props.placeholder"
        style="min-width: 300px"
      />
    </template>
    <!-- 图片上传 -->
    <template v-if="props.type === 8">
      <div class="clearfix img-upload-container">
        <a-upload
          accept=".jpg, .jpeg, .png, .gif"
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          listType="picture-card"
          :fileList="fileList"
          @preview="imgPreview"
          @change="handleChange"
        >
          <div v-if="fileList.length < 3">
            <a-icon type="plus" />
            <div class="ant-upload-text">上传图片</div>
          </div>
        </a-upload>
      </div>
    </template>
    <!-- 附件上传 -->
    <template v-if="props.type === 9">
      <a-upload
        class="file-upload-container"
        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
        :multiple="true"
        :fileList="fileList"
        @change="handleChange"
      >
        <a-button>
          <a-icon type="upload" />上传附件
        </a-button>
      </a-upload>
    </template>
    <!-- 附件下载 -->
    <template v-if="props.type === 10">
      <ul class="file-list" v-if="props.valueArray && props.valueArray.length">
        <li v-for="(item, index) in props.valueArray" :key="'file' + index" class="file-list-item">
          <a-tooltip placement="topLeft" v-if="item.fileName.length > 30">
            <template slot="title">
              <enclosure :data="item"/>
            </template>
            <a :href="serveUrl + item.localUrl" target="blank">
              <a-icon type="paper-clip" class="file__icon" />
              <enclosure :data="item" class="file__name"/>
            </a>
          </a-tooltip>
          <a v-else :href="serveUrl + item.localUrl" target="blank">
              <a-icon type="paper-clip" class="file__icon" />
              <enclosure :data="item" class="file__name"/>
            </a>
        </li>
      </ul>
      <span v-else>暂无附件可下载</span>
    </template>
    <div class="hint">
      <!-- <span v-if="props.isRequired" class="is-required">(要求：必填)</span> -->
      <template v-if="props.type < 3">
        <span v-if="props.isReadOnly" class="is-readonly">(文本只读)</span>
      </template>
      <template v-if="props.type === 3">
        <span v-if="props.unit" class="unit">(单位: {{ props.unit }})</span>
        <span v-if="props.isStatistics" class="is-statisstics">(汇总统计)</span>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from "vue-property-decorator";
import Enclosure from "@/components/form-config-modal/Enclosure.vue";

import moment from "moment";

import config from "@/config";
const SERVER_URL = config.get("SERVER_URL");

@Component({ components: { Enclosure } })
export default class FormControl extends Vue {
  @Prop({ type: [Object] }) props!: any;

  fileList: any = [
      // {
      //   uid: "-1",
      //   name: "xxx.png",
      //   status: "done",
      //   url:
      //     "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
      // }
    ]

  // 服务器地址
  serveUrl: any = SERVER_URL;

  @Watch("props") propsChange() {
    // console.log(this.props);
  }

  @Emit("img-preview") imgPreview(file: any) {}

  // 日期格式化
  formatDate(value) {
    return value ? moment(value) : null;
  }

  // 是否显示备注
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

  handleChange({ fileList }) {
    this.fileList = fileList;
  }
}
</script>
<style lang="less" scoped>
.form-control-container {
  display: flex;
  align-items: center;

  .file {
    &-list {
      list-style: none;
      margin: 0;
      padding: 0;

      &-item {
        >a{
          display: flex;
          align-items: center;
        }
      }
    }

    &__name {
      max-width: 480px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__icon {
      margin-right: 5px;
    }

    &__size {
      margin-left: 5px;
    }
  }

  .hint {
    span {
      font-size: 12px;
      margin-left: 5px;
    }
    .unit {
      color: #ff6870;
    }

    .is-required {
      color: #f5222d;
    }

    .is-statisstics,
    .is-readonly {
      color: #56b7f7;
    }
  }
}
.img-upload-container {
  > span {
    display: flex;
  }
}

.file-upload-container {
  /deep/ .ant-upload-list {
    min-width: 400px;
  }
}
</style>
