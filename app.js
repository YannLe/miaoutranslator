"use strict";

const TRANSLATIONS = [
  "J'ai faim.",
  "Nourris-moi, humain.",
  "Ma gamelle est vide depuis 4 minutes. C'est un scandale.",
  "Je vois le fond de la gamelle. JE VOIS LE FOND.",
  "Il est l'heure de manger. Il est toujours l'heure de manger.",
  "As-tu envisagé de me donner à manger ? Réfléchis-y.",
  "J'ai mangé il y a 12 minutes, donc techniquement, j'ai faim.",
  "Le frigo est là. Je suis là. Fais le calcul.",
  "Croquettes. Maintenant. S'il te plaît. Mais surtout maintenant.",
  "Mon estomac émet un vide juridique qu'il faut combler.",
  "Je ne miaule pas, je lance un appel à candidatures pour me nourrir.",
  "Un petit creux. Un gros creux en fait. Un gouffre.",
  "La faim est une construction sociale, mais donne-moi à manger quand même.",
  "Si je m'écoutais, je mangerais. Écoute-moi donc.",
  "Sers-moi des croquettes et personne ne sera griffé.",
  "J'ai faim, et accessoirement, ton canapé est en danger.",
  "Le service ici est d'une lenteur inadmissible. J'ai faim.",
  "Je t'aime. Surtout quand tu ouvres une boîte de pâtée.",
  "Mange-t-on bientôt ? C'était une question rhétorique. On mange.",
  "Alerte niveau 3 : la gamelle présente une transparence anormale.",
  "Le vide de ma gamelle reflète le vide de mon âme. Croquettes.",
  "Selon mes calculs, il reste 0 croquette. Selon mon estomac aussi.",
  "Ceci est mon 47e rappel courtois. Le prochain sera griffé.",
  "Je ne suis pas gros, je suis en prévision de famine. Nourris-moi.",
  "Tu manges. Je regarde. Tu vois le problème ?",
  "La gamelle du voisin a l'air mieux remplie. Ne m'oblige pas à déménager.",
  "J'ai renversé ton verre pour attirer l'attention sur ma faim. C'était un avertissement.",
  "Il est 4h du matin, l'heure idéale pour parler croquettes.",
  "Mon vétérinaire dit que je mange trop. Mon vétérinaire n'est pas invité.",
  "Je jeûne depuis 8 minutes. C'est de la maltraitance.",
  "Miaou. Traduction : j'ai faim. Tu avais vraiment besoin d'une appli ?",
  "J'exige des croquettes et un dédommagement pour l'attente.",
  "Le thon du placard m'appelle. Je t'autorise à répondre.",
  "Remplis la gamelle et je promets de ne pas vomir sur le tapis. Promesse non contractuelle.",
  "As-tu remarqué comme je suis mignon aujourd'hui ? C'était pour la nourriture.",
  "Niveau de croquettes : critique. Niveau de patience : pire.",
  "Je viens de faire 3 pas. J'ai mérité une collation.",
  "L'humain d'avant me nourrissait mieux. Je dis ça, je dis rien.",
  "Ce n'est pas de la faim, c'est de la gourmandise stratégique.",
  "Sers le repas maintenant et je n'annulerai pas le câlin de 18h.",
  "Mon ronronnement était en fait un bruit de ventre. Erreur de traduction. J'ai faim.",
  "Flash info : un chat magnifique meurt de faim dans un salon. Les secours, c'est toi.",
  "Je te réveille à 5h par amour. Et pour les croquettes. Surtout les croquettes.",
  "Deux options : me nourrir maintenant, ou me nourrir tout de suite.",
  "J'ai neuf vies mais une seule gamelle. Cherche l'erreur.",
  "Ta réunion peut attendre. Mon estomac, non.",
  "Je surveille ce laser rouge depuis 3 heures. Ça creuse.",
  "Ce miaulement contenait trois syllabes : cro-quet-tes.",
  "La nuit, tous les chats sont gris. Et affamés. Enfin surtout moi.",
];

const ANALYSIS_STEPS = [
  "Isolation du signal félin…",
  "Analyse spectrale des harmoniques de ronronnement…",
  "Comparaison avec 2,4 M de miaulements (dataset MeowCorpus™)…",
  "Décodage sémantique par le réseau neuronal MiaouNet™…",
  "Calibration selon la race sélectionnée…",
  "Finalisation de la traduction…",
];

const LISTEN_DURATION_MS = 4000;
const STEP_DURATION_MS = 900;

