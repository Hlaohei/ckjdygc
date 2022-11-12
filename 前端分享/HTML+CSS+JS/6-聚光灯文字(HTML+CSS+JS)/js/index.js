// 添加鼠标移动事件并完成操作
document.body.addEventListener("mousemove", (e) => {
  move(e);
});
// 添加手机端手指移动事件
document.body.addEventListener("touchmove", (e) => {
  move(e.touches[0]);
});

/**
 * 统一做移动的操作
 *
 * @param {*} e 鼠标事件传回的值
 */
const move = (e) => {
  // 获取到鼠标的 x,y 坐标
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  // 获取自定义鼠标的盒子
  const cursor = document.querySelector(".cursor");
  // 把鼠标的坐标赋值给自定义鼠标盒子，这样成为了新的鼠标
  cursor.style.top = mouseY + "px";
  cursor.style.left = mouseX + "px";

  // 获取所有圆圈
  const shapes = document.querySelectorAll(".shape");
  shapes.forEach((shape) => {
    // 循环设置每个圆的位置，同样是鼠标位置
    shape.style.top = mouseY + "px";
    shape.style.left = mouseX + "px";
  });
};
