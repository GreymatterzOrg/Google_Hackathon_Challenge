import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../services/apiClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Playlist = () => {
  const [screenshots, setScreenshots] = useState([]);
  const [clips, setClips] = useState([]);
  const [name, setName] = useState("Playlist");

  const { id } = useParams();

  const fetchGallery = async () => {
    try {
     
      const response = await apiClient.get(`/playlist/${id}`);

      setScreenshots(response?.data?.screenshot_paths);
      setClips(response?.data?.clips_paths);
      setName(response?.data?.playlist);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{name}</h2>

      {screenshots.length > 0 && clips.length > 0 ? (
        <>
          <div className="my-5">
            {/* <h3 className="text-xl font-bold mb-4">Screenshots</h3> */}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {screenshots.map((image, index) => (
              <div key={index} className="overflow-hidden rounded-lg shadow-lg">
                <img
                  src={`${BASE_URL}/` + image}
                  alt={`Saved ${index + 1}`}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
          <div className="my-5">{/* <h3 className="text-xl font-bold mb-4">Clips</h3> */}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {clips.map((clip, index) => (
              <div key={index} className="overflow-hidden rounded-lg shadow-lg">
                <video
                  src={`${BASE_URL}/` + clip}
                  controls
                  className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-neutral-400">No images saved yet.</p>
      )}
    </div>
  );
};

export default Playlist;
