<template>
  <t-card>
    <t-space direction="vertical" style="width: 100%">
      <t-form v-show="showSearch" ref="queryRef" :data="queryParams" layout="inline" label-width="calc(4em + 12px)">
        <t-form-item label="账号" name="userName">
          <t-input
            v-model="queryParams.userName"
            placeholder="请输入账号"
            clearable
            style="width: 180px"
            @enter="handleQuery"
          />
        </t-form-item>
        <t-form-item label="昵称" name="nickName">
          <t-input
            v-model="queryParams.nickName"
            placeholder="请输入昵称"
            clearable
            style="width: 180px"
            @enter="handleQuery"
          />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-select v-model="queryParams.status" placeholder="状态" clearable style="width: 140px">
            <t-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
          </t-select>
        </t-form-item>
        <t-form-item label-width="0px">
          <t-button theme="primary" @click="handleQuery">
            <template #icon><search-icon /></template>
            搜索
          </t-button>
          <t-button theme="default" @click="resetQuery">
            <template #icon><refresh-icon /></template>
            重置
          </t-button>
        </t-form-item>
      </t-form>

      <t-table
        v-model:column-controller-visible="columnControllerVisible"
        :loading="loading"
        hover
        row-key="userId"
        :data="userList"
        :columns="columns"
        :selected-row-keys="ids"
        select-on-row-click
        :pagination="pagination"
        :column-controller="{ hideTriggerButton: true }"
        @select-change="handleSelectionChange"
      >
        <template #topContent>
          <t-row>
            <t-col flex="auto">
              <t-button v-hasPermi="['system:desktopUser:add']" theme="primary" @click="handleAdd">
                <template #icon><add-icon /></template>
                新增
              </t-button>
              <t-button
                v-hasPermi="['system:desktopUser:edit']"
                theme="default"
                variant="outline"
                :disabled="single"
                @click="handleUpdate()"
              >
                <template #icon><edit-icon /></template>
                修改
              </t-button>
              <t-button
                v-hasPermi="['system:desktopUser:remove']"
                theme="danger"
                variant="outline"
                :disabled="multiple"
                @click="handleDelete()"
              >
                <template #icon><delete-icon /></template>
                删除
              </t-button>
              <span class="selected-count">已选 {{ ids.length }} 项</span>
            </t-col>
            <t-col flex="none">
              <t-button theme="default" shape="square" variant="outline" @click="showSearch = !showSearch">
                <template #icon><search-icon /></template>
              </t-button>
              <t-button theme="default" variant="outline" @click="columnControllerVisible = true">
                <template #icon><setting-icon /></template>
                列配置
              </t-button>
            </t-col>
          </t-row>
        </template>
        <template #online="{ row }">
          <t-tag :theme="row.online ? 'success' : 'default'" variant="light">
            {{ row.online ? '在线' : '离线' }}
          </t-tag>
        </template>
        <template #subscribed="{ row }">
          <span v-if="row.appTitles?.length" class="app-titles">{{ row.appTitles.join('、') }}</span>
          <t-tag v-else theme="default" variant="light">未订阅</t-tag>
        </template>
        <template #status="{ row }">
          <dict-tag :options="sys_normal_disable" :value="row.status" />
        </template>
        <template #lastLoginTime="{ row }">
          <span>{{ parseTime(row.lastLoginTime) || '-' }}</span>
        </template>
        <template #createTime="{ row }">
          <span>{{ parseTime(row.createTime) }}</span>
        </template>
        <template #operation="{ row }">
          <t-space :size="8" break-line>
            <my-link v-hasPermi="['system:desktopUser:edit']" @click.stop="handleUpdate(row)">
              <template #prefix-icon><edit-icon /></template>修改
            </my-link>
            <my-link v-hasPermi="['system:desktopUser:resetPwd']" @click.stop="handleResetPwd(row)">
              <template #prefix-icon><secured-icon /></template>重置密码
            </my-link>
            <my-link
              v-if="row.status === '1'"
              v-hasPermi="['system:desktopUser:edit']"
              theme="danger"
              @click.stop="handleToggleStatus(row, '0')"
            >
              停用
            </my-link>
            <my-link
              v-else
              v-hasPermi="['system:desktopUser:edit']"
              theme="primary"
              @click.stop="handleToggleStatus(row, '1')"
            >
              启用
            </my-link>
            <my-link v-hasPermi="['system:desktopUser:remove']" theme="danger" @click.stop="handleDelete(row)">
              <template #prefix-icon><delete-icon /></template>删除
            </my-link>
          </t-space>
        </template>
      </t-table>
    </t-space>

    <t-dialog
      v-model:visible="open"
      :header="title"
      destroy-on-close
      :close-on-overlay-click="false"
      width="560px"
      attach="body"
      :confirm-btn="{ loading: eLoading }"
      @confirm="onConfirm"
    >
      <t-loading :loading="eLoading" size="small">
        <t-form
          ref="formRef"
          label-align="right"
          :data="form"
          :rules="rules"
          label-width="calc(5em + 28px)"
          @submit="submitForm"
        >
          <t-form-item label="账号" name="userName">
            <t-input v-model="form.userName" placeholder="登录账号" :disabled="!!form.userId" />
          </t-form-item>
          <t-form-item label="昵称" name="nickName">
            <t-input v-model="form.nickName" placeholder="显示昵称" />
          </t-form-item>
          <t-form-item v-if="!form.userId" label="密码" name="password">
            <t-input v-model="form.password" type="password" placeholder="登录密码" autocomplete="new-password" />
          </t-form-item>
          <t-form-item label="状态" name="status">
            <t-radio-group v-model="form.status">
              <t-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">
                {{ dict.label }}
              </t-radio>
            </t-radio-group>
          </t-form-item>
          <t-form-item label="行业应用">
            <t-checkbox-group v-if="industryAppOptions.length" v-model="form.appIds" class="app-check-group">
              <t-checkbox v-for="app in industryAppOptions" :key="String(app.appId)" :value="Number(app.appId)">
                {{ app.title }}
              </t-checkbox>
            </t-checkbox-group>
            <span v-else class="app-empty">暂无启用中的行业应用</span>
          </t-form-item>
          <t-form-item label="备注" name="remark">
            <t-textarea v-model="form.remark" placeholder="备注" :autosize="{ minRows: 2, maxRows: 4 }" />
          </t-form-item>
        </t-form>
      </t-loading>
    </t-dialog>
  </t-card>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'DesktopUser',
});
import {
  AddIcon,
  DeleteIcon,
  EditIcon,
  RefreshIcon,
  SearchIcon,
  SecuredIcon,
  SettingIcon,
} from 'tdesign-icons-vue-next';
import type { FormInstanceFunctions, FormRule, PageInfo, PrimaryTableCol, SubmitContext } from 'tdesign-vue-next';
import { computed, getCurrentInstance, onMounted, ref } from 'vue';

