let currentStream = null;
let usingFrontCamera = false;

const videoElement = document.getElementById('camera-preview');
const capturedImg = document.getElementById('captured-img');
const statusMsg = document.getElementById('status-msg');
const commentBox = document.getElementById('comment');

function showStatus(message, duration = 2000) {
    statusMsg.textContent = message;
    statusMsg.style.display = 'block';
    setTimeout(() => { statusMsg.style.display = 'none'; }, duration);
}

async function startCamera() {
    try {
        currentStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
        });
        videoElement.srcObject = currentStream;
        videoElement.play();

        usingFrontCamera = false;
        showStatus('📹 Camera started (back camera)');
    } catch (err) {
        console.error(err);
        showStatus('❌ Error starting camera: ' + err.message, 4000);
    }
}

async function switchCamera() {
    if (!currentStream) return;
    currentStream.getTracks().forEach(track => track.stop());
    usingFrontCamera = !usingFrontCamera;

    try {
        currentStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: usingFrontCamera ? 'user' : 'environment' },
            audio: false
        });
        videoElement.srcObject = currentStream;
        videoElement.play();

        showStatus(`🔄 Camera flipped to ${usingFrontCamera ? 'front' : 'back'}`);
    } catch (err) {
        console.error(err);
        showStatus('❌ Error switching camera: ' + err.message, 4000);
    }
}

function takePhoto() {
    if (!videoElement.srcObject) {
        showStatus('⚠️ Start camera first!');
        return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext('2d').drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    capturedImg.src = imageDataUrl;
    capturedImg.style.display = 'block';
    showStatus('📸 Photo captured successfully!');
}

function uploadPhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            capturedImg.src = reader.result;
            capturedImg.style.display = 'block';
            showStatus('✅ Photo uploaded successfully!');
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

function savePhoto() {
    if (!capturedImg.src) {
        showStatus('⚠️ No photo to save!');
        return;
    }

    const reportData = {
        image: capturedImg.src,
        comment: commentBox.value,
        datetime: new Date().toLocaleString(),
        location: 'Unknown (GPS not implemented)'
    };

    // Store in memory (not sessionStorage as per instructions)
    window.potholeReport = reportData;

    showStatus('💾 Saving report...', 1000);
    setTimeout(() => { 
        showStatus('✅ Report saved! Redirecting...', 1500);
     window.location.href = 'report.html'; 
    }, 1000);
}

document.getElementById('start-camera').addEventListener('click', startCamera);
document.getElementById('switch-camera').addEventListener('click', switchCamera);
document.getElementById('take-photo').addEventListener('click', takePhoto);
document.getElementById('upload-photo').addEventListener('click', uploadPhoto);
document.getElementById('save-photo').addEventListener('click', savePhoto);
