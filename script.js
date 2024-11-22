const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const cameraSelect = document.getElementById('cameraSelect');
const captureButton = document.getElementById('capture');
const uploadButton = document.getElementById('upload');

let currentStream = null;

// Get list of cameras and populate dropdown
async function getCameras() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === 'videoinput');
  cameraSelect.innerHTML = videoDevices
    .map(device => `<option value="${device.deviceId}">${device.label}</option>`)
    .join('');
}

// Start a video stream with the selected camera
async function startCamera(deviceId) {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }
  const constraints = {
    video: { deviceId: deviceId ? { exact: deviceId } : undefined },
  };
  currentStream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = currentStream;
}

// Event listener for camera switch
cameraSelect.addEventListener('change', () => {
  startCamera(cameraSelect.value);
});

// Capture image
captureButton.addEventListener('click', () => {
  const context = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Show canvas and upload button
  canvas.style.display = 'block';
  uploadButton.style.display = 'inline-block';
});

// Upload image
uploadButton.addEventListener('click', () => {
  const imageData = canvas.toDataURL('image/png');
  fetch('/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageData }),
  })
    .then(response => response.json())
    .then(data => {
      alert('Image uploaded successfully: ' + data.message);
    })
    .catch(err => console.error('Upload failed:', err));
});

// Initialize
getCameras().then(() => startCamera());
