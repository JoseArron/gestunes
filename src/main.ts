import './style.css';
import { GestureRecognizerOptions, NormalizedLandmark } from '@mediapipe/tasks-vision';
import HandDetector from './models/hand-detector';
import AudioPlayer from './models/audio-player';
import Renderer from './models/renderer';
import scaleValue from './utils/scaleValue';

class App {
  audioPlayer: AudioPlayer;
  handDetector: HandDetector;
  renderer: Renderer;

  constructor() {
    this.renderer = new Renderer({
      initialize: this.initialize.bind(this),
      startLoop: this.startLoop.bind(this),
    });
    this.audioPlayer = new AudioPlayer({
      animateInstrument: this.renderer.animateInstrument.bind(this.renderer),
      animateNote: this.renderer.animateNote,
    });
    this.handDetector = new HandDetector({
      fileSet: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
      options: {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task',
          delegate: 'GPU',
        },
        numHands: 2,
        runningMode: 'VIDEO',
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.2,
        minHandPresenceScore: 0.2,
      } as GestureRecognizerOptions,
      renderer: this.renderer,
      processRightHand: this.processRightHand.bind(this),
      processLeftHand: this.processLeftHand.bind(this),
      stopRightLoop: this.stopRightLoop.bind(this),
      stopLeftLoop: this.stopLeftLoop.bind(this),
    });
  }

  async initialize() {
    this.renderer.loadWebcam().then(() => {
      this.audioPlayer.play();
    });
  }

  async startLoop() {
    this.handDetector.loopDetection();
  }

  processRightHand(gesture: string, index: NormalizedLandmark) {
    let instrument = this.audioPlayer.getRightInstrument();
    if (gesture === 'Pointing_Up') {
      this.audioPlayer.setRightInstrument('piano');
      instrument = 'piano';
    } else if (gesture === 'Victory') {
      this.audioPlayer.setRightInstrument('guitar');
      instrument = 'guitar';
    } else if (gesture === 'Closed_Fist') {
      this.audioPlayer.setRightInstrument('drum');
      instrument = 'drum';
    } else if (gesture === 'Thumb_Up') {
      this.audioPlayer.setRightInstrument('kalimba');
      instrument = 'kalimba';
    }
    this.audioPlayer.setRightNoteIndex(Math.floor(scaleValue(index.y, [0, 1], [0, 22])));
    this.audioPlayer.getRightVelocity(index);
    if (this.renderer.resultElement)
      this.renderer.resultElement.children.item(1)!.textContent = `Right: ${gesture} ${instrument}`;
  }

  processLeftHand(gesture: string, index: NormalizedLandmark) {
    let instrument = this.audioPlayer.getLeftInstrument();
    if (gesture === 'Pointing_Up') {
      this.audioPlayer.setLeftInstrument('piano');
      instrument = 'piano';
    } else if (gesture === 'Victory') {
      this.audioPlayer.setLeftInstrument('guitar');
      instrument = 'guitar';
    } else if (gesture === 'Closed_Fist') {
      this.audioPlayer.setLeftInstrument('drum');
      instrument = 'drum';
    } else if (gesture === 'Thumb_Up') {
      this.audioPlayer.setLeftInstrument('kalimba');
      instrument = 'kalimba';
    }
    this.audioPlayer.setLeftNoteIndex(Math.floor(scaleValue(index.y, [0, 1], [0, 22])));
    this.audioPlayer.getLeftVelocity(index);
    if (this.renderer.resultElement)
      this.renderer.resultElement.children.item(0)!.textContent = `Left: ${gesture} ${instrument}`;
  }

  stopRightLoop() {
    this.audioPlayer.rightLoop.stop();
  }

  stopLeftLoop() {
    this.audioPlayer.leftLoop.stop();
  }
}

const app = new App();
