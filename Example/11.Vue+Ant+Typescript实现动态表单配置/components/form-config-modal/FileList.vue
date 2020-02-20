<template>
  <ul class="file-list">
    <li v-for="(item, index) in list" :key="'file' + index" class="file-list-item">
      <a-tooltip
        placement="topLeft"
        v-if="item.fileName.length > 30"
        overlayClassName="file-name-tooltip"
      >
        <template slot="title">
          <div>{{ item.fileName }}</div>
        </template>
        <a :href="serveUrl + item.localUrl" target="blank">
          <a-icon type="paper-clip" class="file__icon" />
          <enclosure :data="item" class="file__name" />
        </a>
      </a-tooltip>
      <a v-else :href="serveUrl + item.localUrl" target="blank">
        <a-icon type="paper-clip" class="file__icon" />
        <enclosure :data="item" class="file__name" />
      </a>
    </li>
  </ul>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from "vue-property-decorator";
import Enclosure from "@/components/text-content/Enclosure.vue";

import moment from "moment";

import config from "@/config";
const SERVER_URL = config.get("SERVER_URL");

@Component({ components: { Enclosure } })
export default class TextContentFileList extends Vue {
  @Prop({ type: [Array], default: () => [] }) list!: any;

  // 服务器地址
  private serveUrl: any = SERVER_URL;

  @Watch("list") listChange() {}
}
</script>
<style lang="less">
.file-name-tooltip {
  /deep/ .ant-tooltip-content {
    width: 480px;
  }
}
</style>
<style lang="less" scoped>
.file {
  &-list {
    list-style: none;
    margin: 0;
    padding: 0;

    &-item {
      > a {
        display: flex;
        align-items: center;
      }
    }
  }

  &__icon {
    margin-right: 5px;
  }
}
</style>
