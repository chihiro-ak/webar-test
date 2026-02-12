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
    target 2（静止画）
  ========================================================= */

  const target2 = document.querySelector("#target2");
  const staticPlane2 = document.querySelector("#staticPlane2");
  const staticImage2 = "images/3.webp";

  await preloadImages([staticImage2]);

  target2.addEventListener("targetFound", () => {
    setMaterialSrc(staticPlane2, staticImage2);
    setActivePlane(staticPlane2);
  });

  target2.addEventListener("targetLost", () => {
    clearActivePlane(staticPlane2);
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

  /* =========================================================
     カメラ切替機能（内/外カメラ）
  ========================================================= */

  // video 要素を探す。MindAR が生成する要素を優先して返す
  async function getMindarVideoElement(timeout = 3000) {
    const scene = document.querySelector('a-scene');

    // まず既知 ID をチェック
    const known = document.getElementById('mindar-video');
    if (known) return known;

    // scene 内の video を優先
    const tryFind = () => {
      const fromScene = scene?.querySelector('video');
      if (fromScene) return fromScene;
      const any = document.querySelectorAll('video');
      if (any && any.length > 0) {
        // 再生中やサイズがあるものを優先
        for (const v of any) {
          if (v.readyState > 0 || v.videoWidth > 0 || v.autoplay) return v;
        }
        return any[0];
      }
      return null;
    };

    let video = tryFind();
    if (video) return video;

    const start = Date.now();
    while (!video && Date.now() - start < timeout) {
      await new Promise(res => setTimeout(res, 200));
      video = tryFind();
    }
    return video;
  }

  // facing ('user'|'environment') から deviceId を選ぶためのヘルパ
  async function getDeviceIdForFacing(facing) {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter(d => d.kind === 'videoinput');
      if (!cams || cams.length === 0) return null;

      // ラベルが取得できていればラベルで判定
      const envRe = /back|rear|environment|rear camera|back camera|背面|外/i;
      const userRe = /front|face|user|front camera|front-facing|前面|内/i;

      let candidates = cams.filter(c => envRe.test(c.label));
      if (facing === 'user') candidates = cams.filter(c => userRe.test(c.label));

      if (candidates.length > 0) return candidates[0].deviceId;

      // ラベル情報が取れない/マッチしない場合は、environment -> 最後、user -> 最初 を選ぶ
      return facing === 'environment' ? cams[cams.length - 1].deviceId : cams[0].deviceId;
    } catch (e) {
      console.warn('enumerateDevices エラー', e);
      return null;
    }
  }

  // カメラ切替。まず facingMode を試し、失敗したら deviceId 指定で再試行する
  async function switchCameraFacing(facingMode) {
    const video = await getMindarVideoElement();
    if (!video) {
      alert('カメラ要素が見つかりません');
      return;
    }

    // 既存ストリーム停止
    try {
      const oldStream = video.srcObject;
      if (oldStream && oldStream.getTracks) oldStream.getTracks().forEach(t => t.stop());
    } catch (e) {
      console.warn('既存ストリーム停止エラー', e);
    }

    // try facingMode first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
      video.srcObject = stream;
      video.muted = true;
      await video.play();
      return;
    } catch (err) {
      console.warn('facingMode 取得失敗、deviceId 指定で再試行します', err);
    }

    // fallback: deviceId 指定
    const deviceId = await getDeviceIdForFacing(facingMode);
    if (!deviceId) {
      alert('使用可能なカメラが見つかりません');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId } }, audio: false });
      video.srcObject = stream;
      video.muted = true;
      await video.play();
    } catch (err) {
      console.error('deviceId 指定でのカメラ取得失敗', err);
      alert('カメラの取得に失敗しました: ' + err.message);
    }
  }

  // separate buttons for front/back camera
  const btnFront = document.getElementById('btnFront');
  const btnBack = document.getElementById('btnBack');
  if (btnFront) btnFront.addEventListener('click', () => switchCameraFacing('user'));
  if (btnBack) btnBack.addEventListener('click', () => switchCameraFacing('environment'));

});
