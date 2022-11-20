/**
 * 自动填充文字部分
 */
/**
 * 获取 url 参数
 * @param {*} variable 传入 key
 * @returns 有值就返回值，没有就返回 false
 */
const getQueryVariable = (variable) => {
  let query = window.location.search.substring(1);
  let vars = query.split("&");
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split("=");
    if (pair[0] == variable) {
      return decodeURI(pair[1]);
    }
  }
  return false;
};
/**
 * 将 url 地址中的 t 参数放入文字显示区域
 */
((text) => {
  let t = getQueryVariable("t");
  if (t) {
    text.innerHTML = t;
  }
})(document.querySelector("#text"));

/**
 * 下面全是 爱心代码部分
 */
const settings = {
  length: 5200, // 最大颗粒数量
  duration: 4, // 粒子持续时间
  velocity: 80, // 粒子速度
  effect: -1.3, // 超出部分
  size: 8, // 粒子大小 （像素）
  color: "#ee3e3e", // 颜色
};

/**
 * Point
 */
const Point = (() => {
  function Point(x, y) {
    this.x = typeof x !== "undefined" ? x : 0;
    this.y = typeof y !== "undefined" ? y : 0;
  }

  Point.prototype.clone = function () {
    return new Point(this.x, this.y);
  };

  Point.prototype.length = function (length) {
    if (typeof length == "undefined") {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    this.normalize();
    this.x *= length;
    this.y *= length;
    return this;
  };

  Point.prototype.normalize = function () {
    let length = this.length();
    this.x /= length;
    this.y /= length;
    return this;
  };

  return Point;
})();

/**
 * Particle 粒子
 */
const Particle = (() => {
  function Particle() {
    this.position = new Point();
    this.velocity = new Point();
    this.acceleration = new Point();
    this.age = 0;
  }

  Particle.prototype.initialize = function (x, y, dx, dy) {
    this.position.x = x;
    this.position.y = y;
    this.velocity.x = dx;
    this.velocity.y = dy;
    this.acceleration.x = dx * settings.effect;
    this.acceleration.y = dy * settings.effect;
    this.age = 0;
  };

  Particle.prototype.update = function (deltaTime) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.velocity.x += this.acceleration.x * deltaTime;
    this.velocity.y += this.acceleration.y * deltaTime;
    this.age += deltaTime;
  };

  Particle.prototype.draw = function (context, image) {
    function ease(t) {
      return --t * t * t + 1;
    }
    let size = image.width * ease(this.age / settings.duration);
    context.globalAlpha = 1 - this.age / settings.duration;
    context.drawImage(
      image,
      this.position.x - size / 2,
      this.position.y - size / 2,
      size,
      size
    );
  };

  return Particle;
})();

/**
 * ParticlePool 粒子池
 */
const ParticlePool = (() => {
  let particles,
    firstActive = 0,
    firstFree = 0,
    duration = settings.duration;

  function ParticlePool(length) {
    // 创建和填充粒子池
    particles = new Array(length);
    for (var i = 0; i < particles.length; i++) particles[i] = new Particle();
  }

  ParticlePool.prototype.add = function (x, y, dx, dy) {
    particles[firstFree].initialize(x, y, dx, dy);

    // 处理循环队列
    firstFree++;
    if (firstFree == particles.length) firstFree = 0;
    if (firstActive == firstFree) firstActive++;
    if (firstActive == particles.length) firstActive = 0;
  };

  ParticlePool.prototype.update = function (deltaTime) {
    let i;

    // 更新活动粒子
    if (firstActive < firstFree) {
      for (i = firstActive; i < firstFree; i++) particles[i].update(deltaTime);
    }
    if (firstFree < firstActive) {
      for (i = firstActive; i < particles.length; i++)
        particles[i].update(deltaTime);
      for (i = 0; i < firstFree; i++) particles[i].update(deltaTime);
    }

    // 删除不活跃的粒子
    while (particles[firstActive].age >= duration && firstActive != firstFree) {
      firstActive++;
      if (firstActive == particles.length) firstActive = 0;
    }
  };

  ParticlePool.prototype.draw = function (context, image) {
    // 画出活动粒子
    if (firstActive < firstFree) {
      for (i = firstActive; i < firstFree; i++)
        particles[i].draw(context, image);
    }
    if (firstFree < firstActive) {
      for (i = firstActive; i < particles.length; i++)
        particles[i].draw(context, image);
      for (i = 0; i < firstFree; i++) particles[i].draw(context, image);
    }
  };

  return ParticlePool;
})();

/**
 * 绘制爱心
 */
((canvas) => {
  let context = canvas.getContext("2d");
  let particles = new ParticlePool(settings.length);
  let particleRate = settings.length / settings.duration; // 粒子/秒
  let time;

  // 画出心对应的点 -PI <= t <= PI
  function pointOnHeart(t) {
    return new Point(
      160 * Math.pow(Math.sin(t), 3),
      130 * Math.cos(t) -
        50 * Math.cos(2 * t) -
        20 * Math.cos(3 * t) -
        10 * Math.cos(4 * t) +
        25
    );
  }

  // 使用虚拟画布创建粒子图像
  const image = (function () {
    let canvas = document.createElement("canvas"),
      context = canvas.getContext("2d");
    canvas.width = settings.size;
    canvas.height = settings.size;

    // 创建路径
    function to(t) {
      let point = pointOnHeart(t);
      point.x = settings.size / 2 + (point.x * settings.size) / 350;
      point.y = settings.size / 2 - (point.y * settings.size) / 350;
      return point;
    }
    // 创建路径
    context.beginPath();
    let t = -Math.PI;
    let point = to(t);

    context.moveTo(point.x, point.y);
    while (t < Math.PI) {
      t += 0.01; // 帧步数
      point = to(t);
      context.lineTo(point.x, point.y);
    }
    context.closePath();
    // 创建填充颜色
    context.fillStyle = settings.color;
    context.fill();
    // 创建图像
    let image = new Image();
    image.src = canvas.toDataURL();
    return image;
  })();

  // 渲染
  function render() {
    // 下一个动画帧
    requestAnimationFrame(render);

    // 更新时间
    let newTime = new Date().getTime() / 1000;
    let deltaTime = newTime - (time || newTime);
    time = newTime;

    // 清理画布
    context.clearRect(0, 0, canvas.width, canvas.height);

    // 创建新的粒子
    var amount = particleRate * deltaTime;
    for (var i = 0; i < amount; i++) {
      var pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());
      var dir = pos.clone().length(settings.velocity);
      particles.add(
        canvas.width / 2 + pos.x,
        canvas.height / 2 - pos.y,
        dir.x,
        -dir.y
      );
    }

    // 更新和绘制粒子
    particles.update(deltaTime);
    particles.draw(context, image);
  }

  // 重绘画布的大小
  function onResize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  window.onresize = onResize;

  // 延迟渲染
  setTimeout(function () {
    onResize();
    render();
  }, 10);
})(document.getElementById("heart"));
