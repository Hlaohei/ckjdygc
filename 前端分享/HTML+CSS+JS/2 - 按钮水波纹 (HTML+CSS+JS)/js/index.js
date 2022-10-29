// 获取到所有的 按钮 元素
const buttons = document.querySelectorAll("button");

// 循环设置每个按钮
buttons.forEach((button) => {
  // 给按钮添加 鼠标点击事件
  button.addEventListener("click", (e) => {
    /**
     * e.clientX 鼠标事件触发时，指针相对于浏览器边缘的 水平坐标
     * e.clientY 鼠标事件触发时，指针相对于浏览器边缘的 垂直坐标
     * e.pageX 相对于文档的坐标
     * e.clientX 相对于屏幕页面的坐标
     * NOTE: 注意两者区别
     *
     * e.target.offsetLeft 被点击的元素左边相对于浏览器左边的距离坐标
     * e.target.offsetTop 被点击的元素上边相对于浏览器上边的距离坐标
     *
     * 计算出鼠标点击的位置相对于按钮元素左上角原点的坐标，然后用作定位的 left top 的值
     * x = 鼠标位置距离浏览器左边缘的坐标 - 元素距离浏览器左边缘的坐标
     * y 同理，距离上边
     */
    let x = e.pageX - e.target.offsetLeft;
    let y = e.pageY - e.target.offsetTop;

    // console.log("🚀 ~ left, top", x, y);

    // 创建水波纹元素，一个 span，css写好了，就差定位的 left top
    let ripples = document.createElement("span");
    // 给元素的 left top 赋值，记得加单位 px
    ripples.style.left = x + "px";
    ripples.style.top = y + "px";

    // 把水波纹元素添加到按钮里面
    button.appendChild(ripples);

    setTimeout(() => {
      // 定时删除水波纹元素，不然就一直存在和叠加，多了之后电脑可能会冒烟
      ripples.remove();
    }, 1000);
  });
});
