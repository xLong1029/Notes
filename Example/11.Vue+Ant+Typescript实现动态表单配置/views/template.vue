<template>
  <div>
    <a-modal
      v-model="showModal"
      :title="`${template.name}-模板定义`"
      :footer="null"
      :maskClosable="false"
      :centered="true"
      width="1000px"
      @cancel="close(false)"
      class="template-container"
      style="top:10px"
    >
      <div class="operate-container">
        <span class="hint">
          <a-icon type="exclamation-circle" />注意：请时刻保存您的操作，以免数据丢失
        </span>
        <span class="operate-btn">
          <a-button type="primary" @click="addModule" icon="plus-circle">新增模块</a-button>
          <a-button type="primary" @click="saveTemplate" icon="folder">保存</a-button>
        </span>
      </div>
      <a-divider />
      <div class="report-info-container">
        <template v-if="!loading">
          <recursive-module
            v-if="template.trees.length"
            :trees="template.trees"
            :parent-node-key="'root'"
            :operable="true"
            @add-child-module="addChildModule"
            @edit-module="editModule"
            @del-module="delModule"
            @add-form-control="addFormControl"
            @edit-form-control="editFormControl"
            @del-form-control="delFormControl"
          />
          <div v-else class="empty-container">
            <a-empty description="暂无模块，请新增" />
          </div>
        </template>
        <div v-else class="loading-container">
          <a-spin />
        </div>
      </div>
    </a-modal>
    <!-- 模块操作弹窗 -->
    <a-modal
      v-model="moduleModal.visible"
      :title="moduleModal.title"
      :maskClosable="false"
      :centered="true"
      @ok="saveModule"
      @cancel="closeModuleModal"
    >
      <a-form :form="moduleForm">
        <a-form-item label="模块名称">
          <a-input
            placeholder="请输入模块名称"
            v-decorator="['name', {rules:[{required:true, message:'请输入模块名称'}]}]"
          ></a-input>
        </a-form-item>
        <a-form-item label="模块说明">
          <a-textarea placeholder="请输入模块说明" v-decorator="['remark']" :autosize="{ minRows: 3 }"></a-textarea>
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- 表单操作弹窗 -->
    <form-config-modal
      :visible="formModal.visible"
      :parent-node="formModal.parentNode"
      :form-data="formModal.data"
      :title="formModal.title"
      :form-control-type="formControlType"
      @ok="saveForm"
      @cancel="closeFormModal"
    />
  </div>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Vue,
  Watch,
  Emit,
  Mixins
} from "vue-property-decorator";
import recursiveModule from "@/components/recursive-module/Index.vue";
import formConfigModal from "@/components/form-config-modal/Index.vue";
import templateMixin from "@/mixins/template";
import axios from "axios";

@Component({ components: { recursiveModule, formConfigModal } })
export default class SubmitTemplate extends Mixins(templateMixin) {
  @Prop({ type: [Number, String], default: () => {} }) id!: Number | String;

  @Prop({ type: [Array], default: () => [] }) formControlType!: any;

  // 模块弹窗
  private moduleModal: any = {};
  // 模块表单
  private moduleForm: any = {};

  // 表单弹窗
  private formModal: any = {};

  // 控件类型
  private controlType: any = [];

  // 父节点Key值
  private parentNodeKey: any = null;

  // 自增Id
  private increaseId: number = 1;

  created() {
    this.moduleForm = this.$form.createForm(this);
  }

  @Watch("visible") visibleChange() {
    this.showModal = this.visible;
    if (this.visible) {
      this.getModules();
      this.resetModal();
    }
  }

  // 重置弹窗
  resetModal() {
    this.moduleModal = {
      visible: false,
      title: "新增弹窗",
      key: null
    };

    this.formModal = {
      visible: false,
      title: "新增表单",
      parentNode: null,
      data: null
    };
  }

  // 获取所有模块
  getModules() {
    this.loading = true;
    this.template = { trees: [] };
    const params = { id: this.id };
    return axios
      .get("/api/RTTemplate/Modules", { params })
      .then((res: any) => {
        this.template = res.data;

        this.setModuleKey(this.template.trees);
      })
      .catch(err => this.$message.error(err.message));
  }

  // 递归查找模块
  findModule(trees, key) {
    if (!trees || !trees.length) return null;

    for (var i = 0; i < trees.length; i++) {
      if (trees[i].key === key) {
        return trees[i];
      } else if (trees[i].children) {
        const node = this.findModule(trees[i].children, key);
        if (node) return node;
      }
    }
  }

  // 给树形排序
  setSort(trees) {
    if (!trees || !trees.length) return;

    trees.forEach((e, index) => {
      e.sortId = index + 1;
      if (e.children) {
        this.setSort(e.children);
      }

      if (e.formControls) {
        this.setSort(e.formControls);
      }
    });
  }

