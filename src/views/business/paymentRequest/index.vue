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
      <el-form-item label="商户名" prop="username">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入商户名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="支付状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择支付状态" clearable>
          <el-option
            v-for="dict in order_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="成功时间" prop="successTime">
        <el-date-picker clearable
          v-model="queryParams.successTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择成功时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['business:paymentRequest:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="paymentRequestList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="订单号" align="center" prop="requestId" />
      <el-table-column label="商户号" align="center" prop="customerId" />
      <el-table-column label="商户名" align="center" prop="username" />
      <el-table-column label="支付状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="order_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="订单金额" align="center" prop="orderAmount" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="真实金额" align="center" prop="realAmount" />
      <el-table-column label="订单时间" align="center" prop="successTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="成功时间" align="center" prop="successTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.successTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleManualApprove(scope.row)" :disabled="scope.row.status === 2" v-hasPermi="['business:paymentRequest:manualApprove']">手动通过</el-button>
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

    <!-- 添加或修改存入订单对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="paymentRequestRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="商户号" prop="customerId">
          <el-input v-model="form.customerId" placeholder="请输入商户号" />
        </el-form-item>
        <el-form-item label="商户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入商户名" />
        </el-form-item>
        <el-form-item label="支付状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in order_status"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="订单金额" prop="orderAmount">
          <el-input v-model="form.orderAmount" placeholder="请输入订单金额" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="真实金额" prop="realAmount">
          <el-input v-model="form.realAmount" placeholder="请输入真实金额" />
        </el-form-item>
        <el-form-item label="成功时间" prop="successTime">
          <el-date-picker clearable
            v-model="form.successTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择成功时间">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 手动通过对话框 -->
    <el-dialog title="手动通过" v-model="manualApproveOpen" width="500px" append-to-body>
      <el-form ref="manualApproveRef" :model="manualApproveForm" :rules="manualApproveRules" label-width="80px">
        <el-form-item label="订单号" prop="requestId">
          <el-input v-model="manualApproveForm.requestId" disabled />
        </el-form-item>
        <el-form-item label="订单金额" prop="orderAmount">
          <el-input v-model="manualApproveForm.orderAmount" disabled />
        </el-form-item>
        <el-form-item label="真实金额" prop="realAmount">
          <el-input v-model="manualApproveForm.realAmount" placeholder="请输入真实金额" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="manualApproveForm.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitManualApprove">确 定</el-button>
          <el-button @click="cancelManualApprove">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PaymentRequest">
import { listPaymentRequest, getPaymentRequest, delPaymentRequest, addPaymentRequest, updatePaymentRequest, manualApprove } from "@/api/business/paymentRequest";

const { proxy } = getCurrentInstance();
const { order_status } = proxy.useDict('order_status');

const paymentRequestList = ref([]);
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
    username: null,
    status: null,
    orderAmount: null,
    realAmount: null,
    successTime: null
  },
  rules: {
    customerId: [
      { required: true, message: "商户号不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "支付状态不能为空", trigger: "change" }
    ],
    orderAmount: [
      { required: true, message: "订单金额不能为空", trigger: "blur" }
    ],
  },
  manualApproveOpen: false,
  manualApproveForm: {},
  manualApproveRules: {
    realAmount: [
      { required: true, message: "真实金额不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules, manualApproveOpen, manualApproveForm, manualApproveRules } = toRefs(data);

/** 查询存入订单列表 */
function getList() {
  loading.value = true;
  listPaymentRequest(queryParams.value).then(response => {
    paymentRequestList.value = response.rows;
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
    requestId: null,
    customerId: null,
    username: null,
    status: null,
    orderAmount: null,
    createTime: null,
    createBy: null,
    updateTime: null,
    updateBy: null,
    remark: null,
    realAmount: null,
    successTime: null
  };
  proxy.resetForm("paymentRequestRef");
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
  ids.value = selection.map(item => item.requestId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加存入订单";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _requestId = row.requestId || ids.value
  getPaymentRequest(_requestId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改存入订单";
  });
}

/** 手动通过按钮操作 */
function handleManualApprove(row) {
  resetManualApprove();
  manualApproveForm.value = {
    requestId: row.requestId,
    orderAmount: row.orderAmount,
    realAmount: row.orderAmount, // 默认真实金额等于订单金额
    remark: null
  };
  manualApproveOpen.value = true;
}

/** 手动通过表单重置 */
function resetManualApprove() {
  manualApproveForm.value = {
    requestId: null,
    orderAmount: null,
    realAmount: null,
    remark: null
  };
  proxy.resetForm("manualApproveRef");
}

/** 提交手动通过 */
function submitManualApprove() {
  proxy.$refs["manualApproveRef"].validate(valid => {
    if (valid) {
      manualApprove(manualApproveForm.value).then(response => {
        proxy.$modal.msgSuccess("手动通过成功");
        manualApproveOpen.value = false;
        getList();
      });
    }
  });
}

/** 取消手动通过 */
function cancelManualApprove() {
  manualApproveOpen.value = false;
  resetManualApprove();
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["paymentRequestRef"].validate(valid => {
    if (valid) {
      if (form.value.requestId != null) {
        updatePaymentRequest(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPaymentRequest(form.value).then(response => {
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
  const _requestIds = row.requestId || ids.value;
  proxy.$modal.confirm('是否确认删除存入订单编号为"' + _requestIds + '"的数据项？').then(function() {
    return delPaymentRequest(_requestIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('business/paymentRequest/export', {
    ...queryParams.value
  }, `paymentRequest_${new Date().getTime()}.xlsx`)
}

getList();
</script>
