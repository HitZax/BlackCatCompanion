(function () {
  const stage = document.getElementById("stage");
  const cat = document.getElementById("cat");
  const eyes = document.getElementById("eyes");
  const petBtn = document.getElementById("petBtn");
  const patBtn = document.getElementById("patBtn");
  const bellyBtn = document.getElementById("bellyBtn");
  const kissBtn = document.getElementById("kissBtn");
  const releaseBtn = document.getElementById("releaseBtn");
  const taskInput = document.getElementById("taskInput");
  const purgeText = document.getElementById("purgeText");
  const purgeVisual = document.getElementById("purgeVisual");
  const shredLayer = document.getElementById("shredLayer");
  const rewardMessage = document.getElementById("rewardMessage");
  const focusTimer = document.getElementById("focusTimer");
  const timerTime = document.getElementById("timerTime");
  const nightTooltip = document.getElementById("nightTooltip");
  const motivatorText = document.getElementById("motivatorText");
  const motivatorBtn = document.getElementById("motivatorBtn");
  const motivatorMode = document.getElementById("motivatorMode");

  let blinkTimer = null;
  let focusInterval = null;
  let focusSeconds = 25 * 60;
  let holdTimer = null;

  // Sound effects - placeholder paths, replace with your own audio files
  const sounds = {
    pet: new Audio("sounds/pet-purr.mp3"),
    pat: new Audio("sounds/pat-bounce.mp3"),
    bellyRub: new Audio("sounds/pet-long-purr.mp3"),
    release: new Audio("sounds/release-shred.mp3"),
    motivator: new Audio("sounds/motivator-chime.mp3"),
    focusStart: new Audio("sounds/focus-start.mp3"),
    reward: new Audio("sounds/reward-celebration.mp3"),
  };

  const meowSounds = [
    new Audio("sounds/pet-meow-1.mp3"),
    new Audio("sounds/pet-meow-2.mp3"),
    new Audio("sounds/pet-meow-3.mp3"),
  ];

  // Set volume for all sounds
  Object.values(sounds).forEach((sound) => {
    sound.volume = 0.6;
  });

  meowSounds.forEach((sound) => {
    sound.volume = 0.6;
  });

  function playSound(soundKey) {
    try {
      if (sounds[soundKey]) {
        sounds[soundKey].currentTime = 0;
        // Preload is important for faster playback
        sounds[soundKey].preload = "auto";
        const playPromise = sounds[soundKey].play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Silently fail if audio doesn't exist or can't play
            // This is normal - audio files may not be committed to GitHub
          });
        }
      }
    } catch (error) {
      // Audio might not be available
    }
  }

  function playRandomMeow() {
    try {
      const meow = meowSounds[Math.floor(Math.random() * meowSounds.length)];
      if (meow) {
        meow.currentTime = 0;
        meow.preload = "auto";
        const playPromise = meow.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Silently fail if audio doesn't exist or can't play
          });
        }
      }
    } catch (error) {
      // Audio might not be available
    }
  }

  function triggerClass(el, className, durationMs) {
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
    window.setTimeout(() => el.classList.remove(className), durationMs);
  }

  function flashStage() {
    triggerClass(stage, "flash", 140);
  }

  function happyPulse(durationMs) {
    triggerClass(cat, "happy", durationMs);
  }

  function delight(durationMs) {
    triggerClass(cat, "delight", durationMs);
  }

  function scheduleBlink() {
    const delay = 5000 + Math.floor(Math.random() * 3000);
    blinkTimer = window.setTimeout(() => {
      triggerClass(eyes, "blink", 460);
      scheduleBlink();
    }, delay);
  }

  function startBlinkLoop() {
    if (blinkTimer) {
      window.clearTimeout(blinkTimer);
    }
    scheduleBlink();
  }

  function pet() {
    triggerClass(eyes, "purr", 940);
    happyPulse(640);
    delight(980);
    flashStage();
    playSound("pet");
  }

  function pat() {
    triggerClass(eyes, "pat", 420);
    happyPulse(640);
    delight(820);
    flashStage();
    playSound("pat");
  }

  function bellyRub() {
    triggerClass(eyes, "purr", 1180);
    happyPulse(760);
    delight(1100);
    flashStage();
    playSound("bellyRub");
  }

  function kiss() {
    triggerClass(eyes, "blink", 520);
    happyPulse(620);
    delight(900);
    flashStage();
    playRandomMeow();
  }

  function invalidFeedback() {
    triggerClass(taskInput, "invalid", 300);
    flashStage();
  }

  function setRewardMessage(text) {
    rewardMessage.textContent = text;
    rewardMessage.classList.add("show");
    window.setTimeout(() => rewardMessage.classList.remove("show"), 3000);
  }

  function makeShred(text) {
    shredLayer.innerHTML = "";
    const slices = 8;

    for (let i = 0; i < slices; i += 1) {
      const part = document.createElement("span");
      const topPct = (100 / slices) * i;
      const bottomPct = 100 - (100 / slices) * (i + 1);
      const direction = i % 2 === 0 ? 1 : -1;
      const offset = 26 + Math.random() * 42;
      const rotate = (Math.random() * 12 + 3) * direction;

      part.className = "shred-slice";
      part.textContent = text;
      part.style.top = "0";
      part.style.bottom = "0";
      part.style.clipPath = "inset(" + topPct + "% 0 " + bottomPct + "% 0)";
      part.style.setProperty("--x", String(offset * direction) + "px");
      part.style.setProperty("--r", String(rotate) + "deg");
      part.style.animationDelay = String(i * 38) + "ms";

      shredLayer.appendChild(part);
    }

    window.setTimeout(() => {
      shredLayer.innerHTML = "";
    }, 1300);
  }

  function isRewardWord(text) {
    const normalized = text.toLowerCase();
    return normalized === "done" || normalized === "finish";
  }

  function releaseTask() {
    const text = taskInput.value.trim();

    if (!text) {
      invalidFeedback();
      return;
    }

    purgeText.textContent = text;
    makeShred(text);
    taskInput.value = "";
    playSound("release");

    if (isRewardWord(text)) {
      triggerClass(eyes, "slow-blink", 1550);
      happyPulse(760);
      delight(980);
      playSound("reward");
      setRewardMessage("Efficiency achieved. Rest now.");
    }

    window.setTimeout(() => {
      purgeText.textContent = "";
    }, 1200);

    flashStage();
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
  }

  function startFocusTimer() {
    if (focusInterval) {
      return;
    }

    playSound("focusStart");
    timerTime.textContent = formatTime(focusSeconds);
    document.body.classList.add("focus-mode");
    focusTimer.classList.add("show");

    focusInterval = window.setInterval(() => {
      if (focusSeconds <= 0) {
        window.clearInterval(focusInterval);
        focusInterval = null;
        focusSeconds = 25 * 60;
        timerTime.textContent = "Session done";
        playSound("reward");
        setRewardMessage("Focus cycle complete. Recover strategically.");
        return;
      }

      focusSeconds -= 1;
      timerTime.textContent = formatTime(focusSeconds);
    }, 1000);
  }

  function handleHoldStart() {
    if (holdTimer) {
      window.clearTimeout(holdTimer);
    }

    holdTimer = window.setTimeout(() => {
      startFocusTimer();
    }, 3000);
  }

  function handleHoldEnd() {
    if (holdTimer) {
      window.clearTimeout(holdTimer);
      holdTimer = null;
    }
  }

  function setupNightGreeting() {
    const hour = new Date().getHours();
    if (hour >= 20) {
      document.body.classList.add("night-mode");
      nightTooltip.classList.add("show");
    }
  }

  function randomFallbackMotivation() {
    const local = [
      "Tiny steps still move mountains.",
      "You are doing better than your stress says.",
      "Calm first. Then the next right move.",
      "Discipline with kindness beats pressure.",
      "Finish one thing, then breathe.",
      "You do not need perfect to make progress.",
      "Your consistency is your superpower.",
    ];
    return local[Math.floor(Math.random() * local.length)];
  }

  function pickCuratedQuote() {
    const curated = [
      "Do not fear going forward slowly; fear standing still. - Chinese proverb",
      "Success is the sum of small efforts repeated day in and day out. - Robert Collier",
      "It always seems impossible until it is done. - Nelson Mandela",
      "Action is the foundational key to all success. - Pablo Picasso",
      "Do what you can, with what you have, where you are. - Theodore Roosevelt",
      "You are what you do, not what you say you will do. - Carl Jung",
      "Well done is better than well said. - Benjamin Franklin",
    ];
    return curated[Math.floor(Math.random() * curated.length)];
  }

  async function loadFromAdviceSlip() {
    const response = await fetch("https://api.adviceslip.com/advice", {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Advice API request failed");
    }

    const data = await response.json();
    const advice =
      data && data.slip && data.slip.advice ? data.slip.advice : null;
    if (!advice) {
      throw new Error("Advice API returned empty content");
    }

    return advice;
  }

  async function loadFromAffirmationApi() {
    const response = await fetch("https://www.affirmations.dev/", {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Affirmation API request failed");
    }

    const data = await response.json();
    const affirmation = data && data.affirmation ? data.affirmation : null;
    if (!affirmation) {
      throw new Error("Affirmation API returned empty content");
    }

    return affirmation;
  }

  async function loadMotivation() {
    motivatorText.textContent = "Loading motivator...";

    try {
      const mode = motivatorMode ? motivatorMode.value : "hybrid";

      if (mode === "curated") {
        motivatorText.textContent = pickCuratedQuote();
      } else if (mode === "api") {
        const useAffirmation = Math.random() > 0.5;
        motivatorText.textContent = useAffirmation
          ? await loadFromAffirmationApi()
          : await loadFromAdviceSlip();
      } else {
        const strategy = Math.random();
        if (strategy < 0.35) {
          motivatorText.textContent = pickCuratedQuote();
        } else {
          const useAffirmation = Math.random() > 0.5;
          motivatorText.textContent = useAffirmation
            ? await loadFromAffirmationApi()
            : await loadFromAdviceSlip();
        }
      }

      happyPulse(620);
      delight(980);
      playSound("motivator");
    } catch (error) {
      const mode = motivatorMode ? motivatorMode.value : "hybrid";
      motivatorText.textContent =
        mode === "curated" ? pickCuratedQuote() : randomFallbackMotivation();
      happyPulse(620);
      delight(980);
      playSound("motivator");
    }
  }

  petBtn.addEventListener("click", pet);
  patBtn.addEventListener("click", pat);
  bellyBtn.addEventListener("click", bellyRub);
  kissBtn.addEventListener("click", kiss);
  releaseBtn.addEventListener("click", releaseTask);
  motivatorBtn.addEventListener("click", loadMotivation);

  taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      releaseTask();
    }
  });

  eyes.addEventListener("pointerdown", handleHoldStart);
  eyes.addEventListener("pointerup", handleHoldEnd);
  eyes.addEventListener("pointercancel", handleHoldEnd);
  eyes.addEventListener("pointerleave", handleHoldEnd);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (blinkTimer) {
        window.clearTimeout(blinkTimer);
      }
    } else {
      startBlinkLoop();
    }
  });

  setupNightGreeting();
  loadMotivation();
  startBlinkLoop();
})();
