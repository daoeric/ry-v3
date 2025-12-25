<template>
  <div class="app-container">

    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="真实姓名" prop="realName">
        <el-input
          v-model="queryParams.realName"
          placeholder="请输入真实姓名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态：0-待审核，1-审核通过，2-审核拒绝" clearable>
          <el-option
            v-for="dict in approve_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="审核时间" prop="auditTime">
        <el-date-picker clearable
          v-model="queryParams.auditTime"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择审核时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="审核人" prop="auditBy">
        <el-input
          v-model="queryParams.auditBy"
          placeholder="请输入审核人"
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
          v-hasPermi="['business:auth:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Check"
          :disabled="single || !isPendingStatus"
          @click="handleApprove"
          v-hasPermi="['business:auth:edit']"
        >通过</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="CircleClose"
          :disabled="single || !isPendingStatus"
          @click="handleReject"
          v-hasPermi="['business:auth:remove']"
        >拒绝</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['business:auth:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="authList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="商户ID" align="center" prop="customerId" />
      <el-table-column label="真实姓名" align="center" prop="realName" />
      <el-table-column label="身份证正面图片" align="center" prop="idCardFront">
        <template #default="scope">
          <image-preview v-if="scope.row.idCardFront" :src="scope.row.idCardFront" :width="50" :height="50"/>
          <span v-else>无图片</span>
        </template>
      </el-table-column>
      <el-table-column label="身份证反面图片" align="center" prop="idCardBack">
        <template #default="scope">
          <image-preview v-if="scope.row.idCardBack" :src="scope.row.idCardBack" :width="50" :height="50"/>
          <span v-else>无图片</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="approve_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="审核原因" align="center" prop="auditReason" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核时间" align="center" prop="auditTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.auditTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核人" align="center" prop="auditBy" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            link
            type="success"
            icon="Check"
            @click="handleApproveSingle(scope.row)"
            v-hasPermi="['business:auth:edit']"
            :disabled="scope.row.status !== 0"
          >通过</el-button>
          <el-button
            link
            type="danger"
            icon="CircleClose"
            @click="handleRejectSingle(scope.row)"
            v-hasPermi="['business:auth:remove']"
            :disabled="scope.row.status !== 0"
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

    <!-- 添加或修改实名认证对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="authRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="商户ID" prop="customerId">
          <el-input v-model="form.customerId" placeholder="请输入商户ID" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="身份证正面图片URL" prop="idCardFront">
          <image-preview v-if="form.idCardFront" :src="form.idCardFront" :width="100" :height="100"/>
          <el-input v-model="form.idCardFront" placeholder="请输入身份证正面图片URL" />
        </el-form-item>
        <el-form-item label="身份证反面图片URL" prop="idCardBack">
          <image-preview v-if="form.idCardBack" :src="form.idCardBack" :width="100" :height="100"/>
          <el-input v-model="form.idCardBack" placeholder="请输入身份证反面图片URL" />
        </el-form-item>
        <el-form-item label="状态：0-待审核，1-审核通过，2-审核拒绝" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in approve_status"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核原因" prop="auditReason">
          <el-input v-model="form.auditReason" placeholder="请输入审核原因" />
        </el-form-item>
        <el-form-item label="审核时间" prop="auditTime">
          <el-date-picker clearable
            v-model="form.auditTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择审核时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="审核人" prop="auditBy">
          <el-input v-model="form.auditBy" placeholder="请输入审核人" />
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

<script setup name="Auth">
import { listAuth, getAuth, delAuth, addAuth, updateAuth, approveAuth, rejectAuth } from "@/api/business/auth";
import { getOnlineCount } from "@/api/monitor/online";

const { proxy } = getCurrentInstance();
const { approve_status } = proxy.useDict('approve_status');

const authList = ref([]);
const open = ref(false);
const auditOpen = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const auditTitle = ref("");
const isPendingStatus = ref(false);
const onlineCount = ref(0);

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
    customerId: null,
    realName: null,
    idCardFront: null,
    idCardBack: null,
    status: null,
    auditReason: null,
    auditTime: null,
    auditBy: null,
  },
  rules: {
    customerId: [
      { required: true, message: "商户ID不能为空", trigger: "blur" }
    ],
    realName: [
      { required: true, message: "真实姓名不能为空", trigger: "blur" }
    ],
    idCardFront: [
      { required: true, message: "身份证正面图片URL不能为空", trigger: "blur" }
    ],
    idCardBack: [
      { required: true, message: "身份证反面图片URL不能为空", trigger: "blur" }
    ],
  },
  auditRules: {
    auditReason: [
      { required: true, message: "审核原因不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules, auditForm, auditRules } = toRefs(data);

/** 查询实名认证列表 */
function getList() {
  loading.value = true;
  listAuth(queryParams.value).then(response => {
    authList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 获取在线用户数量
function getOnlineUserCount() {
  getOnlineCount().then(response => {
    onlineCount.value = response.data || 0;
  }).catch(error => {
    console.error('获取在线用户数量失败:', error);
    onlineCount.value = 0;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 取消审核操作
function cancelAudit() {
  auditOpen.value = false;
  resetAuditForm();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    customerId: null,
    realName: null,
    idCardFront: null,
    idCardBack: null,
    status: null,
    auditReason: null,
    auditTime: null,
    auditBy: null,
    createTime: null,
    updateTime: null
  };
  proxy.resetForm("authRef");
}

// 审核表单重置
function resetAuditForm() {
  auditForm.value = {
    id: null,
    auditReason: null,
    status: null
  };
  proxy.resetForm("auditRef");
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

  // 检查选中的记录是否都是待审核状态
  isPendingStatus.value = selection.every(item => item.status === 0);
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加实名认证";
}

/** 通过按钮操作 */
function handleApprove() {
  auditTitle.value = "审核通过";
  resetAuditForm();
  auditForm.value.status = 1; // 通过状态
  auditOpen.value = true;
}

/** 拒绝按钮操作 */
function handleReject() {
  auditTitle.value = "审核拒绝";
  resetAuditForm();
  auditForm.value.status = 2; // 拒绝状态
  auditOpen.value = true;
}

/** 单个通过操作 */
function handleApproveSingle(row) {
  auditTitle.value = "审核通过";
  resetAuditForm();
  auditForm.value.id = row.id;
  auditForm.value.status = 1; // 通过状态
  auditOpen.value = true;
}

/** 单个拒绝操作 */
function handleRejectSingle(row) {
  auditTitle.value = "审核拒绝";
  resetAuditForm();
  auditForm.value.id = row.id;
  auditForm.value.status = 2; // 拒绝状态
  auditOpen.value = true;
}

/** 提交审核操作 */
function submitAudit() {
  proxy.$refs["auditRef"].validate(valid => {
    if (valid) {
      const operation = auditForm.value.status === 1 ? approveAuth : rejectAuth;

      // 如果是批量操作
      if (ids.value.length > 0 && !auditForm.value.id) {
        const promises = ids.value.map(id => {
          const params = {
            id: id,
            auditReason: auditForm.value.auditReason,
            status: auditForm.value.status
          };
          return operation(params);
        });

        Promise.all(promises).then(() => {
          proxy.$modal.msgSuccess(`${auditForm.value.status === 1 ? '通过' : '拒绝'}成功`);
          auditOpen.value = false;
          getList();
        }).catch(() => {
          proxy.$modal.msgError(`${auditForm.value.status === 1 ? '通过' : '拒绝'}失败`);
        });
      } else {
        // 单个操作
        const params = {
          id: auditForm.value.id || ids.value[0],
          auditReason: auditForm.value.auditReason,
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
    }
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["authRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateAuth(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addAuth(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除实名认证编号为"' + _ids + '"的数据项？').then(function() {
    return delAuth(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('business/auth/export', {
    ...queryParams.value
  }, `auth_${new Date().getTime()}.xlsx`)
}

// 页面加载时获取在线用户数量
onMounted(() => {
  getList();
  getOnlineUserCount();
});
</script>

<style scoped>
.mb20 {
  margin-bottom: 20px;
}

.online-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}
</style>
