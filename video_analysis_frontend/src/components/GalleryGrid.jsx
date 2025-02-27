import axios from "axios";
import { useEffect, useState } from "react";
import { FaFolder } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const GalleryGrid = () => {
  const [screenshots, setScreenshots] = useState([]);
  const [clips, setClips] = useState([]);
  const [playlist, setPlaylist] = useState([]);

  const navigate = useNavigate();

  const fetchGallery = async () => {
    try {
      if (!localStorage.getItem("user")) return;
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await apiClient.get(`/get-file?user_id=${user?._id}`);

      setScreenshots(response?.data?.screenshots);
      setClips(response?.data?.clips);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchPlaylist = async () => {
    try {
      if (!localStorage.getItem("user")) return;
      const user = JSON.parse(localStorage.getItem("user"));

      const response = await apiClient.get(`/playlists/${user?._id}`);

      setPlaylist(response?.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchGallery();
    fetchPlaylist();
  }, []);

  return (
    <div className="min-h-100 p-6">
      <h2 className="text-[#092C4C] text-2xl text-center font-bold mb-5">Saved Gallery</h2>

      <div className="grid place-items-center grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-6">
        {playlist.map((folder) => (
          <div
            key={folder?._id}
            className="bg-[#708a87] p-4 w-75 h-32 rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer"
            onClick={() => navigate(`/playlist/${folder?._id}`)}
          >
            <div className="flex justify-center items-center mb-4">
              <div className="text-4xl text-white">
                <FaFolder />
              </div>
            </div>
            <h3 className="text-lg font-medium text-center text-white">{folder?.playlist}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryGrid;
