import { useState } from "react";
import { toast } from 'sonner';
import api from "../../Axios";
import { Link, useNavigate } from "react-router-dom";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);

  // loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();

    if(!email || !password) {
      toast.error('Login failed', {
        description: "Email and Password cannot be empty",
      });;
      return;
    }

    setLoading(true);
    setError(null); // Clear previous errors

    try {
      const res = await api.post("/pet/login", { email, password });

      localStorage.setItem("token", res.data.token);

      toast.success('Logged in', {
        description: `Welcome ${email}`,
      });

      setTimeout(() => {
        navigate("/swipe");
      }, 3000)
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  if(loading) {
    return <div className="min-h-screen flex items-center justify-center text-teal-600 font-bold text-xl">
        Logging in... 
      </div>
  }

  if(error) {
    return <p style={{ color: "red" }}>{error}</p>
  }

  return(
<div className="min-h-screen flex items-center justify-center bg-orange-50 p-4">
      
      {/* Main Card Container */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Image & Branding */}
        <div className="w-full md:w-1/2 bg-teal-600 p-10 flex flex-col justify-center items-center text-center relative">
            {/* Cat Image this time! */}
            <img 
              src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Cute Cat" 
              className="rounded-full w-48 h-48 object-cover mb-6 border-4 border-white shadow-lg"
            />
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back!</h2>
            <p className="text-teal-100">Your future furry friend is waiting for you.</p>
            
            {/* Decorative Circles */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-teal-500 rounded-full -translate-x-10 -translate-y-10 opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-teal-700 rounded-full translate-x-10 translate-y-10 opacity-50"></div>
        </div>

        {/* Right Side: The Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <div className="text-center md:text-left mb-8">
            <h1 className="text-3xl font-extrabold text-gray-800">Log In</h1>
            <p className="text-gray-500 text-sm mt-2">Continue your search for a companion.</p>
          </div>

          <form className="flex flex-col gap-5">
            
            {/* Email Input */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600 ml-1">Email Address</label>
              <input 
                type="email" 
                placeholder="you@example.com" 
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 p-3 rounded-xl outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-gray-600">Password</label>
                <a href="#" className="text-xs text-teal-600 font-bold hover:underline">Forgot password?</a>
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 p-3 rounded-xl outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Login Button */}
            <button className="mt-4 w-full bg-orange-500 text-white font-bold text-lg p-3 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 active:scale-[0.98]" onClick={submit}>
              Let me in! 🏠
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-gray-500 text-sm mt-8">
            Don't have an account yet? 
            <Link to="/signup" className="text-teal-600 font-bold ml-1 hover:underline">
              Create one here
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

export default Login