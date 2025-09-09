# 字符串算法集合

## 概述

字符串算法是计算机科学中的重要分支，涉及字符串匹配、解析、变换等多个方面。本模块实现了常用的字符串处理算法，特别是CSS变换解析等实际应用场景。

## 算法目录

### 1. CSS变换解析
- **路径**: `css_transform.js`
- **功能**: 解析CSS transform属性
- **应用**: 前端开发、样式处理

## 核心算法设计

### CSS Transform解析器

#### 问题描述
解析CSS transform属性字符串，提取各种变换函数及其参数。

**支持的变换函数**:
- `translate(x, y)` - 平移变换
- `translateX(x)` - X轴平移
- `translateY(y)` - Y轴平移
- `scale(x, y)` - 缩放变换
- `scaleX(x)` - X轴缩放
- `scaleY(y)` - Y轴缩放
- `rotate(angle)` - 旋转变换
- `skew(x, y)` - 倾斜变换
- `matrix(a, b, c, d, e, f)` - 矩阵变换

#### 算法设计

1. **词法分析**
```javascript
function tokenize(transformString) {
    const tokens = []
    let i = 0

    while (i < transformString.length) {
        // 跳过空白字符
        if (/\s/.test(transformString[i])) {
            i++
            continue
        }

        // 识别函数名
        if (/[a-zA-Z]/.test(transformString[i])) {
            let functionName = ''
            while (i < transformString.length && /[a-zA-Z]/.test(transformString[i])) {
                functionName += transformString[i]
                i++
            }
            tokens.push({ type: 'FUNCTION', value: functionName })
            continue
        }

        // 识别数字
        if (/[\d.-]/.test(transformString[i])) {
            let number = ''
            while (i < transformString.length && /[\d.-]/.test(transformString[i])) {
                number += transformString[i]
                i++
            }
            tokens.push({ type: 'NUMBER', value: parseFloat(number) })
            continue
        }

        // 识别单位
        if (/[a-zA-Z%]/.test(transformString[i])) {
            let unit = ''
            while (i < transformString.length && /[a-zA-Z%]/.test(transformString[i])) {
                unit += transformString[i]
                i++
            }
            tokens.push({ type: 'UNIT', value: unit })
            continue
        }

        // 识别特殊字符
        const char = transformString[i]
        if (char === '(') {
            tokens.push({ type: 'LPAREN', value: char })
        } else if (char === ')') {
            tokens.push({ type: 'RPAREN', value: char })
        } else if (char === ',') {
            tokens.push({ type: 'COMMA', value: char })
        }

        i++
    }

    return tokens
}
```

2. **语法分析**
```javascript
function parseTransform(transformString) {
    const tokens = tokenize(transformString)
    const transforms = []
    let i = 0

    while (i < tokens.length) {
        if (tokens[i].type === 'FUNCTION') {
            const functionName = tokens[i].value
            i++ // 跳过函数名

            // 期望左括号
            if (i >= tokens.length || tokens[i].type !== 'LPAREN') {
                throw new Error(`Expected '(' after function ${functionName}`)
            }
            i++ // 跳过左括号

            // 解析参数
            const args = []
            while (i < tokens.length && tokens[i].type !== 'RPAREN') {
                if (tokens[i].type === 'NUMBER') {
                    let value = tokens[i].value
                    let unit = ''

                    // 检查是否有单位
                    if (i + 1 < tokens.length && tokens[i + 1].type === 'UNIT') {
                        unit = tokens[i + 1].value
                        i++ // 跳过单位
                    }

                    args.push({ value, unit })
                } else if (tokens[i].type === 'COMMA') {
                    // 跳过逗号
                } else {
                    throw new Error(`Unexpected token: ${tokens[i].value}`)
                }
                i++
            }

            // 期望右括号
            if (i >= tokens.length || tokens[i].type !== 'RPAREN') {
                throw new Error(`Expected ')' after function arguments`)
            }
            i++ // 跳过右括号

            transforms.push({
                function: functionName,
                args: args
            })
        } else {
            i++
        }
    }

    return transforms
}
```

