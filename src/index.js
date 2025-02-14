const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

const $input = document.querySelector("#input");
const $answer = document.querySelector("#answer");

const answers = [
  "아무것도 하지 마.",
  "안 돼.",
  "언젠가는.",
  "다시 시도해 봐.",
  "그러지 마.",
  "좋은 생각이야!",
  "별로야.",
  "전혀 몰라.",
  "아마도.",
  "절대 안 돼.",
  "그건 알 수 없어.",
  "할 수 있어!",
  "포기해.",
  "운명에 맡겨.",
  "조용히 해.",
  "그럼!",
  "기다려 봐.",
  "말도 안 돼.",
  "넌 아직 준비가 안 됐어.",
  "그건 비밀이야.",
];

let isDragging = false;
let hasDragged = false;
let isDisabled = false;

const INIT_X = 260;
const INIT_Y = 295;

let mouseX = INIT_X;
let mouseY = INIT_Y;

const initPosition = { x: INIT_X, y: INIT_Y };
const maxLength = 200;
const returnSpeed = 0.05;

const outerRadius = 20;
const innerRadius = 5;

// 📌 공통 이벤트 좌표 가져오기 (모바일/데스크탑)
function getEventPosition(event) {
  if (event.touches) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }
  return {
    x: event.clientX,
    y: event.clientY,
  };
}

function askRandomAnswer() {
  const randomAnswer = Math.floor(Math.random() * answers.length);
  return answers[randomAnswer];
}

function isInsideClick(x, y) {
  const validRadius = Math.sqrt((x - mouseX) ** 2 + (y - mouseY) ** 2);
  return validRadius >= innerRadius && validRadius <= outerRadius;
}

function drawLineAndCircle(x, y) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "lightgray";
  ctx.beginPath();
  ctx.moveTo(initPosition.x, initPosition.y);
  ctx.lineTo(x, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, outerRadius, 0, Math.PI * 2);
  ctx.fillStyle = "lightgray";
  ctx.fill();
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(x, y, innerRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";

  ctx.beginPath();
  ctx.arc(x, y, innerRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function setTimeoutPromise(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function animate() {
  if (!isDragging) {
    mouseX += (initPosition.x - mouseX) * returnSpeed;
    mouseY += (initPosition.y - mouseY) * returnSpeed;
  }
  drawLineAndCircle(mouseX, mouseY);
  requestAnimationFrame(animate);
}

// 📌 드래그 시작 (마우스 & 터치)
function startDrag(event) {
  if (isDisabled) return;
  const rect = canvas.getBoundingClientRect();
  const { x, y } = getEventPosition(event);
  const clickX = x - rect.left;
  const clickY = y - rect.top;

  if (isInsideClick(clickX, clickY)) {
    isDragging = true;
    hasDragged = false;
  }
}

// 📌 드래그 중 (마우스 & 터치)
function dragging(event) {
  if (isDragging) {
    hasDragged = true;
    const rect = canvas.getBoundingClientRect();
    const { x, y } = getEventPosition(event);
    let clickX = x - rect.left;
    let clickY = y - rect.top;

    const distanceX = clickX - initPosition.x;
    const distanceY = clickY - initPosition.y;
    const currentDistance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

    if (currentDistance > maxLength) {
      const angle = Math.atan2(distanceY, distanceX);
      clickX = initPosition.x + maxLength * Math.cos(angle);
      clickY = initPosition.y + maxLength * Math.sin(angle);
    }

    mouseX = clickX;
    mouseY = clickY;
  }
}

// 📌 드래그 종료 (마우스 & 터치)
async function stopDrag() {
  if (isDragging && hasDragged) {
    isDragging = false;
    hasDragged = false;
    isDisabled = true;

    $input.classList.add("disabled");
    $input.disabled = true;

    $answer.style.opacity = "1";
    $answer.textContent = "";

    let blinkCount = 0;
    const blinkInterval = setInterval(() => {
      $answer.textContent = blinkCount % 2 === 0 ? "" : "...";
      blinkCount++;
    }, 500);

    await setTimeoutPromise(3500);
    clearInterval(blinkInterval);

    await setTimeoutPromise(1000);

    $answer.textContent = $input.value.trim() === "" ? "질문을 해" : askRandomAnswer();
    $answer.style.opacity = "1";

    await setTimeoutPromise(1500);
    $input.value = "";
    $input.classList.remove("disabled");
    $input.disabled = false;

    isDisabled = false;
  }
}

// 📌 이벤트 리스너 등록
canvas.addEventListener("mousedown", startDrag);
canvas.addEventListener("mousemove", dragging);
canvas.addEventListener("mouseup", stopDrag);
canvas.addEventListener("mouseleave", stopDrag);

// 📌 모바일 이벤트 리스너 추가
canvas.addEventListener("touchstart", (event) => {
  event.preventDefault(); // 화면 스크롤 방지
  startDrag(event);
});
canvas.addEventListener("touchmove", (event) => {
  event.preventDefault(); // 화면 스크롤 방지
  dragging(event);
});
canvas.addEventListener("touchend", stopDrag);

// 📌 전체 화면 스크롤 방지 (모바일에서)
document.body.addEventListener(
  "touchmove",
  (event) => {
    event.preventDefault();
  },
  { passive: false }
);

animate();
