import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Feature } from '../types';

// Extend the Window interface for SpeechRecognition
interface IWindow extends Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}
declare const window: IWindow;

interface InputAreaProps {
  textValue: string;
  onTextChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  feature: Feature;
  imageBase64: string | null;
  onImageChange: (base64: string | null) => void;
  showIdentifiedMessage: boolean;
}

const placeholderText = {
  [Feature.RECIPE_GENERATOR]: "e.g., chicken breast, cherry tomatoes, basil...",
  [Feature.NUTRITIONAL_ANALYZER]: "e.g., a bowl of oatmeal with blueberries...",
  [Feature.LEFTOVER_RECOMMENDER]: "e.g., leftover roasted chicken, cooked rice...",
  [Feature.MEDICAL_DIETARY_PLANNER]: "e.g., salmon fillet, quinoa, broccoli...",
};

const InputArea: React.FC<InputAreaProps> = ({ textValue, onTextChange, feature, imageBase64, onImageChange, showIdentifiedMessage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechRecognitionSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const syntheticEvent = {
          target: { value: textValue ? `${textValue} ${transcript}` : transcript }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onTextChange(syntheticEvent);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechRecognitionSupported(false);
    }
  }, [textValue, onTextChange]);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string)?.split(',')[1];
        onImageChange(base64 || null);
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleTakePhoto = async () => {
    stopStream();
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        onImageChange(dataUrl.split(',')[1]);
        stopStream();
      }
    }
  };
  
  const handleToggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const labelText = {
      [Feature.NUTRITIONAL_ANALYZER]: "Describe a Meal or List its Ingredients",
      [Feature.RECIPE_GENERATOR]: "List Your Available Ingredients",
      [Feature.LEFTOVER_RECOMMENDER]: "What Leftovers Do You Have?",
      [Feature.MEDICAL_DIETARY_PLANNER]: "List Available Ingredients for Your Plan",
  }

  const buttonBaseStyle = "w-full bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-xl shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400";

  return (
    <div>
      <label htmlFor="text-input" className="block text-md font-semibold text-gray-700 mb-2 text-center">
        {labelText[feature]}
      </label>
      {showIdentifiedMessage && (
        <div className="mb-3 p-3 bg-green-100 text-green-800 text-sm rounded-xl flex items-center gap-2 animate-fade-in">
          <i className="fa-solid fa-check-circle"></i>
          <span>Ingredients identified! Feel free to edit the list below.</span>
        </div>
      )}
      <textarea
        id="text-input"
        value={textValue}
        onChange={onTextChange}
        placeholder={placeholderText[feature]}
        rows={4}
        className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200 shadow-sm"
      />
      
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {imageBase64 ? (
          <div className="relative sm:col-span-3 rounded-xl overflow-hidden shadow-md">
            <img src={`data:image/jpeg;base64,${imageBase64}`} alt="Ingredient preview" className="w-full h-auto max-h-60 object-cover" />
            <button onClick={() => onImageChange(null)} className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/75 transition-colors">
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        ) : stream ? (
             <div className="relative sm:col-span-3 rounded-xl overflow-hidden shadow-md bg-black">
                <video ref={videoRef} autoPlay playsInline className="w-full h-auto max-h-60 object-contain"></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center gap-4">
                    <button onClick={handleCapture} className="bg-green-500 text-white py-2 px-5 rounded-full font-semibold flex items-center gap-2 shadow-lg"><i className="fa-solid fa-camera"></i> Capture</button>
                    <button onClick={stopStream} className="bg-red-500 text-white py-2 px-5 rounded-full font-semibold flex items-center gap-2 shadow-lg"><i className="fa-solid fa-times"></i> Cancel</button>
                </div>
            </div>
        ) : (
          <>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className={buttonBaseStyle}>
              <i className="fa-solid fa-upload text-green-500"></i> Upload
            </button>
            <button onClick={handleTakePhoto} className={buttonBaseStyle}>
              <i className="fa-solid fa-camera-retro text-green-500"></i> Take Photo
            </button>
            <button
              onClick={handleToggleListening}
              disabled={!speechRecognitionSupported}
              className={`${buttonBaseStyle}
                ${isListening ? '!bg-red-500 text-white hover:!bg-red-600' : ''}
                ${!speechRecognitionSupported ? 'bg-gray-200 text-gray-400 cursor-not-allowed hover:bg-gray-200' : ''}
              `}
              title={!speechRecognitionSupported ? 'Voice input is not supported by your browser.' : 'Start voice input'}
            >
              {isListening ? (
                <>
                  <i className="fa-solid fa-microphone-slash animate-pulse"></i>
                  Listening...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-microphone text-green-500"></i>
                  Voice
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default InputArea;