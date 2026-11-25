<template>
  <t-card>
    <t-space direction="vertical" style="width: 100%">
      <t-form v-show="showSearch" ref="queryRef" :data="queryParams" layout="inline" label-width="calc(4em + 12px)">
        <t-form-item label="名称" name="name">
          <t-input v-model="queryParams.name" placeholder="名称" clearable style="width: 140px" @enter="handleQuery" />
        </t-form-item>
        <t-form-item label="Persona" name="personaKey">
          <t-input
            v-model="queryParams.personaKey"
            placeholder="personaKey"
            clearable
            style="width: 140px"
            @enter="handleQuery"
          />
        </t-form-item>
        <t-form-item label="分组" name="groupKey">
          <t-select v-model="queryParams.groupKey" clearable placeholder="全部" style="width: 120px">
            <t-option value="general" label="通用" />
            <t-option value="engineering" label="工程" />
            <t-option value="security" label="安全" />
          </t-select>
        </t-form-item>
        <t-form-item label="权限" name="visibility">
          <t-select v-model="queryParams.visibility" clearable placeholder="全部" style="width: 130px">
            <t-option value="public" label="公开" />
            <t-option value="login" label="登录" />
            <t-option value="subscribe" label="订阅" />
          </t-select>
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-select v-model="queryParams.status" clearable placeholder="全部" style="width: 100px">
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
            刷新
          </t-button>
        </t-form-item>
      </t-form>

      <t-table
        :loading="loading"
        hover
        row-key="coworkerId"
        :data="coworkerList"
        :columns="columns"
        :selected-row-keys="ids"
        select-on-row-click
        :pagination="pagination"
        @select-change="handleSelectionChange"
      >
        <template #topContent>
          <t-row>
            <t-col flex="auto">
              <t-button v-hasPermi="['system:coworker:add']" theme="primary" @click="handleAdd">
                <template #icon><add-icon /></template>
                新增
              </t-button>
              <t-button
                v-hasPermi="['system:coworker:remove']"
                theme="danger"
                variant="outline"
                :disabled="multiple"
                @click="handleDelete()"
              >
                <template #icon><delete-icon /></template>
                删除
              </t-button>
            </t-col>
          </t-row>
        </template>
        <template #groupKey="{ row }">
          <span>{{ groupLabel(row.groupKey) }}</span>
        </template>
        <template #package="{ row }">
          <t-tag :theme="row.hasPackage ? 'success' : 'default'" variant="light">
            {{ row.hasPackage ? '已上传' : '无包' }}
          </t-tag>
        </template>
        <template #visibility="{ row }">
          <t-tag
            :theme="row.visibility === 'public' ? 'success' : row.visibility === 'login' ? 'warning' : 'danger'"
            variant="light"
          >
            {{ visibilityLabel(row.visibility) }}
          </t-tag>
        </template>
        <template #status="{ row }">
          <dict-tag :options="sys_normal_disable" :value="row.status" />
        </template>
        <template #operation="{ row }">
          <t-space :size="8" break-line>
            <my-link v-hasPermi="['system:coworker:edit']" @click.stop="handleUpdate(row)">修改</my-link>
            <my-link
              v-if="row.status === '1'"
              v-hasPermi="['system:coworker:edit']"
              theme="danger"
              @click.stop="handleToggleStatus(row, '0')"
            >
              停用
            </my-link>
            <my-link
              v-else
              v-hasPermi="['system:coworker:edit']"
              theme="primary"
              @click.stop="handleToggleStatus(row, '1')"
            >
              启用
            </my-link>
            <my-link v-hasPermi="['system:coworker:remove']" theme="danger" @click.stop="handleDelete(row)">
              删除
            </my-link>
          </t-space>
        </template>
      </t-table>
    </t-space>

    <t-dialog
      v-model:visible="open"
      :header="title"
      placement="center"
      destroy-on-close
      :close-on-overlay-click="false"
      width="720px"
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
          label-width="calc(6em + 28px)"
          @submit="submitForm"
        >
          <t-form-item label="Persona" name="personaKey">
            <t-input v-model="form.personaKey" placeholder="唯一键" :disabled="!!form.coworkerId" />
          </t-form-item>
          <t-form-item label="名称" name="name">
            <t-input v-model="form.name" placeholder="展示名称" />
          </t-form-item>
          <t-form-item label="一句话" name="tagline">
            <t-input v-model="form.tagline" placeholder="副标题" />
          </t-form-item>
          <t-form-item label="描述" name="description">
            <t-textarea v-model="form.description" :autosize="{ minRows: 2, maxRows: 4 }" />
          </t-form-item>
          <t-form-item label="图标" name="icon">
            <t-input v-model="form.icon" placeholder="图标标识" />
          </t-form-item>
          <t-form-item label="分组" name="groupKey">
            <t-select v-model="form.groupKey" style="width: 100%">
              <t-option value="general" label="通用" />
              <t-option value="engineering" label="工程" />
              <t-option value="security" label="安全" />
            </t-select>
          </t-form-item>
          <t-form-item label="版本" name="version">
            <t-input v-model="form.version" placeholder="如 1.0.0" />
          </t-form-item>
          <t-form-item label="同事包 zip" name="packageZipBase64">
            <div class="zip-field">
              <t-tag v-if="form.coworkerId && editHasPackage" theme="success" variant="light">已有包，重新上传可替换</t-tag>
              <t-upload
                theme="custom"
                accept="application/zip,.zip"
                :auto-upload="false"
                :show-upload-progress="false"
                :max="1"
                @select-change="onZipSelect"
              >
                <t-button variant="outline" type="button">选择 zip</t-button>
              </t-upload>
              <span v-if="zipFileName" class="zip-name">{{ zipFileName }}</span>
              <div class="zip-hint">{{ form.coworkerId ? '编辑时可选；不传则保留原包' : '新增必填，转 base64 上传' }}</div>
            </div>
          </t-form-item>
          <t-form-item label="访问权限" name="visibility">
            <t-radio-group v-model="form.visibility">
              <t-radio value="public">公开</t-radio>
              <t-radio value="login">登录</t-radio>
              <t-radio value="subscribe">登录且订阅</t-radio>
            </t-radio-group>
          </t-form-item>
          <t-form-item label="排序" name="sortOrder">
            <t-input-number v-model="form.sortOrder" :min="0" style="width: 100%" />
          </t-form-item>
          <t-form-item label="状态" name="status">
            <t-radio-group v-model="form.status">
              <t-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">
                {{ dict.label }}
              </t-radio>
            </t-radio-group>
          </t-form-item>
          <t-form-item label="MCP 工具">
            <t-space direction="vertical" style="width: 100%">
              <t-select
                v-model="selectedToolIds"
                multiple
                filterable
                clearable
                placeholder="从网关选择工具"
                style="width: 100%"
                @change="syncToolsFromSelect"
              >
                <t-option
                  v-for="gt in gatewayTools"
                  :key="String(gt.toolId)"
                  :value="String(gt.toolId)"
                  :label="`${gt.toolName || gt.toolId}${gt.description ? ` — ${gt.description}` : ''}`"
                />
              </t-select>
              <t-table
                v-if="(form.tools || []).length"
                size="small"
                row-key="toolId"
                :data="form.tools"
                :columns="toolEditColumns"
                bordered
              >
                <template #logicalMcp="{ row }">
                  <t-input v-model="row.logicalMcp" placeholder="logicalMcp（可空）" size="small" />
                </template>
              </t-table>
              <span v-else class="tools-empty">未绑定工具</span>
            </t-space>
          </t-form-item>
          <t-form-item label="备注" name="remark">
            <t-textarea v-model="form.remark" :autosize="{ minRows: 2, maxRows: 4 }" />
          </t-form-item>
        </t-form>
      </t-loading>
    </t-dialog>
  </t-card>
