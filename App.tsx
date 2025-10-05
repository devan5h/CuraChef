import React, { useReducer, useCallback, Reducer } from 'react';
import { Feature, MedicalCondition, Recipe, NutritionInfo, DietaryPlan, UserPreferences, PersonalizedPlan } from './types';
import { FEATURES, MEDICAL_CONDITIONS } from './constants';
import { generateContent, identifyIngredients, generateRecipesStream } from './services/geminiService';
import { useAuth } from './contexts/AuthContext';

import FeatureTabs from './components/FeatureTabs';
import InputArea from './components/InputArea';
import MedicalConditionSelector from './components/MedicalConditionSelector';
import LoadingSpinner from './components/LoadingSpinner';
import RecipeCard from './components/RecipeCard';
import NutritionCard from './components/NutritionCard';
import DietaryPlanCard from './components/DietaryPlanCard';
import UserPreferencesForm from './components/UserPreferencesForm';
import Modal from './components/Modal';
import RecipeCardSkeleton from './components/RecipeCardSkeleton';
import SignInForm from './components/SignInForm';
import SignUpForm from './components/SignUpForm';
import PersonalizedPlanGenerator from './components/PersonalizedPlanGenerator';
import PersonalizedPlanCard from './components/PersonalizedPlanCard';

interface FeatureResult {
    recipes: Recipe[];
    nutritionInfo: NutritionInfo | null;
    dietaryPlan: DietaryPlan | null;
    personalizedPlan: PersonalizedPlan | null;
}

const initialFeatureResultState: FeatureResult = {
    recipes: [],
    nutritionInfo: null,
    dietaryPlan: null,
    personalizedPlan: null,
};

// --- State Management using useReducer ---

interface AppState {
    activeFeature: Feature;
    textInput: string;
    selectedCondition: MedicalCondition;
    imageBase64: string | null;
    isLoading: boolean;
    error: string | null;
    results: Record<string, FeatureResult>;
    showIdentifiedMessage: boolean;
    isMobileMenuOpen: boolean;
}

type AppAction =
    | { type: 'SELECT_FEATURE'; payload: Feature }
    | { type: 'SET_TEXT_INPUT'; payload: string }
    | { type: 'SET_IMAGE'; payload: string | null }
    | { type: 'SET_CONDITION'; payload: MedicalCondition }
    | { type: 'GENERATION_START'; payload: { feature: Feature } }
    | { type: 'GENERATION_COMPLETE'; payload: { feature: Feature; result: Partial<FeatureResult> } }
    | { type: 'GENERATION_ERROR'; payload: string }
    | { type: 'CLEAR_ERROR' }
    | { type: 'SHOW_IDENTIFIED_MESSAGE'; payload: boolean }
    | { type: 'TOGGLE_MOBILE_MENU'; payload: boolean }
    | { type: 'SIGN_OUT_RESET' };

const initialState: AppState = {
    activeFeature: Feature.RECIPE_GENERATOR,
    textInput: '',
    selectedCondition: MedicalCondition.NONE,
    imageBase64: null,
    isLoading: false,
    error: null,
    results: {
        [Feature.RECIPE_GENERATOR]: { ...initialFeatureResultState },
        [Feature.LEFTOVER_RECOMMENDER]: { ...initialFeatureResultState },
        [Feature.NUTRITIONAL_ANALYZER]: { ...initialFeatureResultState },
        [Feature.MEDICAL_DIETARY_PLANNER]: { ...initialFeatureResultState },
        [Feature.PERSONALIZED_DIETARY_PLANNER]: { ...initialFeatureResultState },
    },
    showIdentifiedMessage: false,
    isMobileMenuOpen: false,
};

const appReducer: Reducer<AppState, AppAction> = (state, action): AppState => {
    switch (action.type) {
        case 'SELECT_FEATURE':
            return {
                ...state,
                activeFeature: action.payload,
                textInput: '',
                imageBase64: null,
                selectedCondition: MedicalCondition.NONE,
                isMobileMenuOpen: false,
            };
        case 'SET_TEXT_INPUT':
            return { ...state, textInput: action.payload };
        case 'SET_IMAGE':
            return { ...state, imageBase64: action.payload, showIdentifiedMessage: false };
        case 'SET_CONDITION':
            return { ...state, selectedCondition: action.payload };
        case 'GENERATION_START':
            return {
                ...state,
                isLoading: true,
                error: null,
                results: {
                    ...state.results,
                    [action.payload.feature]: { ...initialFeatureResultState }
                }
            };
        case 'GENERATION_COMPLETE':
            const currentResult = state.results[action.payload.feature];
            const updatedResult = { ...currentResult, ...action.payload.result };
            return {
                ...state,
                isLoading: false,
                results: {
                    ...state.results,
                    [action.payload.feature]: updatedResult
                }
            };
        case 'GENERATION_ERROR':
            return { ...state, isLoading: false, error: action.payload };
        case 'CLEAR_ERROR':
            return { ...state, error: null };
        case 'SHOW_IDENTIFIED_MESSAGE':
            return { ...state, showIdentifiedMessage: action.payload };
        case 'TOGGLE_MOBILE_MENU':
            return { ...state, isMobileMenuOpen: action.payload };
        case 'SIGN_OUT_RESET':
            return { ...initialState };
        default:
            return state;
    }
};


