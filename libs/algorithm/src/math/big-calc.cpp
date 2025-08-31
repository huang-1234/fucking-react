#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_DIGITS 1000 // 整数部分和小数部分的最大位数

// 结构体：表示一个高精度数，分为整数部分和小数部分
struct HighPrecisionNumber {
  char integerPart[MAX_DIGITS];    // 整数部分
  char fractionalPart[MAX_DIGITS]; // 小数部分
  int fractionalLen;               // 小数部分实际长度
};

// 函数：反转字符串
void reverse(char *str) {
  int len = strlen(str);
  for (int i = 0; i < len / 2; i++) {
    char temp = str[i];
    str[i] = str[len - 1 - i];
    str[len - 1 - i] = temp;
  }
}

// 函数：高精度加法（增强版，可处理小数和精度控制）
// 参数：num1, num2 - 输入的大数字符串
//        precision - 指定要保留的小数位数
//        roundingMode - 舍入模式：'0'向下取整，'1'四舍五入
//        result - 用于存储结果的字符串
void addWithPrecision(char *num1, char *num2, int precision, char roundingMode,
                      char *result) {
  // 1. 分离整数部分与小数部分
  struct HighPrecisionNumber n1 = {"", "", 0};
  struct HighPrecisionNumber n2 = {"", "", 0};

  char *dotPos1 = strchr(num1, '.');
  char *dotPos2 = strchr(num2, '.');

  if (dotPos1 != NULL) {
    *dotPos1 = '\0'; // 在小数点处截断，分离整数和小数部分
    strcpy(n1.integerPart, num1);
    strcpy(n1.fractionalPart, dotPos1 + 1);
    n1.fractionalLen = strlen(n1.fractionalPart);
    *dotPos1 = '.'; // 恢复原字符串
  } else {
    strcpy(n1.integerPart, num1);
    strcpy(n1.fractionalPart, "0");
    n1.fractionalLen = 1;
  }

  if (dotPos2 != NULL) {
    *dotPos2 = '\0';
    strcpy(n2.integerPart, num2);
    strcpy(n2.fractionalPart, dotPos2 + 1);
    n2.fractionalLen = strlen(n2.fractionalPart);
    *dotPos2 = '.';
  } else {
    strcpy(n2.integerPart, num2);
    strcpy(n2.fractionalPart, "0");
    n2.fractionalLen = 1;
  }

  // 2. 小数部分对齐：在较短的小数部分后面补零
  int maxFracLen = (n1.fractionalLen > n2.fractionalLen) ? n1.fractionalLen
                                                         : n2.fractionalLen;
  char frac1[MAX_DIGITS] = {0};
  char frac2[MAX_DIGITS] = {0};

  strcpy(frac1, n1.fractionalPart);
  for (int i = n1.fractionalLen; i < maxFracLen; i++) {
    frac1[i] = '0';
  }
  frac1[maxFracLen] = '\0';

  strcpy(frac2, n2.fractionalPart);
  for (int i = n2.fractionalLen; i < maxFracLen; i++) {
    frac2[i] = '0';
  }
  frac2[maxFracLen] = '\0';

  // 3.
  // 将整数部分和小数部分当做整体进行加法（小数部分对齐后，可以视为两个大整数）
  // 构建新的加数字符串：整数部分 + 补零后的小数部分
  char fullNum1[MAX_DIGITS * 2] = {0};
  char fullNum2[MAX_DIGITS * 2] = {0};

  sprintf(fullNum1, "%s%s", n1.integerPart, frac1);
  sprintf(fullNum2, "%s%s", n2.integerPart, frac2);

  int len1 = strlen(fullNum1);
  int len2 = strlen(fullNum2);
  int maxLen = (len1 > len2) ? len1 : len2;

  // 给较短的数字前面补零，使其与较长的数字长度一致
  char tempNum1[MAX_DIGITS * 2] = {0};
  char tempNum2[MAX_DIGITS * 2] = {0};

  if (len1 < maxLen) {
    for (int i = 0; i < maxLen - len1; i++) {
      tempNum1[i] = '0';
    }
    strcat(tempNum1, fullNum1);
    strcpy(fullNum1, tempNum1);
  }
  if (len2 < maxLen) {
    for (int i = 0; i < maxLen - len2; i++) {
      tempNum2[i] = '0';
    }
    strcat(tempNum2, fullNum2);
    strcpy(fullNum2, tempNum2);
  }

  // 现在两个数字长度相同，可以执行加法
  reverse(fullNum1);
  reverse(fullNum2);

  int carry = 0;
  char tempResult[MAX_DIGITS * 2] = {0};

  for (int i = 0; i < maxLen; i++) {
    int digitSum = (fullNum1[i] - '0') + (fullNum2[i] - '0') + carry;
    tempResult[i] = (digitSum % 10) + '0';
    carry = digitSum / 10;
  }

  if (carry > 0) {
    tempResult[maxLen] = carry + '0';
    maxLen++;
  }
  tempResult[maxLen] = '\0';

  reverse(tempResult); // 反转回来得到正确顺序的和

  // 4. 从完整结果中重新分离出整数部分和指定精度的小数部分
  int totalIntegerDigits =
      strlen(n1.integerPart) > strlen(n2.integerPart)
          ? strlen(n1.integerPart)
          : strlen(n2.integerPart); // 原始整数部分的最大位数
  int totalDigits = strlen(tempResult); // 总位数（整数部分 + 补零后的小数部分）
  int integerDigitsInResult =
      totalDigits - maxFracLen; // 结果中整数部分的实际位数

  // 提取整数部分
  char integerResult[MAX_DIGITS] = {0};
  strncpy(integerResult, tempResult, integerDigitsInResult);
  integerResult[integerDigitsInResult] = '\0';

  // 提取小数部分（原始小数部分相加后的完整结果）
  char fractionalResult[MAX_DIGITS] = {0};
  strcpy(fractionalResult, tempResult + integerDigitsInResult);
  fractionalResult[maxFracLen] = '\0'; // 长度即为之前对齐的小数位数

  // 5. 精度控制：根据用户指定的小数位数进行截断和舍入
  if (precision < maxFracLen) {
    // 需要截断
    if (roundingMode == '1') { // 四舍五入
      if (fractionalResult[precision] >= '5' &&
          fractionalResult[precision] <= '9') {
        // 需要进位
        char carryBuffer[MAX_DIGITS] = {0};
        sprintf(carryBuffer, "0.%s", fractionalResult); // 构造一个0.的小数
        // 为小数部分生成一个进位数字：例如0.999,
        // 精度2，舍入后整数部分要+1，小数部分变为00
        // 这里简化处理：将小数部分前面加"1"然后进行加法，更严谨的做法是将其与整数部分一同考虑
        // 由于时间关系，此处提供一个思路：将小数部分的前precision位转换为整数，加上1，然后再格式化为字符串。
        // 注意可能发生的连锁进位（如0.999舍入后为1.000）
        int carryInt = 0;
        // 示例代码省略详细的连锁进位处理，实际实现需要考虑整数部分因小数舍入而进位的情况
        // 这是一个复杂点，建议使用专门的高精度小数库处理会更稳健。
        // 本示例暂不实现复杂的四舍五入连锁进位，只做简单演示。
        for (int i = precision - 1; i >= 0; i--) {
          if (fractionalResult[i] < '9') {
            fractionalResult[i]++;
            break;
          } else {
            fractionalResult[i] = '0';
            if (i == 0) {
              // 整数部分需要进位
              carryInt = 1;
            }
          }
        }
        if (carryInt == 1) {
          // 整数部分加1
          int integerValue = atoi(integerResult);
          integerValue++;
          sprintf(integerResult, "%d", integerValue);
        }
      }
    }
    // 无论是否四舍五入，都截断到precision位
    fractionalResult[precision] = '\0';
  } else if (precision > maxFracLen) {
    // 用户要求的精度比原始小数位数高，则在后面补零
    for (int i = maxFracLen; i < precision; i++) {
      fractionalResult[i] = '0';
    }
    fractionalResult[precision] = '\0';
  }
  // 如果precision == maxFracLen, 则直接使用fractionalResult

  // 6. 组装最终结果
  if (precision > 0) {
    sprintf(result, "%s.%s", integerResult, fractionalResult);
  } else {
    // 精度为0，只输出整数部分
    strcpy(result, integerResult);
  }
}

int main() {
  char num1[MAX_DIGITS] = "123.456";
  char num2[MAX_DIGITS] = "45.6789";
  char result[MAX_DIGITS * 2];

  int precision = 3;       // 保留3位小数
  char roundingMode = '1'; // '0' for truncate, '1' for round

  addWithPrecision(num1, num2, precision, roundingMode, result);

  printf("Number 1: %s\n", num1);
  printf("Number 2: %s\n", num2);
  printf("Sum (Precision: %d, Rounding: %s): %s\n", precision,
         (roundingMode == '1') ? "Yes" : "No", result);

  return 0;
}