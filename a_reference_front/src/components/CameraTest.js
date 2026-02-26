import React, { useRef, useEffect, useState } from "react";

export default function CameraTest() {
  const videoRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Erreur accès caméra : " + err.message);
      }
    }
    startCamera();
  }, []);

  return (
    <div>
      <h2>Test Caméra</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <video ref={videoRef} autoPlay playsInline width="320" height="240" />
    </div>
  );
}
