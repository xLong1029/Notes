<template>
  <!-- 这里用table可以解决打印时，图片沾满一页的BUG -->
  <table cellpadding="0" cellspacing="0" border="0" class="img-list">
    <tr v-for="(item, index) in list" :key="'file' + index" class="img-list-item">
      <td>
        <div class="img-list-item__content">
          <div class="img-list-item__block">
            <a>
              <img class="img-list-item__img" :src="serveUrl + item.localUrl" />
            </a>
          </div>
        </div>
        <span class="img-list-item__actions">
          <a-icon
            type="eye"
            class="img-list-item__actions-btn"
            @click="imgPreview({ url: serveUrl + item.localUrl })"
          />
        </span>
      </td>
    </tr>
  </table>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from "vue-property-decorator";

import moment from "moment";

import config from "@/config";
const SERVER_URL = config.get("SERVER_URL");

@Component
export default class TextContentImgList extends Vue {
  @Prop({ type: [Array], default: () => [] }) list!: any;

  // 服务器地址
  private serveUrl: any = SERVER_URL;

  @Watch("list") listChange() {}

  @Emit("img-preview") imgPreview(file: any) {}
}
</script>
<style lang="less" scoped>
.img {
  &-list {
    width: 100%;

    &-item {
      float: left;
      // width: 104px;
      // height: 104px;
      margin: 0 8px 8px 0;
      position: relative;
      padding: 8px;
      border: 1px solid #d9d9d9;
      border-radius: 2px;

      &:hover {
        .img-list-item__actions,
        .img-list-item__content::before {
          opacity: 1;
        }
      }

      &__content {
        position: relative;
        height: 100%;
        overflow: hidden;
        padding: 0;
        &::before {
          position: absolute;
          z-index: 1;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          opacity: 0;
          -webkit-transition: all 0.3s;
          transition: all 0.3s;
          content: " ";
        }
      }

      &__block {
        display: table;
        height: 100%;
        width: 100%;
        > a {
          // max-width: 150px;
          display: table-cell;
          vertical-align: middle;
          text-align: center;
        }
      }

      &__img {
        display: block;
        max-width: 100%;
        width: auto;
        // max-height: 600px;
        height: auto;
      }

      &__actions {
        position: absolute;
        top: 50%;
        left: 50%;
        z-index: 10;
        white-space: nowrap;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        opacity: 0;
        -webkit-transition: all 0.3s;
        transition: all 0.3s;

        &-btn {
          z-index: 10;
          width: 16px;
          margin: 0 4px;
          color: rgba(255, 255, 255, 0.85);
          font-size: 16px;
          cursor: pointer;
          -webkit-transition: all 0.3s;
          transition: all 0.3s;
        }
      }
    }
  }
}
</style>
