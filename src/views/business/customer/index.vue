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
      <el-form-item label="邀请码" prop="inviteCode">
        <el-input
          v-model="queryParams.inviteCode"
          placeholder="请输入邀请码"
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
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
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
<!--      <el-col :span="1.5">-->
<!--        <el-button-->
<!--          type="primary"-->
<!--          plain-->
<!--          icon="Plus"-->
<!--          @click="handleAdd"-->
<!--          v-hasPermi="['business:customer:add']"-->
<!--        >新增</el-button>-->
<!--      </el-col>-->
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
      <el-col :span="1.5">
        <el-tag size="large">在线人数：<span style="color: red">{{onlineCount}}</span></el-tag>
      </el-col>


      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="customerList" @selection-change="handleSelectionChange" :header-cell-style="{background: '#f8f9fa', color: '#555'}" :cell-style="{padding: '8px 0'}" row-key="id" height="600">
      <el-table-column type="selection" width="55" align="center" fixed="left" />
      <el-table-column label="用户ID" align="center" prop="id" width="100" fixed="left" />
      <el-table-column label="用户名" align="center" prop="username" width="120" fixed="left" />
      <el-table-column label="邀请码" align="center" prop="inviteCode" width="120" show-overflow-tooltip />
      <el-table-column label="path" align="center" prop="path" width="120" show-overflow-tooltip />
      <el-table-column label="父级ID" align="center" prop="pid" width="100" />
      <el-table-column label="余额" align="center" prop="balance" width="100" />
      <el-table-column label="冻结余额" align="center" prop="lockBalance" width="100" />
      <el-table-column label="额外次数" align="center" prop="scanCount" width="100" />
      <el-table-column label="VIP等级" align="center" prop="grade" width="100" />
      <el-table-column label="VIP过期时间" align="center" prop="expireTime" width="160">
        <template #default="scope">
          <span>{{ parseTime(scope.row.expireTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最后登录IP" align="center" prop="lastLoginAddress" width="130" show-overflow-tooltip />
      <el-table-column label="最后登录时间" align="center" prop="lastLoginTime" width="120">
        <template #default="scope">
          <span>{{ parseTime(scope.row.lastLoginTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="实名" align="center" prop="realnameStatus" width="100">
        <template #default="scope">
          <dict-tag :options="realname_status" :value="scope.row.realnameStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:customer:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['business:customer:remove']">删除</el-button>
          <el-button link type="primary" icon="Clock" @click="handleRenew(scope.row)" v-hasPermi="['business:customer:edit']">续签会员</el-button>
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
          <el-input v-model="form.username" placeholder="请输入用户名" readonly />
        </el-form-item>
        <el-form-item label="邀请码" prop="inviteCode">
          <el-input v-model="form.inviteCode" placeholder="请输入邀请码" readonly/>
        </el-form-item>
        <el-form-item label="VIP等级" prop="grade">
          <el-input v-model="form.grade" placeholder="请输入VIP等级" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
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

    <!-- 续签会员对话框 -->
    <el-dialog :title="renewTitle" v-model="renewOpen" width="500px" append-to-body>
      <el-form ref="renewRef" :model="renewForm" :rules="renewRules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="renewForm.username" placeholder="用户名" readonly />
        </el-form-item>
        <el-form-item label="当前到期时间" prop="currentExpireTime">
          <el-input v-model="renewForm.currentExpireTime" placeholder="当前到期时间" readonly />
        </el-form-item>
        <el-form-item label="新的到期时间" prop="newExpireTime">
          <el-date-picker
            v-model="renewForm.newExpireTime"
            type="datetime"
            placeholder="选择新的到期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitRenewForm">确 定</el-button>
          <el-button @click="cancelRenew">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Customer">
import { listCustomer, getCustomer, delCustomer, addCustomer, updateCustomer,renew } from "@/api/business/customer";
import { getOnlineCount } from "@/api/monitor/online";
const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict('sys_normal_disable');
const { realname_status } = proxy.useDict('realname_status');

const customerList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const onlineCount = ref(0);
const renewOpen = ref(false);
const renewTitle = ref("");

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
  renewForm: {
    id: null,
    username: null,
    currentExpireTime: null,
    renewDuration: null,
    newExpireTime: null
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
  },
  renewRules: {
    newExpireTime: [
      { required: true, message: "请选择新的到期时间", trigger: "change" }
    ]
  }
});

const { queryParams, form, renewForm, rules, renewRules } = toRefs(data);

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

// 获取在线用户数量
function getOnlineUserCount() {
  getOnlineCount().then(response => {
    onlineCount.value = response.count || 0;
  }).catch(error => {
    console.error('获取在线用户数量失败:', error);
    onlineCount.value = 0;
  });
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

// 续签会员按钮操作
function handleRenew(row) {
  const _id = row.id || ids.value;
  getCustomer(_id).then(response => {
    const customer = response.data;
    renewForm.value.id = customer.id;
    renewForm.value.username = customer.username;
    renewForm.value.currentExpireTime = customer.expireTime ? proxy.parseTime(customer.expireTime, '{y}-{m}-{d} {h}:{i}:{s}') : '无';
    renewForm.value.newExpireTime = customer.expireTime;
    renewForm.value.renewDuration = null; // Reset duration when opening the dialog
    renewOpen.value = true;
    renewTitle.value = "续签会员 - " + customer.username;
  });
}

// 处理续签时长选择变化
function handleRenewDurationChange(value) {
  if (!value || !renewForm.value.currentExpireTime) {
    return;
  }

  // 获取当前过期时间，如果没有则使用当前时间
  let baseTime = null;
  if (renewForm.value.currentExpireTime !== '无' && renewForm.value.currentExpireTime) {
    baseTime = new Date(renewForm.value.currentExpireTime);
  } else {
    baseTime = new Date(); // 如果当前没有过期时间，则从当前时间开始计算
  }

  // 计算新的过期时间
  const newExpireTime = new Date(baseTime);
  if (value === 1) {
    newExpireTime.setMonth(newExpireTime.getMonth() + 1);
  } else if (value === 3) {
    newExpireTime.setMonth(newExpireTime.getMonth() + 3);
  } else if (value === 6) {
    newExpireTime.setMonth(newExpireTime.getMonth() + 6);
  } else if (value === 12) {
    newExpireTime.setFullYear(newExpireTime.getFullYear() + 1);
  }

  // 设置新的过期时间
  renewForm.value.newExpireTime = newExpireTime.toISOString().slice(0, 19).replace('T', ' ');
}

// 取消续签
function cancelRenew() {
  renewOpen.value = false;
  resetRenew();
}

// 表单重置（续签）
function resetRenew() {
  renewForm.value = {
    id: null,
    username: null,
    currentExpireTime: null,
    renewDuration: null,
    newExpireTime: null
  };
  proxy.resetForm("renewRef");
}

// 续签提交
function submitRenewForm() {
  proxy.$refs["renewRef"].validate(valid => {
    if (valid) {
      // 更新客户信息，设置新的过期时间
      const updateData = {
        id: renewForm.value.id,
        expireTime: renewForm.value.newExpireTime
      };

      renew(updateData).then(response => {
        proxy.$modal.msgSuccess("续签成功");
        renewOpen.value = false;
        resetRenew();
        getList();d
      });
    }
  });
}

getList();
getOnlineUserCount();
</script>
