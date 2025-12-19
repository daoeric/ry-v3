<template>
  <div class="app-container">

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="vipList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="VIP等级" align="center" prop="id" />
      <el-table-column label="扫码次数" align="center" prop="scanLimit" />
      <el-table-column label="提现次数" align="center" prop="withdrawLimit" />
      <el-table-column label="最小奖励" align="center" prop="minReward" />
      <el-table-column label="最大奖励" align="center" prop="maxReward" />
      <el-table-column label="分享奖励扫码次数" align="center" prop="shareCount" />
      <el-table-column label="分享奖励" align="center" prop="shareReward" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['business:vip:edit']">修改</el-button>
<!--          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['business:vip:remove']">删除</el-button>-->
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

    <!-- 添加或修改VIP管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="vipRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="扫码次数" prop="scanLimit">
          <el-input v-model="form.scanLimit" placeholder="请输入扫码次数" />
        </el-form-item>
        <el-form-item label="提现次数" prop="withdrawLimit">
          <el-input v-model="form.withdrawLimit" placeholder="请输入提现次数" />
        </el-form-item>
        <el-form-item label="最小奖励" prop="minReward">
          <el-input v-model="form.minReward" placeholder="请输入最小奖励" />
        </el-form-item>
        <el-form-item label="最大奖励" prop="maxReward">
          <el-input v-model="form.maxReward" placeholder="请输入最大奖励" />
        </el-form-item>
        <el-form-item label="分享奖励扫码次数" prop="shareCount">
          <el-input v-model="form.shareCount" placeholder="请输入分享奖励扫码次数" />
        </el-form-item>
        <el-form-item label="分享奖励" prop="shareReward">
          <el-input v-model="form.shareReward" placeholder="请输入分享奖励" />
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

<script setup name="Vip">
import { listVip, getVip, delVip, addVip, updateVip } from "@/api/business/vip";

const { proxy } = getCurrentInstance();

const vipList = ref([]);
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
    scanLimit: null,
    withdrawLimit: null,
    minReward: null,
    maxReward: null,
    shareCount: null,
    shareReward: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询VIP管理列表 */
function getList() {
  loading.value = true;
  listVip(queryParams.value).then(response => {
    vipList.value = response.rows;
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
    scanLimit: null,
    withdrawLimit: null,
    minReward: null,
    maxReward: null,
    shareCount: null,
    shareReward: null,
    createTime: null,
    createBy: null,
    updateTime: null,
    updateBy: null,
    remark: null
  };
  proxy.resetForm("vipRef");
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
  title.value = "添加VIP管理";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getVip(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改VIP管理";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["vipRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateVip(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addVip(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除VIP管理编号为"' + _ids + '"的数据项？').then(function() {
    return delVip(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('business/vip/export', {
    ...queryParams.value
  }, `vip_${new Date().getTime()}.xlsx`)
}

getList();
</script>
