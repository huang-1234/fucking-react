import { ref } from 'vue'

// 状态
export const newBookName = ref('')

// 方法
export const handleAddBook = (emit: any) => {
  if (newBookName.value) {
    emit('addBook', { bookName: newBookName.value })
    newBookName.value = ''
  }
}

export const handleCallback = (callback: (id: number) => void) => {
  callback(1)
}
