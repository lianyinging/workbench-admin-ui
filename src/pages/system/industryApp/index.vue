<template>
  <t-card>
    <t-space direction="vertical" style="width: 100%">
      <t-form v-show="showSearch" ref="queryRef" :data="queryParams" layout="inline" label-width="calc(4em + 12px)">
        <t-form-item label="标题" name="title">
          <t-input v-model="queryParams.title" placeholder="标题" clearable style="width: 160px" @enter="handleQuery" />
        </t-form-item>
        <t-form-item label="模式" name="mode">
          <t-select v-model="queryParams.mode" clearable placeholder="全部" style="width: 140px">
            <t-option value="embed" label="Web 内嵌" />
            <t-option value="plugin" label="本地插件" />
            <t-option value="external" label="外开" />
          </t-select>
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-select v-model="queryParams.status" clearable placeholder="全部" style="width: 120px">
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
        row-key="appId"
        :data="appList"
        :columns="columns"
        :selected-row-keys="ids"
        select-on-row-click
        :pagination="pagination"
        @select-change="handleSelectionChange"
      >
        <template #topContent>
          <t-row>
            <t-col flex="auto">
              <t-button v-hasPermi="['system:industryApp:add']" theme="primary" @click="handleAdd">
                <template #icon><add-icon /></template>
                新增
              </t-button>
              <t-button
                v-hasPermi="['system:industryApp:remove']"
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
        <template #logo="{ row }">
          <img v-if="row.logo" :src="row.logo" alt="" class="logo-cell" />
          <span v-else class="logo-cell-empty">-</span>
        </template>
        <template #mode="{ row }">
          <span>{{ modeLabel(row.mode) }}</span>
        </template>
        <template #entry="{ row }">
          <span v-if="row.mode === 'plugin'">{{ row.pluginId || '-' }}</span>
          <span v-else class="entry-url">{{ row.url || '-' }}</span>
        </template>
        <template #visibility="{ row }">
          <t-tag
            :theme="
              row.visibility === 'public' ? 'success' : row.visibility === 'login' ? 'warning' : 'danger'
            "
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
            <my-link v-hasPermi="['system:industryApp:edit']" @click.stop="handleUpdate(row)">修改</my-link>
            <my-link
              v-if="row.status === '1'"
              v-hasPermi="['system:industryApp:edit']"
              theme="danger"
              @click.stop="handleToggleStatus(row, '0')"
            >
              停用
            </my-link>
            <my-link
              v-else
              v-hasPermi="['system:industryApp:edit']"
              theme="primary"
              @click.stop="handleToggleStatus(row, '1')"
            >
              启用
            </my-link>
            <my-link v-hasPermi="['system:industryApp:remove']" theme="danger" @click.stop="handleDelete(row)">
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
      width="640px"
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
          <t-form-item label="应用键" name="appKey">
            <t-input v-model="form.appKey" placeholder="唯一键，如 ai_ecommerce" :disabled="!!form.appId" />
          </t-form-item>
          <t-form-item label="标题" name="title">
            <t-input v-model="form.title" placeholder="展示标题" />
          </t-form-item>
          <t-form-item label="副标题" name="subtitle">
            <t-input v-model="form.subtitle" placeholder="简短说明" />
          </t-form-item>
          <t-form-item label="Logo" name="logo">
            <div class="logo-field">
              <div v-if="form.logo" class="logo-preview-wrap">
                <img :src="form.logo" alt="logo" class="logo-preview" />
                <t-button size="small" variant="outline" theme="danger" @click="clearLogo">清除</t-button>
              </div>
              <t-upload
                theme="custom"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                :auto-upload="false"
                :show-upload-progress="false"
                :allow-upload-duplicate-file="true"
                :max="1"
                @select-change="onLogoSelect"
              >
                <t-button variant="outline" type="button">上传 Logo</t-button>
              </t-upload>
              <div class="logo-hint">图片转 base64 落库，建议 ≤200KB</div>
            </div>
          </t-form-item>
          <t-form-item label="模式" name="mode">
            <t-radio-group v-model="form.mode">
              <t-radio value="embed">Web 内嵌</t-radio>
              <t-radio value="plugin">本地插件</t-radio>
              <t-radio value="external">外开浏览器</t-radio>
            </t-radio-group>
          </t-form-item>
          <t-form-item v-if="form.mode === 'embed' || form.mode === 'external'" label="URL" name="url">
            <t-input v-model="form.url" placeholder="https://..." />
          </t-form-item>
          <t-form-item v-if="form.mode === 'plugin'" label="插件ID" name="pluginId">
            <t-input v-model="form.pluginId" placeholder="与本地 plugins 目录 id 一致，如 sample_a" />
          </t-form-item>
          <t-form-item label="访问权限" name="visibility">
            <t-radio-group v-model="form.visibility">
              <t-radio value="public">公开</t-radio>
              <t-radio value="login">登录</t-radio>
              <t-radio value="subscribe">登录且订阅</t-radio>
            </t-radio-group>
          </t-form-item>
          <t-form-item label="分类" name="category">
            <t-select v-model="form.category" style="width: 100%">
              <t-option value="global" label="全局" />
              <t-option value="listing" label="刊登" />
              <t-option value="ops" label="运营" />
              <t-option value="service" label="客服" />
              <t-option value="content" label="内容" />
              <t-option value="analytics" label="分析" />
            </t-select>
          </t-form-item>
          <t-form-item label="标签" name="tags">
            <t-input v-model="form.tags" placeholder="逗号分隔" />
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
          <t-form-item label="备注" name="remark">
            <t-textarea v-model="form.remark" :autosize="{ minRows: 2, maxRows: 4 }" />
          </t-form-item>
        </t-form>
      </t-loading>
    </t-dialog>
  </t-card>
