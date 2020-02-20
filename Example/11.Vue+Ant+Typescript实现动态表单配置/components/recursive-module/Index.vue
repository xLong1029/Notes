<template>
  <div>
    <draggable
      :list="trees"
      :disabled="!moduleDragSetting.enabled"
      class="module-list"
      handle=".module-drag"
      ghost-class="ghost"
      :move="handleModuleMove"
      @start="moduleDragSetting.dragging = true"
      @end="moduleDragSetting.dragging = false"
    >
      <a-collapse
        v-for="(item, index) in trees"
        :key="item.key"
        :activeKey="item.key"
        :bordered="false"
        class="module-container"
      >
        <a-collapse-panel :key="item.key">
          <div slot="header" class="module-header">
            <div class="module-header__name" :class="{'w-100perent': !operable}">
              <span>{{ item.name }}</span>
              <a-tooltip placement="right" v-if="showRemark(item)">
                <template slot="title">{{ item.remark }}</template>
                <a-icon class="module-header__question" type="question-circle" />
              </a-tooltip>
            </div>
            <div class="module-header__operate" v-if="operable">
              <a-button icon="bars" type="link" class="module-drag">移动</a-button>
              <a-divider type="vertical" />
              <a-button icon="plus-circle" type="link" @click.stop="addChildModule(item)">子模块</a-button>
              <a-divider type="vertical" />
              <a-button icon="plus-circle" type="link" @click.stop="addFormControl(item)">表单控件</a-button>
              <a-divider type="vertical" />
              <a-button icon="edit" type="link" @click.stop="editModule(item)">编辑</a-button>
              <a-divider type="vertical" />
              <a-button
                style="color:#f5222d"
                icon="delete"
                type="link"
                @click.stop="handleModuleDelete(index, parentNodeKey)"
              >删除</a-button>
            </div>
          </div>
          <div class="module-content">
            <!-- 表单 -->
            <template v-if="item.formControls.length">
              <!-- 只读文本 -->
              <template v-if="readOnly">
                <div
                  v-for="(form, i) in item.formControls"
                  :key="'form-control' + i"
                  class="form-control"
                >
                  <div class="form-control__content">
                    <text-content
                      v-if="readOnly"
                      :data="form"
                      :preview-type="previewType"
                      @img-preview="handleImgPreview"
                    ></text-content>
                  </div>
                </div>
              </template>
              <!-- 表单控件 -->
              <template v-else>
                <draggable
                  :list="item.formControls"
                  :disabled="!formControlDragSetting.enabled"
                  class="form-control-list"
                  handle=".form-control-drag"
                  ghost-class="ghost"
                  :move="handleFormControlMove"
                  @start="formControlDragSetting.dragging = true"
                  @end="formControlDragSetting.dragging = false"
                >
                  <div
                    v-for="(form, i) in item.formControls"
                    :key="'form-control' + i"
                    class="form-control"
                  >
                    <div class="form-control__content">
                      <form-control
                        :props="form"
                        :usageType="controlUsageType"
                        @img-preview="handleImgPreview"
                      />
                    </div>
                    <div class="form-control__operate" v-if="operable">
                      <a-icon type="bars" class="operate-icon form-control-drag" />
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
                </draggable>
              </template>
            </template>
            <!-- 模块 -->
            <template v-if="item.children.length">
              <recursive-module
                :trees="item.children"
                :parent-node-key="item.key"
                :operable="operable"
                :control-usage-type="controlUsageType"
                :read-only="readOnly"                
                :preview-type="previewType"
                :report-type="reportType"                
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
              <a-empty :description="operable ? '暂无内容，请新增' : '暂无内容'" />
            </div>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </draggable>
    <!-- 查看图片 -->
    <a-modal
      title="查看图片"
      :visible="imgPreview.visible"
      :footer="null"
      @cancel="handleImgPreviewCancel"
    >
      <img alt="example" style="width: 100%" :src="imgPreview.img" />
    </a-modal>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from "vue-property-decorator";
import FormControl from "@/components/form-config-modal/FormControl.vue";
import TextContent from "@/components/text-content/Index.vue";
import Draggable from "vuedraggable";

@Component({
  name: "RecursiveModule",
  components: { FormControl, TextContent, Draggable }
})
export default class RecursiveModule extends Vue {
  // 树形
  @Prop({ type: Array, default: () => [] }) trees!: any;
  // 父节点Key值
  @Prop({ type: String, default: () => "root" }) parentNodeKey!: any;
  // 是否可操作（包含新增、编辑、删除等功能）
  @Prop({ type: Boolean, default: () => false }) operable!: any;
  // 控件使用类型 模板配置 module 填报 report
  @Prop({ type: [String], default: () => "module" }) controlUsageType!: any;
  // 内容是否只读
  @Prop({ type: Boolean, default: () => false }) readOnly!: any;
  // 查看类型：季报查看 quarter 季报汇总查看 quarterSummary 年报查看 year
  @Prop({ type: [String], default: () => "quarter" }) previewType!: any;
  // 上报类型（operable=false时有效）：季报 quarter 年报 year
  @Prop({ type: [String], default: () => "quarter" }) reportType!: any;

  // 图片预览
  private  imgPreview: any = {
    visible: false,
    img: null
  };

  // 表单控件拖拽配置
  private  formControlDragSetting: any = {
    enabled: true,
    dragging: false
  };

  // 模板拖拽配置
  private moduleDragSetting: any = {
    enabled: true,
    dragging: false
  };

  @Emit("add-child-module") addChildModule(node: any) {}

  @Emit("edit-module") editModule(node: any) {}
  @Emit("del-module") delModule(moduleIndex: number, parentNodeKey: string) {}

  @Emit("add-form-control") addFormControl(node: any) {}
  @Emit("edit-form-control") editFormControl(
    parentNode: any,
    form: any,
    formIndex: number
  ) {}
  @Emit("del-form-control") delFormControl(
    formIndex: number,
    parentNodeKey: string
  ) {}

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

  // 模板拖拽成功后的回调
  handleModuleMove(e) {
    // console.log("Future index: " + e.draggedContext.futureIndex);
  }

  // 表单拖拽成功后的回调
  handleFormControlMove(e) {
    // console.log("Future index: " + e.draggedContext.futureIndex);
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

    &__name {
      max-width: 460px;
      font-weight: bold;

      &.w-100perent {
        max-width: 98%;
      }
    }

    &__question {
      margin-left: 10px;
    }
  }

  &-drag {
    cursor: move;
    color: #2189ce;
  }
}

.form-control {
  display: flex;
  // align-items: center;
  padding: 10px 10px;
  position: relative;

  &:hover {
    background: #f8f8f8;
    .form-control__operate {
      display: block;
    }
  }

  &__content {
    width: 100%;
  }

  &__operate {
    display: none;
    position: absolute;
    right: 15px;
    .operate-icon {
      margin-left: 20px;
      font-size: 16px;
      cursor: pointer;

      &.form-control-drag {
        cursor: move;
      }

      &:hover {
        color: #1da57a;
      }
    }
  }
}

.empty-container {
  padding: 20px 0;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>