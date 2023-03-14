/**
 * 先定义好每个数字亮起的位置关系
 *
 * -- 00 --
 * 11 -- 22
 * -- 33 --
 * 44 -- 55
 * -- 66 --
 */
const numbers = [
  [1, 1, 1, 0, 1, 1, 1], // 0
  [0, 0, 1, 0, 0, 1, 0], // 1
  [1, 0, 1, 1, 1, 0, 1], // 2
  [1, 0, 1, 1, 0, 1, 1], // 3
  [0, 1, 1, 1, 0, 1, 0], // 4
  [1, 1, 0, 1, 0, 1, 1], // 5
  [1, 1, 0, 1, 1, 1, 1], // 6
  [1, 0, 1, 0, 0, 1, 0], // 7
  [1, 1, 1, 1, 1, 1, 1], // 8
  [1, 1, 1, 1, 0, 1, 1], // 9
];

/**
 * 获取到所有的单个数字元素并按顺序放好
 */
const numbersEls = [];
document.querySelectorAll(".number").forEach((numberEl) => {
  // 把获取到的单个数字的子元素按顺序存到外面的数组中
  numbersEls.push(Array.from(numberEl.children));
});

/**
 * 获取时分秒对应数字 22:12:15 => [2, 2, 1, 2, 2, 5]
 * @returns [h, h, m, m, s, s]
 */
function getTimeNumbers() {
  const time = new Date();

  return [
    splitNumbers(time.getHours()),
    splitNumbers(time.getMinutes()),
    splitNumbers(time.getSeconds()),
  ].flat();
}

/**
 * 拆分数字，把两位数的时间拆成一个数组中的两个单独的数字，十位数不够时补 0
 * @param {*} n 12
 * @returns [1, 2]
 */
function splitNumbers(n) {
  return [Math.floor(n / 10), n % 10];
}

/**
 * 点亮对应数字的操作
 * 循环套娃
 */
function timeFun() {
  // 1. 先获取到时分秒每一位的数字
  // 22:12:15 => [2, 2, 1, 2, 2, 5]
  const timeNumbers = getTimeNumbers();

  // 2. 第一个循环，以时分秒总共 6位数 为基础
  timeNumbers.forEach((timeNumber, timeNumberIndex) => {
    // 3. 按照时分秒的数字顺序，获取到单个数字下的 7个LED子元素
    const numbersEl = numbersEls[timeNumberIndex];

    // 4. 第二个循环，点亮对应数字的 led
    numbersEl.forEach((numberEl, numberElIndex) => {
      // numbers[ 6 ][ - ] 数字 6 亮起的位置关系
      if (numbers[timeNumber][numberElIndex]) {
        // 符合亮起条件就添加 active 类名
        numberEl.className = "active";
      } else {
        numberEl.className = "";
      }
    });
  });
}

// 刚打开页面就先运行一次点亮 LED
timeFun();
// 之后每隔 1s 都要重复执行一次，刷新时间并点亮对应的数字
setInterval(timeFun, 1000);
