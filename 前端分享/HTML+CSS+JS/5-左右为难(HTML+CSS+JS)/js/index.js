// 先获取到左边盒子元素
const left = document.getElementById("left-box");

const handleMove = (e) => {
  // 给左边盒子的宽度赋值，就是宽度位置和鼠标的 X 轴位置一致就行
  left.style.width = `${(e.pageX / window.innerWidth) * 100}%`;
};

document.onmousemove = (e) => {
  // 鼠标移动时自动赋值
  handleMove(e);
};

document.ontouchmove = (e) => {
  // 手机上手指移动时自动赋值
  handleMove(e.touches[0]);
};
