import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Heart, 
  Utensils, 
  User, 
  MapPin, 
  Stethoscope, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  Loader2, 
  Info,
  Dumbbell,
  Calendar,
  Clock,
  RefreshCw
} from 'lucide-react';
import { UserProfile, HealthPlan, DayPlan } from './types';
import { generateHealthPlan, generateFoodImage } from './services/geminiService';

const INITIAL_PROFILE: UserProfile = {
  fullName: '',
  age: '',
  gender: '',
  height: '',
  weight: '',
  location: '',
  existingConditions: '',
  currentMedications: '',
  recentSymptoms: '',
  familyHistory: '',
  foodType: '',
  cuisinePreference: '',
  allergies: '',
  dislikedFoods: '',
  eatingPattern: '',
  maritalStatus: '',
  kids: '',
  occupation: '',
  sleepPattern: '',
  stressLevel: '',
  activityLevel: '',
  exerciseExperience: '',
  limitations: '',
};

export default function App() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<HealthPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const generatedPlan = await generateHealthPlan(profile);
      setPlan(generatedPlan);
      setStep(6); // Show dashboard
      
      // Fetch images for the first day initially to show something
      if (generatedPlan.mealPlan.length > 0) {
        fetchImagesForDay(generatedPlan.mealPlan[0]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to generate your health plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchImagesForDay = async (dayPlan: DayPlan) => {
    const meals = ['breakfast', 'lunch', 'dinner', 'snacks'] as const;
    const dayKey = dayPlan.day;

    for (const mealType of meals) {
      const meal = dayPlan[mealType];
      if (meal.imageUrl) continue;

      const imageKey = `${dayKey}-${mealType}`;
      setLoadingImages(prev => ({ ...prev, [imageKey]: true }));
      
      try {
        const url = await generateFoodImage(meal.imagePrompt);
        setPlan(prev => {
          if (!prev) return null;
          const newMealPlan = prev.mealPlan.map(dp => {
            if (dp.day === dayKey) {
              return {
                ...dp,
                [mealType]: { ...dp[mealType], imageUrl: url }
              };
            }
            return dp;
          });
          return { ...prev, mealPlan: newMealPlan };
        });
      } catch (err) {
        console.error(`Failed to load image for ${imageKey}`, err);
      } finally {
        setLoadingImages(prev => ({ ...prev, [imageKey]: false }));
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                <p className="text-gray-500">Let's start with the basics</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Full Name" value={profile.fullName} onChange={v => handleInputChange('fullName', v)} placeholder="John Doe" />
              <Input label="Age" value={profile.age} onChange={v => handleInputChange('age', v)} placeholder="30" type="number" />
              <Select 
                label="Gender" 
                value={profile.gender} 
                onChange={v => handleInputChange('gender', v)} 
                options={['Male', 'Female', 'Non-binary', 'Prefer not to say']} 
              />
              <Input label="Location" value={profile.location} onChange={v => handleInputChange('location', v)} placeholder="Mumbai, India" icon={<MapPin size={16} />} />
              <Input label="Height (cm)" value={profile.height} onChange={v => handleInputChange('height', v)} placeholder="175" type="number" />
              <Input label="Weight (kg)" value={profile.weight} onChange={v => handleInputChange('weight', v)} placeholder="70" type="number" />
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-red-100 rounded-xl text-red-600">
                <Stethoscope size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Medical Information</h2>
                <p className="text-gray-500">Your health history helps us stay safe</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <TextArea label="Existing Conditions" value={profile.existingConditions} onChange={v => handleInputChange('existingConditions', v)} placeholder="e.g., Diabetes, Thyroid, PCOS (Leave blank if none)" />
              <TextArea label="Current Medications" value={profile.currentMedications} onChange={v => handleInputChange('currentMedications', v)} placeholder="List any medications you take regularly" />
              <TextArea label="Recent Symptoms" value={profile.recentSymptoms} onChange={v => handleInputChange('recentSymptoms', v)} placeholder="Any unusual symptoms lately?" />
              <TextArea label="Family Medical History" value={profile.familyHistory} onChange={v => handleInputChange('familyHistory', v)} placeholder="Optional: Any hereditary conditions?" />
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-green-100 rounded-xl text-green-600">
                <Utensils size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Dietary Preferences</h2>
                <p className="text-gray-500">Tell us what you love to eat</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select 
                label="Food Type" 
                value={profile.foodType} 
                onChange={v => handleInputChange('foodType', v as any)} 
                options={['Vegetarian', 'Non-Vegetarian', 'Eggetarian']} 
              />
              <Input label="Cuisine Preference" value={profile.cuisinePreference} onChange={v => handleInputChange('cuisinePreference', v)} placeholder="e.g., South Indian, Mediterranean" />
              <Input label="Allergies" value={profile.allergies} onChange={v => handleInputChange('allergies', v)} placeholder="e.g., Peanuts, Dairy, Gluten" />
              <Input label="Foods to Avoid" value={profile.dislikedFoods} onChange={v => handleInputChange('dislikedFoods', v)} placeholder="Foods you dislike" />
              <div className="md:col-span-2">
                <Input label="Eating Pattern" value={profile.eatingPattern} onChange={v => handleInputChange('eatingPattern', v)} placeholder="e.g., 3 meals + 2 snacks, Intermittent fasting" />
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                <Activity size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Lifestyle Details</h2>
                <p className="text-gray-500">Your daily routine matters</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Marital Status" value={profile.maritalStatus} onChange={v => handleInputChange('maritalStatus', v)} placeholder="Single, Married, etc." />
              <Input label="Number of Kids" value={profile.kids} onChange={v => handleInputChange('kids', v)} placeholder="0" type="number" />
              <Input label="Occupation" value={profile.occupation} onChange={v => handleInputChange('occupation', v)} placeholder="e.g., Software Engineer (Sedentary)" />
              <Input label="Sleep Pattern" value={profile.sleepPattern} onChange={v => handleInputChange('sleepPattern', v)} placeholder="e.g., 6-7 hours, irregular" />
              <Select 
                label="Stress Level" 
                value={profile.stressLevel} 
                onChange={v => handleInputChange('stressLevel', v as any)} 
                options={['Low', 'Moderate', 'High']} 
              />
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                <Dumbbell size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Fitness Information</h2>
                <p className="text-gray-500">How active are you?</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select 
                label="Current Activity Level" 
                value={profile.activityLevel} 
                onChange={v => handleInputChange('activityLevel', v as any)} 
                options={['Sedentary', 'Moderate', 'Active']} 
              />
              <Select 
                label="Exercise Experience" 
                value={profile.exerciseExperience} 
                onChange={v => handleInputChange('exerciseExperience', v as any)} 
                options={['Beginner', 'Intermediate', 'Advanced']} 
              />
              <div className="md:col-span-2">
                <TextArea label="Physical Limitations / Injuries" value={profile.limitations} onChange={v => handleInputChange('limitations', v)} placeholder="Any back pain, knee issues, etc.?" />
              </div>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 space-y-6"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 text-blue-600 rounded-full mb-4">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">All set!</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              We've collected everything we need. Click below to generate your personalized health dashboard.
            </p>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Generating Plan...
                </>
              ) : (
                'Generate My Plan'
              )}
            </button>
          </motion.div>
        );
      case 6:
        return plan ? <Dashboard plan={plan} profile={profile} fetchImages={fetchImagesForDay} loadingImages={loadingImages} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Activity size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">VitalVibe</h1>
          </div>
          {step < 6 && (
            <div className="text-sm font-medium text-gray-500">
              Step {step + 1} of 6
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {step < 6 ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>

              {step < 5 && (
                <div className="mt-12 flex items-center justify-between border-t border-gray-100 pt-8">
                  <button
                    onClick={prevStep}
                    disabled={step === 0}
                    className="flex items-center gap-2 text-gray-500 font-medium hover:text-gray-900 disabled:opacity-0 transition-all"
                  >
                    <ChevronLeft size={20} />
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center gap-2"
                  >
                    Next
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          renderStep()
        )}
      </main>

      {error && (
        <div className="fixed bottom-8 right-8 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <AlertTriangle size={20} />
          <p className="font-medium">{error}</p>
          <button onClick={() => setError(null)} className="ml-4 hover:opacity-70">×</button>
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text', icon }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, type?: string, icon?: ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${icon ? 'pl-11' : ''}`}
        />
      </div>
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options: string[] }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
      >
        <option value="">Select option</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function Dashboard({ plan, profile, fetchImages, loadingImages }: { plan: HealthPlan, profile: UserProfile, fetchImages: (day: DayPlan) => void, loadingImages: Record<string, boolean> }) {
  const [selectedDay, setSelectedDay] = useState(plan.mealPlan[0].day);
  const currentDayPlan = plan.mealPlan.find(d => d.day === selectedDay)!;

  useEffect(() => {
    fetchImages(currentDayPlan);
  }, [selectedDay]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Risk Alert */}
      {(plan.requiresConsultation || plan.medicalDisclaimer) && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-start">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-bold text-amber-900">Medical Safety Notice</h3>
            {plan.requiresConsultation && (
              <p className="text-amber-800 font-medium">
                ⚠️ Professional consultation required: {plan.consultationReason}
              </p>
            )}
            {plan.medicalDisclaimer && (
              <p className="text-amber-700 text-sm leading-relaxed">
                {plan.medicalDisclaimer}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary & Profile */}
        <div className="space-y-8">
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Info size={20} className="text-blue-600" />
              Health Summary
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              {plan.summary.interpretation}
            </p>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Risk Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {plan.summary.riskAreas.map(risk => (
                    <span key={risk} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold">
                      {risk}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Key Constraints</h4>
                <div className="flex flex-wrap gap-2">
                  {plan.summary.constraints.map(c => (
                    <span key={c} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gray-900 text-white rounded-3xl p-8 shadow-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Dumbbell size={20} className="text-blue-400" />
              Exercise Routine
            </h3>
            <div className="space-y-6">
              {plan.exercisePlan.map((ex, i) => (
                <div key={i} className="space-y-2 border-l-2 border-blue-500/30 pl-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-blue-400">{ex.type}</h4>
                    <span className="text-xs font-medium bg-white/10 px-2 py-1 rounded">{ex.frequency}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock size={14} />
                    {ex.duration}
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {ex.instructions}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Meal Plan */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Utensils size={20} className="text-green-600" />
                Weekly Meal Plan
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                {plan.mealPlan.map(dp => (
                  <button
                    key={dp.day}
                    onClick={() => setSelectedDay(dp.day)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                      selectedDay === dp.day 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {dp.day}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MealCard type="Breakfast" meal={currentDayPlan.breakfast} isLoading={loadingImages[`${selectedDay}-breakfast`]} />
              <MealCard type="Lunch" meal={currentDayPlan.lunch} isLoading={loadingImages[`${selectedDay}-lunch`]} />
              <MealCard type="Dinner" meal={currentDayPlan.dinner} isLoading={loadingImages[`${selectedDay}-dinner`]} />
              <MealCard type="Snacks" meal={currentDayPlan.snacks} isLoading={loadingImages[`${selectedDay}-snacks`]} />
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}

function MealCard({ type, meal, isLoading }: { type: string, meal: any, isLoading: boolean }) {
  return (
    <div className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-blue-200 transition-all">
      <div className="aspect-video relative bg-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
            <RefreshCw className="animate-spin" size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Generating Image...</span>
          </div>
        ) : meal.imageUrl ? (
          <img 
            src={meal.imageUrl} 
            alt={meal.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <Utensils size={32} />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur shadow-sm rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-900">
            {type}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h4 className="font-bold text-gray-900 mb-1">{meal.name}</h4>
        <p className="text-sm text-gray-500 leading-relaxed">{meal.description}</p>
      </div>
    </div>
  );
}
