function ConfirmationModal({open, close, confirm, title, subtitle, confirmContent }) {

  if(!open) return null;
 
  return(
// 1. Backdrop: Covers the whole screen with a semi-transparent blur
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 fade-in">
      
      {/* 2. Modal Card: White box with rounded corners and shadow */}
      <div 
        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the box
      >
        
        {/* Content Section */}
        <div className="p-8 text-center">
          {/* Optional: You could add an icon here if you wanted */}
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {title}
          </h1>
          
          <p className="text-gray-500 text-sm leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Button Section */}
        <div className="flex gap-3 px-8 pb-8">
          
          {/* Cancel Button - Subtle styling */}
          <button 
            onClick={close} 
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            Cancel
          </button>
          
          {/* Confirm Button - Primary/Action styling */}
          <button 
            onClick={() => {
              confirm();
              close();
            }} 
            className="flex-1 py-3 px-4 rounded-xl teal-100 text-gray font-bold shadow-lg shadow-teal-200 hover:bg-teal-600 active:scale-95 transition-all"
          >
            {confirmContent || "Confirm"}
          </button>
        </div>

      </div>
    </div>
  )
}

export default ConfirmationModal;