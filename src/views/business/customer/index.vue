<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入用户名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="queryParams.password"
          placeholder="请输入密码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="邀请码" prop="inviteCode">
        <el-input
          v-model="queryParams.inviteCode"
          placeholder="请输入邀请码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="path" prop="path">
        <el-input
          v-model="queryParams.path"
          placeholder="请输入path"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="父级ID" prop="pId">
        <el-input
          v-model="queryParams.pId"
          placeholder="请输入父级ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="余额" prop="balance">
        <el-input
          v-model="queryParams.balance"
          placeholder="请输入余额"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="冻结余额" prop="lockBalance">
        <el-input
          v-model="queryParams.lockBalance"
          placeholder="请输入冻结余额"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="VIP等级" prop="grade">
        <el-input
          v-model="queryParams.grade"
          placeholder="请输入VIP等级"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="提款密码" prop="withdrawPassword">
        <el-input
          v-model="queryParams.withdrawPassword"
          placeholder="请输入提款密码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="最后登录IP" prop="lastLoginAddress">
        <el-input
          v-model="queryParams.lastLoginAddress"
          placeholder="请输入最后登录IP"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="最后登录时间" prop="lastLoginTime">
        <el-date-picker clearable
          v-model="queryParams.lastLoginTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择最后登录时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="0正常 1启用" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择0正常 1启用" clearable>
          <el-option
            v-for="dict in sys_normal_disable"
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
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['business:customer:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['business:customer:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['business:customer:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['business:customer:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="customerList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户ID" align="center" prop="id" />
      <el-table-column label="用户名" align="center" prop="username" />
      <el-table-column label="密码" align="center" prop="password" />
      <el-table-column label="邀请码" align="center" prop="inviteCode" />
      <el-table-column label="path" align="center" prop="path" />
      <el-table-column label="父级ID" align="center" prop="pId" />
      <el-table-column label="余额" align="center" prop="balance" />
      <el-table-column label="冻结余额" align="center" prop="lockBalance" />
      <el-table-column label="VIP等级" align="center" prop="grade" />
      <el-table-column label="提款密码" align="center" prop="withdrawPassword" />
      <el-table-column label="最后登录IP" align="center" prop="lastLoginAddress" />
      <el-table-column label="最后登录时间" align="center" prop="lastLoginTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.lastLoginTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="0正常 1启用" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:customer:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['business:customer:remove']">删除</el-button>
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

    <!-- 添加或修改用户管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="customerRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="邀请码" prop="inviteCode">
          <el-input v-model="form.inviteCode" placeholder="请输入邀请码" />
        </el-form-item>
        <el-form-item label="path" prop="path">
          <el-input v-model="form.path" placeholder="请输入path" />
        </el-form-item>
        <el-form-item label="父级ID" prop="pId">
          <el-input v-model="form.pId" placeholder="请输入父级ID" />
        </el-form-item>
        <el-form-item label="余额" prop="balance">
          <el-input v-model="form.balance" placeholder="请输入余额" />
        </el-form-item>
        <el-form-item label="冻结余额" prop="lockBalance">
          <el-input v-model="form.lockBalance" placeholder="请输入冻结余额" />
        </el-form-item>
        <el-form-item label="VIP等级" prop="grade">
          <el-input v-model="form.grade" placeholder="请输入VIP等级" />
        </el-form-item>
        <el-form-item label="提款密码" prop="withdrawPassword">
          <el-input v-model="form.withdrawPassword" placeholder="请输入提款密码" />
        </el-form-item>
        <el-form-item label="最后登录IP" prop="lastLoginAddress">
          <el-input v-model="form.lastLoginAddress" placeholder="请输入最后登录IP" />
        </el-form-item>
        <el-form-item label="最后登录时间" prop="lastLoginTime">
          <el-date-picker clearable
            v-model="form.lastLoginTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择最后登录时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="0正常 1启用" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in sys_normal_disable"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
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

<script setup name="Customer">
import { listCustomer, getCustomer, delCustomer, addCustomer, updateCustomer } from "@/api/business/customer";

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict('sys_normal_disable');

const customerList = ref([]);
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
    username: null,
    password: null,
    inviteCode: null,
    path: null,
    pId: null,
    balance: null,
    lockBalance: null,
    grade: null,
    withdrawPassword: null,
    lastLoginAddress: null,
    lastLoginTime: null,
    status: null
  },
  rules: {
    username: [
      { required: true, message: "用户名不能为空", trigger: "blur" }
    ],
    password: [
      { required: true, message: "密码不能为空", trigger: "blur" }
    ],
    inviteCode: [
      { required: true, message: "邀请码不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询用户管理列表 */
function getList() {
  loading.value = true;
  listCustomer(queryParams.value).then(response => {
    customerList.value = response.rows;
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
    username: null,
    password: null,
    inviteCode: null,
    path: null,
    pId: null,
    balance: null,
    lockBalance: null,
    grade: null,
    withdrawPassword: null,
    lastLoginAddress: null,
    lastLoginTime: null,
    createTime: null,
    updateTime: null,
    status: null
  };
  proxy.resetForm("customerRef");
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
  title.value = "添加用户管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCustomer(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改用户管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["customerRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCustomer(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCustomer(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除用户管理编号为"' + _ids + '"的数据项？').then(function() {
    return delCustomer(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('business/customer/export', {
    ...queryParams.value
  }, `customer_${new Date().getTime()}.xlsx`)
}

getList();
</script>
