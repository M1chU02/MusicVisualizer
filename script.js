// Select DOM elements
const audioInput = document.getElementById("audioInput");
const visualizerCanvas = document.getElementById("visualizer");
const ctx = visualizerCanvas.getContext("2d");
const visualStyleSelect = document.getElementById("visualStyle");

// Set canvas size
visualizerCanvas.width = window.innerWidth;
visualizerCanvas.height = window.innerHeight;

// Variables for audio and visualization
let audioContext, analyser, source, bufferLength, dataArray;
let currentStyle = "bars";

// Handle file input
audioInput.addEventListener("change", handleAudioInput);
visualStyleSelect.addEventListener("change", (e) => {
  currentStyle = e.target.value;
});

function handleAudioInput(event) {
  const file = event.target.files[0];
  const audio = new Audio(URL.createObjectURL(file));
  audio.play();

  // Initialize Web Audio API
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioContext.createAnalyser();
  source = audioContext.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioContext.destination);

  // Configure analyser
  analyser.fftSize = 2048;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);

  // Start visualizing
  visualize();
}

// Visualization function
function visualize() {
  ctx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
  analyser.getByteFrequencyData(dataArray);

  if (currentStyle === "bars") {
    drawBars();
  } else if (currentStyle === "circle") {
    drawCircle();
  } else if (currentStyle === "wave") {
    drawWave();
  }

  requestAnimationFrame(visualize);
}

// Draw bar visualizer
function drawBars() {
  const barWidth = (visualizerCanvas.width / bufferLength) * 2.5;
  let barHeight;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];
    const red = (barHeight + 100) * 2;
    const green = (i / bufferLength) * 255;
    const blue = 150;

    ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
    ctx.fillRect(
      x,
      visualizerCanvas.height - barHeight / 2,
      barWidth,
      barHeight / 2
    );

    x += barWidth + 1;
  }
}

// Draw circle visualizer
function drawCircle() {
  const radius = Math.min(visualizerCanvas.width, visualizerCanvas.height) / 4;
  const centerX = visualizerCanvas.width / 2;
  const centerY = visualizerCanvas.height / 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;
  ctx.stroke();

  analyser.getByteFrequencyData(dataArray);

  for (let i = 0; i < bufferLength; i++) {
    const angle = (i / bufferLength) * Math.PI * 2;
    const length = (dataArray[i] / 255) * radius;
    const x = centerX + Math.cos(angle) * length;
    const y = centerY + Math.sin(angle) * length;
    ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "rgb(50,255,255)";
  ctx.stroke();
}

// Draw wave visualizer
function drawWave() {
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgb(0, 255, 255)";

  analyser.getByteTimeDomainData(dataArray);

  ctx.beginPath();

  const sliceWidth = visualizerCanvas.width / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * visualizerCanvas.height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  ctx.lineTo(visualizerCanvas.width, visualizerCanvas.height / 2);
  ctx.stroke();
}