const micBtn = document.getElementById("micBtn");
const micHint = document.getElementById("micHint");
const waveform = document.getElementById("waveform");
const analysis = document.getElementById("analysis");
const analysisStep = document.getElementById("analysisStep");
const progressBar = document.getElementById("progressBar");
const result = document.getElementById("result");
const translation = document.getElementById("translation");
const confidence = document.getElementById("confidence");
const resultBreed = document.getElementById("resultBreed");
const breedSelect = document.getElementById("breed");
const speakBtn = document.getElementById("speakBtn");
const againBtn = document.getElementById("againBtn");
const proBtn = document.getElementById("proBtn");
const proModal = document.getElementById("proModal");
const proClose = document.getElementById("proClose");
const proPay = document.getElementById("proPay");
const proError = document.getElementById("proError");

let state = "idle"; // idle | listening | analyzing
let audioContext = null;
let mediaStream = null;
let animationFrame = null;
let listenTimeout = null;
let currentTranslation = "";

micBtn.addEventListener("click", () => {
  if (state === "idle") {
    startListening();
  } else if (state === "listening") {
    stopListening();
  }
});

againBtn.addEventListener("click", () => {
  result.hidden = true;
  startListening();
});

speakBtn.addEventListener("click", () => speak(currentTranslation));

async function startListening() {
  state = "listening";
  result.hidden = true;
  analysis.hidden = true;
  micBtn.classList.add("listening");
  micHint.textContent = "Écoute en cours… faites miauler le sujet 🐱";

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(mediaStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    waveform.hidden = false;
    drawWaveform(analyser);
  } catch (error) {
    micHint.textContent = "Micro refusé. Pas grave : on connaît déjà la réponse…";
    waveform.hidden = true;
  }

  listenTimeout = setTimeout(stopListening, LISTEN_DURATION_MS);
}

function stopListening() {
  if (state !== "listening") return;
  state = "analyzing";

  clearTimeout(listenTimeout);
  cancelAnimationFrame(animationFrame);

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  micBtn.classList.remove("listening");
  micBtn.disabled = true;
  waveform.hidden = true;
  micHint.textContent = "Signal capturé. Analyse en cours…";

  runAnalysis();
}

function drawWaveform(analyser) {
  const ctx = waveform.getContext("2d");
  const data = new Uint8Array(analyser.fftSize);

  const draw = () => {
    animationFrame = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(data);

    ctx.clearRect(0, 0, waveform.width, waveform.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#ec4899";
    ctx.beginPath();

    const sliceWidth = waveform.width / data.length;
    let x = 0;
    for (let i = 0; i < data.length; i++) {
      const y = (data[i] / 255) * waveform.height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.stroke();
  };

  draw();
}

function runAnalysis() {
  analysis.hidden = false;
  let step = 0;

  const nextStep = () => {
    if (step < ANALYSIS_STEPS.length) {
      analysisStep.textContent = ANALYSIS_STEPS[step];
      progressBar.style.width = `${((step + 1) / ANALYSIS_STEPS.length) * 100}%`;
      step++;
      setTimeout(nextStep, STEP_DURATION_MS);
    } else {
      showResult();
    }
  };

  nextStep();
}

function showResult() {
  state = "idle";
  micBtn.disabled = false;
  analysis.hidden = true;
  progressBar.style.width = "0%";
  micHint.textContent = "Approchez le micro de votre chat et appuyez pour traduire";

  currentTranslation = TRANSLATIONS[Math.floor(Math.random() * TRANSLATIONS.length)];
  const score = (97 + Math.random() * 2.9).toFixed(1).replace(".", ",");

  translation.textContent = `« ${currentTranslation} »`;
  confidence.textContent = `${score} %`;
  resultBreed.textContent = breedSelect.value;
  result.hidden = false;

  speak(currentTranslation);
}

function speak(text) {
  if (!("speechSynthesis" in window) || !text) return;
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = 0.95;
  const frenchVoice = speechSynthesis.getVoices().find((voice) => voice.lang.startsWith("fr"));
  if (frenchVoice) utterance.voice = frenchVoice;

  speechSynthesis.speak(utterance);
}

// Certains navigateurs chargent les voix de façon asynchrone,
// et d'autres (Samsung Internet…) n'ont pas de synthèse vocale du tout.
if ("speechSynthesis" in window) {
  speechSynthesis.getVoices();
} else {
  speakBtn.hidden = true;
}

proBtn.addEventListener("click", () => {
  proError.hidden = true;
  proModal.hidden = false;
});

proClose.addEventListener("click", () => {
  proModal.hidden = true;
});

proModal.addEventListener("click", (event) => {
  if (event.target === proModal) proModal.hidden = true;
});

proPay.addEventListener("click", () => {
  proError.hidden = false;
});
