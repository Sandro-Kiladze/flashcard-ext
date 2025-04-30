import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-webgl';

interface GestureRecognitionProps {
  onGestureDetected: (gesture: string) => void;
  isActive: boolean;
}

export default function GestureRecognition({ onGestureDetected, isActive }: GestureRecognitionProps) {
  const [status, setStatus] = useState('Initializing...');
  const [isHandDetected, setIsHandDetected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentGesture = useRef<string | null>(null);
  const gestureStartTime = useRef<number | null>(null);
  const HOLD_DURATION = 3000;

  useEffect(() => {
    if (!isActive) {
      // Clean up when inactive
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsHandDetected(false);
      currentGesture.current = null;
      gestureStartTime.current = null;
      return;
    }

    let model: handpose.HandPose;
    let stream: MediaStream;
    let animationFrameId: number;
    let isRunning = true;

    async function setupCamera() {
      try {
        setStatus('Setting up camera...');
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise((resolve) => {
            if (videoRef.current) {
              videoRef.current.onloadedmetadata = resolve;
            }
          });
          await videoRef.current.play();
        }
      } catch (err) {
        console.error('Camera error:', err);
        setStatus('Camera access denied');
      }
    }

    async function loadModel() {
      try {
        setStatus('Loading model...');
        await tf.setBackend('webgl');
        await tf.ready();
        console.log('TensorFlow.js backend:', tf.getBackend());
        model = await handpose.load({
          maxContinuousChecks: 3,
          detectionConfidence: 0.8
        });
        setStatus('Ready - Show your hand');
      } catch (err) {
        console.error('Model loading error:', err);
        setStatus('Model failed to load');
      }
    }

    async function detectHands() {
      if (!isRunning || !model || !videoRef.current || !canvasRef.current) {
        return;
      }

      try {
        tf.engine().startScope();
        const predictions = await model.estimateHands(videoRef.current);
        
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.font = '24px Arial';
          
          if (predictions.length > 0) {
            setIsHandDetected(true);
            const gesture = detectGesture(predictions[0]);
            
            if (gesture) {
              const currentTime = Date.now();
              
              // First detection of this gesture
              if (currentGesture.current !== gesture) {
                currentGesture.current = gesture;
                gestureStartTime.current = currentTime;
              } 
              // Same gesture continuing
              else {
                const elapsed = currentTime - (gestureStartTime.current || 0);
                
                // Update status with countdown
                setStatus(`${gesture.replace('_', ' ')} - ${Math.ceil((HOLD_DURATION - elapsed)/1000)}s`);
                
                // Draw countdown progress
                const progress = Math.min(1, elapsed / HOLD_DURATION);
                ctx.strokeStyle = '#4CAF50';
                ctx.lineWidth = 8;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(50, 50, 30, 0, 2 * Math.PI * progress);
                ctx.stroke();
                
                // Gesture held long enough
                if (elapsed >= HOLD_DURATION) {
                  onGestureDetected(gesture);
                  gestureStartTime.current = null;
                  currentGesture.current = null;
                  
                  // Add haptic feedback
                  if (navigator.vibrate) {
                    navigator.vibrate(200); // 200ms vibration
                  }
                  
                  // Draw confirmation
                  if (gesture === 'thumbs_up') {
                    ctx.fillStyle = 'green';
                    ctx.fillText('👍 Detected!', 10, 30);
                  } else if (gesture === 'thumbs_down') {
                    ctx.fillStyle = 'red';
                    ctx.fillText('👎 Detected!', 10, 30);
                  } else if (gesture === 'open_palm') {
                    ctx.fillStyle = 'blue';
                    ctx.fillText('✋ Detected!', 10, 30);
                  }
                  
                  setTimeout(() => {
                    setStatus('Show your hand!');
                  }, 2000);
                }
              }
            } else {
              currentGesture.current = null;
              gestureStartTime.current = null;
              setStatus('Show your hand!');
            }
          } else {
            setIsHandDetected(false);
            currentGesture.current = null;
            gestureStartTime.current = null;
            setStatus('Show your hand!');
          }
        }
      } catch (err) {
        console.error('Detection error:', err);
        setStatus('Error detecting hand. Please try again.');
      } finally {
        tf.engine().endScope();
        if (isRunning) {
          animationFrameId = requestAnimationFrame(detectHands);
        }
      }
    }

    function detectGesture(prediction: handpose.AnnotatedPrediction) {
      const landmarks = prediction.landmarks;
      
      if (!landmarks || landmarks.length < 21) return null;

      // Key landmarks
      const wrist = landmarks[0];
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const middleTip = landmarks[12];
      const ringTip = landmarks[16];
      const pinkyTip = landmarks[20];

      // Calculate vertical positions relative to wrist (Y coordinates)
      const thumbY = thumbTip[1] - wrist[1];
      const indexY = indexTip[1] - wrist[1];
      const middleY = middleTip[1] - wrist[1];
      const ringY = ringTip[1] - wrist[1];
      const pinkyY = pinkyTip[1] - wrist[1];

      // Calculate horizontal spread between index and pinky (X coordinates)
      const handSpread = Math.abs(indexTip[0] - pinkyTip[0]);

      // Calculate distances between thumb and index fingertips
      const thumbIndexDist = Math.sqrt(
        Math.pow(thumbTip[0] - indexTip[0], 2) + 
        Math.pow(thumbTip[1] - indexTip[1], 2)
      );

      // Debug output (keep this for testing)
      console.log('Landmark Positions:');
      console.log('Thumb Y:', thumbY, 'Index Y:', indexY, 'Middle Y:', middleY);
      console.log('Ring Y:', ringY, 'Pinky Y:', pinkyY);
      console.log('Wrist Position:', wrist);
      console.log('Hand Spread:', handSpread);
      console.log('Thumb-Index Distance:', thumbIndexDist);

      // Thumbs Up Detection (based on console output)
      if (thumbY < -150 &&            // Thumb is significantly above wrist
          indexY < -50 &&             // Fingers are above wrist
          middleY < -30 &&
          thumbIndexDist > 100 &&     // Thumb is separated from index finger
          pinkyY > 10) {             // Pinky is below wrist (natural curl)
        return 'thumbs_up'; // Easy
      }

      // Thumbs Down Detection (based on new data)
      if (thumbY > 35 &&              // Thumb below wrist (data shows ~40-44)
          indexY > 35 &&              // Fingers below wrist
          middleY > 25 &&
          thumbIndexDist > 80 &&      // Thumb separated from index
          pinkyY < -5) {             // Pinky curled up
        return 'thumbs_down'; // Hard
      }

      // Open Palm Detection
      const fingerSpread = 
        Math.abs(indexY - middleY) + 
        Math.abs(middleY - ringY) + 
        Math.abs(ringY - pinkyY);
      
      if (fingerSpread < 80 &&        // Fingers are close together vertically
          thumbIndexDist < 80 &&      // Thumb is close to index finger
          handSpread > 150) {         // Hand is wide open
        return 'open_palm'; // Incorrect
      }

      return null;
    }

    async function initialize() {
      await setupCamera();
      await loadModel();
      if (isRunning) {
        detectHands();
      }
    }

    initialize();

    return () => {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current?.srcObject) {
        const videoStream = videoRef.current.srcObject as MediaStream;
        videoStream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      tf.disposeVariables();
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="gesture-recognition">
      <div className="video-container">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: 'scaleX(-1)'
          }}
        />
        <div className={`status ${isHandDetected ? 'hand-detected' : ''}`}>
          {status}
        </div>
      </div>
      <div className="instructions">
        <p>Hold your gesture for 3 seconds to confirm:</p>
        <div className="gesture-info">
          <div>👍 Thumbs Up = Easy</div>
          <div>👎 Thumbs Down = Hard</div>
          <div>✋ Open Palm = Incorrect</div>
        </div>
      </div>
    </div>
  );
}