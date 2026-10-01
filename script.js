/**
 * 幸運物語 ｜ 緣結の飯糰
 * 動態互動腳本：滑鼠懸停、視差眼神跟隨、點擊彈跳、米粒/星光粒子噴發、3D卡片傾斜與御神籤抽籤
 * 作者：514170167 陳明萱
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM 元素引用
  const onigiriHero = document.getElementById('onigiriHero');
  const riceBody = document.getElementById('riceBody');
  const faceGroup = document.getElementById('faceGroup');
  const glowBg = document.getElementById('glowBg');
  const blessingCountEl = document.getElementById('blessingCount');
  const soundToggleBtn = document.getElementById('soundToggle');
  const drawOmikujiBtn = document.getElementById('drawOmikujiBtn');
  const omikujiModal = document.getElementById('omikujiModal');
  const omikujiClose = document.getElementById('omikujiClose');
  const omikujiOverlay = document.getElementById('omikujiOverlay');
  const redrawBtn = document.getElementById('redrawBtn');
  const acceptBtn = document.getElementById('acceptBtn');
  const omikujiRankEl = document.getElementById('omikujiRank');
  const omikujiQuoteEl = document.getElementById('omikujiQuote');
  const omikujiItemEl = document.getElementById('omikujiItem');
  const omikujiColorEl = document.getElementById('omikujiColor');
  const symbolCards = document.querySelectorAll('.symbol-item');
  const ambientCanvas = document.getElementById('ambientCanvas');

  // 狀態管理
  let blessingCount = 0;
  let isSoundEnabled = true;
  let audioCtx = null;

  // 祝福小金句庫
  const blessingQuotes = [
    '🍙 米粒飽滿，今日運勢大吉！',
    '🍙 緣分相繫，今天會遇見溫柔的人！',
    '🍙 暖心護佑，一切煩惱消散如煙！',
    '🍙 每一粒米，都凝聚著滿滿元氣！',
    '🍙 雙手相扣的溫度，化作堅定前行的幸運！',
    '🍙 善意如稻穗，低頭處皆是美好！',
    '🍙 豐收滿滿，努力的種子正在悄悄發芽！'
  ];

  // 御神籤籤詩庫
  const omikujiPool = [
    {
      rank: '【 大吉 · 緣結圓滿 】',
      quote: '「心念真誠如溫熱米香，所到之處皆有善緣相迎。」',
      item: '海苔御結飯糰',
      color: '和風米白'
    },
    {
      rank: '【 大吉 · 豐收無窮 】',
      quote: '「聚沙成塔，每一分付出的汗水，終將化作金黃稻浪。」',
      item: '黃金柴魚飯糰',
      color: '稻穗金黃'
    },
    {
      rank: '【 結緣吉 · 善意相逢 】',
      quote: '「不期而遇的溫暖，正在轉角處安靜等候著你。」',
      item: '梅子紫蘇御結',
      color: '櫻花淡粉'
    },
    {
      rank: '【 中吉 · 心安神寧 】',
      quote: '「簡樸踏實，走好眼前的每一步，便是最好的庇佑。」',
      item: '靜岡煎茶與三角飯糰',
      color: '青甘抹茶綠'
    },
    {
      rank: '【 元氣吉 · 步步踏實 】',
      quote: '「吃飽一口熱騰騰的飯，就有了勇氣面對世界。」',
      item: '烤鮭魚御結',
      color: '朝陽琥珀橙'
    }
  ];

  // ==========================================================
  // 1. Web Audio API 音效合成系統（零外部檔案、日式輕盈空靈）
  // ==========================================================
  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // 播放日式風鈴清脆音
  function playChimeSound(freq = 880, duration = 0.5) {
    if (!isSoundEnabled) return;
    try {
      initAudioContext();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio not allowed yet:', e);
    }
  }

  // 播放 Q 彈跳音
  function playBounceSound() {
    if (!isSoundEnabled) return;
    try {
      initAudioContext();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, audioCtx.currentTime + 0.12);
      osc.frequency.exponentialRampToValueAtTime(320, audioCtx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.warn(e);
    }
  }

  // 音效開關切換
  soundToggleBtn.addEventListener('click', () => {
    isSoundEnabled = !isSoundEnabled;
    if (isSoundEnabled) {
      soundToggleBtn.classList.remove('muted');
      soundToggleBtn.querySelector('.sound-icon').textContent = '🔔';
      soundToggleBtn.querySelector('.sound-text').textContent = '和風音效：開';
      playChimeSound(660, 0.4);
    } else {
      soundToggleBtn.classList.add('muted');
      soundToggleBtn.querySelector('.sound-icon').textContent = '🔕';
      soundToggleBtn.querySelector('.sound-text').textContent = '和風音效：關';
    }
  });

  // ==========================================================
  // 2. 飯糰核心互動：眼神追隨、自然眨眼、懸停晃動
  // ==========================================================

  // 靈動眼神追隨滑鼠（Parallax 視差）
  const heroSection = document.querySelector('.hero-section');
  if (heroSection && faceGroup) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);

      // 限制微移在 -4px 到 +4px 之間
      const moveX = Math.max(-4, Math.min(4, deltaX * 4));
      const moveY = Math.max(-3, Math.min(3, deltaY * 3));

      faceGroup.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });

    heroSection.addEventListener('mouseleave', () => {
      faceGroup.style.transform = 'translate(0px, 0px)';
    });
  }

  // 自動自然眨眼
  function triggerBlink() {
    if (!onigiriHero.classList.contains('happy-face')) {
      onigiriHero.classList.add('blinking');
      setTimeout(() => {
        onigiriHero.classList.remove('blinking');
      }, 160);
    }
    // 隨機每 3 ~ 6 秒眨一次
    const nextBlink = Math.random() * 3000 + 3000;
    setTimeout(triggerBlink, nextBlink);
  }
  setTimeout(triggerBlink, 2500);

  // ==========================================================
  // 3. 點擊飯糰：果凍彈跳、笑瞇瞇表情、粒子散開、祝福飄字
  // ==========================================================
  function handleOnigiriClick(e) {
    initAudioContext();
    playBounceSound();
    setTimeout(() => playChimeSound(880, 0.4), 80);

    // 觸發果凍擠壓彈跳動畫
    onigiriHero.classList.remove('bouncing');
    void onigiriHero.offsetWidth; // 強制重繪
    onigiriHero.classList.add('bouncing');

    // 切換瞇瞇眼笑臉
    onigiriHero.classList.add('happy-face');
    setTimeout(() => {
      onigiriHero.classList.remove('happy-face');
    }, 700);

    // 取得點擊位置
    const clickX = e ? e.clientX : window.innerWidth / 2;
    const clickY = e ? e.clientY : window.innerHeight / 2;

    // 噴發米粒與星芒粒子
    spawnParticleBurst(clickX, clickY);

    // 飄起隨機緣結祝福字條
    showFloatingQuote(clickX, clickY);

    // 增加福氣值
    incrementBlessing();
  }

  onigiriHero.addEventListener('click', handleOnigiriClick);
  onigiriHero.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const rect = onigiriHero.getBoundingClientRect();
      handleOnigiriClick({
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2
      });
    }
  });

  // 福氣計數增加動態
  function incrementBlessing(amount = 1) {
    blessingCount += amount;
    blessingCountEl.textContent = blessingCount;
    blessingCountEl.classList.remove('pulse');
    void blessingCountEl.offsetWidth;
    blessingCountEl.classList.add('pulse');
    setTimeout(() => {
      blessingCountEl.classList.remove('pulse');
    }, 250);
  }

  // 浮現隨機緣結祝福小金句
  function showFloatingQuote(x, y) {
    const quote = blessingQuotes[Math.floor(Math.random() * blessingQuotes.length)];
    const quoteEl = document.createElement('div');
    quoteEl.className = 'floating-quote';
    quoteEl.textContent = quote;

    const onigiriRect = onigiriHero.getBoundingClientRect();
    quoteEl.style.left = `${onigiriRect.left + onigiriRect.width / 2}px`;
    quoteEl.style.top = `${onigiriRect.top}px`;

    document.body.appendChild(quoteEl);
    setTimeout(() => {
      quoteEl.remove();
    }, 1600);
  }

  // ==========================================================
  // 4. 米粒與星芒粒子噴發特效 (Physics Particle Burst)
  // ==========================================================
  function spawnParticleBurst(originX, originY) {
    const particleCount = 22; // 噴發粒子數量
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const el = document.createElement('div');
      el.className = 'particle-elem';

      // 決定粒子類型：40% 米粒、35% 金色星芒、25% 櫻花花瓣
      const rand = Math.random();
      let type = 'rice';
      if (rand < 0.4) {
        type = 'rice';
        el.classList.add('rice-grain-particle');
      } else if (rand < 0.75) {
        type = 'star';
        el.classList.add('star-particle');
        el.textContent = Math.random() > 0.5 ? '✦' : '★';
      } else {
        type = 'petal';
        el.classList.add('petal-particle');
      }

      // 物理參數：初速度、方向角度、重力與阻尼
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 6 + 4;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 2.5; // 稍微向上噴

      document.body.appendChild(el);

      particles.push({
        el,
        x: originX,
        y: originY,
        vx,
        vy,
        gravity: 0.22,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        decay: Math.random() * 0.015 + 0.018
      });
    }

    // 粒子逐幀物理更新
    function updateParticles() {
      let activeCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.opacity <= 0.02) {
          if (p.el.parentNode) p.el.remove();
          continue;
        }

        activeCount++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98; // 空氣阻力
        p.rotation += p.rotSpeed;
        p.opacity -= p.decay;

        p.el.style.left = `${p.x}px`;
        p.el.style.top = `${p.y}px`;
        p.el.style.opacity = Math.max(0, p.opacity);
        p.el.style.transform = `translate(-50%, -50%) rotate(${p.rotation}deg)`;
      }

      if (activeCount > 0) {
        requestAnimationFrame(updateParticles);
      }
    }

    requestAnimationFrame(updateParticles);
  }

  // ==========================================================
  // 5. 象徵意涵三卡片：3D 景深傾斜、水波漣漪與結緣印章
  // ==========================================================
  symbolCards.forEach((card) => {
    // 3D 微傾斜 (Tilt)
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // 旋轉角度 (-8deg 到 +8deg)
      const rotateX = ((y - centerY) / centerY) * -7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(600px) translateY(-6px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });

    // 點擊卡片：水波紋漣漪 + 印章 + 收集福氣
    card.addEventListener('click', (e) => {
      initAudioContext();
      playChimeSound(720, 0.35);

      // 水波紋擴散 (Ripple)
      const rect = card.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple-wave';
      const size = Math.max(rect.width, rect.height) * 1.5;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      card.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);

      // 蓋上「已結緣」硃砂印章
      card.classList.add('stamped');

      // 噴發少量幸運星芒
      spawnParticleBurst(e.clientX, e.clientY);

      // 增加福氣
      incrementBlessing(1);
    });

    // 鍵盤支援
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // ==========================================================
  // 6. 今日御神籤抽籤系統
  // ==========================================================
  function openOmikuji() {
    initAudioContext();
    playChimeSound(580, 0.4);

    // 讓飯糰快速晃動象徵祈願
    onigiriHero.classList.add('bouncing');
    setTimeout(() => onigiriHero.classList.remove('bouncing'), 600);

    // 隨機抽取一張籤詩
    const luckyItem = omikujiPool[Math.floor(Math.random() * omikujiPool.length)];
    omikujiRankEl.textContent = luckyItem.rank;
    omikujiQuoteEl.textContent = luckyItem.quote;
    omikujiItemEl.textContent = luckyItem.item;
    omikujiColorEl.textContent = luckyItem.color;

    // 開啟彈出視窗
    setTimeout(() => {
      omikujiModal.classList.add('active');
      omikujiModal.setAttribute('aria-hidden', 'false');
      playChimeSound(1040, 0.5);
    }, 300);
  }

  function closeOmikuji() {
    omikujiModal.classList.remove('active');
    omikujiModal.setAttribute('aria-hidden', 'true');
  }

  drawOmikujiBtn.addEventListener('click', openOmikuji);
  omikujiClose.addEventListener('click', closeOmikuji);
  omikujiOverlay.addEventListener('click', closeOmikuji);
  redrawBtn.addEventListener('click', openOmikuji);
  acceptBtn.addEventListener('click', () => {
    closeOmikuji();
    incrementBlessing(3); // 收下籤詩額外贈送 3 點福氣
    const rect = drawOmikujiBtn.getBoundingClientRect();
    spawnParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  });

  // Esc 鍵關閉模態視窗
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && omikujiModal.classList.contains('active')) {
      closeOmikuji();
    }
  });

  // ==========================================================
  // 7. 和風背景畫布：櫻花瓣與金色光斑緩慢飄落
  // ==========================================================
  if (ambientCanvas) {
    const ctx = ambientCanvas.getContext('2d');
    let width = (ambientCanvas.width = window.innerWidth);
    let height = (ambientCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = ambientCanvas.width = window.innerWidth;
      height = ambientCanvas.height = window.innerHeight;
    });

    const petalCount = 18;
    const ambientPetals = [];

    for (let i = 0; i < petalCount; i++) {
      ambientPetals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 4 + 3,
        speedY: Math.random() * 0.7 + 0.3,
        speedX: Math.random() * 0.4 - 0.2,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.02,
        isGold: Math.random() > 0.65 // 65% 櫻花粉，35% 暖金微塵
      });
    }

    function renderAmbient() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < ambientPetals.length; i++) {
        const p = ambientPetals[i];
        p.y += p.speedY;
        p.x += Math.sin(p.angle) * 0.6 + p.speedX;
        p.angle += p.spin;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        if (p.isGold) {
          // 金色微塵
          ctx.beginPath();
          ctx.arc(0, 0, p.radius * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(235, 185, 100, 0.4)';
          ctx.fill();
        } else {
          // 櫻花瓣
          ctx.beginPath();
          ctx.moveTo(0, -p.radius);
          ctx.bezierCurveTo(p.radius, -p.radius / 2, p.radius, p.radius, 0, p.radius * 1.5);
          ctx.bezierCurveTo(-p.radius, p.radius, -p.radius, -p.radius / 2, 0, -p.radius);
          ctx.fillStyle = 'rgba(255, 190, 200, 0.35)';
          ctx.fill();
        }

        ctx.restore();
      }

      requestAnimationFrame(renderAmbient);
    }

    requestAnimationFrame(renderAmbient);
  }
});