</template>

<script lang="ts" setup>
defineOptions({ name: 'Coworker' });
import { AddIcon, DeleteIcon, RefreshIcon, SearchIcon } from 'tdesign-icons-vue-next';
import type { FormInstanceFunctions, FormRule, PageInfo, PrimaryTableCol, SubmitContext } from 'tdesign-vue-next';
import { computed, getCurrentInstance, onMounted, ref } from 'vue';

import type { OpcCoworkerForm, OpcCoworkerQuery, OpcCoworkerVo } from '@/api/system/model/coworkerModel';
import type { McpGatewayToolItem } from '@/api/system/model/mcpGatewayModel';
import {
  addCoworker,
  changeCoworkerStatus,
  delCoworker,
  getCoworker,
  listCoworker,
  updateCoworker,
} from '@/api/system/coworker';
import { listMcpGatewayTools } from '@/api/system/mcpGateway';

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict('sys_normal_disable');

const coworkerList = ref<OpcCoworkerVo[]>([]);
const gatewayTools = ref<McpGatewayToolItem[]>([]);
const selectedToolIds = ref<string[]>([]);
const editHasPackage = ref(false);
const zipFileName = ref('');
const open = ref(false);
const loading = ref(false);
const eLoading = ref(false);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const multiple = ref(true);
const total = ref(0);
const title = ref('');
const queryRef = ref<FormInstanceFunctions>();
const formRef = ref<FormInstanceFunctions>();

