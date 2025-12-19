<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户ID" prop="customerId">
        <el-input
          v-model="queryParams.customerId"
          placeholder="请输入用户ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="关联ID" prop="refId">
        <el-input
          v-model="queryParams.refId"
          placeholder="请输入关联ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['business:creditLog:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['business:creditLog:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['business:creditLog:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['business:creditLog:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="creditLogList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" />
      <el-table-column label="商户号" align="center" prop="customerId" />
      <el-table-column label="操作类型" align="center" prop="opearteType" />
      <el-table-column label="操作金额，可以为负数" align="center" prop="opearteAmount" />
      <el-table-column label="操作前金额" align="center" prop="preBalance" />
      <el-table-column label="操作后金额" align="center" prop="postBalance" />
      <el-table-column label="关联ID" align="center" prop="refId" />
      <el-table-column label="备注" align="center" prop="remark" />
<!--      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">-->
<!--        <template #default="scope">-->
<!--          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:creditLog:edit']">修改</el-button>-->
<!--          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['business:creditLog:remove']">删除</el-button>-->
<!--        </template>-->
<!--      </el-table-column>-->
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改额度变更对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="creditLogRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="商户号" prop="customerId">
          <el-input v-model="form.customerId" placeholder="请输入商户号" />
        </el-form-item>
        <el-form-item label="操作金额，可以为负数" prop="opearteAmount">
          <el-input v-model="form.opearteAmount" placeholder="请输入操作金额，可以为负数" />
        </el-form-item>
        <el-form-item label="操作前金额" prop="preBalance">
          <el-input v-model="form.preBalance" placeholder="请输入操作前金额" />
        </el-form-item>
        <el-form-item label="操作后金额" prop="postBalance">
          <el-input v-model="form.postBalance" placeholder="请输入操作后金额" />
        </el-form-item>
        <el-form-item label="关联ID" prop="refId">
          <el-input v-model="form.refId" placeholder="请输入关联ID" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="CreditLog">
import { listCreditLog, getCreditLog, delCreditLog, addCreditLog, updateCreditLog } from "@/api/business/creditLog";

const { proxy } = getCurrentInstance();

const creditLogList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    customerId: null,
    opearteType: null,
    opearteAmount: null,
    preBalance: null,
    postBalance: null,
    refId: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询额度变更列表 */
function getList() {
  loading.value = true;
  listCreditLog(queryParams.value).then(response => {
    creditLogList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    customerId: null,
    opearteType: null,
    opearteAmount: null,
    preBalance: null,
    postBalance: null,
    createTime: null,
    createBy: null,
    updateTime: null,
    updateBy: null,
    refId: null,
    remark: null
  };
  proxy.resetForm("creditLogRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加额度变更";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCreditLog(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改额度变更";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["creditLogRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCreditLog(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCreditLog(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除额度变更编号为"' + _ids + '"的数据项？').then(function() {
    return delCreditLog(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('business/creditLog/export', {
    ...queryParams.value
  }, `creditLog_${new Date().getTime()}.xlsx`)
}

getList();
</script>
