declare module '@tensorflow/tfjs' {
  export * from '@tensorflow/tfjs-core';
  export * from '@tensorflow/tfjs-converter';
  export * from '@tensorflow/tfjs-backend-webgl';
}

declare module '@tensorflow-models/handpose' {
  interface AnnotatedPrediction {
    landmarks: number[][];
    handInViewConfidence: number;
    boundingBox: {
      topLeft: [number, number];
      bottomRight: [number, number];
    };
  }

  interface HandPose {
    estimateHands(input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): Promise<AnnotatedPrediction[]>;
  }

  function load(config?: {
    maxContinuousChecks?: number;
    detectionConfidence?: number;
    iouThreshold?: number;
    scoreThreshold?: number;
  }): Promise<HandPose>;

  export { load, HandPose, AnnotatedPrediction };
} 