const rules = computed<Record<string, Array<FormRule>>>(() => ({
  personaKey: [{ required: true, message: 'personaKey 不能为空' }],
  name: [{ required: true, message: '名称不能为空' }],
}));

const toolEditColumns = ref<Array<PrimaryTableCol>>([
  { title: '工具', colKey: 'toolName', width: 160, ellipsis: true },
  { title: 'Tool ID', colKey: 'toolId', width: 120, ellipsis: true },
  { title: 'Logical MCP', colKey: 'logicalMcp', minWidth: 180 },
]);

const columns = ref<Array<PrimaryTableCol>>([
  { title: '选择列', colKey: 'row-select', type: 'multiple', width: 50, align: 'center' },
  { title: '排序', colKey: 'sortOrder', align: 'center', width: 70 },
  { title: '名称', colKey: 'name', align: 'center', ellipsis: true, minWidth: 120 },
  { title: 'Persona', colKey: 'personaKey', align: 'center', ellipsis: true, minWidth: 110 },
  { title: '分组', colKey: 'groupKey', align: 'center', width: 90 },
  { title: '版本', colKey: 'version', align: 'center', width: 90 },
  { title: '包', colKey: 'package', align: 'center', width: 90 },
  { title: '权限', colKey: 'visibility', align: 'center', width: 110 },
  { title: '状态', colKey: 'status', align: 'center', width: 90 },
  { title: '操作', colKey: 'operation', align: 'center', width: 200, fixed: 'right' },
]);

const form = ref<OpcCoworkerForm>({});
const queryParams = ref<OpcCoworkerQuery>({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  personaKey: undefined,
  groupKey: undefined,
  visibility: undefined,
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

function groupLabel(key?: string) {
  if (key === 'engineering') return '工程';
  if (key === 'security') return '安全';
  if (key === 'general') return '通用';
  return key || '-';
}

function visibilityLabel(visibility?: string) {
  if (visibility === 'public') return '公开';
  if (visibility === 'login') return '登录';
  if (visibility === 'subscribe') return '登录且订阅';
  return visibility || '-';
}

function getList() {
  loading.value = true;
  listCoworker(queryParams.value)
    .then((res) => {
      coworkerList.value = res.rows || [];
      total.value = res.total || 0;
    })
    .finally(() => {
      loading.value = false;
    });
}

function loadGatewayTools() {
  return listMcpGatewayTools()
    .then((res) => {
      const data = (res as any)?.data ?? res;
      gatewayTools.value = Array.isArray(data) ? data : [];
    })
    .catch(() => {
      gatewayTools.value = [];
    });
}

function syncToolsFromSelect() {
  const prev = new Map((form.value.tools || []).map((t) => [String(t.toolId), t]));
  form.value.tools = selectedToolIds.value.map((id) => {
    const gt = gatewayTools.value.find((g) => String(g.toolId) === id);
    const old = prev.get(id);
    return {
      logicalMcp: old?.logicalMcp ?? '',
      toolId: id,
      toolName: gt?.toolName ?? old?.toolName ?? id,
    };
  });
}

function reset() {
  form.value = {
    coworkerId: undefined,
    personaKey: undefined,
    name: undefined,
    tagline: undefined,
    description: undefined,
    icon: undefined,
    groupKey: 'general',
    version: undefined,
    packageZipBase64: undefined,
    visibility: 'subscribe',
    sortOrder: 0,
    status: '1',
    remark: undefined,
    tools: [],
  };
  selectedToolIds.value = [];
  editHasPackage.value = false;
  zipFileName.value = '';
  formRef.value?.reset();
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('读取失败'));
    reader.readAsDataURL(file);
  });
}

