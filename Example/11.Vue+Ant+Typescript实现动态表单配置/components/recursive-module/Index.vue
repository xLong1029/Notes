<template>
  <div>
    <a-collapse :activeKey="unfoldKeys" :bordered="false" class="module-container">
      <a-collapse-panel v-for="(item, index) in trees" :key="item.key">
        <div slot="header" class="module-header">
          <div class="module-header__name">
            <span>{{ item.name }}</span>
            <a-tooltip placement="right" v-if="showRemark(item)">
              <template slot="title">{{ item.remark }}</template>
              <a-icon class="module-header__question" type="question-circle" />
            </a-tooltip>
          </div>
          <div class="module-header__operate">
            <a-button icon="plus-circle" type="link" @click.stop="addChildModule(item)">新增子模块</a-button>
            <a-divider type="vertical" />
            <a-button icon="plus-circle" type="link" @click.stop="addFormControl(item)">插入表单控件</a-button>
            <a-divider type="vertical" />
            <a-button icon="edit" type="link" @click.stop="editModule(item)">编辑模块</a-button>
            <a-divider type="vertical" />
            <a-button
              style="color:#f5222d"
              icon="delete"
              type="link"
              @click.stop="handleModuleDelete(index, parentNodeKey)"
            >删除模块</a-button>
          </div>
        </div>
        <div class="module-content">
          <!-- 模块key： {{ item.key }} -->
          <!-- 表单 -->
          <template v-if="item.formControls.length">
            <div
              v-for="(form, i) in item.formControls"
              :key="'form-control' + i"
              class="form-control"
              :class="{ 'label-top10': form.type === 2 || form.type === 9 || form.type === 10 }"
            >
              <div class="form-control__label">
                <span class="form-control__required" v-if="form.isRequired">*</span>
                {{ form.name }}
                <a-tooltip
                  v-if="showRemark(form)"
                  :title="form.remark"
                  class="form-control__question"
                >
                  <a-icon type="question-circle-o" />
                </a-tooltip>:
              </div>
              <div class="form-control__control">
                <form-control :props="form" @img-preview="handleImgPreview" />
              </div>
              <div class="form-control__operate">
                <a-icon
                  type="edit"
                  class="operate-icon"
                  @click.stop="editFormControl(item, form, i)"
                />
                <a-icon
                  type="delete"
                  class="operate-icon"
                  @click.stop="handleFormControlDelete(i, item.key)"
                />
              </div>
            </div>
          </template>
          <template v-if="item.children.length">
            <recursive-module
              :trees="item.children"
              :parent-node-key="item.key"
              @add-child-module="addChildModule"
              @edit-module="editModule"
              @del-module="delModule"
              @add-form-control="addFormControl"
              @edit-form-control="editFormControl"
              @del-form-control="delFormControl"
            />
          </template>
          <!-- 两者为空 -->
          <div v-if="!item.children.length && !item.formControls.length" class="empty-container">
            <a-empty description="暂无内容，请新增" />
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
    <!-- 查看图片 -->
    <a-modal :visible="imgPreview.visible" :footer="null" @cancel="handleImgPreviewCancel">
      <img alt="example" style="width: 100%" :src="imgPreview.img" />
    </a-modal>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from "vue-property-decorator";
import FormControl from "@/components/form-config-modal/FormControl.vue";

@Component({ components: { FormControl } })
export default class recursiveModule extends Vue {
  @Prop({ type: Array, default: () => [] }) trees!: any;

  @Prop({ type: String, default: () => "root" }) parentNodeKey!: any;
  

  // 展开的值
  unfoldKeys: any = [];

  // 图片预览
  imgPreview: any = {
    visible: false,
    img: null
  };

  created() {
    this.setUnfoldKeys();
  }

  // 设置展开key值
  setUnfoldKeys() {
    this.unfoldKeys = [];
    this.trees.forEach(e => {
      if (e.key) {
        this.unfoldKeys.push(e.key);
      }
    });
  }

  @Emit("add-child-module") addChildModule(node: any) {}

  @Emit("edit-module") editModule(node: any) {}
  @Emit("del-module") delModule(moduleIndex: number, parentNodeKey: string) {}

  @Emit("add-form-control") addFormControl(node: any) {}
  @Emit("edit-form-control") editFormControl(parentNode: any,form: any,formIndex: number) {}
  @Emit("del-form-control") delFormControl(formIndex: number, parentNodeKey: string) {}

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

  // 模板删除
  handleModuleDelete(moduleIndex, parentNodeKey) {
    const _this = this;

    this.$confirm({
      title: "确认删除该模块？",
      content: "该模块下的子模块和表单会一同删除",
      okText: "确认",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        _this.delModule(moduleIndex, parentNodeKey);
      }
    });
  }

  // 表单控件删除
  handleFormControlDelete(formIndex, parentNodeKey) {
    const _this = this;

    this.$confirm({
      title: "确认删除该控件？",
      okText: "确认",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        _this.delFormControl(formIndex, parentNodeKey);
      }
    });
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
}
</script>
<style lang="less">
.template-container {
  /deep/ .ant-modal-body {
    padding: 15px 20px;
  }

  /deep/ .ant-divider-horizontal {
    margin: 15px 0;
  }
}
</style>
<style lang="less" scoped>
.module {
  &-container {
    /deep/ .ant-collapse-item {
      border-bottom: none;
    }

    /deep/ .ant-collapse-header {
      border-bottom: 1px solid #d9d9d9;
    }

    /deep/ .ant-collapse-header {
      padding: 5px 0 5px 25px;
      .ant-collapse-arrow {
        left: 0px;
      }
    }

    /deep/ .ant-collapse-content-box {
      padding-right: 0;
    }
  }
  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    /deep/ .ant-divider-vertical {
      margin: 0;
    }

    /deep/ .ant-btn-link {
      padding: 0 10px;
    }

    &__question {
      margin-left: 10px;
    }
  }
}

.form-control {
  display: flex;
  align-items: center;
  padding: 10px 0;
  position: relative;

  &:hover {
    background: #f8f8f8;
    .form-control__operate {
      display: block;
    }
  }

  &.label-top10 {
    margin-top: 10px;
    align-items: baseline;
  }

  &__label {
    text-align: right;
    margin-right: 10px;
    min-width: 300px;
  }

  &__required {
    color: #f5222d;
    font-family: SimSun, sans-serif;
  }

  &__question {
    margin-right: 5px;
  }

  &__operate {
    display: none;
    position: absolute;
    right: 15px;
    .operate-icon {
      margin-left: 20px;
      font-size: 16px;
      cursor: pointer;

      &:hover {
        color: #1da57a;
      }
    }
  }
}

.empty-container {
  padding: 20px 0;
}
</style>