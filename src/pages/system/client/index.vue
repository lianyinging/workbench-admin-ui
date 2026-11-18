<template>
  <t-card>
    <t-space direction="vertical" style="width: 100%">
      <t-form ref="queryRef" :data="queryParams" layout="inline" label-width="calc(4em + 12px)">
        <t-form-item label="设备名称" name="deviceName">
          <t-input
            v-model="queryParams.deviceName"
            placeholder="请输入设备名称"
            clearable
            style="width: 200px"
            @enter="handleQuery"
          />
        </t-form-item>
        <t-form-item label="在线状态" name="onlineFilter">
          <t-select v-model="queryParams.onlineFilter" clearable placeholder="全部" style="width: 140px">
            <t-option value="online" label="仅在线" />
            <t-option value="all" label="全部" />
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
        hover
        :loading="loading"
        row-key="deviceId"
        :data="deviceList"
        :columns="columns"
        :column-controller="{ placement: 'top-right' }"
        style="width: 100%"
      >
        <template #userDisplayName="{ row }">
          <div v-if="row.userDisplayName" class="user-cell">
            <span class="user-name">{{ row.userDisplayName }}</span>
            <t-tag :theme="row.userOnline ? 'success' : 'default'" variant="light" size="small">
              {{ row.userOnline ? '已登录' : '未登录' }}
            </t-tag>
          </div>
          <span v-else>-</span>
        </template>
        <template #deviceInfo="{ row }">
          <span>{{ formatDeviceInfo(row) }}</span>
        </template>
        <template #lastHeartbeatTime="{ row }">
          <span>{{ parseTime(row.lastHeartbeatTime) || '-' }}</span>
        </template>
        <template #online="{ row }">
          <t-tag :theme="row.online ? 'success' : 'default'" variant="light">
            {{ row.online ? '在线' : '离线' }}
          </t-tag>
        </template>
        <template #status="{ row }">
          <t-tag :theme="row.status === '1' ? 'primary' : 'danger'" variant="light">
            {{ row.status === '1' ? '正常' : '禁用' }}
          </t-tag>
        </template>
        <template #operation="{ row }">
          <t-space :size="8" break-line>
            <my-link
              v-if="row.status === '1'"
              v-hasPermi="['system:client:edit']"
              theme="danger"
              @click.stop="handleToggleStatus(row, '0')"
            >
              禁用
            </my-link>
            <my-link
              v-else
              v-hasPermi="['system:client:edit']"
              theme="primary"
              @click.stop="handleToggleStatus(row, '1')"
            >
              启用
            </my-link>
          </t-space>
        </template>
      </t-table>
    </t-space>
  </t-card>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'Client',
});
import { RefreshIcon, SearchIcon } from 'tdesign-icons-vue-next';
import type { FormInstanceFunctions, PrimaryTableCol } from 'tdesign-vue-next';
import { getCurrentInstance, onMounted, ref } from 'vue';

import type { OpcDesktopDevice } from '@/api/monitor/desktop';
import { listDesktopDevices, updateDesktopDeviceStatus } from '@/api/monitor/desktop';

const { proxy } = getCurrentInstance();

const queryRef = ref<FormInstanceFunctions>();
const deviceList = ref<OpcDesktopDevice[]>([]);
const loading = ref(false);

const queryParams = ref<{
  deviceName?: string;
  onlineFilter?: string;
}>({
  deviceName: undefined,
  onlineFilter: 'all',
});

const columns = ref<Array<PrimaryTableCol>>([
  { title: '设备名称', colKey: 'deviceName', align: 'center', ellipsis: true, minWidth: 160 },
  { title: '登录用户', colKey: 'userDisplayName', align: 'center', ellipsis: true, minWidth: 160 },
  { title: '设备信息', colKey: 'deviceInfo', align: 'center', ellipsis: true, minWidth: 180 },
  { title: '版本', colKey: 'appVersion', align: 'center', width: 100 },
  { title: 'IP', colKey: 'lastIp', align: 'center', ellipsis: true, minWidth: 120 },
  { title: '最后心跳', colKey: 'lastHeartbeatTime', align: 'center', width: 180 },
  { title: '设备在线', colKey: 'online', align: 'center', width: 100 },
  { title: '状态', colKey: 'status', align: 'center', width: 90 },
  { title: '操作', colKey: 'operation', align: 'center', width: 100, fixed: 'right' },
]);

function formatDeviceInfo(row: OpcDesktopDevice) {
  const parts = ['桌面端', row.osName, row.osVersion].filter(Boolean);
  return parts.join(' · ') || '-';
}

function getList() {
  loading.value = true;
  const onlineOnly = queryParams.value.onlineFilter === 'online' ? true : undefined;
  listDesktopDevices({
    deviceName: queryParams.value.deviceName,
    onlineOnly,
  })
    .then((res) => {
      deviceList.value = res.data || [];
    })
    .finally(() => {
      loading.value = false;
    });
}

function handleQuery() {
  getList();
}

function resetQuery() {
  queryRef.value?.reset();
  queryParams.value.deviceName = undefined;
  queryParams.value.onlineFilter = 'all';
  handleQuery();
}

function handleToggleStatus(row: OpcDesktopDevice, status: string) {
  const action = status === '0' ? '禁用' : '启用';
  proxy.$modal.confirm(`是否确认${action}设备「${row.deviceName}」?`, () => {
    return updateDesktopDeviceStatus(row.deviceId, status).then(() => {
      getList();
      proxy.$modal.msgSuccess(`${action}成功`);
    });
  });
}

onMounted(() => {
  getList();
});
</script>

<style scoped>
.user-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
}
.user-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
