/**
 * 流处理工具
 * 用于处理React流式渲染
 */
import { Readable, Transform, TransformCallback } from 'stream';

/**
 * 将字符串转换为可读流
 */
export function stringToStream(content: string): Readable {
  const stream = new Readable();
  stream.push(content);
  stream.push(null);
  return stream;
}

/**
 * 创建HTML模板流
 * @param template HTML模板字符串，使用<!--ssr-outlet-->作为占位符
 * @param contentStream 内容流
 * @returns 完整的HTML流
 */
export function createTemplateStream(template: string, contentStream: Readable): Readable {
  const [before, after] = template.split('<!--ssr-outlet-->');

  // 创建前半部分流
  const beforeStream = stringToStream(before);

  // 创建后半部分流
  const afterStream = stringToStream(after);

  // 连接流
  return Readable.from(async function* () {
    // 输出前半部分
    for await (const chunk of beforeStream) {
      yield chunk;
    }

    // 输出内容
    for await (const chunk of contentStream) {
      yield chunk;
    }

    // 输出后半部分
    for await (const chunk of afterStream) {
      yield chunk;
    }
  }());
}

/**
 * 创建注入状态的转换流
 * @param state 要注入的状态对象
 */
export function createStateInjector(state: object): Transform {
  const stateScript = `<script>window.__PRELOADED_STATE__ = ${JSON.stringify(state).replace(/</g, '\\u003c')}</script>`;
  let injected = false;

  return new Transform({
    transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback) {
      let data = chunk.toString();

      // 在</body>前注入状态
      if (!injected && data.includes('</body>')) {
        data = data.replace('</body>', `${stateScript}</body>`);
        injected = true;
      }

      callback(null, data);
    }
  });
}

/**
 * 创建注入头部信息的转换流
 * @param head 头部信息对象
 */
export interface HeadInfo {
  title?: string;
  meta?: string;
  links?: string;
  scripts?: string;
}

export function createHeadInjector(head: HeadInfo): Transform {
  let injected = false;

  return new Transform({
    transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback) {
      let data = chunk.toString();

      // 在</head>前注入头部信息
      if (!injected && data.includes('</head>')) {
        let injection = '';
        if (head.title) {
          injection += `<title>${head.title}</title>`;
        }
        if (head.meta) {
          injection += head.meta;
        }
        if (head.links) {
          injection += head.links;
        }
        if (head.scripts) {
          injection += head.scripts;
        }

        data = data.replace('</head>', `${injection}</head>`);
        injected = true;
      }

      callback(null, data);
    }
  });
}