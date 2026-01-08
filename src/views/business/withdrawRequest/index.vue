<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="商户号" prop="customerId">
        <el-input
          v-model="queryParams.customerId"
          placeholder="请输入商户号"
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
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="withdrawRequestList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="订单号" align="center" prop="withdrawId" />
      <el-table-column label="提现金额" align="center" prop="withdrawAmount" />
      <el-table-column label="商户号" align="center" prop="customerId" />
      <el-table-column label="用户名" align="center" prop="username" />
      <el-table-column label="银行" align="center" prop="bankName" />
      <el-table-column label="卡号" align="center" prop="bankNo" />
      <el-table-column label="名字" align="center" prop="realName" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="order_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
              link
              type="success"
              icon="Check"
              @click="handleApproveSingle(scope.row)"
              v-hasPermi="['business:auth:edit']"
              :disabled="scope.row.status !== 1"
          >通过</el-button>
          <el-button
              link
              type="danger"
              icon="CircleClose"
              @click="handleRejectSingle(scope.row)"
              v-hasPermi="['business:auth:remove']"
              :show="scope.row.status !== 1"
          >拒绝</el-button>
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


    <!-- 审核操作对话框 -->
    <el-dialog :title="auditTitle" v-model="auditOpen" width="500px" append-to-body>
      <el-form ref="auditRef" :model="auditForm" :rules="auditRules" label-width="80px">
        <el-form-item label="审核原因" prop="auditReason">
          <el-input v-model="auditForm.auditReason" type="textarea" placeholder="请输入审核原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitAudit">确 定</el-button>
          <el-button @click="cancelAudit">取 消</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup name="WithdrawRequest">
import { listWithdrawRequest, getWithdrawRequest, delWithdrawRequest, addWithdrawRequest, updateWithdrawRequest,approveWithdraw,rejectWithdraw } from "@/api/business/withdrawRequest";
import {approveAuth, rejectAuth} from "@/api/business/auth.js";

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
const auditTitle = ref("");
const auditOpen = ref(false);

const data = reactive({
  form: {},
  auditForm: {
    id: null,
    auditReason: null,
    status: null
  },
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
  },
  auditRules: {
    auditReason: [
      { required: true, message: "审核原因不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules,auditForm,auditRules } = toRefs(data);

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

function handleApproveSingle(row) {
  auditTitle.value = "审核通过";
  resetAuditForm();
  auditForm.value.id = row.withdrawId;
  auditForm.value.status = 2; // 通过状态
  auditOpen.value = true;
}

/** 单个拒绝操作 */
function handleRejectSingle(row) {
  auditTitle.value = "审核拒绝";
  resetAuditForm();
  auditForm.value.id = row.withdrawId;
  auditForm.value.status = 3; // 拒绝状态
  auditOpen.value = true;
}
function resetAuditForm() {
  auditForm.value = {
    id: null,
    auditReason: null,
    status: null
  };
  proxy.resetForm("auditRef");
}

function submitAudit() {
  proxy.$refs["auditRef"].validate(valid => {
    if (valid) {
      const operation = auditForm.value.status === 2 ? approveWithdraw : rejectWithdraw;
      // 单个操作
      const params = {
        withdrawId: auditForm.value.id || ids.value[0],
        remark: auditForm.value.auditReason,
        status: auditForm.value.status
      };

      operation(params).then(response => {
        proxy.$modal.msgSuccess(`${auditForm.value.status === 1 ? '通过' : '拒绝'}成功`);
        auditOpen.value = false;
        getList();
      }).catch(() => {
        proxy.$modal.msgError(`${auditForm.value.status === 1 ? '通过' : '拒绝'}失败`);
      });
    }
  });
}

function cancelAudit() {
  auditOpen.value = false;
  resetAuditForm();
}

getList();
</script>
