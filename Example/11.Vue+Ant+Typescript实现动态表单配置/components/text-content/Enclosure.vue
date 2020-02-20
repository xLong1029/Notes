<template>
  <div class="file__name">
    <div class="name" :class="{'ellipsis': !showAllText}">{{ data.fileName }}</div>
    <span v-if="data.size > 0" class="size">({{ fileSize }})</span>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from "vue-property-decorator";

@Component
export default class FormControl extends Vue {
  // 数据
  @Prop({ type: [Object] }) data!: any;
  // 是否显示全部文本
  @Prop({ type: [Boolean], default: () => false }) showAllText!: any;

  created() {
    this.getSize(this.data);
  }

  // 文件大小
  private fileSize: any = "";

  getSize(data) {
    let size: any =
      data.size && data.size > 0 ? (data.size / 1024).toFixed(2) : 0;
    this.fileSize = size > 1024 ? `${(size / 1024).toFixed(2)}MB` : `${size}KB`;
  }
}
</script>
<style lang="less" scoped>
.file__name {
  display: flex;
  width: 100%;
  .name {
    width: 100%;
    &.ellipsis {
      width: auto;
      max-width: 400px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .size{
    margin-left: 3px;
  }
}
</style>
