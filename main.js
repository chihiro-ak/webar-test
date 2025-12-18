window.addEventListener("DOMContentLoaded", async () => {

  /* ===== preload helper ===== */
  function preloadImages(urls) {
    return Promise.all(
      urls.map(src => new Promise(resolve => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
      }))
    );
  }

  function setMaterialSrc(el, src) {
    el.setAttribute("material", "src", src);
  }

  /* =========================================================
     target 0（瞬き）
  ========================================================= */

  const target0 = document.querySelector("#target0");
  const blinkPlane = document.querySelector("#blinkPlane");

  const blinkFrames = [
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

  await preloadImages(blinkFrames);

  const frameInterval = 120;
  const blinkInterval = 2000;

  let frameIndex = 0;
  let frameTimeout = null;
  let blinkTimeout = null;
  let isBlinking = false;

  function playBlinkOnce() {
    if (isBlinking) return;
    isBlinking = true;
    frameIndex = 0;

    function nextFrame() {
      setMaterialSrc(blinkPlane, blinkFrames[frameIndex]);
      frameIndex++;

      if (frameIndex < blinkFrames.length) {
        frameTimeout = setTimeout(nextFrame, frameInterval);
      } else {
        isBlinking = false;
      }
    }
    nextFrame();
  }

  function startBlinkLoop() {
    if (blinkTimeout) return;
    playBlinkOnce();
    blinkTimeout = setInterval(playBlinkOnce, blinkInterval);
  }

  function stopBlinkLoop() {
    clearInterval(blinkTimeout);
    clearTimeout(frameTimeout);
    blinkTimeout = null;
    frameTimeout = null;
    isBlinking = false;
    frameIndex = 0;
    setMaterialSrc(blinkPlane, blinkFrames[0]);
  }

  target0.addEventListener("targetFound", () => {
    startBlinkLoop();
    setActivePlane(blinkPlane);
  });

  target0.addEventListener("targetLost", () => {
    stopBlinkLoop();
    clearActivePlane(blinkPlane);
  });

  /* =========================================================
     target 1（静止画）
  ========================================================= */

  const target1 = document.querySelector("#target1");
  const staticPlane = document.querySelector("#staticPlane");
  const staticImage = "images/2.webp";

  await preloadImages([staticImage]);

  target1.addEventListener("targetFound", () => {
    setMaterialSrc(staticPlane, staticImage);
    setActivePlane(staticPlane);
  });

  target1.addEventListener("targetLost", () => {
    clearActivePlane(staticPlane);
  });

  /* =========================================================
     UI操作（② ピンチ＋ドラッグ）
  ========================================================= */

  let activePlane = null;

  let startTouches = [];
  let startScale = 1;
  let startPosY = 0;

  let currentScale = 1;
  let currentPosY = 0;

  function setActivePlane(plane) {
    activePlane = plane;

    // 現在値を plane から取得
    const scale = plane.getAttribute("scale");
    currentScale = scale.x;

    const pos = plane.getAttribute("position");
    currentPosY = pos.y;
  }

  function clearActivePlane(plane) {
    if (activePlane === plane) {
      activePlane = null;
    }
  }

  function getDistance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  document.addEventListener("touchstart", (e) => {
    console.log("touch, activePlane =", activePlane?.id);
    if (!activePlane) return;

    if (e.touches.length === 1) {
      startTouches = [e.touches[0]];
      startPosY = currentPosY;
    }

    if (e.touches.length === 2) {
      startTouches = [e.touches[0], e.touches[1]];
      startScale = currentScale;
    }
  }, { passive: false });

  document.addEventListener("touchmove", (e) => {
    if (!activePlane) return;
    e.preventDefault();

    /* 1本指：上下移動 */
    if (e.touches.length === 1 && startTouches.length === 1) {
      const dy = e.touches[0].clientY - startTouches[0].clientY;
      currentPosY = startPosY - dy * 0.002;

      currentPosY = Math.min(Math.max(currentPosY, -0.5), 0.5);

      const pos = activePlane.getAttribute("position");
      activePlane.setAttribute("position", `0 ${currentPosY} ${pos.z}`);
    }

    /* 2本指：ピンチ拡大縮小 */
    if (e.touches.length === 2 && startTouches.length === 2) {
      const newDist = getDistance(e.touches[0], e.touches[1]);
      const startDist = getDistance(startTouches[0], startTouches[1]);

      let scale = startScale * (newDist / startDist);
      scale = Math.min(Math.max(scale, 0.3), 2.0);

      currentScale = scale;
      activePlane.setAttribute("scale", `${scale} ${scale} 1`);
    }
  }, { passive: false });

  document.addEventListener("touchend", () => {
    startTouches = [];
  });

  /* =========================================================
     A-Frame touch対策
  ========================================================= */

  const sceneEl = document.querySelector("a-scene");
  sceneEl.addEventListener("loaded", () => {
    const canvas = sceneEl.canvas;
    canvas.style.touchAction = "none";
  });

});
