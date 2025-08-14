// 示例代码
export const optionsApiCode = `// Options API 方式
export default {
  props: {
    book: {
      type: Object,
      required: true,
      validator: value => {
        return value.title && value.year
      }
    },
    callback: {
      type: Function,
      required: true
    }
  },
  emits: {
    addBook: payload => {
      return payload && payload.bookName
    },
    removeBook: id => typeof id === 'number'
  },
  data() {
    return {
      newBookName: ''
    }
  },
  methods: {
    handleAddBook() {
      if (this.newBookName) {
        this.$emit('addBook', { bookName: this.newBookName })
        this.newBookName = ''
      }
    },
    handleCallback() {
      this.callback(1)
    }
  }
}`

export const compositionApiCode = `// Composition API 方式
<script setup lang="ts">
import { ref } from 'vue';

// 类型定义
interface Book {
  title: string;
  year: number;
}

// defineProps 和 defineEmits 的使用
const props = defineProps<{
  book: Book;
  callback: (id: number) => void;
}>()

const emit = defineEmits<{
  (e: 'addBook', payload: { bookName: string }): void;
  (e: 'removeBook', id: number): void;
}>()

// 状态
const newBookName = ref('');

// 方法
const handleAddBook = () => {
  if (newBookName.value) {
    emit('addBook', { bookName: newBookName.value });
    newBookName.value = '';
  }
}

const handleCallback = () => {
  props.callback(1);
}
</script>`
