import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const VideoSocket = () => {
  const [file, setFile] = useState(null);
  const [tooltips, setTooltips] = useState([]);
  const [videoSrc, setVideoSrc] = useState("");

  useEffect(() => {
    const socket = io(BASE_URL);

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("tooltip", (data) => {
      console.log(data, "Received tooltip data");
      setTooltips((prevTooltips) => [...prevTooltips, data]);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);

    const formData = new FormData();
    formData.append("file", uploadedFile);

    const response = await fetch("BASE_URL/upload-tool-tips", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      setVideoSrc(URL.createObjectURL(uploadedFile));
      //   alert("Video uploaded successfully!");
    } else {
      //   alert("Failed to upload video.");
    }
  };

  return (
    <div>
      <h1>Baseball Analytics</h1>
      <input type="file" onChange={handleFileUpload} />
      {videoSrc && (
        <div>
          <video src={videoSrc} controls width="600" />
          <div>
            <h2>Real-Time Insights</h2>
            <ul>
              {tooltips.map((tooltip, index) => (
                <li key={index}>
                  <strong>{tooltip.timestamp}</strong>: {tooltip.tooltip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoSocket;
