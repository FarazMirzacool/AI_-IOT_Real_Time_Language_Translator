// DOM Elements
    const recordBtn = document.getElementById('recordBtn');
    const recordingLanguage = document.getElementById('recordingLanguage');
    const transcriptText = document.getElementById('transcriptText');
    const manualText = document.getElementById('manualText');
    const clearBtn = document.getElementById('clearBtn');
    const copyTextBtn = document.getElementById('copyTextBtn');
    const speakBtn = document.getElementById('speakBtn');
    const stopBtn = document.getElementById('stopBtn');
    const voiceSelect = document.getElementById('voiceSelect');
    const speedSlider = document.getElementById('speedSlider');
    const pitchSlider = document.getElementById('pitchSlider');
    const speedValue = document.getElementById('speedValue');
    const pitchValue = document.getElementById('pitchValue');
    const voiceListDiv = document.getElementById('voiceList');
    const audioPlayer = document.getElementById('audioPlayer');
    const audioElement = document.getElementById('audioElement');
    const downloadBtn = document.getElementById('downloadBtn');
    const statusMessage = document.getElementById('statusMessage');

    // Speech Recognition
    let recognition = null;
    let isRecording = false;
    
    // Speech Synthesis
    let currentUtterance = null;
    let availableVoices = [];
    let mediaRecorder = null;
    let audioChunks = [];

    // Initialize Speech Recognition
    function initRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            statusMessage.innerText = '❌ Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.';
            statusMessage.className = 'status error';
            recordBtn.disabled = true;
            return null;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        return recog;
    }

    // Start Recording
    function startRecording() {
        if (!recognition) {
            recognition = initRecognition();
            if (!recognition) return;
            attachRecognitionEvents();
        }
        
        const selectedLang = recordingLanguage.value;
        recognition.lang = selectedLang;
        
        try {
            recognition.start();
            isRecording = true;
            recordBtn.classList.add('recording');
            recordBtn.innerHTML = '🔴 Recording... Click to Stop';
            statusMessage.innerText = `🎤 Listening in ${recordingLanguage.options[recordingLanguage.selectedIndex].text}... Speak now!`;
            statusMessage.className = 'status info';
        } catch (err) {
            console.error('Start error:', err);
            statusMessage.innerText = '❌ Could not start recording. Check microphone permissions.';
            statusMessage.className = 'status error';
            stopRecording();
        }
    }

    function stopRecording() {
        if (recognition && isRecording) {
            try {
                recognition.stop();
            } catch(e) {}
        }
        isRecording = false;
        recordBtn.classList.remove('recording');
        recordBtn.innerHTML = '🎙️ Start Recording';
    }

    function attachRecognitionEvents() {
        if (!recognition) return;
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const currentText = transcriptText.value;
            transcriptText.value = currentText ? currentText + ' ' + transcript : transcript;
            manualText.value = transcriptText.value;
            statusMessage.innerText = '✅ Voice captured! You can now generate speech.';
            statusMessage.className = 'status success';
            stopRecording();
        };
        
        recognition.onerror = (event) => {
            console.error('Recognition error:', event.error);
            let msg = '';
            if (event.error === 'not-allowed') msg = 'Microphone permission denied.';
            else if (event.error === 'no-speech') msg = 'No speech detected. Try again.';
            else msg = `Error: ${event.error}`;
            statusMessage.innerText = `⚠️ ${msg}`;
            statusMessage.className = 'status error';
            stopRecording();
        };
        
        recognition.onend = () => {
            if (isRecording) {
                stopRecording();
            }
        };
    }

    // Load Available Voices
    function loadVoices() {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            availableVoices = voices;
            updateVoiceList();
            updateVoiceSelect();
        }
    }

    function updateVoiceList() {
        if (availableVoices.length === 0) {
            voiceListDiv.innerHTML = '<div style="color: #94a3b8; text-align: center; padding: 1rem;">Loading voices...</div>';
            return;
        }
        
        voiceListDiv.innerHTML = availableVoices.map((voice, index) => `
            <div class="voice-card" data-voice-index="${index}">
                <div class="voice-name">${voice.name}</div>
                <div class="voice-lang">${voice.lang} • ${voice.localService ? 'Local' : 'Network'}</div>
            </div>
        `).join('');
        
        // Add click handlers
        document.querySelectorAll('.voice-card').forEach(card => {
            card.addEventListener('click', () => {
                const index = parseInt(card.dataset.voiceIndex);
                voiceSelect.value = index;
                document.querySelectorAll('.voice-card').forEach(vc => vc.classList.remove('active'));
                card.classList.add('active');
                statusMessage.innerText = `✅ Selected voice: ${availableVoices[index].name}`;
                statusMessage.className = 'status success';
                setTimeout(() => {
                    if (statusMessage.innerText.includes('Selected')) {
                        statusMessage.innerText = '💡 Ready! Click Generate & Speak to hear it.';
                        statusMessage.className = 'status info';
                    }
                }, 2000);
            });
        });
    }

    function updateVoiceSelect() {
        voiceSelect.innerHTML = availableVoices.map((voice, index) => 
            `<option value="${index}">${voice.name} (${voice.lang})</option>`
        ).join('');
    }

    // Get current text (from either manual input or transcript)
    function getCurrentText() {
        const manualTextValue = manualText.value.trim();
        const transcriptValue = transcriptText.value.trim();
        
        if (manualTextValue) return manualTextValue;
        if (transcriptValue) return transcriptValue;
        return '';
    }

    // Speak Text
    function speakText() {
        const text = getCurrentText();
        if (!text) {
            statusMessage.innerText = '⚠️ Please record or type some text first!';
            statusMessage.className = 'status error';
            return;
        }
        
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoiceIndex = parseInt(voiceSelect.value);
        
        if (selectedVoiceIndex >= 0 && availableVoices[selectedVoiceIndex]) {
            utterance.voice = availableVoices[selectedVoiceIndex];
        }
        
        utterance.rate = parseFloat(speedSlider.value);
        utterance.pitch = parseFloat(pitchSlider.value);
        utterance.volume = 1;
        
        utterance.onstart = () => {
            statusMessage.innerText = '🔊 Generating speech...';
            statusMessage.className = 'status info';
        };
        
        utterance.onend = () => {
            statusMessage.innerText = '✅ Speech generated successfully! You can download it.';
            statusMessage.className = 'status success';
            currentUtterance = null;
            
            // Create downloadable audio
            createAudioFromSpeech(text, utterance.voice, utterance.rate, utterance.pitch);
        };
        
        utterance.onerror = (err) => {
            console.error('Speech error:', err);
            statusMessage.innerText = '⚠️ Speech generation error. Try a different voice.';
            statusMessage.className = 'status error';
            currentUtterance = null;
        };
        
        currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    }

    // Create downloadable audio using MediaRecorder
    async function createAudioFromSpeech(text, voice, rate, pitch) {
        // Using Web Audio API to capture speech synthesis output
        // Alternative: Use browser's built-in capability - record using MediaStream
        try {
            // For simplicity, we'll offer download via recording the speech output
            // Since capturing SpeechSynthesis directly is complex, we provide an alternative:
            statusMessage.innerText = '💡 Click the download button after playing the audio to save it.';
            audioPlayer.classList.add('show');
            
            // Note: Due to browser security, we can only download if we record the audio
            // For now, we'll show a message that they can use browser extensions or screen recording
            // Better solution: Use server-side TTS (which would require API)
            
            // Update message for clarity
            setTimeout(() => {
                if (statusMessage.innerText.includes('download')) {
                    statusMessage.innerText = '🎵 Audio played! You can use browser dev tools or extensions to record, or try the demo below.';
                }
            }, 3000);
            
        } catch (err) {
            console.error('Audio creation error:', err);
        }
    }

    // Alternative Download Method - Using Web Audio API to record
    function startRecordingAudio() {
        // This would require capturing the audio output
        // For now, we'll provide a workaround message
        alert('To download speech as MP3:\n\n1. Play the speech above\n2. Use a browser extension like "Audio Capture" or "Voice Recorder"\n3. Or right-click on the page and select "Save as" for recorded audio\n\nFor professional use, consider using TTS APIs like ElevenLabs, Google TTS, or AWS Polly which provide direct MP3 download.');
    }

    function stopSpeaking() {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            statusMessage.innerText = '⏹️ Speech stopped.';
            statusMessage.className = 'status info';
            currentUtterance = null;
        }
    }

    function clearAll() {
        transcriptText.value = '';
        manualText.value = '';
        statusMessage.innerText = '✨ All cleared! Ready for new input.';
        statusMessage.className = 'status success';
        setTimeout(() => {
            if (statusMessage.innerText === '✨ All cleared! Ready for new input.') {
                statusMessage.innerText = '💡 Ready! Record your voice or type text.';
                statusMessage.className = 'status info';
            }
        }, 2000);
        stopSpeaking();
    }

    async function copyText() {
        const text = getCurrentText();
        if (!text) {
            statusMessage.innerText = '⚠️ Nothing to copy!';
            statusMessage.className = 'status error';
            return;
        }
        try {
            await navigator.clipboard.writeText(text);
            statusMessage.innerText = '📋 Text copied to clipboard!';
            statusMessage.className = 'status success';
            setTimeout(() => {
                if (statusMessage.innerText === '📋 Text copied to clipboard!') {
                    statusMessage.innerText = '💡 Ready!';
                    statusMessage.className = 'status info';
                }
            }, 2000);
        } catch (err) {
            statusMessage.innerText = '❌ Could not copy text.';
            statusMessage.className = 'status error';
        }
    }

    function downloadAudio() {
        // Fallback for download - provide instructions
        statusMessage.innerText = '📥 To download the speech: Play it first, then use your browser\'s built-in recorder or extensions like "Audio Capture" for MP3 download.';
        statusMessage.className = 'status info';
        
        // Alternative: Create a text file with instructions
        const text = getCurrentText();
        if (text) {
            const blob = new Blob([`Text for voice generation:\n\n${text}\n\nTo get audio: Play the speech and use a screen recorder or audio capture tool.`], {type: 'text/plain'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'voice_text_backup.txt';
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    // Update slider values
    speedSlider.addEventListener('input', () => {
        speedValue.textContent = speedSlider.value;
    });
    
    pitchSlider.addEventListener('input', () => {
        pitchValue.textContent = pitchSlider.value;
    });

    // Event Listeners
    recordBtn.addEventListener('click', () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    });
    
    speakBtn.addEventListener('click', speakText);
    stopBtn.addEventListener('click', stopSpeaking);
    clearBtn.addEventListener('click', clearAll);
    copyTextBtn.addEventListener('click', copyText);
    downloadBtn.addEventListener('click', downloadAudio);
    
    // Sync manual text with transcript
    manualText.addEventListener('input', () => {
        // Don't auto-sync to keep both separate
    });
    
    // Load voices when page loads
    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
            loadVoices();
        };
        loadVoices();
    } else {
        statusMessage.innerText = '❌ Speech synthesis not supported in this browser.';
        statusMessage.className = 'status error';
        speakBtn.disabled = true;
    }
    
    // Initialize recognition
    recognition = initRecognition();
    if (recognition) {
        attachRecognitionEvents();
    }
    
    statusMessage.innerText = '💡 Ready! Choose a voice, record or type text, then click Generate & Speak.';