import type { OpcDesktopUserForm, OpcDesktopUserQuery, OpcDesktopUserVo } from '@/api/system/model/desktopUserModel';
import type { OpcIndustryAppVo } from '@/api/system/model/industryAppModel';
import {
  addDesktopUser,
  changeDesktopUserStatus,
  delDesktopUser,
  getDesktopUser,
  listDesktopUser,
  resetDesktopUserPwd,
  updateDesktopUser,
} from '@/api/system/desktopUser';
import { listIndustryApp } from '@/api/system/industryApp';

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict('sys_normal_disable');

const userList = ref<OpcDesktopUserVo[]>([]);
const industryAppOptions = ref<OpcIndustryAppVo[]>([]);
const open = ref(false);
const loading = ref(false);
const eLoading = ref(false);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref('');
const queryRef = ref<FormInstanceFunctions>();
const formRef = ref<FormInstanceFunctions>();
const columnControllerVisible = ref(false);

const rules = computed<Record<string, Array<FormRule>>>(() => {
  const base: Record<string, Array<FormRule>> = {
    userName: [
      { required: true, message: '账号不能为空' },
      { min: 2, max: 64, message: '账号长度 2-64' },
    ],
  };
  // 仅新增时校验密码，避免修改弹窗被必填密码卡住
  if (!form.value.userId) {
    base.password = [
      { required: true, message: '密码不能为空' },
      { min: 5, max: 50, message: '密码长度 5-50' },
    ];
  }
  return base;
});

const columns = ref<Array<PrimaryTableCol>>([
  { title: '选择列', colKey: 'row-select', type: 'multiple', width: 50, align: 'center' },
  { title: '账号', colKey: 'userName', align: 'center', ellipsis: true, minWidth: 120 },
  { title: '昵称', colKey: 'nickName', align: 'center', ellipsis: true, minWidth: 120 },
  { title: '登录在线', colKey: 'online', align: 'center', width: 100 },
  { title: '行业应用', colKey: 'subscribed', align: 'center', ellipsis: true, minWidth: 160 },
  { title: '状态', colKey: 'status', align: 'center', width: 90 },
  { title: '最后登录', colKey: 'lastLoginTime', align: 'center', width: 170 },
  { title: '登录IP', colKey: 'lastLoginIp', align: 'center', ellipsis: true, minWidth: 120 },
  { title: '创建时间', colKey: 'createTime', align: 'center', width: 170 },
  { title: '操作', colKey: 'operation', align: 'center', width: 280, fixed: 'right' },
]);

const form = ref<OpcDesktopUserForm>({
  userId: undefined,
  userName: undefined,
  nickName: undefined,
  password: undefined,
  status: '1',
  subscribed: '0',
  appIds: [],
  remark: undefined,
});
const queryParams = ref<OpcDesktopUserQuery>({
  pageNum: 1,
  pageSize: 10,
  userName: undefined,
  nickName: undefined,
  status: undefined,
});

