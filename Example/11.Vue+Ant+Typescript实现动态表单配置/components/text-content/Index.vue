<template>
  <div class="text-content-container">
    <div
      class="text-content"
      :class="{'flex': previewType === 'quarter', 'label-top-normal': data.type >= 8 || data.type === 2}"
    >
      <!-- 季报查看 -->
      <template v-if="previewType === 'quarter'">
        <div class="text-content__label">{{ data.name }}:</div>
        <div class="text-content__content">
          <!-- 数字 -->
          <template v-if="data.type === 3">
            <span>{{ data.value && data.unit ? data.value + data.unit : "--" }}</span>
          </template>
          <!-- 单选、日期 -->
          <template
            v-else-if="data.type === 4 || data.type === 6 || data.type === 7"
          >{{ data.valueStr | notNull }}</template>
          <!-- 多选 -->
          <template v-else-if="data.type === 5">
            <span v-for="(label, i) in data.valueStr" :key="'label' + i">{{ label }}</span>
          </template>
          <!-- 图片上传 -->
          <template v-else-if="data.type === 8">
            <img-list
              v-if="data.value && data.value.length"
              :list="data.value"
              @img-preview="imgPreview"
            />
            <span v-else style="color: #888;">--</span>
          </template>
          <!-- 附件上传 -->
          <template v-else-if="data.type === 9">
            <file-list v-if="data.value && data.value.length" :list="data.value" />
            <span v-else style="color: #888;">--</span>
          </template>
          <!-- 附件下载 -->
          <template v-else-if="data.type === 10">
            <file-list v-if="data.valueArray && data.valueArray.length" :list="data.valueArray" />
            <span v-else style="color: #888;">暂无附件可下载</span>
          </template>
          <template v-else>{{ data.value | notNull }}</template>
        </div>
      </template>
      <!-- 季报汇总、年报查看 -->
      <template v-else-if="previewType === 'quarterSummary' || previewType === 'year'">
        <div class="text-content__title">{{ data.name }}:</div>
        <div class="text-content__content">
          <!-- 附件下载 -->
          <template v-if="data.type === 10">
            <file-list v-if="data.valueArray && data.valueArray.length" :list="data.valueArray" />
            <span v-else style="color: #888;">暂无附件可下载</span>
          </template>
          <!-- 其他 -->
          <template v-else>
            <template v-if="data.deptValues && data.deptValues.length">
              <table cellpadding="0" cellspacing="0" class="info-table">
                <tr
                  v-for="(item, index) in data.deptValues"
                  :key="'tr' + index"
                  class="info-table__tr"
                >
                  <th
                    class="info-table__th"
                    :width="previewType === 'year' ? 150 : 200"
                  >{{ item.deptName | notNull }}</th>
                  <td class="info-table__td">
                    <!-- 数字 -->
                    <template v-if="data.type === 3">
                      <span>{{ item.value && item.unit ? item.value + item.unit : "--" }}</span>
                    </template>
                    <!-- 单选、日期 -->
                    <template
                      v-else-if="data.type === 4 || data.type === 6 || data.type === 7"
                    >{{ item.valueStr | notNull }}</template>
                    <!-- 多选 -->
                    <template v-else-if="data.type === 5">
                      <span v-for="(label, i) in item.valueStr" :key="'label' + i">{{ label }}</span>
                    </template>
                    <!-- 图片上传 -->
                    <template v-else-if="data.type === 8">
                      <img-list
                        v-if="item.value && item.value.length"
                        :list="item.value"
                        @img-preview="imgPreview"
                      />
                      <span v-else style="color: #888;">--</span>
                    </template>
                    <!-- 附件上传 -->
                    <template v-else-if="data.type === 9">
                      <file-list v-if="item.value && item.value.length" :list="item.value" />
                      <span v-else style="color: #888;">--</span>
                    </template>
                    <template v-else>{{ item.value | notNull }}</template>
                  </td>
                </tr>
              </table>
            </template>
            <span v-else style="color: #888;">--</span>
          </template>
        </div>
      </template>
      <!-- 其他 -->
      <template v-else>查看类型有误</template>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from "vue-property-decorator";

import ImgList from "./ImgList.vue";
import FileList from "./FileList.vue";

import moment from "moment";

import config from "@/config";
@Component({
  name: "ModuleTextContent",
  components: { ImgList, FileList }
})
export default class ModuleTextContent extends Vue {
  // 数据
  @Prop({ type: [Object] }) data!: any;
  // 查看类型：季报查看 quarter 季报汇总查看 quarterSummary 年报查看 year
  @Prop({ type: [String], default: () => "quarter" }) previewType!: any;

  @Watch("data") dataChange() {}

  @Emit("img-preview") imgPreview(file: any) {}
}
</script>
<style lang="less" scoped>
.text-content {
  width: 100%;
  position: relative;

  &.flex {
    display: flex;
    align-items: center;

    &text-content__content {
      width: 65%;
    }

    &.label-top-normal {
      align-items: normal;
    }
  }

  &__label {
    text-align: right;
    margin-right: 10px;
    min-width: 35%;
    max-width: 35%;
  }

  &__title {
    margin-bottom: 10px;
    font-weight: bold;
  }

  &__content {
    width: 100%;
  }
}

@border: 1px solid #e8e8e8;
.info-table {
  border: @border;
  width: 100%;
  &-container {
    height: 100%;
    min-height: 400px;
  }

  &__tr {
    &:last-child {
      .info-table__th,
      .info-table__td {
        border-bottom: none;
      }
    }
  }

  &__th,
  &__td {
    padding: 12px 10px;
    min-width: 100px;
    border-bottom: @border;
  }

  &__th {
    background: #fafafa;
    border-right: @border;
    text-align: right;
  }

  &__td {
    background: #fff;
  }
}
</style>
