// webapp/src/components/GestureRunner.tsx

import React, { useState } from 'react';
import { GestureType } from '../types';

interface GestureRunnerProps {
  onGestureDetected: (gesture: GestureType) => void;
}

/**
 * PLACEHOLDER COMPONENT - To be implemented by teammate
 * 
 * This component will handle:
 * 1. Accessing the webcam
 * 2. Processing video frames
 * 3. Using MediaPipe and TensorFlow.js to detect hand gestures
 * 4. Classifying gestures as thumbs up, flat hand, or thumbs down
 */
const GestureRunner: React.FC<GestureRunnerProps> = ({ onGestureDetected }) => {
  const [isActive, setIsActive] = useState(false);
  
  // This is a placeholder button that simulates gesture detection
  // The real implementation will be done by your teammate
  const simulateGesture = (gesture: GestureType) => {
    onGestureDetected(gesture);
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
      <div className="text-center mb-4">
        <h3 className="font-medium text-lg text-gray-800">Webcam Gesture Detection</h3>
        <p className="text-gray-600 text-sm">
          This component will be implemented by your teammate.
        </p>
      </div>
      
      {/* Placeholder for webcam display */}
      <div className="bg-black h-48 rounded-lg flex items-center justify-center mb-4">
        <p className="text-white">Webcam feed will appear here</p>
      </div>
      
      {/* Placeholder controls */}
      <div className="flex justify-between">
        <button
          className={`px-4 py-2 rounded-lg ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors`}
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? 'Stop Camera' : 'Start Camera'}
        </button>
        
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
            onClick={() => simulateGesture(GestureType.THUMBS_UP)}
          >
            👍
          </button>
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
            onClick={() => simulateGesture(GestureType.FLAT_HAND)}
          >
            ✋
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
            onClick={() => simulateGesture(GestureType.THUMBS_DOWN)}
          >
            👎
          </button>
        </div>
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>
          Your teammate will implement this component using MediaPipe and TensorFlow.js
          to detect and classify hand gestures from webcam input.
        </p>
      </div>
    </div>
  );
};

export default GestureRunner;