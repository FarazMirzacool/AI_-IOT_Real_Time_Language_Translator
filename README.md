# AI_-IOT_Real_Time_Language_Translator
VocalX is an ecosystem built to bridge language gaps globally. It combines a clean, animated web-based frontend dashboard with Python IoT backend servers apable of handling incoming audio stream data (such as UDP data streamed from an ESP32 or external IoT microcontrollers). The platform  translate it across 10+ languages in real time customize speech synthesis metrics (speed, pitch, and voice tones), and play back or download human-like translated audio.

🌟 Key Features1. 🌐 Web Portal Dashboard (interface.*)Modern UI: Features a sleek, responsive, modern dark-themed landing page complete with floating particles and scroll-reveal animations.Unified Hub: Serves as the central launchpad to open the specialized translation assistant and text-to-speech studio modules.

2. 🗣️ AI Voice Translation Assistant (Vocal.*)Microphone Capture: Accesses your local microphone to capture live speech naturally.Multilingual Support: Select source and target languages from a diverse group of 10+ major global languages (English, Spanish, French, German, Italian, Portuguese, Japanese, Chinese, Hindi, Arabic, Russian, and more).Translate & Speak: Instant cross-language text translation coupled with localized speech playback.
3. 
4. 🎙️ Voice Synthesizer Studio (Text.*)Dual Input Processing: Transcribe spoken audio on the fly or manually enter text script inputs.Voice Customization: Granular control dials allowing real-time modification of Speed Rate and Pitch.Human-like Tones: A grid containing an array of available native human voice profiles to choose from.Export Capabilities: Option to download generated speech sequences locally as high-quality audio files.
5. 
6. 🎛️ IoT Network Backends (server.py & translation.py)UDP Audio Streaming Socket: Python script designed to capture incoming low-latency binary audio chunks over raw network ports.Hardware Integration: Configured out-of-the-box to receive incoming audio packets from IoT devices such as an ESP32 microcontroller.Real-Time Sound Device Rendering: Converts incoming byte arrays into signed 16-bit integers (int16) on a $16\text{ kHz}$ sample rate, writing directly to computer audio output streams.

├── interface.html       # Primary Landing Page/Web Showcase
├── interface.css        # Core Global Styling & Animations
├── interface.js         # Navigation Interaction & Dynamic Routing
│
├── Vocal.html           # Real-Time Voice Translator Interface
├── vocal.css            # Layout Grid for Translation Panels
│
├── Text.html            # AI Voice Synthesizer Studio Interface
├── Text.css             # Audio Player & Sliders Layout Styles
├── Text.js              # Speech Recognition, Synthesis & File Downloads
│
├── server.py            # IoT Audio Player (UDP Socket to Output Audio Stream)
└── translation.py       # Debugging/Testing Network Hook for IoT Data Validation

🛠️ Installation & Setup
1. Frontend Web App Deployment
The web portion of VocalX is built with vanilla HTML5, CSS3, and JavaScript, meaning no build step is required.

Simply clone this repository to your computer.

Open interface.html directly in any modern standard web browser (Chrome, Edge, Safari, Firefox).

Note: To use microphone permissions properly, make sure you run the frontend via a local or secure web environment (http://localhost or https://).

2. Setting Up Python Backend Environment (IoT Streamer)
If you are streaming audio data from an IoT device like an ESP32 over your local network, configure your Python environment:

<img width="872" height="482" alt="image" src="https://github.com/user-attachments/assets/55cf7cfa-3177-4794-b7b0-465fb09c652a" />
<img width="880" height="216" alt="image" src="https://github.com/user-attachments/assets/da1133ce-64b2-4e96-be78-12c6c25ffcb5" />



🚀 How to Use
Explore the Dashboard: Open interface.html and click "Launch Voice Translator Now" or browse the navbar options.

Translate Real-Time Audio: - Open the AI Voice Translator block.

Select your source language and target language.

Tap Start Recording, speak into your microphone, and view the text conversion output automatically. Click Translate & Speak to hear the target translation.

Generate Custom Audio Files: - Open Voice Synthesizer Studio.

Input your script text, fine-tune the Pitch and Speed sliders, choose your desired human tone, and hit Generate & Speak.

Click Download as MP3 / Audio File to preserve the audio file locally.

IoT Streaming: Turn on your configured microchip (ESP32) programmed to record and push UDP chunks to your machine's local IP address on port 12345. Run server.py to hear the device's environment recordings immediately through your server speakers.

📝 Future Scope
[ ] Connect the web client frontend to the Python socket backend using WebSockets to pass live translated text parameters directly to IoT displays.

[ ] Incorporate advanced cloud AI engines (Google Cloud Speech-to-Text, OpenAI Whisper, or Azure Cognitive Services) for industry-grade translation capabilities.

[ ] Develop native embedded source code guidelines (.ino for ESP32) to simplify hardware replication steps.

📄 License
This project is open-source and structured under the MIT License.


***

### How to use this:
1. Create a new text file at the root level of your project directory and name it exactly `README.md`.
2. Copy the code block above and paste it directly into that file. 
3. Adjust references if you eventually make a specific microcontroller `.ino` sket



