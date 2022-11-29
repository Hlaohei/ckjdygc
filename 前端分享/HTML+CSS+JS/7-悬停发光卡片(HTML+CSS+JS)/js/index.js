/**
 * 发光点移动的操作
 * @param {*} e
 */
function move(e) {
  // 先获取所有的卡片元素
  let cards = document.querySelectorAll(".card");

  // 循环设置每个卡片元素
  cards.forEach((card) => {
    // 每个卡片渐变圆的 圆心位置
    let x = e.clientX - card.getBoundingClientRect().left;
    let y = e.clientY - card.getBoundingClientRect().top;

    // 设置每个发光点圆心的位置
    // 给卡片元素统一添加各自的 css 变量，并在 css 中配合使用
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  });
}

// 鼠标在卡片显示区域移动时进行位置设置
document.querySelector(".cards").onmousemove = (e) => {
  move(e);
};

// 手指在卡片显示区域移动时进行位置设置，但看不出效果，还是要电脑好看一些
document.querySelector(".cards").ontouchmove = (e) => {
  move(e.touches[0]);
};
