import { useState } from "react";
import { Oval } from "react-loader-spinner";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";
import toast from "react-hot-toast";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email_id: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { action: "login", ...formData };

      const response = await apiClient.post("/authUser", payload);

      // Save user data to localStorage
      localStorage.setItem("user", JSON.stringify(response?.user));
      navigate("/"); // Redirect to home or dashboard
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error("Something went Wrong!");
      // alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-[#E9F5F4] border border-[#A8BFBD] p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#092C4C] text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email_id" className="block text-[#092C4C] font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email_id"
              name="email_id"
              value={formData.email_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#A8BFBD] rounded-lg bg-white text-[#092C4C]"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#A8BFBD] rounded-lg bg-white  text-[#092C4C]"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex item-center justify-center bg-[#708A87] hover:bg-[#708A87f0] disabled:bg-[#708A87e0] text-white font-semibold py-2 px-4 rounded-lg"
            disabled={loading}
          >
            {loading ? (
              <Oval
                TailSpin
                height="20"
                width="20"
                color="#ffffff"
                ariaLabel="loading"
                className=""
              />
            ) : (
              "Login"
            )}
          </button>
        </form>
        <p className="text-center text-gray-700 mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-[#708A87] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
