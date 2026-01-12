import { useEffect, useState } from "react";
import api from "../../Axios";

function History() {

  const [history, setHistory] = useState([]);

  // loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchHistory();
  }, [])

  const fetchHistory = () => {
    api.get("/pet/history")
      .then(res => {
        setLoading(false);
        setHistory(res.data);
      })
      .catch(err => setError(err));
  };

  if(loading) {
    return <div className="min-h-screen flex items-center justify-center text-teal-600 font-bold text-xl">
        Digging up your history... 🐾
      </div>
  };

    if(error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>
  };

  return(
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      
      {/* Header Section */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Activity History</h1>
          <p className="text-gray-500 mt-2">A log of all the pets you've swiped on.</p>
        </div>
        
        {/* Simple Counter Badge */}
        <div className="hidden md:block bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <span className="block text-xs font-bold text-gray-400 uppercase">Total Swipes</span>
          <span className="text-xl font-bold text-gray-800">{history.length}</span>
        </div>
      </div>

      {/* Main Content List */}
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        
        {history.length > 0 ? (
          history.map((h) => (
            <div 
              key={h.id} 
              className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex items-center justify-between group"
            >
              
              {/* LEFT: Pet Info */}
              <div className="flex items-center gap-5">
                {/* Image with subtle hover zoom effect */}
                <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  <img 
                    src={h.image_url} 
                    alt={h.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-teal-600 transition-colors">
                    {h.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="capitalize">{h.species}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-xs">ID: {h.id}</span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Decision Badge */}
              <div className="px-4">
                {/* ✅ LOGIC FIXED: 
                   'like' = Hearted (Teal/Green)
                   'pass' = Rejected (Red/Gray)
                */}
                {h.decision === "like" ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-full border border-teal-100">
                    <span className="text-lg">💚</span>
                    <span className="font-bold text-sm hidden sm:block">Liked</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full border border-red-100">
                    <span className="text-lg">❌</span>
                    <span className="font-bold text-sm hidden sm:block">Passed</span>
                  </div>
                )}
              </div>

            </div>
          ))
        ) : (
          /* Empty State (If history is empty) */
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 text-lg">No history yet. Start swiping! 🐾</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default History