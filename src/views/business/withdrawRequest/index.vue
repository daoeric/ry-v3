<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="提现金额" prop="withdrawAmount">
        <el-input
          v-model="queryParams.withdrawAmount"
          placeholder="请输入提现金额"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商户号" prop="customerId">
        <el-input
          v-model="queryParams.customerId"
          placeholder="请输入商户号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="${comment}" prop="username">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入${comment}"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in order_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="真实金额" prop="realAmount">
        <el-input
          v-model="queryParams.realAmount"
          placeholder="请输入真实金额"
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
          v-hasPermi="['business:withdrawRequest:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['business:withdrawRequest:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['business:withdrawRequest:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['business:withdrawRequest:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="withdrawRequestList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="${comment}" align="center" prop="withdrawId" />
      <el-table-column label="提现金额" align="center" prop="withdrawAmount" />
      <el-table-column label="商户号" align="center" prop="customerId" />
      <el-table-column label="${comment}" align="center" prop="username" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="order_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="真实金额" align="center" prop="realAmount" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:withdrawRequest:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['business:withdrawRequest:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改提现订单对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="withdrawRequestRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="提现金额" prop="withdrawAmount">
          <el-input v-model="form.withdrawAmount" placeholder="请输入提现金额" />
        </el-form-item>
        <el-form-item label="商户号" prop="customerId">
          <el-input v-model="form.customerId" placeholder="请输入商户号" />
        </el-form-item>
        <el-form-item label="${comment}" prop="username">
          <el-input v-model="form.username" placeholder="请输入${comment}" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in order_status"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="真实金额" prop="realAmount">
          <el-input v-model="form.realAmount" placeholder="请输入真实金额" />
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

<script setup name="WithdrawRequest">
import { listWithdrawRequest, getWithdrawRequest, delWithdrawRequest, addWithdrawRequest, updateWithdrawRequest } from "@/api/business/withdrawRequest";

const { proxy } = getCurrentInstance();
const { order_status } = proxy.useDict('order_status');

const withdrawRequestList = ref([]);
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
    withdrawAmount: null,
    customerId: null,
    username: null,
    status: null,
    realAmount: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询提现订单列表 */
function getList() {
  loading.value = true;
  listWithdrawRequest(queryParams.value).then(response => {
    withdrawRequestList.value = response.rows;
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
    withdrawId: null,
    withdrawAmount: null,
    customerId: null,
    username: null,
    status: null,
    createTime: null,
    createBy: null,
    updateTime: null,
    updateBy: null,
    realAmount: null,
    remark: null
  };
  proxy.resetForm("withdrawRequestRef");
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
  ids.value = selection.map(item => item.withdrawId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加提现订单";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _withdrawId = row.withdrawId || ids.value
  getWithdrawRequest(_withdrawId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改提现订单";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["withdrawRequestRef"].validate(valid => {
    if (valid) {
      if (form.value.withdrawId != null) {
        updateWithdrawRequest(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addWithdrawRequest(form.value).then(response => {
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
  const _withdrawIds = row.withdrawId || ids.value;
  proxy.$modal.confirm('是否确认删除提现订单编号为"' + _withdrawIds + '"的数据项？').then(function() {
    return delWithdrawRequest(_withdrawIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('business/withdrawRequest/export', {
    ...queryParams.value
  }, `withdrawRequest_${new Date().getTime()}.xlsx`)
}

getList();
</script>
