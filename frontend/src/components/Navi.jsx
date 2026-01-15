import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConfirmationModal from "./ConfirmationModal";
import { toast } from 'sonner';

function Navi() {
  const navigate = useNavigate();

  const [isOpen, setOpen] = useState(false);

  // loading states
  const [loading, setLoading] = useState(false);

  function handleLogout() {

      setLoading(true);
      localStorage.removeItem("token");

      toast.success("Logging out", {
        description: "Please wait"
      })

      setTimeout(() => {
        navigate("/login", {replace: true});
      }, 2000)

      setLoading(false);
  }

  if(loading) {
    return <p>Lading...</p>
  }

  return(
    // Sticky Header: Stays at the top of the screen
    <nav className="sticky top-0 z-50 w-full bg-teal-600 shadow-lg">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* LEFT: Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <span className="text-3xl">🐾</span>
            <h1 className="text-2xl font-extrabold text-white tracking-wide">
              Paw<span className="text-orange-300">Match</span>
            </h1>
          </div>

          {/* CENTER: Navigation Links (Hidden on small mobile screens if needed) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/swipe" 
              className="text-teal-100 hover:text-white hover:bg-teal-700 px-3 py-2 rounded-xl text-md font-medium transition-all"
            >
              Find Pets
            </Link>

            <Link 
              to="/history" 
              className="text-teal-100 hover:text-white hover:bg-teal-700 px-3 py-2 rounded-xl text-md font-medium transition-all"
            >
              History
            </Link>

            <Link 
              to="/profile" 
              className="text-teal-100 hover:text-white hover:bg-teal-700 px-3 py-2 rounded-xl text-md font-medium transition-all"
            >
              Profile
            </Link>
          </div>

          {/* RIGHT: Logout Button */}
          <div>
            <button 
              onClick={() => setOpen(true)}
              className="bg-white text-teal-700 hover:bg-orange-100 hover:text-orange-600 font-bold py-2 px-6 rounded-full shadow-md transition-all transform active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        open={isOpen}
        close={() => setOpen(false)}
        confirm={handleLogout}
        title="Logout?"
        subtitle="Don't forget your adoption"
        confirmContent="Logout"
      />
    </nav>
  )
};

export default Navi;