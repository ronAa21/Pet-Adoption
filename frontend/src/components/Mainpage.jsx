import { useState, useEffect } from "react";
import api from "../../Axios";

function Mainpage() { 
  const [pets, setPets] = useState([]);

  // loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Display pets in a dating app format
  const currentPet = pets[0];

  // For rejecting or hearting pets
 async function decisions(d, ide) {

  const id = Number(ide);

    setPets(currentPets => currentPets.filter(p => p.id !== ide));

    try {
      if(d === "heart") {
        alert("Heart");
        const res = await api.post(`/pet/adopted/${id}`, { decision: 'like' });
      } else {
        alert("Rejected")
        const res = await api.post(`/pet/adopted/${id}`, {
        decision: 'pass' })
      }

    } catch (error) {
      setError("Something went wrong saving your swipe");
    } finally {
      setLoading(false);
    }
  }
  
  // display pets
  useEffect(() => {
    setLoading(true);
    fetchPet();
  }, []);

  const fetchPet = () => {
    api.get("/pet/adopt")
      .then(res => {
        setPets(res.data);
        setLoading(false);
      })
      .catch(err => setError(err));
  };

  if(loading) {
    return <div className="min-h-screen flex items-center justify-center text-teal-600 font-bold text-xl">
        Looking for pets... 🐾
      </div>
  }

  if(error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>
  }

  return(
<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      
      {/* CHECK: Are there any pets left? */}
      {pets.length > 0 ? (
        
        /* 🎴 THE CARD (Single Card Container) */
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative border border-gray-100">
          
          {/* Image Section (Tall & Heroic) */}
          <div className="relative h-[450px] w-full">
            <img 
              className="w-full h-full object-cover" 
              src={currentPet.image_url} 
              alt={currentPet.name}
            />
            
            {/* Dark Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

            {/* Floating Info (Inside the image, dating app style) */}
            <div className="absolute bottom-0 left-0 p-6 text-white w-full">
               <div className="flex items-end gap-2 mb-2">
                 <h2 className="text-4xl font-extrabold">{currentPet.name}</h2>
                 <span className="text-2xl font-medium opacity-90 mb-1">{currentPet.age || 2}</span>
               </div>
               
               <div className="flex items-center gap-2 mb-4">
                 <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-sm font-bold border border-white/30">
                   {currentPet.species}
                 </span>
                 {currentPet.breed && (
                   <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-sm font-bold border border-white/30">
                     {currentPet.breed}
                   </span>
                 )}
               </div>

               <p className="text-gray-200 text-sm line-clamp-2 leading-relaxed">
                 {currentPet.description}
               </p>
            </div>
          </div>

          {/* Action Area (Big Buttons) */}
          <div className="p-6 flex gap-4 justify-center items-center bg-white">
            
            {/* REJECT BUTTON */}
            <button 
              onClick={() => decisions('panget', currentPet.id)}
              className="h-16 w-16 rounded-full bg-white border-2 border-red-200 text-red-500 text-3xl shadow-lg hover:bg-red-50 hover:scale-110 hover:border-red-400 transition-all flex items-center justify-center"
            >
              ❌
            </button>

            {/* LIKE BUTTON */}
            <button 
              onClick={() => decisions('heart', currentPet.id)}
              className="h-20 w-20 rounded-full bg-gradient-to-tr from-teal-400 to-teal-600 text-white text-4xl shadow-xl shadow-teal-200 hover:scale-110 hover:shadow-2xl transition-all flex items-center justify-center"
            >
              💚
            </button>
            
          </div>

        </div>

      ) : (
        
        /* 🏁 EMPTY STATE (No more pets) */
        <div className="text-center flex flex-col items-center animate-fade-in-up">
            <div className="text-6xl mb-4">😿</div>
            <h2 className="text-2xl font-bold text-gray-800">No more pets nearby!</h2>
            <p className="text-gray-500 mt-2">Check back later for more friends.</p>
            <button 
                onClick={() => window.location.reload()} 
                className="mt-6 px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 shadow-sm transition-all"
            >
                Refresh List
            </button>
        </div>

      )}

    </div>
  )
}

export default Mainpage;