const pagination = computed(() => ({
  current: queryParams.value.pageNum,
  pageSize: queryParams.value.pageSize,
  total: total.value,
  showJumper: true,
  onChange: (pageInfo: PageInfo) => {
    queryParams.value.pageNum = pageInfo.current;
    queryParams.value.pageSize = pageInfo.pageSize;
    getList();
  },
}));

function getList() {
  loading.value = true;
  listDesktopUser(queryParams.value)
    .then((res) => {
      userList.value = res.rows || [];
      total.value = res.total || 0;
    })
    .finally(() => {
      loading.value = false;
    });
}

function reset() {
  form.value.userId = undefined;
  form.value.userName = undefined;
  form.value.nickName = undefined;
  form.value.password = undefined;
  form.value.status = '1';
  form.value.subscribed = '0';
  form.value.appIds = [];
  form.value.remark = undefined;
}

function loadIndustryApps() {
  return listIndustryApp({ pageNum: 1, pageSize: 200, status: '1' })
    .then((res) => {
      industryAppOptions.value = res.rows || [];
    })
    .catch(() => {
      industryAppOptions.value = [];
    });
}

function applyUserToForm(data: Partial<OpcDesktopUserVo>) {
  form.value.userId = data.userId;
  form.value.userName = data.userName;
  form.value.nickName = data.nickName;
  form.value.status = data.status ?? '1';
  form.value.subscribed = data.subscribed ?? '0';
  form.value.appIds = (data.appIds || []).map((v) => Number(v)).filter((n) => !Number.isNaN(n));
  form.value.remark = data.remark;
  form.value.password = undefined;
}

function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  queryRef.value?.reset();
  queryParams.value.pageNum = 1;
  handleQuery();
}

function handleSelectionChange(selection: Array<string | number>) {
  ids.value = selection;
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

function handleAdd() {
  reset();
  open.value = true;
  title.value = '新增客户端用户';
}

function handleUpdate(row?: OpcDesktopUserVo) {
  const userId = (row?.userId || ids.value.at(0)) as number;
  if (!userId) {
    proxy.$modal.msgError('请选择要修改的用户');
    return;
  }
  // 先用行数据打开弹窗，避免详情接口慢/失败时“点了没反应”
  reset();
  if (row) {
    applyUserToForm(row);
  } else {
    form.value.userId = userId;
  }
  title.value = '修改客户端用户';
  open.value = true;
  eLoading.value = true;
  getDesktopUser(userId)
    .then((res) => {
      const data = (res as any)?.data ?? res;
      applyUserToForm(data || {});
    })
    .catch(() => {
      /* 错误提示由 request 拦截器处理，弹窗保留以便重试/查看 */
    })
    .finally(() => {
      eLoading.value = false;
    });
}

function onConfirm() {
  formRef.value?.submit();
}

function submitForm({ validateResult, firstError }: SubmitContext) {
  if (validateResult !== true) {
    proxy.$modal.msgError(firstError);
    return;
  }
  const msgLoading = proxy.$modal.msgLoading('提交中...');
  const req = form.value.userId ? updateDesktopUser(form.value) : addDesktopUser(form.value);
  req
    .then(() => {
      proxy.$modal.msgSuccess(form.value.userId ? '修改成功' : '新增成功');
      open.value = false;
      getList();
    })
    .finally(() => proxy.$modal.msgClose(msgLoading));
}

function handleDelete(row?: OpcDesktopUserVo) {
  const userIds = row?.userId ? [row.userId] : (ids.value as number[]);
  proxy.$modal.confirm(`是否确认删除选中的客户端用户？`, () => {
    return delDesktopUser(userIds).then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    });
  });
}

function handleToggleStatus(row: OpcDesktopUserVo, status: string) {
  const action = status === '0' ? '停用' : '启用';
  proxy.$modal.confirm(`是否确认${action}账号「${row.userName}」？`, () => {
    return changeDesktopUserStatus(row.userId!, status).then(() => {
      getList();
      proxy.$modal.msgSuccess(`${action}成功`);
    });
  });
}

function handleResetPwd(row: OpcDesktopUserVo) {
  proxy.$modal.prompt(`请输入"${row.userName}"的新密码`, '提示', {
    inputPlaceholder: '至少5位',
  }).then((password: string) => {
    if (!password || password.length < 5) {
      proxy.$modal.msgError('密码至少5位');
      return;
    }
    return resetDesktopUserPwd(row.userId!, password).then(() => {
      proxy.$modal.msgSuccess('密码已重置');
    });
  });
}

onMounted(() => {
  loadIndustryApps();
  getList();
});
</script>

<style scoped>
.app-check-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 220px;
  overflow: auto;
  padding: 4px 0;
}
.app-empty {
  color: var(--td-text-color-placeholder);
  font-size: 13px;
}
.app-titles {
  display: inline-block;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}
</style>
