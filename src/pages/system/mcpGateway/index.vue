<template>
  <t-card title="MCP 网关配置">
    <t-loading :loading="loading" size="small">
      <t-form
        ref="formRef"
        label-align="right"
        :data="form"
        label-width="calc(7em + 28px)"
        style="max-width: 720px"
        @submit="submitForm"
      >
        <t-form-item label="网关地址" name="gatewayBaseUrl">
          <t-input v-model="form.gatewayBaseUrl" placeholder="https://gateway.example.com" />
        </t-form-item>
        <t-form-item label="Gateway Key" name="gatewayApiKey">
          <t-input
            v-model="form.gatewayApiKey"
            type="password"
            autocomplete="new-password"
            :placeholder="vo.hasApiKey ? '已配置，留空不修改' : 'Bearer API Key'"
          />
          <div v-if="vo.hasApiKey" class="field-hint">当前已配置{{ vo.apiKeyHint ? `（${vo.apiKeyHint}）` : '' }}</div>
        </t-form-item>
        <t-form-item label="虚拟 Server ID" name="virtualServerId">
          <t-input v-model="form.virtualServerId" placeholder="可选" />
        </t-form-item>
        <t-form-item label="Admin Token" name="adminToken">
          <t-input
            v-model="form.adminToken"
            type="password"
            autocomplete="new-password"
            :placeholder="vo.hasAdminToken ? '已配置，留空不修改' : '拉取 tools 用'"
          />
        </t-form-item>
        <t-form-item label="备注" name="remark">
          <t-textarea v-model="form.remark" :autosize="{ minRows: 2, maxRows: 4 }" />
        </t-form-item>
        <t-form-item>
          <t-space>
            <t-button v-hasPermi="['system:mcpGateway:edit']" theme="primary" :loading="saving" @click="handleSave">
              保存配置
            </t-button>
            <t-button
              v-hasPermi="['system:mcpGateway:query']"
              theme="default"
              variant="outline"
              :loading="toolsLoading"
              @click="loadTools"
            >
              刷新工具列表
            </t-button>
          </t-space>
        </t-form-item>
      </t-form>

      <t-divider>网关 Tools 预览</t-divider>
      <t-table :loading="toolsLoading" row-key="toolId" :data="tools" :columns="toolColumns" hover size="small" />
    </t-loading>
  </t-card>
</template>

<script lang="ts" setup>
defineOptions({ name: 'McpGateway' });
import type { PrimaryTableCol, SubmitContext } from 'tdesign-vue-next';
import { getCurrentInstance, onMounted, ref } from 'vue';

import type { McpGatewayToolItem, OpcMcpGatewayConfigForm, OpcMcpGatewayConfigVo } from '@/api/system/model/mcpGatewayModel';
import { getMcpGatewayConfig, listMcpGatewayTools, saveMcpGatewayConfig } from '@/api/system/mcpGateway';

const { proxy } = getCurrentInstance();

const loading = ref(false);
const saving = ref(false);
const toolsLoading = ref(false);
const formRef = ref();
const vo = ref<OpcMcpGatewayConfigVo>({});
const form = ref<OpcMcpGatewayConfigForm>({});
const tools = ref<McpGatewayToolItem[]>([]);

const toolColumns = ref<Array<PrimaryTableCol>>([
  { title: 'Tool ID', colKey: 'toolId', ellipsis: true, minWidth: 140 },
  { title: '名称', colKey: 'toolName', ellipsis: true, minWidth: 140 },
  { title: 'Gateway ID', colKey: 'gatewayId', ellipsis: true, width: 120 },
  { title: '描述', colKey: 'description', ellipsis: true, minWidth: 200 },
]);

function applyVo(data: OpcMcpGatewayConfigVo) {
  vo.value = { ...data };
  form.value = {
    gatewayBaseUrl: data.gatewayBaseUrl,
    gatewayApiKey: undefined,
    virtualServerId: data.virtualServerId,
    adminToken: undefined,
    remark: data.remark,
  };
}

function loadConfig() {
  loading.value = true;
  getMcpGatewayConfig()
    .then((res) => {
      const data = (res as any)?.data ?? res;
      applyVo(data || {});
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleSave() {
  formRef.value?.submit();
}

function submitForm({ validateResult, firstError }: SubmitContext) {
  if (validateResult !== true) {
    proxy.$modal.msgError(firstError);
    return;
  }
  saving.value = true;
  const msgLoading = proxy.$modal.msgLoading('保存中...');
  saveMcpGatewayConfig(form.value)
    .then(() => {
      proxy.$modal.msgSuccess('保存成功');
      form.value.gatewayApiKey = undefined;
      form.value.adminToken = undefined;
      loadConfig();
    })
    .finally(() => {
      saving.value = false;
      proxy.$modal.msgClose(msgLoading);
    });
}

function loadTools() {
  toolsLoading.value = true;
  listMcpGatewayTools()
    .then((res) => {
      const data = (res as any)?.data ?? res;
      tools.value = Array.isArray(data) ? data : [];
    })
    .catch(() => {
      tools.value = [];
    })
    .finally(() => {
      toolsLoading.value = false;
    });
}

onMounted(() => {
  loadConfig();
});
</script>

<style scoped>
.field-hint {
  margin-top: 6px;
  color: var(--td-text-color-placeholder);
  font-size: 12px;
}
</style>