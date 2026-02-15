window.addEventListener("DOMContentLoaded", () => {

  const target0 = document.querySelector("#target0");
  const blinkPlane = document.querySelector("#blinkPlane");

  const frames = [
    "images/01.webp",
    "images/02.webp",
    "images/03.webp",
    "images/04.webp",
    "images/05.webp",
    "images/04.webp",
    "images/03.webp",
    "images/02.webp",
    "images/01.webp"
  ];

  const FRAME_INTERVAL = 120;
  const BLINK_INTERVAL = 2000;

  let frameIndex = 0;
  let blinkTimer = null;

  function playBlinkOnce() {
    frameIndex = 0;

    const step = () => {
      blinkPlane.setAttribute("material", "src", frames[frameIndex++]);
      if (frameIndex < frames.length) {
        setTimeout(step, FRAME_INTERVAL);
      }
    };

    step();
  }

  function startBlink() {
    if (blinkTimer) return;
    playBlinkOnce();
    blinkTimer = setInterval(playBlinkOnce, BLINK_INTERVAL);
  }

  function stopBlink() {
    clearInterval(blinkTimer);
    blinkTimer = null;
    blinkPlane.setAttribute("material", "src", frames[0]);
  }

  target0.addEventListener("targetFound", startBlink);
  target0.addEventListener("targetLost", stopBlink);

});