</template>

<script lang="ts" setup>
defineOptions({ name: 'IndustryApp' });
import { AddIcon, DeleteIcon, RefreshIcon, SearchIcon } from 'tdesign-icons-vue-next';
import type { FormInstanceFunctions, FormRule, PageInfo, PrimaryTableCol, SubmitContext } from 'tdesign-vue-next';
import { computed, getCurrentInstance, onMounted, ref } from 'vue';

import type { OpcIndustryAppForm, OpcIndustryAppQuery, OpcIndustryAppVo } from '@/api/system/model/industryAppModel';
import {
  addIndustryApp,
  changeIndustryAppStatus,
  delIndustryApp,
  getIndustryApp,
  listIndustryApp,
  updateIndustryApp,
} from '@/api/system/industryApp';

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict('sys_normal_disable');

const appList = ref<OpcIndustryAppVo[]>([]);
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

const rules = computed<Record<string, Array<FormRule>>>(() => {
  const base: Record<string, Array<FormRule>> = {
    appKey: [{ required: true, message: '应用键不能为空' }],
    title: [{ required: true, message: '标题不能为空' }],
    mode: [{ required: true, message: '请选择模式' }],
  };
  if (form.value.mode === 'embed' || form.value.mode === 'external') {
    base.url = [{ required: true, message: '请填写 URL' }];
  }
  if (form.value.mode === 'plugin') {
    base.pluginId = [{ required: true, message: '请填写插件 ID' }];
  }
  return base;
});

const columns = ref<Array<PrimaryTableCol>>([
  { title: '选择列', colKey: 'row-select', type: 'multiple', width: 50, align: 'center' },
  { title: '排序', colKey: 'sortOrder', align: 'center', width: 70 },
  { title: 'Logo', colKey: 'logo', align: 'center', width: 72 },
  { title: '标题', colKey: 'title', align: 'center', ellipsis: true, minWidth: 140 },
  { title: '应用键', colKey: 'appKey', align: 'center', ellipsis: true, minWidth: 120 },
  { title: '模式', colKey: 'mode', align: 'center', width: 100 },
  { title: '入口', colKey: 'entry', align: 'center', ellipsis: true, minWidth: 180 },
  { title: '访问权限', colKey: 'visibility', align: 'center', width: 120 },
  { title: '状态', colKey: 'status', align: 'center', width: 90 },
  { title: '操作', colKey: 'operation', align: 'center', width: 200, fixed: 'right' },
]);