  // 添加模块
  addModule() {
    this.moduleModal = {
      visible: true,
      title: "新增子模块",
      key: null
    };

    this.moduleForm.resetFields();
  }

  // 新增子模块
  addChildModule(node) {
    this.moduleModal = {
      visible: true,
      title: `【${node.name}】新增子模块`,
      key: null
    };

    this.parentNodeKey = node.key;

    this.moduleForm.resetFields();
  }

  // 编辑模块
  editModule(node) {
    const key = node.key;

    this.moduleModal = {
      visible: true,
      title: "编辑模块",
      key: node.key
    };

    this.$nextTick(() => {
      this.moduleForm.setFieldsValue({
        name: node.name,
        remark: node.remark
      });
    });
  }

  // 删除模块
  delModule(moduleIndex, parentNodeKey) {
    if (parentNodeKey === "root") {
      this.template.trees.splice(moduleIndex, 1);
    } else {
      const parentNode = this.findModule(this.template.trees, parentNodeKey);
      parentNode.children.splice(moduleIndex, 1);
    }
  }

  // 给模块新增表单控件
  addFormControl(parentNode) {
    this.formModal = {
      visible: true,
      title: `【${parentNode.name}】插入表单控件`,
      parentNode,
      data: null
    };

    this.parentNodeKey = parentNode.key;
  }

  // 编辑表单控件
  editFormControl(parentNode, form, formIndex) {
    let data = { ...form };
    data.index = formIndex;

    this.formModal = {
      visible: true,
      title: `编辑【${parentNode.name}】模块中的【${form.name}】控件`,
      parentNode,
      data
    };

    this.parentNodeKey = parentNode.key;
  }

  // 新增表单控件
  delFormControl(formIndex, parentNodeKey) {
    const parentNode = this.findModule(this.template.trees, parentNodeKey);
    parentNode.formControls.splice(formIndex, 1);
  }

  // 保存模板
  saveTemplate() {
    const _this = this;

    this.$confirm({
      title: "确认要保存此模板？",
      okText: "确认",
      cancelText: "取消",
      onOk() {
        _this.setSort(_this.template.trees);

        let params = new FormData();
        params.append("json", JSON.stringify(_this.template));

        axios
          .post("/api/RTTemplate/UpdateModules", params)
          .then((res: any) => {
            _this.$message.success("操作成功");
            _this.getModules();
          })
          .catch(err => _this.$message.error(err.message));
      }
    });
  }

  // 保存模块（包括新增、编辑）
  saveModule() {
    this.moduleForm.validateFields((err: any, values: any) => {
      if (!err) {
        let data = { ...values };

        // 新增
        if (!this.moduleModal.key) {
          data.key = `new-${this.increaseId}`;
          data.isLeave = false; // 后端数据要求必须有值，数值是什么不重要
          data.formControls = [];
          data.children = [];

          this.increaseId++;

          if (this.parentNodeKey) {
            const parentNode = this.findModule(
              this.template.trees,
              this.parentNodeKey
            );

            parentNode.children.push(data);
          } else {
            this.template.trees.push(data);
          }

          this.parentNodeKey = null;
        }
        // 编辑
        else {
          const node = this.findModule(
            this.template.trees,
            this.moduleModal.key
          );
          node.name = data.name;
          node.remark = data.remark;
        }

        this.closeModuleModal();
      } else {
        this.$message.error("请检查输入项");
      }
    });
  }

  // 关闭模板弹窗
  closeModuleModal() {
    this.parentNodeKey = null;
    this.moduleModal.visible = false;
    this.resetModal();
  }

  // 保存表单（包括新增、编辑）
  saveForm(params, index) {
    let data = { ...params };

    if (this.parentNodeKey) {
      const parentNode = this.findModule(
        this.template.trees,
        this.parentNodeKey
      );

      // 新增
      if (index === -1) {
        data.key = `new-${this.increaseId}`;

        this.increaseId++;

        parentNode.formControls.push(data);
      }
      // 编辑
      else {
        parentNode.formControls[index] = {
          ...parentNode.formControls[index],
          ...params
        };

        // 强制更新树形数据
        const trees = JSON.parse(JSON.stringify(this.template.trees));
        this.template.trees = [];
        this.template.trees = trees;
      }
    } else {
      this.$message.error("操作失败！找不到父级模板");
    }
    this.closeFormModal();
  }

  // 关闭表单弹窗
  closeFormModal() {
    this.parentNodeKey = null;
    this.formModal.visible = false;
    this.resetModal();
  }
}
</script>
<style lang="less">
.template-container {
  /deep/ .ant-modal-body {
    padding: 0;
  }

  /deep/ .ant-divider-horizontal {
    margin: 0;
  }
}
</style>
<style lang="less" scoped>
@import "./../../../../assets/theme/styles/rubbish-score/template.less";
@import "./../../../../assets/theme/styles/rubbish-score/scroll-bar.less";
</style>