import { useState } from "react";
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";
import api from "../../Axios";

const PET_QUIZ_QUESTIONS = [
  {
    id: "energy",
    question: "How active is your daily lifestyle?",
    emoji: "⚡",
    choices: [
      { label: "I'm a couch potato", value: 2 },
      { label: "I enjoy regular walks", value: 6 },
      { label: "I'm always on the move", value: 10 }
    ]
  },
  {
    id: "independence",
    question: "How much time are you away from home?",
    emoji: "🏠",
    choices: [
      { label: "Rarely (WFH/Retired)", value: 2 },
      { label: "Standard 8-hour workday", value: 6 },
      { label: "Very busy/Travel often", value: 10 }
    ]
  },
  {
    id: "kids",
    question: "Do you have children or frequent visitors?",
    emoji: "👨‍👩‍👧",
    choices: [
      { label: "No, it's just me", value: 2 },
      { label: "Sometimes people visit", value: 6 },
      { label: "Yes, kids are always here", value: 10 }
    ]
  },
  {
    id: "space",
    question: "What is your living situation like?",
    emoji: "🏡",
    choices: [
      { label: "Small Studio/Apartment", value: 2 },
      { label: "Townhouse with yard", value: 6 },
      { label: "Large House/Garden", value: 10 }
    ]
  },
  {
    id: "shedding",
    question: "How do you feel about pet hair/cleaning?",
    emoji: "🧹",
    choices: [
      { label: "I have allergies/Need clean", value: 1 },
      { label: "I don't mind a little fur", value: 5 },
      { label: "Fur is not an issue", value: 10 }
    ]
  }
];

function QuizContents() {
  const [responses, setResponses] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const answeredCount = Object.keys(responses).length;
  const totalCount = PET_QUIZ_QUESTIONS.length;
  const progressPercent = (answeredCount / totalCount) * 100;

  const handleSelect = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (answeredCount < totalCount) {
      toast.warning("Answer all questions");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/pet/test", {
        energy: responses.energy,
        independence: responses.independence,
        kids: responses.kids,
        space: responses.space,
        shedding: responses.shedding
      });

      console.log("Response:", response.data);
      toast.success("Preferences saved! Finding your matches...");

      setTimeout(() => {
        navigate("/swipe");
      }, 2000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save preferences");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-teal-600 font-bold text-xl bg-gray-50">
        Finding your match... 🐾
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">

      {/* Card — same shape as Mainpage pet card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">

        {/* Header Banner — mirrors the pet image section gradient */}
        <div className="relative h-36 bg-gradient-to-br from-teal-400 to-teal-600 flex flex-col items-center justify-center px-6">
          <div className="text-4xl mb-1">🐾</div>
          <h1 className="text-white text-2xl font-extrabold tracking-tight">Find Your Match</h1>
          <p className="text-teal-100 text-sm mt-0.5 opacity-90">Answer a few questions to meet your perfect pet</p>

          {/* Progress bar sits at the very bottom of the banner */}
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-teal-300/40">
            <div
              className="h-full bg-white/80 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Progress label */}
        <div className="px-6 pt-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Your Preferences</span>
          <span className="text-xs font-bold text-teal-500">{answeredCount}/{totalCount} answered</span>
        </div>

        {/* Questions */}
        <div className="px-6 pt-3 pb-4 flex flex-col gap-5">
          {PET_QUIZ_QUESTIONS.map((pq) => (
            <div key={pq.id}>
              {/* Question label */}
              <p className="text-gray-800 font-bold text-sm mb-2 flex items-center gap-1.5">
                <span>{pq.emoji}</span>
                {pq.question}
              </p>

              {/* Choice buttons */}
              <div className="flex flex-col gap-2">
                {pq.choices.map((choice) => {
                  const selected = responses[pq.id] === choice.value;
                  return (
                    <button
                      key={choice.value}
                      onClick={() => handleSelect(pq.id, choice.value)}
                      className={`w-full text-left px-4 py-3 rounded-2xl border-2 text-sm font-semibold transition-all duration-150
                        ${selected
                          ? "bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-100 scale-[1.01]"
                          : "bg-white border-gray-100 text-gray-600 hover:border-teal-300 hover:bg-teal-50"
                        }`}
                    >
                      {selected && <span className="mr-2">✓</span>}
                      {choice.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Action area — mirrors the pet card button row */}
        <div className="px-6 pb-6 bg-white flex flex-col items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={answeredCount < totalCount}
            className={`w-full py-4 rounded-2xl font-extrabold text-base transition-all duration-200
              ${answeredCount === totalCount
                ? "bg-gradient-to-tr from-teal-400 to-teal-600 text-white shadow-xl shadow-teal-200 hover:scale-[1.02] hover:shadow-2xl"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            {answeredCount === totalCount ? "Find My Match 💚" : `Answer ${totalCount - answeredCount} more question${totalCount - answeredCount > 1 ? "s" : ""}`}
          </button>
        </div>

      </div>
    </div>
  );
}

export default QuizContents;