3. **变换矩阵计算**
```javascript
class TransformMatrix {
    constructor() {
        // 3x3变换矩阵，使用齐次坐标
        this.matrix = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ]
    }

    // 矩阵乘法
    multiply(other) {
        const result = new TransformMatrix()

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                result.matrix[i][j] = 0
                for (let k = 0; k < 3; k++) {
                    result.matrix[i][j] += this.matrix[i][k] * other.matrix[k][j]
                }
            }
        }

        return result
    }

    // 平移变换
    translate(x, y) {
        const translateMatrix = new TransformMatrix()
        translateMatrix.matrix[0][2] = x
        translateMatrix.matrix[1][2] = y

        return this.multiply(translateMatrix)
    }

    // 缩放变换
    scale(x, y) {
        const scaleMatrix = new TransformMatrix()
        scaleMatrix.matrix[0][0] = x
        scaleMatrix.matrix[1][1] = y

        return this.multiply(scaleMatrix)
    }

    // 旋转变换
    rotate(angle) {
        const rad = angle * Math.PI / 180
        const cos = Math.cos(rad)
        const sin = Math.sin(rad)

        const rotateMatrix = new TransformMatrix()
        rotateMatrix.matrix[0][0] = cos
        rotateMatrix.matrix[0][1] = -sin
        rotateMatrix.matrix[1][0] = sin
        rotateMatrix.matrix[1][1] = cos

        return this.multiply(rotateMatrix)
    }

    // 倾斜变换
    skew(x, y) {
        const radX = x * Math.PI / 180
        const radY = y * Math.PI / 180

        const skewMatrix = new TransformMatrix()
        skewMatrix.matrix[0][1] = Math.tan(radX)
        skewMatrix.matrix[1][0] = Math.tan(radY)

        return this.multiply(skewMatrix)
    }

    // 应用变换到点
    transformPoint(x, y) {
        const newX = this.matrix[0][0] * x + this.matrix[0][1] * y + this.matrix[0][2]
        const newY = this.matrix[1][0] * x + this.matrix[1][1] * y + this.matrix[1][2]

        return { x: newX, y: newY }
    }

    // 获取CSS matrix字符串
    toCSSMatrix() {
        const m = this.matrix
        return `matrix(${m[0][0]}, ${m[1][0]}, ${m[0][1]}, ${m[1][1]}, ${m[0][2]}, ${m[1][2]})`
    }
}
```

4. **完整解析器实现**
```javascript
function parseCSSTransform(transformString) {
    const transforms = parseTransform(transformString)
    let matrix = new TransformMatrix()

    for (const transform of transforms) {
        const { function: func, args } = transform

        switch (func) {
            case 'translate':
                const tx = args[0]?.value || 0
                const ty = args[1]?.value || 0
                matrix = matrix.translate(tx, ty)
                break

            case 'translateX':
                const txOnly = args[0]?.value || 0
                matrix = matrix.translate(txOnly, 0)
                break

            case 'translateY':
                const tyOnly = args[0]?.value || 0
                matrix = matrix.translate(0, tyOnly)
                break

            case 'scale':
                const sx = args[0]?.value || 1
                const sy = args[1]?.value || sx
                matrix = matrix.scale(sx, sy)
                break

            case 'scaleX':
                const sxOnly = args[0]?.value || 1
                matrix = matrix.scale(sxOnly, 1)
                break

            case 'scaleY':
                const syOnly = args[0]?.value || 1
                matrix = matrix.scale(1, syOnly)
                break

            case 'rotate':
                const angle = args[0]?.value || 0
                matrix = matrix.rotate(angle)
                break

            case 'skew':
                const skewX = args[0]?.value || 0
                const skewY = args[1]?.value || 0
                matrix = matrix.skew(skewX, skewY)
                break

            case 'matrix':
                if (args.length === 6) {
                    const customMatrix = new TransformMatrix()
                    customMatrix.matrix[0][0] = args[0].value
                    customMatrix.matrix[1][0] = args[1].value
                    customMatrix.matrix[0][1] = args[2].value
                    customMatrix.matrix[1][1] = args[3].value
                    customMatrix.matrix[0][2] = args[4].value
                    customMatrix.matrix[1][2] = args[5].value
                    matrix = matrix.multiply(customMatrix)
                }
                break

            default:
                console.warn(`Unknown transform function: ${func}`)
        }
    }

    return {
        transforms: transforms,
        matrix: matrix,
        cssMatrix: matrix.toCSSMatrix()
    }
}
```

#### 使用示例

```javascript
// 基础使用
const result = parseCSSTransform('translate(10px, 20px) rotate(45deg) scale(1.5)')

console.log(result.transforms)
// [
//   { function: 'translate', args: [{ value: 10, unit: 'px' }, { value: 20, unit: 'px' }] },
//   { function: 'rotate', args: [{ value: 45, unit: 'deg' }] },
//   { function: 'scale', args: [{ value: 1.5, unit: '' }] }
// ]

console.log(result.cssMatrix)
// matrix(1.06066, 1.06066, -1.06066, 1.06066, 10, 20)

// 应用变换到点
const point = result.matrix.transformPoint(100, 100)
console.log(point)  // { x: 110, y: 120 } (经过变换后的坐标)
```

#### 高级功能

1. **变换动画插值**
```javascript
function interpolateTransforms(from, to, progress) {
    const fromResult = parseCSSTransform(from)
    const toResult = parseCSSTransform(to)

    // 简化版本：仅处理相同类型的变换
    const interpolated = []

    for (let i = 0; i < Math.min(fromResult.transforms.length, toResult.transforms.length); i++) {
        const fromTransform = fromResult.transforms[i]
        const toTransform = toResult.transforms[i]

        if (fromTransform.function === toTransform.function) {
            const interpolatedArgs = []

            for (let j = 0; j < Math.min(fromTransform.args.length, toTransform.args.length); j++) {
                const fromValue = fromTransform.args[j].value
                const toValue = toTransform.args[j].value
                const interpolatedValue = fromValue + (toValue - fromValue) * progress

                interpolatedArgs.push({
                    value: interpolatedValue,
                    unit: fromTransform.args[j].unit
                })
            }

            interpolated.push({
                function: fromTransform.function,
                args: interpolatedArgs
            })
        }
    }

    return transformsToString(interpolated)
}

function transformsToString(transforms) {
    return transforms.map(transform => {
        const args = transform.args.map(arg => `${arg.value}${arg.unit}`).join(', ')
        return `${transform.function}(${args})`
    }).join(' ')
}
```

