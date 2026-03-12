// 1
const redRectangleCanvas = document.getElementById("redRectangleCanvas");
const redRectangleCtx = redRectangleCanvas.getContext("2d");
redRectangleCtx.fillStyle = "red";
redRectangleCtx.fillRect(50, 50, 100, 50);

// 2
const textCanvas = document.getElementById('textCanvas');
const textCtx = textCanvas.getContext('2d');
textCtx.font = '20px Arial';
textCtx.fillStyle = 'blue';
textCtx.fillText('Hallo, Welt!', 10, 30);
textCtx.fillText('Dieser Text ist zu lang für das Canvas!', 10, 100);

// 3
const imageCanvas = document.getElementById('imageCanvas');
const imageCtx = imageCanvas.getContext('2d');

function drawImageOnCanvas() {
    const img = new Image();
    img.onload = () => {
        imageCtx.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);

        imageCtx.strokeStyle = 'orange';
        imageCtx.lineWidth = 4;
        imageCtx.beginPath();
        imageCtx.moveTo(220, 0);
        imageCtx.lineTo(200, 300);
        imageCtx.stroke();

        imageCtx.strokeStyle = 'orange';
        imageCtx.lineWidth = 4;
        imageCtx.beginPath();
        imageCtx.moveTo(500, 0);
        imageCtx.lineTo(0, 300);
        imageCtx.stroke();

        imageCtx.fillStyle = 'yellow';
        imageCtx.beginPath();
        imageCtx.arc(50, 50, 30, 0, Math.PI * 2, false);
        imageCtx.fill();
    };

    img.src = '../../assets/img/Kanada1.jpg';
}

drawImageOnCanvas();

// von mdn web docs
const sun = new Image();
const moon = new Image();
const earth = new Image();
const ctx = document.getElementById("animationCanvas").getContext("2d");

function init() {
  sun.src = "../../assets/img/sun.png";
  moon.src = "../../assets/img/moon.png";
  earth.src = "../../assets/img/earth.png";
  window.requestAnimationFrame(draw);
}

function draw() {
    ctx.globalCompositeOperation = "destination-over";
    ctx.clearRect(0, 0, 300, 300); // clear canvas
  
    ctx.fillStyle = "rgb(0 0 0 / 40%)";
    ctx.strokeStyle = "rgb(0 153 255 / 40%)";
    ctx.save();
    ctx.translate(150, 150);
  
    // Earth
    const time = new Date();
    ctx.rotate(
      ((2 * Math.PI) / 60) * time.getSeconds() +
        ((2 * Math.PI) / 60000) * time.getMilliseconds(),
    );
    ctx.translate(105, 0);
    ctx.fillRect(0, -12, 100, 24); // Shadow
    ctx.drawImage(earth, -12, -12, 24, 24); // Draw Earth smaller
  
    // Moon
    ctx.save();
    ctx.rotate(
      ((2 * Math.PI) / 6) * time.getSeconds() +
        ((2 * Math.PI) / 6000) * time.getMilliseconds(),
    );
    ctx.translate(0, 28.5);
    ctx.drawImage(moon, -3.5, -3.5, 7, 7); // Draw Moon smaller
    ctx.restore();
  
    ctx.restore();
  
    ctx.beginPath();
    ctx.arc(150, 150, 105, 0, Math.PI * 2, false); // Earth orbit
    ctx.stroke();
  
    ctx.drawImage(sun, 75, 75, 150, 150); // Draw Sun smaller
  
    window.requestAnimationFrame(draw);
  }

init();