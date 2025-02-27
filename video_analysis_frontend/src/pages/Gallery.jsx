import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import GalleryGrid from "../components/GalleryGrid";
import toast from "react-hot-toast";
import apiClient from "../services/apiClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Gallery = () => {
  const [activeTab, setActiveTab] = useState("saved");
  const [videoFile, setVideoFile] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [videoClips, setVideoClips] = useState([]);
  const [selectedVideoClips, setSelectedVideoClips] = useState([]);
  const [originalVideoClip, setOriginalVideoClip] = useState("");

  const [name, setName] = useState("");

  const [selectedScreenshot, setSelectedScreenshot] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  // New state for user prompt and clip duration
  const [userPrompt, setUserPrompt] = useState("");
  const [clipDuration, setClipDuration] = useState("");

  const [videoURL, setVideoURL] = useState(""); // State to hold the video URL

  useEffect(() => {
    if (videoFile) {
      const objectURL = URL.createObjectURL(videoFile);
      setVideoURL(objectURL); // Set video URL whenever the file changes
    }
    return () => {
      if (videoURL) {
        URL.revokeObjectURL(videoURL); // Cleanup the URL when the component is unmounted or video changes
      }
    };
  }, [videoFile]); // Only recreate URL when videoFile changes

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleVideoUpload = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleProcessVideo = async () => {
    if (!videoFile) {
      alert("Please upload a video first!");
      return;
    }
    setLoading(true);

    // Retrieve user_id from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user["_id"];
    // console.log(userId,'user---------------------------');

    // Create FormData object and append the video file, user_id, prompt, and duration
    const formData = new FormData();
    formData.append("file", videoFile);
    formData.append("user_id", userId);
    formData.append("user_prompt", userPrompt);
    formData.append("clip_duration", clipDuration);

    try {
      const response = await apiClient.post("/upload", formData);
      // setUploadStatus(response.data.message); // Display success message
      setScreenshots(response?.screenshots);
      setVideoClips(response?.clips);
      setOriginalVideoClip(response?.original_video);
      localStorage.setItem("fileId", response?.file_id);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToPlaylist = async () => {
    if (!localStorage.getItem("user")) return;
    const user = JSON.parse(localStorage.getItem("user"));

    await handleSaveScreenshot();

    const payload = {
      file_id: localStorage.getItem("fileId"),
      screenshot_paths: selectedScreenshot,
      clips_paths: selectedVideoClips,
      original_path: originalVideoClip,
      playlist: name,
      user_id: user._id,
    };

    setLoadingSave(true);

    try {
      await apiClient.post("/playlist", payload);

      // toast.success("Saved !");
    } catch (error) {
      console.error("Error saving screenshots:", error);
      toast.success("Error Saving !");
    } finally {
      setLoadingSave(false);
    }
  };

  const handleSaveScreenshot = async () => {
    if (!localStorage.getItem("user")) return;
    const user = JSON.parse(localStorage.getItem("user"));

    const payload = {
      file_id: localStorage.getItem("fileId"),
      screenshots: selectedScreenshot,
      clips: selectedVideoClips,
      original_path: originalVideoClip,
      user_id: user._id,
    };


    setLoadingSave(true);

    try {
      await apiClient.post("/save-files", payload);

      toast.success("Saved !");
    } catch (error) {
      console.error("Error saving screenshots:", error);
      toast.error("Error Saving !");
    } finally {
      setLoadingSave(false);
    }
  };

  const handleSelectItem = (item) => {
    if (selectedScreenshot.includes(item)) {
      setSelectedScreenshot(selectedScreenshot.filter((selected) => selected !== item));
    } else {
      setSelectedScreenshot([...selectedScreenshot, item]);
    }
  };

  const handleSelectVideo = (item) => {
    if (selectedVideoClips.includes(item)) {
      setSelectedVideoClips(selectedVideoClips.filter((selected) => selected !== item));
    } else {
      setSelectedVideoClips([...selectedVideoClips, item]);
    }
  };

  const removeVideo = () => {
    setVideoURL("");
    setVideoFile(null);
  };

  return (
    <div className="min-h-screen text-gray-200 flex flex-col items-center py-10 px-4">
      {/* Tabs */}
      {}

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === "new" ? (
          <div className=" p-6 flex space-x-6">
            {/* Upload Video Section */}
            <div className="bg-[#E9F5F4] p-6 rounded-lg shadow-lg w-1/2">
              <h2 className="text-[#092C4C] text-2xl font-bold mb-4">Upload Video</h2>

              {/* Video Preview Section */}
              {videoFile && videoURL ? (
                <div className="relative w-full flex items-center justify-center">
                  <video
                    src={videoURL}
                    controls
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={removeVideo}
                    className="absolute top-2 right-2 bg-zinc-900 text-white p-2 rounded-full hover:bg-zinc-800 transition-all"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#092C4C] p-6 rounded-lg text-center">
                  <label className="cursor-pointer text-[#092C4C] hover:underline">
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoUpload}
                    />
                    {videoFile ? (
                      <p className="text-gray-200">{videoFile.name}</p>
                    ) : (
                      "Click to upload video"
                    )}
                  </label>
                </div>
              )}
              {/* User prompt input */}
              <label className="block text-[#092C4C] mt-4">
                Enter prompt for getting specific moments from the video:
              </label>
              <input
                type="text"
                placeholder="Enter your prompt"
                className="mt-4 w-full p-2 bg-white text-[#092C4C] rounded-md"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
              />
              {/* Clip duration input */}
              <label className="block text-[#092C4C] mt-4">
                Enter your desired clip duration(seconds):
              </label>
              <input
                type="number"
                placeholder="Clip duration (seconds)"
                className="mt-2 w-full p-2 bg-white text-[#092C4C] rounded-md"
                value={clipDuration}
                onChange={(e) => setClipDuration(e.target.value)}
              />
              <button
                onClick={handleProcessVideo}
                className="mt-4 w-full cursor-pointer bg-[#708a87] hover:bg-[#708a87cf] text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300"
                disabled={loading || !videoFile}
              >
                {loading ? "Processing..." : "Process"}
              </button>
            </div>

            {/* Display Screenshots Section */}
            <div className="bg-[#E9F5F4] p-6 rounded-lg shadow-lg w-1/2">
              <h2 className=" text-[#092C4C] text-2xl font-bold mb-4">Best Moments</h2>

              {/* Video Clips Section */}
              <div className="mb-6">
                {videoClips.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {videoClips.map((clip, index) => (
                      <div
                        key={index}
                        className={`relative overflow-hidden rounded-lg shadow-lg cursor-pointer`}
                      >
                        <video
                          src={`${BASE_URL}/` + clip}
                          controls
                          className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                        />
                        <input
                          type="checkbox"
                          onClick={() => handleSelectVideo(clip)}
                          className="absolute top-2 right-2"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No video clips available.</p>
                )}
              </div>

              {/* Screenshots Section */}
              <div className="grid grid-cols-2 gap-4">
                {screenshots.length > 0 ? (
                  screenshots.map((screenshot, index) => (
                    <div
                      key={index}
                      className={`relative overflow-hidden rounded-lg shadow-lg cursor-pointer ${
                        selectedScreenshot.includes(screenshot) ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => handleSelectItem(screenshot)}
                    >
                      <img
                        src={`${BASE_URL}/` + screenshot}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No screenshots available.</p>
                )}
              </div>

              {/* Save Selected Screenshots */}
              {videoClips.length && screenshots.length ? (
                <>
                  {}
                  <div className="flex flex-col md:flex-row items-center my-5">
                    <input
                      type="text"
                      placeholder="Enter playlist name"
                      className="mb-4 md:mb-0 md:mr-4 w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <button
                      onClick={() => handleSaveToPlaylist()}
                      className="w-full md:w-auto bg-green-600 disabled:bg-green-800 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300"
                      disabled={!selectedScreenshot.length && !selectedVideoClips.length}
                    >
                      {loadingSave ? "Saving..." : "Save to playlist"}
                    </button>
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        ) : (
          <GalleryGrid />
        )}
      </div>
    </div>
  );
};

export default Gallery;
