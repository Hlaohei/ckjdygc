/**
 * eyeball 设置两个眼睛的旋转值
 */
function eyeball() {
  // 获取两只眼睛的元素
  const eyes = document.querySelectorAll(".eye");

  // 简单循环一下，分别设置两个眼睛
  eyes.forEach((eye) => {
    /**
     * eye.getBoundingClientRect().left 元素盒子距离窗口 左边距离
     * eye.getBoundingClientRect().top 元素盒子距离窗口 上边距离
     *
     * eye.clientWidth 元素内部的宽度
     * eye.clientHeight 元素内部的高度
     *
     * 眼睛中心 x 坐标 = 眼睛左边距离窗口左边距离 + 眼睛宽度的一半
     * 眼睛中心 y 坐标 = 眼睛上边距离窗口上边距离 + 眼睛高度的一半
     */
    let x = eye.getBoundingClientRect().left + eye.clientWidth / 2;
    let y = eye.getBoundingClientRect().top + eye.clientHeight / 2;
    // (x, y) 就是眼睛中心点的 x y 坐标，会有一点偏差，无伤大雅

    // 鼠标事件返回的值，有很多，只要坐标
    const event = window.event;

    /**
     * event.pageX 鼠标 x 坐标
     * event.pageY 鼠标 y 坐标
     *
     * Math.atan2(y,x)
     * 返回从原点(0,0)到(x,y)点的线段与 x 轴正方向之间的平面角度(弧度值)
     */
    let radian = Math.atan2(event.pageY - y, event.pageX - x);
    // console.log("🚀 ~ 弧度", radian);
    // 弧度转角度，数学问题不细说 🚧
    let rotation = radian * (180 / Math.PI) + 180;
    // console.log("🚀 ~ 旋转角度", rotation);

    // 最后把算出来的旋转角度赋值给眼睛元素的 css 进行旋转
    eye.style.transform = `rotate(${rotation}deg)`;

    // console.log("-----------------");
  });
}

// 监听鼠标事件，执行旋转动作
document.querySelector("body").addEventListener("mousemove", eyeball);
