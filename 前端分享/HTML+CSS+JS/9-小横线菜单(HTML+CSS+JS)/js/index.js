// 先获取到需要的线条元素，所有 a 元素备用
const line = document.querySelector(".line");
const items = document.querySelectorAll("nav a");

/**
 * 控制线条的移动和宽度变化
 * @param {*} e
 */
function lineMotion(e) {
  line.style.left = e.offsetLeft + "px";
  line.style.width = e.offsetWidth + "px";
}

// 循环给所有 a 元素添加点击事件，触发线条移动
items.forEach((item) => {
  item.addEventListener("click", (e) => {
    lineMotion(e.target);
  });
});

// 如果想页面打开直接选中某一个
items[0].click();