const form = ref<OpcIndustryAppForm>({});
const queryParams = ref<OpcIndustryAppQuery>({
  pageNum: 1,
  pageSize: 10,
  title: undefined,
  mode: undefined,
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

function modeLabel(mode?: string) {
  if (mode === 'embed') return 'Web 内嵌';
  if (mode === 'plugin') return '本地插件';
  if (mode === 'external') return '外开';
  return mode || '-';
}

function visibilityLabel(visibility?: string) {
  if (visibility === 'public') return '公开';
  if (visibility === 'login') return '登录';
  if (visibility === 'subscribe') return '登录且订阅';
  return visibility || '-';
}

function getList() {
  loading.value = true;
  listIndustryApp(queryParams.value)
    .then((res) => {
      appList.value = res.rows || [];
      total.value = res.total || 0;
    })
    .finally(() => {
      loading.value = false;
    });
}

function reset() {
  form.value = {
    appId: undefined,
    appKey: undefined,
    title: undefined,
    subtitle: undefined,
    category: 'global',
    tags: undefined,
    icon: 'sparkle',
    logo: undefined,
    tone: '#1d4ed8',
    mode: 'embed',
    url: undefined,
    pluginId: undefined,
    visibility: 'subscribe',
    sortOrder: 0,
    status: '1',
    remark: undefined,
  };
  formRef.value?.reset();
}

const LOGO_MAX_BYTES = 200 * 1024;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('读取图片失败'));
    reader.readAsDataURL(file);
  });
}

/** TDesign select-change 首参是原生 File[]（不是 UploadFile[]） */
async function onLogoSelect(files: File[]) {
  const raw = files?.[0];
  if (!raw) return;
  if (!raw.type || !raw.type.startsWith('image/')) {
    proxy.$modal.msgError('请选择图片文件');
    return;
  }
  if (raw.size > LOGO_MAX_BYTES) {
    proxy.$modal.msgError('Logo 不能超过 200KB，请压缩后上传');
    return;
  }
  try {
    const dataUrl = await readAsDataUrl(raw);
    if (!dataUrl.startsWith('data:image/')) {
      proxy.$modal.msgError('图片读取失败');
      return;
    }
    form.value.logo = dataUrl;
    proxy.$modal.msgSuccess('Logo 已选择');
  } catch {
    proxy.$modal.msgError('图片读取失败');
  }
}

function clearLogo() {
  form.value.logo = undefined;
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
  title.value = '新增行业应用';
}

function handleUpdate(row?: OpcIndustryAppVo) {
  reset();
  open.value = true;
  title.value = '修改行业应用';
  eLoading.value = true;
  const appId = (row?.appId || ids.value.at(0)) as number;
  getIndustryApp(appId)
    .then((res) => {
      form.value = { ...res.data };
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
  const req = form.value.appId ? updateIndustryApp(form.value) : addIndustryApp(form.value);
  req
    .then(() => {
      proxy.$modal.msgSuccess(form.value.appId ? '修改成功' : '新增成功');
      open.value = false;
      getList();
    })
    .finally(() => proxy.$modal.msgClose(msgLoading));
}

function handleDelete(row?: OpcIndustryAppVo) {
  const appIds = row?.appId ? [row.appId] : (ids.value as number[]);
  proxy.$modal.confirm('是否确认删除选中的行业应用？', () => {
    return delIndustryApp(appIds).then(() => {
      getList();
      proxy.$modal.msgSuccess('删除成功');
    });
  });
}

function handleToggleStatus(row: OpcIndustryAppVo, status: string) {
  const action = status === '0' ? '停用' : '启用';
  proxy.$modal.confirm(`是否确认${action}「${row.title}」？`, () => {
    return changeIndustryAppStatus(row.appId!, status).then(() => {
      getList();
      proxy.$modal.msgSuccess(`${action}成功`);
    });
  });
}

onMounted(() => getList());
</script>

<style scoped>
.entry-url {
  display: inline-block;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}
.logo-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
.logo-preview-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-preview {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid var(--td-component-border);
  background: #fff;
}
.logo-hint {
  color: var(--td-text-color-placeholder);
  font-size: 12px;
  line-height: 1.4;
}
.logo-cell {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
  vertical-align: middle;
  border: 1px solid var(--td-component-border);
}
.logo-cell-empty {
  color: var(--td-text-color-placeholder);
}
</style>
