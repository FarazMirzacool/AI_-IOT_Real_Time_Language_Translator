import socket
import sounddevice as sd
import numpy as np

# --- CONFIG ---
UDP_IP = "0.0.0.0" # Listen on all network interfaces
UDP_PORT = 12345
SAMPLE_RATE = 16000

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((UDP_IP, UDP_PORT))

print(f"Listening for ESP32 on port {UDP_PORT}...")

# Open the laptop speaker stream
with sd.OutputStream(channels=1, samplerate=SAMPLE_RATE, dtype='int16') as stream:
    while True:
        data, addr = sock.recvfrom(1024) # Receive audio chunks
        if data:
            samples = np.frombuffer(data, dtype=np.int16)
            stream.write(samples)