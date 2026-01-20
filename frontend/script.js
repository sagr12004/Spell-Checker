// ✅ RED Intro Logic (does not disturb your main logic)
window.addEventListener("load", () => {
  const intro = document.getElementById("introScreen");
  const mainApp = document.getElementById("mainApp");

  setTimeout(() => {
    intro.style.display = "none";
    mainApp.classList.remove("hidden");
  }, 5000);
});

let API_BASE = "https://spell-checker-jc5e.onrender.com";

const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const aiOutput = document.getElementById("aiOutput");
const toneOutput = document.getElementById("toneOutput");

const checkBtn = document.getElementById("checkBtn");
const aiBtn = document.getElementById("aiBtn");
const toneBtn = document.getElementById("toneBtn");
const pdfBtn = document.getElementById("pdfBtn");
const docxBtn = document.getElementById("docxBtn");

const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");

const mistakesList = document.getElementById("mistakesList");
const totalWordsEl = document.getElementById("totalWords");
const mistakesCountEl = document.getElementById("mistakesCount");
const accuracyEl = document.getElementById("accuracy");

const customWord = document.getElementById("customWord");
const addWordBtn = document.getElementById("addWordBtn");
const dictStatus = document.getElementById("dictStatus");

function updateStats(total, mistakes, accuracy) {
  totalWordsEl.textContent = total;
  mistakesCountEl.textContent = mistakes;
  accuracyEl.textContent = accuracy + "%";
}

function renderMistakes(mistakes) {
  mistakesList.innerHTML = "";

  if (!mistakes || mistakes.length === 0) {
    mistakesList.innerHTML = `<p>✅ No spelling mistakes found!</p>`;
    return;
  }

  mistakes.forEach((m) => {
    const div = document.createElement("div");
    div.className = "mistakeItem";

    div.innerHTML = `
      <div>Wrong Word: <b>${m.word}</b></div>
      <div class="suggestions"></div>
    `;

    const sugBox = div.querySelector(".suggestions");

    m.suggestions.forEach((sug) => {
      const btn = document.createElement("button");
      btn.className = "sugBtn";
      btn.innerText = sug;

      btn.addEventListener("click", () => {
        const regex = new RegExp("\\b" + m.word + "\\b", "gi");
        inputText.value = inputText.value.replace(regex, sug);
        dictStatus.textContent = `✅ Replaced "${m.word}" with "${sug}"`;
      });

      sugBox.appendChild(btn);
    });

    mistakesList.appendChild(div);
  });
}

// ✅ Spell Check
checkBtn.addEventListener("click", async () => {
  const text = inputText.value.trim();

  if (!text) {
    alert("Please enter some text!");
    return;
  }

  try {
    dictStatus.textContent = "Checking spelling...";

    const res = await fetch(`${API_BASE}/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      dictStatus.textContent = data.error;
      return;
    }

    updateStats(data.total_words, data.wrong_words_count, data.accuracy);
    renderMistakes(data.mistakes);
    outputText.value = data.corrected_text;

    dictStatus.textContent = "✅ Spell check completed!";
  } catch (err) {
    alert("Backend not connected. Run backend first!");
    console.log(err);
  }
});

// ✅ AI Improve Writing
aiBtn.addEventListener("click", async () => {
  const text = inputText.value.trim();

  if (!text) {
    alert("Please enter some text!");
    return;
  }

  try {
    dictStatus.textContent = "⏳ AI is improving your text... please wait...";
    aiOutput.value = "⏳ Generating professional version...";

    const res = await fetch(`${API_BASE}/ai-improve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      dictStatus.textContent = data.error;
      aiOutput.value = "";
      return;
    }

    if (data.professional_version) {
      aiOutput.value = data.professional_version;
    } else {
      aiOutput.value = "✅ AI improvement completed!";
    }

    dictStatus.textContent = "✅ AI professional rewrite generated!";
  } catch (err) {
    alert("Backend not connected or AI failed. Run backend first!");
    console.log(err);
  }
});

// ✅ Tone Detection
toneBtn.addEventListener("click", async () => {
  const text = inputText.value.trim();

  if (!text) {
    alert("Please enter some text!");
    return;
  }

  try {
    dictStatus.textContent = "🎭 Detecting tone... please wait...";
    toneOutput.textContent = "⏳ Detecting tone...";

    const res = await fetch(`${API_BASE}/tone-detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      toneOutput.textContent = "❌ Tone detection failed.";
      dictStatus.textContent = data.error;
      return;
    }

    toneOutput.innerHTML = `
      <b>Tone:</b> ${data.tone} <br>
      <b>Confidence:</b> ${data.confidence} <br>
      <b>Suggestion:</b> ${data.suggestion}
    `;

    dictStatus.textContent = "✅ Tone detected successfully!";
  } catch (err) {
    alert("Backend not connected or tone detect failed.");
    console.log(err);
  }
});

// ✅ Download PDF
pdfBtn.addEventListener("click", async () => {
  const text = outputText.value.trim() || inputText.value.trim();

  if (!text) {
    alert("Write something first!");
    return;
  }

  try {
    dictStatus.textContent = "📄 Generating PDF...";

    const res = await fetch(`${API_BASE}/export/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (!res.ok) {
      alert("PDF export failed.");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "spell_checker_export.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();

    dictStatus.textContent = "✅ PDF downloaded!";
  } catch (err) {
    alert("Export PDF failed.");
    console.log(err);
  }
});

// ✅ Download DOCX
docxBtn.addEventListener("click", async () => {
  const text = outputText.value.trim() || inputText.value.trim();

  if (!text) {
    alert("Write something first!");
    return;
  }

  try {
    dictStatus.textContent = "📝 Generating DOCX...";

    const res = await fetch(`${API_BASE}/export/docx`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (!res.ok) {
      alert("DOCX export failed.");
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "spell_checker_export.docx";
    document.body.appendChild(a);
    a.click();
    a.remove();

    dictStatus.textContent = "✅ DOCX downloaded!";
  } catch (err) {
    alert("Export DOCX failed.");
    console.log(err);
  }
});

// ✅ Clear
clearBtn.addEventListener("click", () => {
  inputText.value = "";
  outputText.value = "";
  aiOutput.value = "";
  mistakesList.innerHTML = "";
  toneOutput.textContent = "No tone detected yet.";
  updateStats(0, 0, 0);
  dictStatus.textContent = "";
});

// ✅ Copy Corrected Text
copyBtn.addEventListener("click", () => {
  if (!outputText.value.trim()) {
    alert("Nothing to copy!");
    return;
  }

  navigator.clipboard.writeText(outputText.value);
  alert("✅ Corrected text copied!");
});

// ✅ Add Custom Word
addWordBtn.addEventListener("click", async () => {
  const word = customWord.value.trim();

  if (!word) {
    alert("Enter a word first!");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/add-word`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word })
    });

    const data = await res.json();

    if (data.error) {
      dictStatus.textContent = data.error;
      return;
    }

    dictStatus.textContent = data.message;
    customWord.value = "";
  } catch (err) {
    alert("Backend not connected. Run backend first!");
    console.log(err);
  }
});