async function onZipSelect(files: File[]) {
  const raw = files?.[0];
  if (!raw) return;
  zipFileName.value = raw.name;
  try {
    form.value.packageZipBase64 = await readAsDataUrl(raw);
    proxy.$modal.msgSuccess('zip 已选择');
  } catch {
    proxy.$modal.msgError('读取 zip 失败');
  }
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
  multiple.value = !selection.length;
}

function handleAdd() {
  reset();
  open.value = true;
  title.value = '新增同事';
  loadGatewayTools();
}

function handleUpdate(row?: OpcCoworkerVo) {
  reset();
  open.value = true;
  title.value = '修改同事';
  eLoading.value = true;
  loadGatewayTools();
  const coworkerId = (row?.coworkerId || ids.value.at(0)) as number;
  getCoworker(coworkerId)
    .then((res) => {
      const data = res.data || ({} as OpcCoworkerVo);
      form.value = {
        coworkerId: data.coworkerId,
        personaKey: data.personaKey,
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        icon: data.icon,
        groupKey: data.groupKey || 'general',
        version: data.version,
        packageZipBase64: undefined,
        visibility: data.visibility || 'subscribe',
        sortOrder: data.sortOrder ?? 0,
        status: data.status ?? '1',
        remark: data.remark,
        tools: [...(data.tools || [])],
      };
      editHasPackage.value = !!data.hasPackage;
      selectedToolIds.value = (data.tools || []).map((t) => String(t.toolId)).filter(Boolean);
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
  if (!form.value.coworkerId && !form.value.packageZipBase64) {
    proxy.$modal.msgError('请上传同事 zip 包');
    return;
  }
  const msgLoading = proxy.$modal.msgLoading('提交中...');
  const payload = { ...form.value };
  if (form.value.coworkerId && !payload.packageZipBase64) {
    delete payload.packageZipBase64;
  }
  const req = form.value.coworkerId ? updateCoworker(payload) : addCoworker(payload);
  req
    .then(() => {
      proxy.$modal.msgSuccess(form.value.coworkerId ? '修改成功' : '新增成功');
      open.value = false;
      getList();
    })
    .finally(() => proxy.$modal.msgClose(msgLoading));
}

function handleDelete(row?: OpcCoworkerVo) {
  const coworkerIds = row?.coworkerId ? [row.coworkerId] : (ids.value as number[]);
  proxy.$modal.confirm('是否确认删除选中的同事？', () => {
    return delCoworker(coworkerIds).then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    });
  });
}

function handleToggleStatus(row: OpcCoworkerVo, status: string) {
  const action = status === '0' ? '停用' : '启用';
  proxy.$modal.confirm(`是否确认${action}「${row.name}」？`, () => {
    return changeCoworkerStatus(row.coworkerId!, status).then(() => {
      getList();
      proxy.$modal.msgSuccess(`${action}成功`);
    });
  });
}

onMounted(() => getList());
</script>

<style scoped>
.zip-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
.zip-hint,
.tools-empty {
  color: var(--td-text-color-placeholder);
  font-size: 12px;
}
.zip-name {
  font-size: 13px;
  color: var(--td-text-color-secondary);
}
</style>