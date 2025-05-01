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
  const HOLD_DURATION = 800; // Reduced to 0.8 seconds
  const lastStableGesture = useRef<string | null>(null);
  const gestureStableCount = useRef<number>(0);
  const currentGestureRef = useRef<string | null>(null);

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
      lastStableGesture.current = null;
      gestureStableCount.current = 0;
      currentGestureRef.current = null;
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
          ctx.textAlign = 'center';

          // Draw reference line
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.beginPath();
          ctx.moveTo(0, canvasRef.current.height/2);
          ctx.lineTo(canvasRef.current.width, canvasRef.current.height/2);
          ctx.stroke();
          
          if (predictions.length > 0) {
            setIsHandDetected(true);
            const currentGesture = detectGesture(predictions[0]);
            const currentTime = Date.now();

            if (currentGesture) {
              if (!currentGestureRef.current || currentGesture !== currentGestureRef.current) {
                // New gesture detected
                currentGestureRef.current = currentGesture;
                gestureStartTime.current = currentTime;
                setStatus(`Hold ${currentGesture.replace('_', ' ')}... (0.8s)`);
                
                // Visual cue for the required gesture
                drawGestureHint(currentGesture);
              } else {
                // Same gesture continuing
                const elapsed = currentTime - (gestureStartTime.current || 0);
                
                // Visual feedback - growing circle with color
                const progress = Math.min(1, elapsed / HOLD_DURATION);
                const centerX = canvasRef.current.width / 2;
                const centerY = canvasRef.current.height / 2;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, 20 + (progress * 30), 0, 2 * Math.PI);
                ctx.fillStyle = currentGesture === 'open_palm' ? 
                  `rgba(0, 100, 255, ${0.4 + (progress * 0.6)})` :
                  currentGesture === 'thumbs_up' ? 
                  `rgba(0, 200, 0, ${0.4 + (progress * 0.6)})` :
                  `rgba(200, 0, 0, ${0.4 + (progress * 0.6)})`;
                ctx.fill();
                
                if (elapsed >= HOLD_DURATION) {
                  onGestureDetected(currentGesture);
                  gestureStartTime.current = null;
                  currentGestureRef.current = null;
                  lastStableGesture.current = null;
                  gestureStableCount.current = 0;
                  
                  // Visual feedback
                  ctx.fillStyle = currentGesture === 'thumbs_up' ? 'green' : 
                                 currentGesture === 'thumbs_down' ? 'red' : 'blue';
                  ctx.fillText(
                    currentGesture === 'thumbs_up' ? '👍 Detected!' :
                    currentGesture === 'thumbs_down' ? '👎 Detected!' : '✋ Detected!',
                    centerX, 30
                  );
                  
                  // Haptic feedback
                  if (navigator.vibrate) navigator.vibrate(200);
                  
                  setTimeout(() => setStatus('Show your hand!'), 2000);
                } else {
                  setStatus(`Keep holding... ${(0.8 - (elapsed/1000)).toFixed(1)}s`);
                }
              }
            } else {
              currentGestureRef.current = null;
              gestureStartTime.current = null;
              setStatus('Hold gesture steady...');
            }
          } else {
            setIsHandDetected(false);
            currentGestureRef.current = null;
            gestureStartTime.current = null;
            lastStableGesture.current = null;
            gestureStableCount.current = 0;
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

      // Calculate positions relative to wrist
      const thumbY = thumbTip[1] - wrist[1];
      const indexY = indexTip[1] - wrist[1];
      const middleY = middleTip[1] - wrist[1];
      const ringY = ringTip[1] - wrist[1];
      const pinkyY = pinkyTip[1] - wrist[1];

      // Calculate distances
      const thumbIndexDist = Math.sqrt(
        Math.pow(thumbTip[0] - indexTip[0], 2) + 
        Math.pow(thumbTip[1] - indexTip[1], 2)
      );
      const handSpread = Math.abs(indexTip[0] - pinkyTip[0]);

      // 1. THUMBS UP DETECTION - More forgiving
      if (thumbY < -40 &&            // Thumb above wrist
          thumbIndexDist > 70 &&     // Thumb separated from fingers
          indexY < 10 &&             // Fingers not too low
          middleY < 10) {
        return 'thumbs_up';
      }

      // 2. THUMBS DOWN DETECTION - More forgiving
      if (thumbY > 20 &&             // Thumb below wrist
          thumbIndexDist > 50 &&     // Thumb separated from fingers
          indexY > -20 &&            // Fingers not too high
          middleY > -20) {
        return 'thumbs_down';
      }

      // 3. OPEN PALM DETECTION - More forgiving
      const fingersUp = indexY < -30 && middleY < -30 && ringY < -30 && pinkyY < -30;
      const thumbOut = thumbIndexDist > 100;
      const fingersSpread = handSpread > 120;
      
      if (fingersUp && thumbOut && fingersSpread) {
        // Check fingertip alignment with more tolerance
        const fingertips = [indexTip, middleTip, ringTip, pinkyTip];
        const tipHeights = fingertips.map(tip => tip[1]);
        const heightDiff = Math.max(...tipHeights) - Math.min(...tipHeights);
        
        if (heightDiff < 80) {  // More tolerant alignment check
          return 'open_palm';
        }
      }

      return null;
    }

    function drawGestureHint(gesture: string) {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      ctx.font = '24px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      
      // Clear previous text
      ctx.clearRect(0, 0, canvasRef.current?.width || 0, 50);
      
      if (gesture === 'open_palm') {
        ctx.fillText('✋ Hold hand flat and open', canvasRef.current?.width ? canvasRef.current.width/2 : 0, 30);
      } else if (gesture === 'thumbs_up') {
        ctx.fillText('👍 Hold thumb up', canvasRef.current?.width ? canvasRef.current.width/2 : 0, 30);
      } else {
        ctx.fillText('👎 Hold thumb down', canvasRef.current?.width ? canvasRef.current.width/2 : 0, 30);
      }
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
        <p>Hold your gesture for 0.8 seconds to confirm:</p>
        <div className="gesture-info">
          <div>👍 Thumbs Up = Easy</div>
          <div>👎 Thumbs Down = Hard</div>
          <div>✋ Open Palm = Incorrect</div>
        </div>
      </div>
    </div>
  );
}