const App: React.FC = () => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const { activeFeature, textInput, selectedCondition, imageBase64, isLoading, error, results, showIdentifiedMessage, isMobileMenuOpen } = state;
    
    const { 
      currentUser, 
      handleSignOut: authSignOut, 
      handleSavePreferences,
      authModalState,
      setAuthModalState,
      closeAuthModal
    } = useAuth();
    
    const [isErrorModalOpen, setIsErrorModalOpen] = React.useState(false);

    React.useEffect(() => {
        if(error) setIsErrorModalOpen(true);
    }, [error]);

    const handleSignOut = () => {
        authSignOut();
        dispatch({ type: 'SIGN_OUT_RESET' });
    }

    const handleSelectFeature = (feature: Feature) => dispatch({ type: 'SELECT_FEATURE', payload: feature });
    const setTextInput = (value: string) => dispatch({ type: 'SET_TEXT_INPUT', payload: value });

    const handleImageChange = useCallback(async (base64: string | null) => {
        dispatch({ type: 'SET_IMAGE', payload: base64 });
        if (base64) {
            dispatch({ type: 'GENERATION_START', payload: { feature: activeFeature } });
            try {
                const { ingredients } = await identifyIngredients(base64);
                dispatch({ type: 'SET_TEXT_INPUT', payload: ingredients });
                dispatch({ type: 'SHOW_IDENTIFIED_MESSAGE', payload: true });
            } catch (err) {
                dispatch({ type: 'GENERATION_ERROR', payload: err instanceof Error ? err.message : 'An unknown error occurred.' });
            } finally {
                // End loading state in either case
                dispatch({ type: 'GENERATION_COMPLETE', payload: { feature: activeFeature, result: {} }});
            }
        }
    }, [activeFeature]);

  const handleSubmit = async () => {
    if (!currentUser) return dispatch({ type: 'GENERATION_ERROR', payload: "Please sign in to generate content." });
    if (!textInput.trim()) return dispatch({ type: 'GENERATION_ERROR', payload: "Please provide some input before generating." });
    if (activeFeature === Feature.MEDICAL_DIETARY_PLANNER && selectedCondition === MedicalCondition.NONE) {
        return dispatch({ type: 'GENERATION_ERROR', payload: "Please select a medical condition for the dietary plan." });
    }

    dispatch({ type: 'GENERATION_START', payload: { feature: activeFeature } });

    const streamingFeatures = [Feature.RECIPE_GENERATOR, Feature.LEFTOVER_RECOMMENDER, Feature.MEDICAL_DIETARY_PLANNER];

    if (streamingFeatures.includes(activeFeature)) {
        try {
            await generateRecipesStream(
                activeFeature, textInput, selectedCondition, currentUser.preferences,
                (recipes: Recipe[]) => {
                    const featureResult: Partial<FeatureResult> = activeFeature === Feature.MEDICAL_DIETARY_PLANNER
                        ? { ...results[activeFeature], recipes } // Preserve other parts of the plan
                        : { recipes };
                    dispatch({ type: 'GENERATION_COMPLETE', payload: { feature: activeFeature, result: featureResult } });
                }
            );
        } catch (err) {
            dispatch({ type: 'GENERATION_ERROR', payload: err instanceof Error ? err.message : 'An unknown error occurred while processing your request.' });
        }
    } else {
        try {
          const result = await generateContent(activeFeature, textInput, selectedCondition, imageBase64, currentUser.preferences);
          const newFeatureResult: Partial<FeatureResult> = {};

          if (activeFeature === Feature.NUTRITIONAL_ANALYZER) newFeatureResult.nutritionInfo = result;
          if (activeFeature === Feature.MEDICAL_DIETARY_PLANNER) {
            // Non-streamed part of medical planner
            newFeatureResult.dietaryPlan = { condition: result.condition, foodsToAvoid: result.foodsToAvoid, foodsToFavor: result.foodsToFavor, guidelines: result.guidelines, recipes: [] };
          }
          
          dispatch({ type: 'GENERATION_COMPLETE', payload: { feature: activeFeature, result: newFeatureResult } });

        } catch (err) {
          dispatch({ type: 'GENERATION_ERROR', payload: err instanceof Error ? err.message : 'An unknown error occurred while processing your request.' });
        }
    }
  };

  const handleGeneratePlan = async (duration: 'Daily' | 'Weekly' | 'Monthly') => {
    if (!currentUser) return dispatch({ type: 'GENERATION_ERROR', payload: "Please sign in to generate a plan." });

    dispatch({ type: 'GENERATION_START', payload: { feature: activeFeature }});

    try {
        const result = await generateContent(activeFeature, '', MedicalCondition.NONE, null, currentUser.preferences, duration);
        dispatch({ type: 'GENERATION_COMPLETE', payload: { feature: activeFeature, result: { personalizedPlan: result } } });
    } catch (err) {
        dispatch({ type: 'GENERATION_ERROR', payload: err instanceof Error ? err.message : 'An unknown error occurred while generating your plan.' });
    }
  };
  
    const renderResults = () => {
    const currentResults = results[activeFeature];
    if (!currentResults) return null;

    const { recipes, nutritionInfo, dietaryPlan, personalizedPlan } = currentResults;
    const hasRecipes = recipes && recipes.length > 0;
    
    const featuresWithRecipeSkeletons = [
        Feature.RECIPE_GENERATOR,
        Feature.LEFTOVER_RECOMMENDER,
        Feature.MEDICAL_DIETARY_PLANNER,
    ];
    
    const activeFeatureDetails = FEATURES.find(f => f.id === activeFeature);

    if (isLoading && !hasRecipes) {
      if (activeFeature === Feature.PERSONALIZED_DIETARY_PLANNER) {
        return <LoadingSpinner message="Crafting your personalized plan... This can take up to a minute, thank you for your patience!" />;
      }
      if (featuresWithRecipeSkeletons.includes(activeFeature)) {
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            <RecipeCardSkeleton />
            <RecipeCardSkeleton />
            <RecipeCardSkeleton />
          </div>
        );
      }
      return <LoadingSpinner message={`Generating ${activeFeatureDetails?.title}...`} />;
    }
    
    return (
      <div className="space-y-8">
        {personalizedPlan && currentUser && <PersonalizedPlanCard plan={personalizedPlan} preferences={currentUser.preferences} />}
        {nutritionInfo && <NutritionCard info={nutritionInfo} />}
        {dietaryPlan && <DietaryPlanCard plan={dietaryPlan} />}

        {hasRecipes && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 items-start">
            {recipes.map((recipe, index) => (
              <RecipeCard key={index} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {!currentUser ? (
         <div className="relative min-h-screen flex items-center justify-center p-8 bg-cover bg-center" style={{backgroundImage: "url('https://source.unsplash.com/1600x900/?healthy,food,cooking,kitchen')"}}>
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="relative text-center text-white max-w-3xl animate-fade-in-up">
                <i className="fa-solid fa-hat-chef text-7xl text-green-300 mb-4"></i>
                <h1 className="text-5xl md:text-7xl font-bold font-serif mb-4">Welcome to <span className="text-green-300">Cura</span>Chef</h1>
                <p className="text-lg md:text-xl text-green-100 mt-4">Your personal AI kitchen companion. Discover recipes, analyze nutrition, and create dietary plans tailored just for you.</p>
                <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                    <button onClick={() => setAuthModalState('signIn')} className="text-lg font-semibold bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg border border-white/30">Sign In</button>
                    <button onClick={() => setAuthModalState('signUp')} className="text-lg font-semibold bg-green-500 text-white px-8 py-3 rounded-full hover:bg-green-600 transition-all duration-300 shadow-lg">Get Started Free</button>
                </div>
            </div>
         </div>
      ) : (
        <div className="flex">
          {/* Side Menu */}
          <aside className="fixed top-0 left-0 h-full bg-white z-40 w-80 border-r border-gray-200 hidden lg:flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center gap-3">
              <i className="fa-solid fa-hat-chef text-3xl brand-gradient-text"></i>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight font-serif">
                <span className="text-green-500">Cura</span><span>Chef</span>
              </h1>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
              <FeatureTabs
                features={FEATURES}
                activeFeature={activeFeature}
                onSelectFeature={handleSelectFeature}
              />
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="font-bold text-green-600">{currentUser.email.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 truncate">{currentUser.email}</p>
                  <button onClick={handleSignOut} className="text-xs text-gray-500 hover:text-red-500 transition-colors">Sign Out</button>
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Menu */}
           <div className={`fixed inset-0 z-30 bg-black/30 backdrop-blur-sm transition-opacity lg:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => dispatch({ type: 'TOGGLE_MOBILE_MENU', payload: false })} aria-hidden="true"></div>
            <aside className={`fixed top-0 left-0 h-full bg-white z-40 transform transition-transform duration-300 ease-in-out w-72 lg:w-80 border-r border-gray-200 flex flex-col lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                 <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <i className="fa-solid fa-hat-chef text-3xl brand-gradient-text"></i>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight font-serif">
                        <span className="text-green-500">Cura</span><span>Chef</span>
                        </h1>
                    </div>
                    <button className="text-gray-500 hover:text-gray-800" onClick={() => dispatch({ type: 'TOGGLE_MOBILE_MENU', payload: false })} aria-label="Close menu">
                        <i className="fa-solid fa-times text-xl"></i>
                    </button>
                 </div>
                 <div className="flex-grow p-4 overflow-y-auto">
                    <FeatureTabs features={FEATURES} activeFeature={activeFeature} onSelectFeature={handleSelectFeature} />
                 </div>
                 <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="font-bold text-green-600">{currentUser.email.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-700 truncate">{currentUser.email}</p>
                            <button onClick={handleSignOut} className="text-xs text-gray-500 hover:text-red-500 transition-colors">Sign Out</button>
                        </div>
                    </div>
                </div>
            </aside>

          {/* Main Content */}
          <div className="w-full lg:ml-80">
             <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-200 lg:hidden">
              <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-3">
                  <button className="text-gray-600 hover:text-gray-800" onClick={() => dispatch({ type: 'TOGGLE_MOBILE_MENU', payload: true })} aria-label="Open menu">
                    <i className="fa-solid fa-bars text-2xl"></i>
                  </button>
                   <div className="flex items-center gap-2">
                    <i className="fa-solid fa-hat-chef text-2xl brand-gradient-text"></i>
                    <h1 className="text-xl font-bold text-gray-800 font-serif"><span className="text-green-500">Cura</span><span>Chef</span></h1>
                  </div>
                </div>
              </div>
            </header>
            <main className="mx-auto p-4 sm:p-6 lg:p-8">
                <div className="space-y-8 w-full">
                    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 font-serif brand-gradient-text">{FEATURES.find(f => f.id === activeFeature)?.title}</h2>
                            <p className="text-gray-500 mt-2 max-w-2xl mx-auto">{FEATURES.find(f => f.id === activeFeature)?.description}</p>
                        </div>

                        {activeFeature === Feature.USER_PREFERENCES ? (
                          <UserPreferencesForm initialPreferences={currentUser.preferences} onSave={handleSavePreferences} />
                        ) : activeFeature === Feature.PERSONALIZED_DIETARY_PLANNER ? (
                          <PersonalizedPlanGenerator onGeneratePlan={handleGeneratePlan} isLoading={isLoading} />
                        ) : (
                          <>
                            <div className="space-y-6 max-w-3xl mx-auto">
                                <InputArea 
                                    textValue={textInput}
                                    onTextChange={(e) => setTextInput(e.target.value)}
                                    feature={activeFeature}
                                    imageBase64={imageBase64}
                                    onImageChange={handleImageChange}
                                    showIdentifiedMessage={showIdentifiedMessage}
                                />
                                {activeFeature === Feature.MEDICAL_DIETARY_PLANNER && (
                                    <MedicalConditionSelector 
                                        conditions={MEDICAL_CONDITIONS}
                                        selectedValue={selectedCondition}
                                        onChange={(e) => dispatch({ type: 'SET_CONDITION', payload: e.target.value as MedicalCondition })}
                                    />
                                )}
                            </div>
                            <div className="mt-8 text-center">
                                <button onClick={handleSubmit} disabled={isLoading} className="bg-green-500 text-white font-bold py-3 px-10 rounded-full text-lg shadow-lg hover:bg-green-600 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-3 mx-auto">
                                  {isLoading ? (<><svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating...</>) : (<><i className="fa-solid fa-wand-magic-sparkles"></i>{FEATURES.find(f => f.id === activeFeature)?.buttonText || 'Generate'}</>)}
                                </button>
                            </div>
                          </>
                        )}
                    </div>
                    <div className="mt-8">{renderResults()}</div>
                </div>
            </main>
          </div>
        </div>
      )}

      <Modal isOpen={authModalState !== 'none'} onClose={closeAuthModal} title={authModalState === 'signIn' ? 'Welcome Back!' : 'Create Your Account'}>
        {authModalState === 'signIn' ? <SignInForm /> : <SignUpForm />}
      {/* FIX: Corrected a typo in the Modal component's closing tag. */}
      </Modal>
      <Modal isOpen={isErrorModalOpen} onClose={() => { setIsErrorModalOpen(false); dispatch({ type: 'CLEAR_ERROR' }); }} title="An Error Occurred">
        <div className="text-center">
            <i className="fa-solid fa-triangle-exclamation text-5xl text-red-400 mb-4"></i>
            <p className="text-gray-600">{error}</p>
            <button onClick={() => { setIsErrorModalOpen(false); dispatch({ type: 'CLEAR_ERROR' }); }} className="mt-6 bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors">Close</button>
        </div>
      </Modal>
    </div>
  );
};

export default App;
