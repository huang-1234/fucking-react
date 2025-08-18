export const runtime = 'edge'; // 使用Vercel边缘计算

// 简单的代码沙盒执行函数（实际生产环境需要更安全的实现）
async function runInVm(code: string) {
  try {
    // 这里只是一个模拟实现，实际应该使用安全的沙盒环境
    return {
      success: true,
      result: '代码编译成功',
      output: '// 这是模拟的输出\n// 实际生产环境需要更安全的实现',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: '无效的代码' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 安全沙箱执行代码
    const result = await runInVm(code);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
