import { useState } from "react";
import axios from "axios";
import apiClient from "../services/apiClient";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ScreenShotsSelection = ({ screenshot, fileId }) => {
  const [selected, setSelected] = useState([]);

  const handleSelect = (id) => {
    console.log(id, "dhhdjkhdkdkh");

    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSave = async () => {
    const payload = {
      file_id: fileId,
      screenshots: selected,
    };
    try {
      await apiClient.post("/save-files", payload);
      // alert('Saved!');
    } catch (error) {
      console.error("Error saving screenshots:", error);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h4 style={{ marginBottom: "20px" }}>Screenshots</h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        {screenshot.map((shot, index) => (
          <div
            key={shot.id}
            style={{
              position: "relative",
              border: "1px solid #ccc",
              borderRadius: "10px",
              overflow: "hidden",
              width: "60%",
              margin: "0 auto",
            }}
          >
            <img
              src={`BASE_URL/${shot}`}
              alt="Screenshot"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                borderRadius: "10px",
              }}
            />
            <input
              type="checkbox"
              onChange={() => handleSelect(shot)}
              checked={selected.includes(shot)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "20px",
                height: "20px",
              }}
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Save to Gallery
      </button>
    </div>
  );
};

export default ScreenShotsSelection;
