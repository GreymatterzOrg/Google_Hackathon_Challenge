import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoMdClose } from "react-icons/io";
import apiClient from "../services/apiClient";

const PlayersInfo = ({ playerName, onClose }) => {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerInfo = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(
          `https://statsapi.mlb.com/api/v1/people/search?names=${playerName}`
        );
        setPlayer(response.people[0]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    if (playerName) {
      fetchPlayerInfo();
    }
  }, [playerName]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-screen bg-[rgba(0,0,0,0.8)] h-screen p-6">
      <div className="relative bg-white rounded-2xl shadow-lg flex flex-col overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-1 right-1 bg-gray-900 rounded-full text-white hover:text-gray-500 text-2xl"
        >
          <IoMdClose size={30} />
        </button>

        {/* Player Information */}
        <div className="flex flex-col md:flex-row p-8">



        <table className="table-auto border-collapse border border-gray-400">
          <tbody>
            <tr>
              <td rowspan="9" className="border border-gray-300 p-4">
                {loading ? (
                <div className="w-60 h-75 bg-gray-500 rounded animate-pulse"></div>
                ) : (
                  <img
                    src={`https://img.mlbstatic.com/mlb-photos/image/upload/w_213,d_people:generic:headshot:silo:current.png,q_auto:best,f_auto/v1/people/${player?.id}/headshot/67/current`}
                    alt={player?.fullName}
                    className="w-60 h-75 object-cover rounded-lg"
                  />
                )}
                <h2 className="text-xl text-center font-bold pt-3 text-gray-800">{player?.fullName}</h2>
              </td>
            </tr>

            {loading ? (
              <>
              <tr>
                <td rowspan="9" className="border border-gray-300 p-4 w-[300px]">
                  <div className="animate-pulse space-y-4">
                    {Array(8)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="h-4 bg-gray-500 rounded w-full"></div>
                      ))}
                  </div>
                </td>
              </tr>
              </>
            ) : (

              <>
                <tr>
                  <td className="border border-gray-300 text-gray-900 p-2 font-medium">Date of Birth</td>
                  <td className="border border-gray-300 text-gray-900 p-2">{player?.birthDate}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 text-gray-900 p-2 font-medium">Height</td>
                  <td className="border border-gray-300 text-gray-900 p-2">{player?.height}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 text-gray-900 p-2 font-medium">Weight</td>
                  <td className="border border-gray-300 text-gray-900 p-2">{player?.weight} lbs</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 text-gray-900 p-2 font-medium">Position</td>
                  <td className="border border-gray-300 text-gray-900 p-2">{player?.primaryPosition.name} (
                    {player?.primaryPosition.abbreviation})</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 text-gray-900 p-2 font-medium">Bats</td>
                  <td className="border border-gray-300 text-gray-900 p-2">{player?.batSide.description}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 text-gray-900 p-2 font-medium">Throws</td>
                  <td className="border border-gray-300 text-gray-900 p-2">{player?.pitchHand.description}
                  {player?.pitchHand.description}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 text-gray-900 p-2 font-medium">Place of Birth</td>
                  <td className="border border-gray-300 text-gray-900 p-2">{player?.birthCity}, {player?.birthStateProvince}
                  , {player?.birthCountry}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 text-gray-900 p-2 font-medium">MLB Debut</td>
                  <td className="border border-gray-300 text-gray-900 p-2">{player?.mlbDebutDate}</td>
                </tr>
              </>
            )}
            


          </tbody>
        </table>



          {/* Left Side - Image */}
          {}

          {/* Right Side - Details */}
          {}

        </div>
      </div>
    </div>
  );
};

export default PlayersInfo;
