<template>
  <div>
    {{ data.fileName }}
    <span
      class="file__size"
    >({{ data.size > 1024 ? data.size + 'MB' : data.size + 'KB' }})</span>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from "vue-property-decorator";

@Component
export default class FormControl extends Vue {
  @Prop({ type: [Object] }) data!: any;
}
</script>
<style lang="less" scoped>
</style>
