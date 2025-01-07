import {
  FilesetResolver,
  GestureRecognizer,
  GestureRecognizerOptions,
  NormalizedLandmark,
} from '@mediapipe/tasks-vision';
import Renderer from './renderer';

interface HandDetectorProps {
  fileSet: string;
  options: GestureRecognizerOptions;
  renderer: Renderer;
  processRightHand: (gesture: string, index: NormalizedLandmark) => void;
  processLeftHand: (gesture: string, index: NormalizedLandmark) => void;
  stopRightLoop: () => void;
  stopLeftLoop: () => void;
}

export default class HandDetector {
  props: HandDetectorProps;
  renderer: Renderer;
  gestureRecognizer: GestureRecognizer | null;

  constructor(props: HandDetectorProps) {
    this.props = props;
    this.renderer = props.renderer;
    this.gestureRecognizer = null;
    this.loadModel()
      .then(gestureRecognizer => {
        this.gestureRecognizer = gestureRecognizer;
      })
      .catch(error => {
        console.log(error);
      });
  }

  async loadModel() {
    const vision = await FilesetResolver.forVisionTasks(this.props.fileSet);
    return GestureRecognizer.createFromOptions(vision, this.props.options);
  }

  loopDetection() {
    const process = (): void => {
      const nowInMs = Date.now();
      if (this.gestureRecognizer && this.renderer.video) {
        const gestureRecognitionResult = this.gestureRecognizer!.recognizeForVideo(
          this.renderer.video!,
          nowInMs
        );

        this.renderer.drawLandmarks(gestureRecognitionResult!.landmarks);
        let rightHandDetected: boolean = false;
        let leftHandDetected: boolean = false;

        if (gestureRecognitionResult.handedness.length === 0) {
          this.props.stopRightLoop();
          this.props.stopLeftLoop();
        }

        for (let i = 0; i < gestureRecognitionResult!.handedness.length; i++) {
          const handedness = gestureRecognitionResult!.handedness[i][0].categoryName;
          const gesture = gestureRecognitionResult!.gestures[i][0].categoryName;
          const index = gestureRecognitionResult!.landmarks[i][8];

          if (handedness === 'Right') {
            this.props.processRightHand(gesture, index);
            rightHandDetected = true;
          } else if (handedness === 'Left') {
            this.props.processLeftHand(gesture, index);
            leftHandDetected = true;
          }
        }

        if (!rightHandDetected) this.props.stopRightLoop();
        if (!leftHandDetected) this.props.stopLeftLoop();
      }
      requestAnimationFrame(() => process());
    };
    process();
  }
}
