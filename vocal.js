// ---------- DOM elements ----------
    const sourceTextarea = document.getElementById('sourceText');
    const translatedTextarea = document.getElementById('translatedText');
    const sourceLangSelect = document.getElementById('sourceLangSelect');
    const targetLangSelect = document.getElementById('targetLangSelect');
    const translateSpeakBtn = document.getElementById('translateAndSpeakBtn');
    const stopSpeakingBtn = document.getElementById('stopSpeakingBtn');
    const copyTranslationBtn = document.getElementById('copyTranslationBtn');
    const startRecordBtn = document.getElementById('startRecordBtn');
    const stopRecordBtn = document.getElementById('stopRecordBtn');
    const clearSourceBtn = document.getElementById('clearSourceBtn');
    const micLed = document.getElementById('micLed');
    const micStateText = document.getElementById('micStateText');
    const micStatusBadge = document.getElementById('micStatusBadge');
    const translationStatusSpan = document.getElementById('translationStatus');

    // ---------- Global references ----------
    let recognition = null;
    let isListening = false;
    let currentUtterance = null;

    // ---------- Language code mapping (for MyMemory - needs 2-letter codes mostly) ----------
    function getSourceLangCode() {
        let code = sourceLangSelect.value;
        // Map special cases for MyMemory
        const mapping = {
            'zh': 'zh',
            'zh-CN': 'zh',
            'en': 'en',
            'es': 'es',
            'fr': 'fr',
            'de': 'de',
            'it': 'it',
            'pt': 'pt',
            'ja': 'ja',
            'hi': 'hi',
            'ar': 'ar',
            'ru': 'ru'
        };
        return mapping[code] || code;
    }

    function getTargetLangForMyMemory() {
        let code = targetLangSelect.value;
        const mapping = {
            'zh-CN': 'zh',
            'en': 'en',
            'es': 'es',
            'fr': 'fr',
            'de': 'de',
            'it': 'it',
            'pt': 'pt',
            'ja': 'ja',
            'hi': 'hi',
            'ar': 'ar',
            'ru': 'ru'
        };
        return mapping[code] || code;
    }

    // ---------- Helper: speak text using laptop speakers ----------
    function speakText(text, langCode) {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
        }
        if (!text || text.trim() === "") {
            translationStatusSpan.innerText = "⚠️ Nothing to speak. Translate first!";
            setTimeout(() => { if(translationStatusSpan.innerText === "⚠️ Nothing to speak. Translate first!") translationStatusSpan.innerText = "✨ Ready"; }, 1800);
            return;
        }
        const utterance = new SpeechSynthesisUtterance(text);
        let voiceLang = langCode;
        if (langCode === 'zh-CN') voiceLang = 'zh-CN';
        else if (langCode === 'es') voiceLang = 'es-ES';
        else if (langCode === 'fr') voiceLang = 'fr-FR';
        else if (langCode === 'de') voiceLang = 'de-DE';
        else if (langCode === 'it') voiceLang = 'it-IT';
        else if (langCode === 'pt') voiceLang = 'pt-PT';
        else if (langCode === 'ja') voiceLang = 'ja-JP';
        else if (langCode === 'hi') voiceLang = 'hi-IN';
        else if (langCode === 'ar') voiceLang = 'ar-EG';
        else if (langCode === 'ru') voiceLang = 'ru-RU';
        else voiceLang = 'en-US';
        
        utterance.lang = voiceLang;
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.volume = 1;
        
        utterance.onstart = () => {
            translationStatusSpan.innerText = `🔊 Speaking: ${langCode.toUpperCase()}`;
        };
        utterance.onend = () => {
            translationStatusSpan.innerText = "✅ Speech finished";
            setTimeout(() => { if(translationStatusSpan.innerText === "✅ Speech finished") translationStatusSpan.innerText = "✨ Ready"; }, 1500);
            currentUtterance = null;
        };
        utterance.onerror = (err) => {
            console.warn("Speech error", err);
            translationStatusSpan.innerText = "⚠️ Speech error";
            currentUtterance = null;
        };
        currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    }

    function stopSpeaking() {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
            translationStatusSpan.innerText = "⏹️ Speech stopped";
            setTimeout(() => { if(translationStatusSpan.innerText === "⏹️ Speech stopped") translationStatusSpan.innerText = "✨ Ready"; }, 1000);
        }
        if (currentUtterance) currentUtterance = null;
    }

    // ---------- FIXED Translation API (MyMemory with proper language pairs) ----------
    async function translateText(text, sourceLang, targetLang) {
        if (!text || text.trim() === "") {
            return "";
        }
        
        // Map to proper 2-letter codes for MyMemory
        const sourceMap = {
            'en': 'en', 'es': 'es', 'fr': 'fr', 'de': 'de', 
            'it': 'it', 'pt': 'pt', 'ja': 'ja', 'hi': 'hi', 
            'ar': 'ar', 'ru': 'ru', 'zh': 'zh', 'zh-CN': 'zh'
        };
        
        const targetMap = {
            'es': 'es', 'fr': 'fr', 'de': 'de', 'it': 'it', 
            'pt': 'pt', 'ja': 'ja', 'hi': 'hi', 'ar': 'ar', 
            'ru': 'ru', 'en': 'en', 'zh-CN': 'zh'
        };
        
        const srcCode = sourceMap[sourceLang] || 'en';
        const tgtCode = targetMap[targetLang] || 'es';
        
        // Create proper language pair like "en|es"
        const langPair = `${srcCode}|${tgtCode}`;
        
        const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}&de=user@email.org`;
        
        try {
            translationStatusSpan.innerText = "🔄 Translating...";
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data && data.responseData && data.responseData.translatedText) {
                let translated = data.responseData.translatedText;
                // Clean up HTML entities
                translated = translated.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
                translationStatusSpan.innerText = "✅ Translation ready";
                return translated;
            } else {
                throw new Error("Invalid translation response");
            }
        } catch (err) {
            console.error("Translation error:", err);
            translationStatusSpan.innerText = "⚠️ Translation failed, trying fallback...";
            
            // Fallback to a different endpoint or show error
            return `[Translation note: Could not translate "${text.substring(0, 50)}..." - Check network or try again]`;
        }
    }

    // Main translate + speak
    async function performTranslationAndSpeak() {
        const sourceRaw = sourceTextarea.value.trim();
        if (sourceRaw === "") {
            translationStatusSpan.innerText = "❌ No source text to translate";
            setTimeout(() => { if(translationStatusSpan.innerText === "❌ No source text to translate") translationStatusSpan.innerText = "✨ Ready"; }, 1500);
            return;
        }
        
        const sourceLang = getSourceLangCode();
        const targetLangDisplay = targetLangSelect.value;
        const targetLangForApi = getTargetLangForMyMemory();
        
        const translated = await translateText(sourceRaw, sourceLang, targetLangForApi);
        
        if (translated && translated !== "" && !translated.startsWith("[Translation note:")) {
            translatedTextarea.value = translated;
            speakText(translated, targetLangDisplay);
        } else if (translated && translated.startsWith("[Translation note:")) {
            translatedTextarea.value = translated;
            translationStatusSpan.innerText = "⚠️ Translation API error - using fallback";
        } else {
            translatedTextarea.value = "Translation unavailable. Please retry.";
            translationStatusSpan.innerText = "❌ Translation failed";
        }
    }

    // ---------- Speech Recognition (Web Speech API) ----------
    function initRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Your browser does not support Speech Recognition. Please use Chrome, Edge, or Safari.");
            return null;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        
        // Set recognition language based on selected source language
        const sourceLang = sourceLangSelect.value;
        const langMap = {
            'en': 'en-US', 'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE',
            'it': 'it-IT', 'pt': 'pt-PT', 'ja': 'ja-JP', 'hi': 'hi-IN',
            'ar': 'ar-EG', 'ru': 'ru-RU', 'zh': 'zh-CN'
        };
        recog.lang = langMap[sourceLang] || 'en-US';
        
        recog.maxAlternatives = 1;
        return recog;
    }

    function startListening() {
        if (isListening) {
            stopListening();
        }
        if (!recognition) {
            recognition = initRecognition();
            if (!recognition) return;
            attachRecognitionEvents();
        }
        try {
            recognition.start();
            isListening = true;
            updateMicUI(true);
            startRecordBtn.disabled = true;
            stopRecordBtn.disabled = false;
            micStatusBadge.innerText = "🎙️ Listening...";
            micStateText.innerText = "Recording... speak now";
            translationStatusSpan.innerText = "🎤 Speak into microphone...";
        } catch (err) {
            console.error("Start error:", err);
            alert("Could not start mic. Check permissions.");
            resetMicUI();
        }
    }

    function stopListening() {
        if (recognition && isListening) {
            try {
                recognition.stop();
            } catch(e) { console.warn(e); }
        }
        isListening = false;
        updateMicUI(false);
        startRecordBtn.disabled = false;
        stopRecordBtn.disabled = true;
        micStatusBadge.innerText = "⚪ Inactive";
        micStateText.innerText = "Microphone idle";
        if (translationStatusSpan.innerText === "🎤 Speak into microphone...") {
            translationStatusSpan.innerText = "✨ Ready";
        }
    }

    function updateMicUI(active) {
        if (active) {
            micLed.classList.add('active');
            micStateText.innerText = "🔴 Listening...";
        } else {
            micLed.classList.remove('active');
            micStateText.innerText = "Microphone idle";
        }
    }

    function resetMicUI() {
        updateMicUI(false);
        startRecordBtn.disabled = false;
        stopRecordBtn.disabled = true;
        micStatusBadge.innerText = "⚪ Inactive";
    }

    function attachRecognitionEvents() {
        if (!recognition) return;
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (transcript && transcript.trim()) {
                sourceTextarea.value = transcript;
                translationStatusSpan.innerText = "✅ Voice captured! Click 'Translate & Speak'";
                translatedTextarea.value = "";
            } else {
                sourceTextarea.value = "";
            }
            stopListening();
        };
        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            let msg = "";
            if (event.error === 'not-allowed') msg = "Microphone permission denied.";
            else if (event.error === 'no-speech') msg = "No speech detected. Try again.";
            else msg = `Error: ${event.error}`;
            translationStatusSpan.innerText = `⚠️ ${msg}`;
            stopListening();
        };
        recognition.onend = () => {
            if (isListening) {
                isListening = false;
                updateMicUI(false);
                startRecordBtn.disabled = false;
                stopRecordBtn.disabled = true;
                micStatusBadge.innerText = "⚪ Inactive";
                micStateText.innerText = "Microphone idle";
            }
        };
    }

    // ---------- Copy Translation ----------
    async function copyTranslation() {
        const translated = translatedTextarea.value;
        if (!translated || translated === "") {
            translationStatusSpan.innerText = "⚠️ Nothing to copy";
            return;
        }
        try {
            await navigator.clipboard.writeText(translated);
            translationStatusSpan.innerText = "📋 Copied to clipboard!";
            setTimeout(() => { if(translationStatusSpan.innerText === "📋 Copied to clipboard!") translationStatusSpan.innerText = "✨ Ready"; }, 1500);
        } catch (err) {
            alert("Could not copy, manually select text");
        }
    }

    // ---- Update recognition language when source language changes ----
    sourceLangSelect.addEventListener('change', () => {
        if (recognition) {
            const newLang = sourceLangSelect.value;
            const langMap = {
                'en': 'en-US', 'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE',
                'it': 'it-IT', 'pt': 'pt-PT', 'ja': 'ja-JP', 'hi': 'hi-IN',
                'ar': 'ar-EG', 'ru': 'ru-RU', 'zh': 'zh-CN'
            };
            recognition.lang = langMap[newLang] || 'en-US';
        }
        translationStatusSpan.innerText = `✨ Source language changed to ${sourceLangSelect.options[sourceLangSelect.selectedIndex].text}`;
        setTimeout(() => { if(translationStatusSpan.innerText.includes("Source language changed")) translationStatusSpan.innerText = "✨ Ready"; }, 1500);
    });

    // ---- event listeners ----
    translateSpeakBtn.addEventListener('click', () => {
        performTranslationAndSpeak();
    });
    stopSpeakingBtn.addEventListener('click', () => {
        stopSpeaking();
    });
    copyTranslationBtn.addEventListener('click', copyTranslation);
    startRecordBtn.addEventListener('click', () => {
        startListening();
    });
    stopRecordBtn.addEventListener('click', () => {
        stopListening();
    });
    clearSourceBtn.addEventListener('click', () => {
        sourceTextarea.value = "";
        translatedTextarea.value = "";
        translationStatusSpan.innerText = "✨ Cleared";
        setTimeout(() => { if(translationStatusSpan.innerText === "✨ Cleared") translationStatusSpan.innerText = "✨ Ready"; }, 1000);
        stopSpeaking();
    });
    
    window.addEventListener('beforeunload', () => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        if (recognition && isListening) recognition.abort();
    });
    
    resetMicUI();
    translationStatusSpan.innerText = "✨ Ready ";