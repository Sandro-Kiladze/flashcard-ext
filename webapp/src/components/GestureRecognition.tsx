import { useState, useEffect, useRef } from 'react';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs';

interface GestureRecognitionProps {
  onGestureDetected: (gesture: string) => void;
  isActive: boolean;
}

export default function GestureRecognition({ onGestureDetected, isActive }: GestureRecognitionProps) {
  const [status, setStatus] = useState('Initializing...');
  const [model, setModel] = useState<handpose.HandPose | null>(null);
  const [isHandDetected, setIsHandDetected] = useState(false);
  const [fps, setFps] = useState(0);
  
  // Properly initialized refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentGesture = useRef<string | null>(null);
  const gestureStartTime = useRef<number | null>(null);
  const frameCount = useRef<number>(0);
  const lastFpsUpdate = useRef<number>(performance.now());
  const animationRef = useRef<number | null>(null);
  
  const HOLD_DURATION = 3000; // 3 seconds
  const DETECTION_INTERVAL = 100; // Check for hand every 100ms

  useEffect(() => {
    if (!isActive) return;

    async function init() {
      try {
        console.log('Initializing camera...');
        // Request camera access with better quality settings
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          console.log('Camera initialized successfully');
          
          if (canvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }
        }
        
        // Load the handpose model with better configuration
        setStatus('Loading model...');
        console.log('Loading handpose model...');
        const handposeModel = await handpose.load({
          maxContinuousChecks: 5,
          detectionConfidence: 0.7, // Lowered for better detection
          iouThreshold: 0.3,
          scoreThreshold: 0.5 // Lowered for better detection
        });
        setModel(handposeModel);
        console.log('Handpose model loaded successfully');
        setStatus('Model loaded. Show your hand!');
        
        // Start detection loop
        detectGestures();
      } catch (err) {
        console.error('Error during initialization:', err);
        setStatus(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    init();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive]);

  async function detectGestures() {
    if (!model || !videoRef.current || !canvasRef.current || !isActive) return;

    try {
      // Update FPS counter
      frameCount.current++;
      if (frameCount.current - lastFpsUpdate.current > 1000) {
        setFps(Math.round((frameCount.current * 1000) / (frameCount.current - lastFpsUpdate.current)));
        lastFpsUpdate.current = frameCount.current;
      }

      const predictions = await model.estimateHands(videoRef.current);
      console.log('Hand predictions:', predictions.length);
      
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        if (predictions.length > 0) {
          const landmarks = predictions[0].landmarks;
          
          // Draw landmarks
          ctx.fillStyle = 'red';
          landmarks.forEach(landmark => {
            ctx.beginPath();
            ctx.arc(landmark[0], landmark[1], 5, 0, 2 * Math.PI);
            ctx.fill();
          });

          // Draw connections
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          const connections = [
            [0, 1, 2, 3, 4],         // Thumb
            [0, 5, 6, 7, 8],         // Index finger
            [0, 9, 10, 11, 12],      // Middle finger
            [0, 13, 14, 15, 16],    // Ring finger
            [0, 17, 18, 19, 20],     // Pinky
            [5, 9, 13, 17, 0]        // Palm base
          ];
          
          connections.forEach(polygon => {
            ctx.beginPath();
            polygon.forEach((pointIdx, i) => {
              const point = landmarks[pointIdx];
              if (i === 0) {
                ctx.moveTo(point[0], point[1]);
              } else {
                ctx.lineTo(point[0], point[1]);
              }
            });
            ctx.stroke();
          });
        }
      }
      
      if (predictions.length > 0) {
        setIsHandDetected(true);
        const gesture = detectGesture(predictions[0]);
        console.log('Detected gesture:', gesture);
        
        if (gesture) {
          if (currentGesture.current === gesture) {
            if (!gestureStartTime.current) {
              gestureStartTime.current = Date.now();
            } else if (Date.now() - gestureStartTime.current >= HOLD_DURATION) {
              onGestureDetected(gesture);
              gestureStartTime.current = null;
              setStatus(`Gesture detected: ${gesture}`);
              setTimeout(() => {
                setStatus('Show your hand!');
              }, 2000);
            }
          } else {
            currentGesture.current = gesture;
            gestureStartTime.current = Date.now();
          }
        } else {
          currentGesture.current = null;
          gestureStartTime.current = null;
        }
      } else {
        setIsHandDetected(false);
        currentGesture.current = null;
        gestureStartTime.current = null;
      }
    } catch (err) {
      console.error('Error detecting gestures:', err);
      setStatus('Error detecting hand. Please try again.');
    }
    
    setTimeout(() => requestAnimationFrame(detectGestures), DETECTION_INTERVAL);
  }

  function detectGesture(prediction: handpose.AnnotatedPrediction) {
    const landmarks = prediction.landmarks;
    console.log('Hand confidence:', prediction.handInViewConfidence);
    
    // Get thumb and index finger positions
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const wrist = landmarks[0];
    
    // Calculate distances with improved thresholds
    const thumbToWrist = Math.abs(thumbTip[1] - wrist[1]);
    const indexToWrist = Math.abs(indexTip[1] - wrist[1]);
    const middleToWrist = Math.abs(middleTip[1] - wrist[1]);
    const ringToWrist = Math.abs(ringTip[1] - wrist[1]);
    const pinkyToWrist = Math.abs(pinkyTip[1] - wrist[1]);
    
    // Thumbs up detection with improved thresholds
    if (thumbToWrist > indexToWrist * 1.2 && 
        thumbToWrist > middleToWrist * 1.2 &&
        indexToWrist < middleToWrist * 0.8) {
      return 'thumbs_up';
    }
    
    // Thumbs down detection with improved thresholds
    if (thumbToWrist < indexToWrist * 0.7 && 
        thumbToWrist < middleToWrist * 0.7 &&
        indexToWrist < middleToWrist * 0.8) {
      return 'thumbs_down';
    }
    
    // Open palm detection with improved thresholds
    if (indexToWrist > middleToWrist * 0.85 &&
        middleToWrist > ringToWrist * 0.85 &&
        ringToWrist > pinkyToWrist * 0.85) {
      return 'open_palm';
    }
    
    return null;
  }

  if (!isActive) return null;

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ position: 'relative' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            transform: 'scaleX(-1)',
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: '8px'
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: 'scaleX(-1)',
            pointerEvents: 'none'
          }}
        />
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '14px',
        zIndex: 10
      }}>
        <div>Status: {status}</div>
        <div>FPS: {fps}</div>
        <div>Hand detected: {isHandDetected ? '✅' : '❌'}</div>
        {currentGesture.current && gestureStartTime.current && (
          <div>
            Detected: {currentGesture.current} - 
            Hold for {Math.ceil((HOLD_DURATION - (Date.now() - gestureStartTime.current)) / 1000)}s
          </div>
        )}
      </div>
      
      <div style={{ 
        marginTop: '10px',
        padding: '10px',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>Gesture Guide:</p>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div>👍</div>
            <div>Thumbs Up</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div>👎</div>
            <div>Thumbs Down</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div>✋</div>
            <div>Open Palm</div>
          </div>
        </div>
      </div>
    </div>
  );
}