2. **变换优化**
```javascript
function optimizeTransforms(transformString) {
    const result = parseCSSTransform(transformString)
    const matrix = result.matrix.matrix

    // 检查是否为单位矩阵（无变换）
    if (isIdentityMatrix(matrix)) {
        return 'none'
    }

    // 检查是否仅为平移
    if (isTranslateOnly(matrix)) {
        return `translate(${matrix[0][2]}px, ${matrix[1][2]}px)`
    }

    // 检查是否仅为缩放
    if (isScaleOnly(matrix)) {
        return `scale(${matrix[0][0]}, ${matrix[1][1]})`
    }

    // 返回优化后的矩阵形式
    return result.cssMatrix
}

function isIdentityMatrix(matrix) {
    return matrix[0][0] === 1 && matrix[0][1] === 0 && matrix[0][2] === 0 &&
           matrix[1][0] === 0 && matrix[1][1] === 1 && matrix[1][2] === 0 &&
           matrix[2][0] === 0 && matrix[2][1] === 0 && matrix[2][2] === 1
}

function isTranslateOnly(matrix) {
    return matrix[0][0] === 1 && matrix[0][1] === 0 &&
           matrix[1][0] === 0 && matrix[1][1] === 1 &&
           matrix[2][0] === 0 && matrix[2][1] === 0 && matrix[2][2] === 1
}

function isScaleOnly(matrix) {
    return matrix[0][1] === 0 && matrix[0][2] === 0 &&
           matrix[1][0] === 0 && matrix[1][2] === 0 &&
           matrix[2][0] === 0 && matrix[2][1] === 0 && matrix[2][2] === 1
}
```

## 扩展算法

### 1. 字符串匹配算法

#### KMP算法
```javascript
function kmpSearch(text, pattern) {
    const lps = computeLPS(pattern)
    const matches = []
    let i = 0, j = 0

    while (i < text.length) {
        if (text[i] === pattern[j]) {
            i++
            j++
        }

        if (j === pattern.length) {
            matches.push(i - j)
            j = lps[j - 1]
        } else if (i < text.length && text[i] !== pattern[j]) {
            if (j !== 0) {
                j = lps[j - 1]
            } else {
                i++
            }
        }
    }

    return matches
}

function computeLPS(pattern) {
    const lps = new Array(pattern.length).fill(0)
    let len = 0
    let i = 1

    while (i < pattern.length) {
        if (pattern[i] === pattern[len]) {
            len++
            lps[i] = len
            i++
        } else {
            if (len !== 0) {
                len = lps[len - 1]
            } else {
                lps[i] = 0
                i++
            }
        }
    }

    return lps
}
```

### 2. 字符串编辑距离

```javascript
function editDistance(str1, str2) {
    const m = str1.length
    const n = str2.length
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0))

    // 初始化边界条件
    for (let i = 0; i <= m; i++) dp[i][0] = i
    for (let j = 0; j <= n; j++) dp[0][j] = j

    // 填充DP表
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1]
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],     // 删除
                    dp[i][j - 1],     // 插入
                    dp[i - 1][j - 1]  // 替换
                )
            }
        }
    }

    return dp[m][n]
}
```

## 测试用例

```javascript
// CSS Transform解析测试
console.log(parseCSSTransform('translate(10px, 20px)'))
console.log(parseCSSTransform('rotate(45deg) scale(2)'))
console.log(parseCSSTransform('matrix(1, 0, 0, 1, 10, 20)'))

// 字符串匹配测试
console.log(kmpSearch('ababcababa', 'ababa'))  // [5]
console.log(kmpSearch('hello world', 'world'))  // [6]

// 编辑距离测试
console.log(editDistance('kitten', 'sitting'))  // 3
console.log(editDistance('hello', 'hallo'))     // 1
```

## 应用场景

1. **前端开发**: CSS动画、变换处理
2. **文本处理**: 搜索、替换、格式化
3. **数据验证**: 格式检查、内容校验
4. **编译器**: 词法分析、语法解析
5. **生物信息学**: DNA序列比对
6. **搜索引擎**: 文本匹配、相似度计算

## 总结

字符串算法涵盖了从基础的解析到复杂的模式匹配等多个方面。CSS Transform解析器展示了如何将复杂的字符串解析问题分解为词法分析和语法分析两个阶段，这种方法可以应用到许多其他的字符串处理场景中。掌握这些算法对于处理文本数据和构建解析器具有重要意义。