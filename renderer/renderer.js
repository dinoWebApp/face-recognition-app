const video = document.getElementById("video");
const statusBox = document.getElementById("status");
const MODEL_URL = "../models";

let faceMatcher = null;

// 모델 로딩 및 캠 시작
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
  faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: {} })
    .then((stream) => {
      video.srcObject = stream;
      statusBox.textContent = "카메라 준비 완료. 얼굴 데이터를 불러오는 중...";
      loadFaceData();
      setInterval(loadFaceData, 5000); // 5초마다 얼굴 정보 갱신
    })
    .catch((err) => {
      statusBox.textContent = "카메라 접근 실패: " + err;
    });
}

async function loadFaceData() {
  try {
    const res = await fetch("https://www.dabuffet.co.kr/faces");
    const data = await res.json();

    const labeled = data.map((entry) => {
      const descriptor = new Float32Array(entry.descriptor);
      return new faceapi.LabeledFaceDescriptors(entry.name, [descriptor]);
    });

    faceMatcher = new faceapi.FaceMatcher(labeled, 0.45);
    statusBox.textContent = "얼굴 데이터 로딩 완료";
  } catch (err) {
    console.error("얼굴 데이터 불러오기 실패:", err);
    statusBox.textContent = "얼굴 데이터 로딩 실패";
  }
}

// 실시간 인식 루프
video.addEventListener("play", () => {
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(video, displaySize);

  setInterval(async () => {
    if (!faceMatcher) {
      statusBox.textContent = "얼굴 데이터를 기다리는 중...";
      return;
    }

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      statusBox.textContent = "얼굴이 감지되지 않습니다.";
      return;
    }

    const area = detection.detection.box.width * detection.detection.box.height;

    if (area < 5000) {
      statusBox.textContent = "얼굴이 너무 멀리 있습니다.";
      return;
    } else if (area > 100000) {
      statusBox.textContent = "얼굴이 너무 가까이 있습니다.";
      return;
    }

    const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
    statusBox.textContent =
      bestMatch.label === "unknown"
        ? "등록되지 않은 얼굴입니다."
        : `${bestMatch.label}님이 감지되었습니다.`;
  }, 1000);
});
