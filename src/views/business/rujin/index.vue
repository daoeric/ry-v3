<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="上游商户号" prop="merchantId">
        <el-input
          v-model="queryParams.merchantId"
          placeholder="请输入上游商户号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="渠道名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入渠道名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类code" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入类code"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="秘钥" prop="priKey">
        <el-input
          v-model="queryParams.priKey"
          placeholder="请输入秘钥"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="支付URL" prop="apiUrl">
        <el-input
          v-model="queryParams.apiUrl"
          placeholder="请输入支付URL"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="代收回调" prop="depositNotify">
        <el-input
          v-model="queryParams.depositNotify"
          placeholder="请输入代收回调"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="通道成本费率" prop="channelRate">
        <el-input
          v-model="queryParams.channelRate"
          placeholder="请输入通道成本费率"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="上游名" prop="alias">
        <el-input
          v-model="queryParams.alias"
          placeholder="请输入上游名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品编码" prop="productId">
        <el-input
          v-model="queryParams.productId"
          placeholder="请输入产品编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="最小限额" prop="minAmount">
        <el-input
          v-model="queryParams.minAmount"
          placeholder="请输入最小限额"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="最大限额" prop="maxAmount">
        <el-input
          v-model="queryParams.maxAmount"
          placeholder="请输入最大限额"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="固定金额" prop="fixAmount">
        <el-input
          v-model="queryParams.fixAmount"
          placeholder="请输入固定金额"
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
          v-hasPermi="['business:rujin:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['business:rujin:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['business:rujin:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['business:rujin:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="rujinList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="channelId" />
      <el-table-column label="上游商户号" align="center" prop="merchantId" />
      <el-table-column label="渠道名称" align="center" prop="name" />
      <el-table-column label="类code" align="center" prop="code" />
      <el-table-column label="状态" align="center" prop="status" />
      <el-table-column label="秘钥" align="center" prop="priKey" />
      <el-table-column label="支付URL" align="center" prop="apiUrl" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="代收回调" align="center" prop="depositNotify" />
      <el-table-column label="通道成本费率" align="center" prop="channelRate" />
      <el-table-column label="上游名" align="center" prop="alias" />
      <el-table-column label="产品编码" align="center" prop="productId" />
      <el-table-column label="最小限额" align="center" prop="minAmount" />
      <el-table-column label="最大限额" align="center" prop="maxAmount" />
      <el-table-column label="固定金额" align="center" prop="fixAmount" />
      <el-table-column label="通道编码" align="center" prop="channelType" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:rujin:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['business:rujin:remove']">删除</el-button>
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

    <!-- 添加或修改入金渠道对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="rujinRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="上游商户号" prop="merchantId">
          <el-input v-model="form.merchantId" placeholder="请输入上游商户号" />
        </el-form-item>
        <el-form-item label="渠道名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入渠道名称" />
        </el-form-item>
        <el-form-item label="类code" prop="code">
          <el-input v-model="form.code" placeholder="请输入类code" />
        </el-form-item>
        <el-form-item label="秘钥" prop="priKey">
          <el-input v-model="form.priKey" placeholder="请输入秘钥" />
        </el-form-item>
        <el-form-item label="支付URL" prop="apiUrl">
          <el-input v-model="form.apiUrl" placeholder="请输入支付URL" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="代收回调" prop="depositNotify">
          <el-input v-model="form.depositNotify" placeholder="请输入代收回调" />
        </el-form-item>
        <el-form-item label="通道成本费率" prop="channelRate">
          <el-input v-model="form.channelRate" placeholder="请输入通道成本费率" />
        </el-form-item>
        <el-form-item label="上游名" prop="alias">
          <el-input v-model="form.alias" placeholder="请输入上游名" />
        </el-form-item>
        <el-form-item label="产品编码" prop="productId">
          <el-input v-model="form.productId" placeholder="请输入产品编码" />
        </el-form-item>
        <el-form-item label="最小限额" prop="minAmount">
          <el-input v-model="form.minAmount" placeholder="请输入最小限额" />
        </el-form-item>
        <el-form-item label="最大限额" prop="maxAmount">
          <el-input v-model="form.maxAmount" placeholder="请输入最大限额" />
        </el-form-item>
        <el-form-item label="固定金额" prop="fixAmount">
          <el-input v-model="form.fixAmount" placeholder="请输入固定金额" />
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

<script setup name="Rujin">
import { listRujin, getRujin, delRujin, addRujin, updateRujin } from "@/api/business/rujin";

const { proxy } = getCurrentInstance();

const rujinList = ref([]);
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
    merchantId: null,
    name: null,
    code: null,
    status: null,
    priKey: null,
    apiUrl: null,
    depositNotify: null,
    channelRate: null,
    alias: null,
    productId: null,
    minAmount: null,
    maxAmount: null,
    fixAmount: null,
    channelType: null
  },
  rules: {
    merchantId: [
      { required: true, message: "上游商户号不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "渠道名称不能为空", trigger: "blur" }
    ],
    priKey: [
      { required: true, message: "秘钥不能为空", trigger: "blur" }
    ],
    apiUrl: [
      { required: true, message: "支付URL不能为空", trigger: "blur" }
    ],
    updateTime: [
      { required: true, message: "$comment不能为空", trigger: "blur" }
    ],
    minAmount: [
      { required: true, message: "最小限额不能为空", trigger: "blur" }
    ],
    channelType: [
      { required: true, message: "通道编码不能为空", trigger: "change" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询入金渠道列表 */
function getList() {
  loading.value = true;
  listRujin(queryParams.value).then(response => {
    rujinList.value = response.rows;
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
    channelId: null,
    merchantId: null,
    name: null,
    code: null,
    status: null,
    priKey: null,
    apiUrl: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    depositNotify: null,
    channelRate: null,
    alias: null,
    productId: null,
    minAmount: null,
    maxAmount: null,
    fixAmount: null,
    channelType: null
  };
  proxy.resetForm("rujinRef");
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
  ids.value = selection.map(item => item.channelId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加入金渠道";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _channelId = row.channelId || ids.value
  getRujin(_channelId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改入金渠道";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["rujinRef"].validate(valid => {
    if (valid) {
      if (form.value.channelId != null) {
        updateRujin(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addRujin(form.value).then(response => {
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
  const _channelIds = row.channelId || ids.value;
  proxy.$modal.confirm('是否确认删除入金渠道编号为"' + _channelIds + '"的数据项？').then(function() {
    return delRujin(_channelIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('business/rujin/export', {
    ...queryParams.value
  }, `rujin_${new Date().getTime()}.xlsx`)
}

getList();
</script>
