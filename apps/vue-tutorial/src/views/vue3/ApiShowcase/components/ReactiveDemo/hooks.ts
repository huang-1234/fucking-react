import { ref } from 'vue'

// 用于添加新特性的输入
export const newFeature = ref('')

// 添加特性
export const handleAddFeature = (addFeature: (feature: string) => void) => {
  if (newFeature.value) {
    addFeature(newFeature.value)
    newFeature.value = ''
  }
}

// 更新全名
export const newFullName = ref('')
export const handleUpdateFullName = (updateFullName: (name: string) => void) => {
  updateFullName(newFullName.value)
}
