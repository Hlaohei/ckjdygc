(function () {
  var regular_stars = [],
    falling_star;

  var R = Math.PI / 5;
  var G = 1.3;
  var TOTAL = 25;
  var SIZE = 3.5;
  var CURVE = 0.25;
  var ENERGY = 0.01;
  var FALLING_CHANCE = 0.2;

  var canvas = document.querySelector("#overlay-bg");
  var cx = canvas.getContext("2d");
  resizeViewport();

  function Star() {
    this.r = Math.random() * SIZE * SIZE + SIZE;
    this.rp = Math.PI / Math.random();
    this.rd = Math.random() * 2 - 1;
    this.c = Math.random() * (CURVE * 2 - CURVE) + CURVE;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.e = 0;
    this.d = false;
  }

  function FallingStar() {
    Star.call(this);
    this.y = (Math.random() * canvas.height) / 2;
    this.r = Math.random() * SIZE * SIZE + SIZE * 3;
    this.falling = false;
  }

  function setShape(p) {
    var o = p.o;
    cx.save();
    cx.beginPath();
    cx.translate(o.x, o.y);
    cx.rotate(o.rp);
    o.rp += o.rd * 0.01;
    cx.moveTo(0, 0 - o.r);
    for (var i = 0; i < 5; i++) {
      cx.rotate(R);
      cx.lineTo(0, 0 - o.r * o.c);
      cx.rotate(R);
      cx.lineTo(0, 0 - o.r);
    }
  }

  function drawShape() {
    cx.stroke();
    cx.fill();
    cx.restore();
  }

  Star.prototype.shine = function () {
    this.d ? (this.e -= (ENERGY * this.r) / 50) : (this.e += ENERGY);
    if (this.e > 1 - ENERGY && this.d === false) {
      this.d = true;
    }
    setShape({
      o: this,
    });
    cx.strokeStyle = "rgba(255, 209, 143, " + this.e + ")";
    cx.shadowColor = "rgba(255, 209, 143, " + this.e + ")";
    cx.fillStyle = "rgba(255, 209, 143, " + this.e + ")";
    cx.lineWidth = this.c * 2;
    cx.shadowBlur = this.r / SIZE;
    cx.shadowOffsetX = 0;
    cx.shadowOffsetY = 0;
    drawShape();
  };

  FallingStar.prototype.shine = function () {
    this.d ? (this.e -= (ENERGY * this.r) / 25) : (this.e += ENERGY * 5);
    if (this.e > 1 - ENERGY && this.d === false) {
      this.d = true;
    }
    setShape({
      o: this,
    });
    cx.strokeStyle = "rgba(221, 19, 255, " + this.e * 2 + ")";
    cx.shadowColor = "rgba(221, 19, 255, " + this.e * 2 + ")";
    cx.fillStyle = "rgba(221, 19, 255, " + this.e * 2 + ")";
    cx.lineWidth = this.c * 2;
    cx.shadowBlur = 50;
    cx.shadowOffsetX = 0;
    cx.shadowOffsetY = 0;
    drawShape();
  };

  FallingStar.prototype.fall = function () {
    this.e -= ENERGY * 0.5;
    this.r -= this.r * ENERGY;
    cx.save();
    cx.translate(this.x + this.vx, this.y + this.vy);
    cx.scale(1, Math.pow(this.e, 2));
    cx.beginPath();
    cx.rotate(this.rp);
    this.rp += 0.1;
    cx.moveTo(0, 0 - this.r);
    for (var i = 0; i < 5; i++) {
      cx.rotate(R);
      cx.lineTo(0, 0 - this.r * this.c);
      cx.rotate(R);
      cx.lineTo(0, 0 - this.r);
    }
    this.vx += this.vx;
    this.vy += this.vy * G;
    cx.strokeStyle = "rgba(255, 210, 93, " + 1 / this.e + ")";
    cx.shadowColor = "rgba(255, 210, 93, " + 1 / this.e + ")";
    cx.fillStyle = "rgba(255, 210, 93, " + 1 / this.e + ")";
    cx.shadowBlur = 100;
    drawShape();
  };

  function redrawWorld() {
    resizeViewport();
    cx.clearRect(0, 0, canvas.width, canvas.height);
    if (regular_stars.length < TOTAL) regular_stars.push(new Star());
    for (var i = 0; i < regular_stars.length; i++) {
      regular_stars[i].shine();
      if (regular_stars[i].d === true && regular_stars[i].e < 0) {
        regular_stars.splice(i, 1);
      }
    }
    if (!falling_star && FALLING_CHANCE > Math.random()) {
      falling_star = new FallingStar();
    }
    if (falling_star) {
      falling_star.falling ? falling_star.fall() : falling_star.shine();
      if (falling_star.e < ENERGY) {
        falling_star = null;
      }
    }
    requestAnimationFrame(redrawWorld, canvas);
  }

  function resizeViewport() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function mouseMove(e) {
    if (falling_star) {
      if (
        e.clientX > falling_star.x - 2 * falling_star.r &&
        e.clientX < falling_star.x + 2 * falling_star.r &&
        e.clientY > falling_star.y - 2 * falling_star.r &&
        e.clientY < falling_star.y + 2 * falling_star.r
      ) {
        if (!falling_star.falling) {
          falling_star.falling = true;
          falling_star.e = 1;
          falling_star.r *= 2;
          falling_star.vy = 0.001;
          if (e.clientX > canvas.width / 2) {
            falling_star.vx = -(Math.random() * 0.01 + 0.01);
          } else {
            falling_star.vx = Math.random() * 0.01 + 0.01;
          }
        }
      }
    }
  }

  document.addEventListener("resize", resizeViewport, false);
  canvas.addEventListener("mousemove", mouseMove, false);
  canvas.addEventListener("touchstart", mouseMove, false);
  redrawWorld();
})();
