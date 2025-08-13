  // useFormState代码示例
  const codeuseFormState = `// React 19中的useFormState Hook
import { useFormState } from 'react';

// 服务器端操作函数
async function createUser(prevState, formData) {
  'use server'; // 标记为服务器操作

  const username = formData.get('username');
  const email = formData.get('email');

  // 验证
  if (username.length < 3) {
    return { error: '用户名至少需要3个字符' };
  }

  // 处理表单提交
  try {
    await db.users.create({ username, email });
    return { success: true };
  } catch (error) {
    return { error: '创建用户失败' };
  }
}

// 客户端组件
function SignupForm() {
  // 使用useFormState连接表单和服务器操作
  const [state, formAction] = useFormState(createUser, {});

  return (
    <form action={formAction}>
      {state.error && <p className="error">{state.error}</p>}
      {state.success && <p className="success">用户创建成功!</p>}

      <input name="username" placeholder="用户名" />
      <input name="email" type="email" placeholder="邮箱" />
      <button type="submit">创建用户</button>
    </form>
  );
}`;

  // 传统表单处理代码示例
  const traditionalFormCode = `// 传统的React表单处理
import { useState, useEffect, useMemo } from 'react';
import { debounce } from 'lodash-es';

function SignupForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 使用debounce防抖处理用户名输入
  const debouncedSetUsername = useMemo(
    () => debounce((value) => setUsername(value), 300),
    []
  );

  // 使用debounce防抖处理邮箱输入
  const debouncedSetEmail = useMemo(
    () => debounce((value) => setEmail(value), 300),
    []
  );

  // 组件卸载时取消防抖函数的执行
  useEffect(() => {
    return () => {
      debouncedSetUsername.cancel();
      debouncedSetEmail.cancel();
    };
  }, [debouncedSetUsername, debouncedSetEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // 客户端验证
    if (username.length < 3) {
      setError('用户名至少需要3个字符');
      return;
    }

    // 提交表单
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '创建用户失败');
      }

      setSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">用户创建成功!</p>}

      <input
        value={username}
        onChange={(e) => debouncedSetUsername(e.target.value)}
        placeholder="用户名"
      />
      <input
        value={email}
        onChange={(e) => debouncedSetEmail(e.target.value)}
        type="email"
        placeholder="邮箱"
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '提交中...' : '创建用户'}
      </button>
    </form>
  );
}`;

export {
  codeuseFormState,
  traditionalFormCode
}