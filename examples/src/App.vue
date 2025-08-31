<template>
  <div>
    <a-typography-title>S2R Petstore Example</a-typography-title>
    
    <a-space>
      <a-button @click="loadPets">加载宠物</a-button>
      <a-select v-model:value="selectedStatus" @change="loadPetsByStatus">
        <a-select-option value="available">可用</a-select-option>
        <a-select-option value="pending">待定</a-select-option>
        <a-select-option value="sold">已售</a-select-option>
      </a-select>
    </a-space>
    
    <a-table :columns="columns" :data-source="pets" row-key="id" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { petPost, petFindByStatusGet } from './service'
import type { Pet } from './service/types'

const pets = ref<Pet[]>([])
const selectedStatus = ref<string>('available')
const newPet = ref<Partial<Pet>>({
  name: '',
  status: 'available'
})

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '状态', dataIndex: 'status', key: 'status' }
]

const loadPets = async () => {
  const response = await petFindByStatusGet({ status: 'pending' })
  pets.value = Array.isArray(response) ? response : []
}

const loadPetsByStatus = async () => {
  const response = await petFindByStatusGet({ status: selectedStatus.value })
  pets.value = Array.isArray(response) ? response : []
}

onMounted(() => {
  loadPets()
})
</script>

<style scoped>
.ant-space {
  margin-bottom: 16px;
}
</style>