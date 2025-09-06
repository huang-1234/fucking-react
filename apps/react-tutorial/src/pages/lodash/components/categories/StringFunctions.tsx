import React from 'react';
import FunctionCard from '../FunctionCard';
import { camelCase, capitalize, escape, kebabCase, lowerCase, pad, repeat, replace, split, template, trim, upperCase } from 'lodash-es';

const StringFunctions: React.FC = () => {
  return (
    <div className="string-functions">
      <h2 className="category-title">字符串操作函数</h2>
      <p>Lodash 提供了丰富的字符串处理函数，用于转换、格式化和操作字符串。</p>

      <FunctionCard
        name="_.camelCase"
        signature="_.camelCase([string=''])"
        description="转换字符串为驼峰写法，移除非字母和非数字的字符，并将空格、连字符和下划线替换为驼峰写法。"
        code={`import { camelCase } from 'lodash-es';

const result1 = camelCase('Foo Bar');
// => 'fooBar'

const result2 = camelCase('--foo-bar--');
// => 'fooBar'

const result3 = camelCase('__FOO_BAR__');
// => 'fooBar'`}
        result={camelCase('--foo-bar--')}
      />

      <FunctionCard
        name="_.capitalize"
        signature="_.capitalize([string=''])"
        description="将字符串的第一个字符转换为大写，其余字符转换为小写。"
        code={`import { capitalize } from 'lodash-es';

const result = capitalize('FRED');
// => 'Fred'`}
        result={capitalize('FRED')}
      />

      <FunctionCard
        name="_.escape"
        signature="_.escape([string=''])"
        description={`转义字符串中的 HTML 实体字符。将 &, <, >, \", ' 转换为对应的 HTML 实体。`}
        code={`import { escape } from 'lodash-es';

const result = escape('fred, barney, & pebbles');
// => 'fred, barney, &amp; pebbles'`}
        result={escape('fred, barney, & pebbles')}
      />

      <FunctionCard
        name="_.kebabCase"
        signature="_.kebabCase([string=''])"
        description="转换字符串为短横线分隔写法，移除非字母和非数字的字符，并将空格和下划线替换为短横线。"
        code={`import { kebabCase } from 'lodash-es';
const result1 = kebabCase('Foo Bar');
// => 'foo-bar'
const result2 = kebabCase('fooBar');
// => 'foo-bar'
const result3 = kebabCase('__FOO_BAR__');
// => 'foo-bar'`}
        result={kebabCase('fooBar')}
      />

      <FunctionCard
        name="_.lowerCase"
        signature="_.lowerCase([string=''])"
        description="转换字符串为空格分隔的小写单词。"
        code={`import { lowerCase } from 'lodash-es';

const result1 = lowerCase('--Foo-Bar--');
// => 'foo bar'

const result2 = lowerCase('fooBar');
// => 'foo bar'

const result3 = lowerCase('__FOO_BAR__');
// => 'foo bar'`}
        result={lowerCase('fooBar')}
      />

      <FunctionCard
        name="_.pad"
        signature="_.pad([string=''], [length=0], [chars=' '])"
        description="如果字符串长度小于 length，则从字符串两端填充字符。如果无法均匀分配，则将多余的填充添加到字符串的右侧。"
        code={`import { pad } from 'lodash-es';

const result1 = pad('abc', 8);
// => '  abc   '

const result2 = pad('abc', 8, '_-');
// => '_-abc_-_'

const result3 = pad('abc', 3);
// => 'abc'`}
        result={pad('abc', 8, '_-')}
      />

      <FunctionCard
        name="_.repeat"
        signature="_.repeat([string=''], [n=1])"
        description="重复给定的字符串 n 次。"
        code={`import { repeat } from 'lodash-es';

const result1 = repeat('*', 3);
// => '***'

const result2 = repeat('abc', 2);
// => 'abcabc'

const result3 = repeat('abc', 0);
// => ''`}
        result={repeat('*', 5)}
      />

      <FunctionCard
        name="_.replace"
        signature="_.replace([string=''], pattern, replacement)"
        description="替换字符串中匹配的 pattern 为给定的 replacement。"
        code={`import { replace } from 'lodash-es';

const result = replace('Hi Fred', 'Fred', 'Barney');
// => 'Hi Barney'`}
        result={replace('Hi Fred', 'Fred', 'Barney')}
      />

      <FunctionCard
        name="_.split"
        signature="_.split([string=''], separator, [limit])"
        description="根据分隔符拆分字符串为数组。"
        code={`import { split } from 'lodash-es';

const result1 = split('a-b-c', '-');
// => ['a', 'b', 'c']

const result2 = split('a-b-c', '-', 2);
// => ['a', 'b']`}
        result={split('a-b-c', '-', 2)}
      />

      <FunctionCard
        name="_.template"
        signature="_.template([string=''], [options={}])"
        description="创建一个预编译模板函数，可以插入数据到模板中。"
        code={`import { template } from 'lodash-es';

// 基本插值
const compiled = template('hello <%= user %>!');
const result1 = compiled({ 'user': 'fred' });
// => 'hello fred!'

// 使用 ES 分隔符
const compiled2 = template('<b>\\${'TEXT'}</b>');
const result2 = compiled2({ 'text': 'Hello' });
// => '<b>Hello</b>'

// 使用自定义分隔符
const compiled3 = template('hello {{user}}!', { 'interpolate': /{{([\\s\\S]+?)}}/g });
const result3 = compiled3({ 'user': 'mustache' });
// => 'hello mustache!'`}
        result={template('hello <%= user %>!')({ 'user': 'fred' })}
      />

      <FunctionCard
        name="_.trim"
        signature="_.trim([string=''], [chars=whitespace])"
        description="从字符串中移除前导和尾随的空白字符或指定的字符。"
        code={`import { trim } from 'lodash-es';

const result1 = trim('  abc  ');
// => 'abc'

const result2 = trim('-_-abc-_-', '_-');
// => 'abc'`}
        result={trim('-_-abc-_-', '_-')}
      />

      <FunctionCard
        name="_.upperCase"
        signature="_.upperCase([string=''])"
        description="转换字符串为空格分隔的大写单词。"
        code={`import { upperCase } from 'lodash-es';

const result1 = upperCase('--foo-bar');
// => 'FOO BAR'

const result2 = upperCase('fooBar');
// => 'FOO BAR'

const result3 = upperCase('__foo_bar__');
// => 'FOO BAR'`}
        result={upperCase('fooBar')}
      />
    </div>
  );
};

export default StringFunctions;
