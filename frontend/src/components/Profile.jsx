import { useState } from "react";
import api from "../../Axios";

function Profile() {
  const [pfp, setPfp] = useState([]);
  const [pet, setPet] = useState([]);

  // loading/error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = () => {
    api.get("/pet/owner/info")
      .then(res => {
        setPfp(res.data);
        setLoading(false);
      })
      .catch(err => setError(err));
  }

  const fetchPets = () => {
    api.get("/pet/owner/heart")
      .then(res => {
        setPet(res.data);
        setLoading(false);
      })
      .catch(err => setError(err));
  }

   useState(() => {
    setLoading(true);
    fetchProfile();
    fetchPets();
  }, []);

  if(loading) {
    return <div className="min-h-screen flex items-center justify-center text-teal-600 font-bold text-xl">
        Loading profile...
      </div>
  }

  if(error) {
    return <p style={{ color: "red" }}>{error}</p>
  }

  return(
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      
      {/* Main Container */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* LEFT COLUMN: Identity Card */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden relative group">
            
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-teal-500 to-teal-700"></div>
            
            {/* Avatar */}
            <div className="absolute top-16 left-1/2 -translate-x-1/2">
              <img 
                src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" 
                alt="No User Profile" 
                className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover bg-gray-200"
              />
            </div>

            {/* User Info */}
            <div className="pt-20 pb-8 px-6 text-center">
              {pfp.map(p => (
                <div key={p.id}>
                    <h2 className="text-2xl font-bold text-gray-800">{p.email}</h2>
                    <p className="text-teal-600 text-sm font-medium mt-1">Pet Enthusiast 🐾</p>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* RIGHT COLUMN: Hearted pets */}
        <div className="w-full md:w-2/3">
          <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 h-full">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Adoption List</h2>
            </div>

            {/* GRID CONTAINER */}
            {/* FIX: Removed the extra wrapper div here so grid-cols-2 works! */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                
                {pet.map(p => (
                  <div key={p.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
                    
                    {/* Image Section */}
                    <div className="relative h-48 w-full overflow-hidden">
                        <img 
                          src={p.image_url} 
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        {/* Badge */}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-teal-600 p-2 rounded-full shadow-sm">
                          💚
                        </div>
                    </div>

                    {/* Text Section */}
                    <div className="p-4 flex flex-col items-start gap-2">
                        <h3 className="text-xl font-bold text-gray-800">{p.name}</h3>
                        <span className="bg-orange-50 text-orange-500 px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wide">
                            {p.species || "Pet"}
                        </span>
                    </div>
                  
                  </div>
                ))}

            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default Profile;