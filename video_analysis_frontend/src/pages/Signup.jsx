import { useState } from "react";
import toast from "react-hot-toast";
import { Oval } from "react-loader-spinner";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      // alert("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        action: "signup",
        email_id: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        name: formData.name,
      };

      const response = await apiClient.post("/authUser", payload);

      setLoading(false);

      toast.success("Registered !");
      navigate("/login");
    } catch (error) {
      setLoading(false);
      // alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-[#E9F5F4] border border-[#A8BFBD] p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#092C4C] text-center mb-6">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-[#092C4C] font-medium mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="bg-white text-[#092C4C] w-full px-4 py-2 border border-[#A8BFBD] rounded-lg"
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-[#092C4C] font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="bg-white text-[#092C4C] w-full px-4 py-2 border border-[#A8BFBD] rounded-lg"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-[#092C4C] font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="bg-white text-[#092C4C] w-full px-4 py-2 border border-[#A8BFBD] rounded-lg"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-[#092C4C] font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="bg-white text-[#092C4C] w-full px-4 py-2 border border-[#A8BFBD] rounded-lg"
              placeholder="Confirm your password"
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
                height={20}
                width={20}
                color="#ffffff"
                secondaryColor="#ffffff"
                visible={true}
                ariaLabel="loading"
              />
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
        <p className="text-center text-gray-700 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
