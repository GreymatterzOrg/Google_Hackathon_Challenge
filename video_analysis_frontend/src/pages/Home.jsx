import { useEffect, useState } from "react";
import ChatSection from "../components/ChatSection";
import VideoUploadPlayback from "../components/VideoUploadPlayback";
import InsightTabs from "../components/InsightSection";
import GallerySection from "../components/GallerySection";

import io from "socket.io-client";

import toast from "react-hot-toast";
import axios from "axios";
import apiClient from "../services/apiClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Home = () => {
  const [screenshots, setScreenshots] = useState([]);
  const [clips, setClips] = useState([]);
  const [fileId, setFileId] = useState("");
  const [originalVideoFile, setOriginalVideoFile] = useState(null);
  const [trimmedVideos, setTrimmedVideos] = useState([]);
  const [players, setPlayers] = useState([]);
  const [insights, setInsights] = useState([]);
  const [activeTab, setActiveTab] = useState("INSIGHTS");
  const [insightStatus, setInsightStatus] = useState(false);
  const [loading, setLoading] = useState({
    process: false,
    trim: false,
    best_moment: false,
    insight: false,
  });

  useEffect(() => {
    const socket = io(BASE_URL);

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("tooltip", (data) => {
      console.log(data, "Received tooltip data");
      setInsights((prevTooltips) => [...prevTooltips, data]);
      setInsightStatus(false);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Handle video upload
  const handleUpload = async () => {
    setLoading({
      ...loading,
      process: true,
    }); // Set loading to true

    const formData = new FormData();
    formData.append("file", originalVideoFile, "file" + Date.now().toString(36) + ".mp4");

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.["_id"];

    if (userId) {
      formData.append("user_id", userId);
    }

    try {
      const response = await apiClient.post("/upload-query", formData);

      // setScreenshots(response?.data?.screenshots);
      setFileId(response?.file_id);
      setPlayers(response?.players);
      setActiveTab("PLAYERS");

      toast.success("Process Successful !");
    } catch (error) {
      console.log(error);
      toast.error("Process failed !");
    } finally {
      setLoading({
        ...loading,
        process: false,
      }); // Set loading to true
    }
  };

  const handleTrim = async (range) => {
    const [startTime, endTime] = range;

    const formData = new FormData();
    formData.append("file", originalVideoFile, "file" + Date.now().toString(36) + ".mp4");
    formData.append("start_timestamp", startTime);
    formData.append("end_timestamp", endTime);

    setLoading({
      ...loading,
      trim: true,
    }); // Set loading to true

    try {
      const response = await apiClient.post("/generate_clips", formData);

      setTrimmedVideos((prev) => [...prev, response?.clip_path]); // Save the trimmed video URL
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      toast.success("Trimmed");
    } catch (error) {
      console.error("Error during API call:", error);
    } finally {
      setLoading({
        ...loading,
        trim: false,
      }); // Set loading to true
    }
  };

  // Handle re-upload and tooltip reset
  const handleTooltips = async () => {
    setLoading({
      ...loading,
      insight: true,
    }); // Set loading to true

    const formData = new FormData();
    formData.append("file", originalVideoFile, "file" + Date.now().toString(36) + ".mp4");
    setInsights([]);

    try {
      const response = await apiClient.post("/upload-tool-tips", formData);

      setActiveTab("INSIGHTS");
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
      setInsightStatus(true);
    } catch (error) {
      console.error("Error updating tooltips:", error);
    } finally {
      setLoading({
        ...loading,
        insight: false,
      }); // Set loading to true
    }
  };

  const handleProcessVideo = async (userPrompt, clipDuration) => {
    if (!originalVideoFile) {
      alert("Please upload a video first!");
      return;
    }
    setLoading({
      ...loading,
      best_moment: true,
    });

    // Retrieve user_id from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user["_id"];
    // console.log(userId,'user---------------------------');

    // Create FormData object and append the video file, user_id, prompt, and duration
    const formData = new FormData();
    formData.append("file", originalVideoFile, "file" + Date.now().toString(36) + ".mp4");
    formData.append("user_id", userId);
    formData.append("user_prompt", userPrompt);
    formData.append("clip_duration", clipDuration);

    try {
      const response = await apiClient.post("/upload", formData);
      // setUploadStatus(response.data.message); // Display success message
      setScreenshots(response?.screenshots);
      setClips(response?.clips);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      localStorage.setItem("fileId", response?.file_id);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading({
        ...loading,
        best_moment: false,
      });
    }
  };

  const handleOriginalVideoFile = (file) => {
    setOriginalVideoFile(file);
  };

  const handleBestMoment = () => {
    setActiveTab("BEST_MOMENT");
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="grid grid-cols-12 w-full">
          {/* First box (30% width) */}
          <div className="col-span-8 text-white rounded-lg p-5">
            <VideoUploadPlayback
              setScreenshot={setScreenshots}
              setFileId={setFileId}
              handleOriginalVideoFile={handleOriginalVideoFile}
              handleTooltips={handleTooltips}
              handleUpload={handleUpload}
              handleTrim={handleTrim}
              fileId={fileId}
              handleBestMoment={handleBestMoment}
              loading={loading}
            />

            <InsightTabs
              handleProcessVideo={handleProcessVideo}
              players={players}
              insights={insights}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              loading={loading}
              insightStatus={insightStatus}
            />
          </div>

          {/* Second box (70% width) */}
          <div className="col-span-4 text-white p-5 bg-[#ECF4FA]">
            <GallerySection trimmedVideos={trimmedVideos} clips={clips} screenshots={screenshots} />
            <ChatSection fileId={fileId} />
          </div>

          {/* Third box (70% width) */}
          {/* <div className="col-span-7 text-white rounded-lg">
          </div> */}

          {/* Fourth box (30% width) */}
          {/* <div className="col-span-5 text-white rounded-lg">
            
          </div> */}
        </div>
      </div>
    </>
  );
};

export default Home;
