import { DrawingUtils, GestureRecognizer, NormalizedLandmark } from '@mediapipe/tasks-vision';
import getRandomRangeInt from '../utils/randomRange';

const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;

interface RendererProps {
  initialize: () => void;
  startLoop: () => void;
}

export default class Renderer {
  props: RendererProps;
  video: HTMLVideoElement | null;
  startButton: HTMLButtonElement | null;
  canvasElement: HTMLCanvasElement | null;
  canvasContext: CanvasRenderingContext2D | null;
  resultElement: HTMLDivElement | null;
  mainElement: HTMLDivElement | null;

  constructor(props: RendererProps) {
    this.props = props;
    this.video = document.getElementById('video-input') as HTMLVideoElement;
    this.video.innerText = 'LOADING...';
    this.startButton = document.getElementById('start-button') as HTMLButtonElement;
    this.canvasElement = document.getElementById('canvas-output') as HTMLCanvasElement;
    this.canvasContext = this.canvasElement!.getContext('2d');
    this.resultElement = document.getElementById('result') as HTMLDivElement;
    this.mainElement = document.getElementById('main') as HTMLDivElement;
    this.mainElement.style.display = 'none';

    this.startButton.addEventListener('click', async () => {
      this.props.initialize();
      this.startButton!.style.display = 'none';
      this.mainElement!.style.display = 'block';
      console.log('Start button clicked');
    });
  }

  async loadWebcam() {
    if (!this.video) {
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
    });
    this.video.srcObject = stream;
    this.video.width = VIDEO_WIDTH;
    this.video.height = VIDEO_HEIGHT;
    this.video.addEventListener('loadeddata', () => {
      if (this.video === null) {
        return;
      }
      console.log('Webcam loaded');
      this.video.play();
      this.props.startLoop();
    });
  }

  drawLandmarks(landmarks: NormalizedLandmark[][]) {
    if (!this.canvasContext || !this.canvasElement || !this.video) {
      return;
    }

    this.canvasContext.save();

    this.canvasElement.width = VIDEO_WIDTH / 2;
    this.canvasElement.height = VIDEO_HEIGHT / 2;
    this.video.width = VIDEO_WIDTH;
    this.video.height = VIDEO_HEIGHT;

    this.canvasContext.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    const drawingUtils = new DrawingUtils(this.canvasContext);

    if (landmarks && landmarks.length > 0) {
      for (const landmark of landmarks) {
        drawingUtils.drawConnectors(landmark, GestureRecognizer.HAND_CONNECTIONS, {
          color: '#fd6c16',
          lineWidth: 6,
        });
        drawingUtils.drawLandmarks(landmark, {
          color: '#fd6c16',
          fillColor: '#fd6c16',
          lineWidth: 6,
          radius: 6,
        });
      }
    } else {
      console.warn('No landmarks detected.');
    }

    this.canvasContext.restore();
  }

  animateInstrument(instrumentName: string, hand: string) {
    const animInstrument = document.getElementById(
      (hand === 'left' ? 'left-' : 'right-') + instrumentName
    );
    const random = getRandomRangeInt(0, 1);
    if (random === 0) animInstrument?.classList.toggle('playing-1');
    if (random === 1) animInstrument?.classList.toggle('playing-2');
  }

  animateNote(instrumentName: string, hand: string) {
    const container = document.getElementById('notes-container');
    const note = document.createElement('img');

    const animInstrument = document.getElementById(
      (hand === 'left' ? 'left-' : 'right-') + instrumentName
    );

    note.src = `/assets/notes/${getRandomRangeInt(1, 6)}.png`;
    note.classList.add('floating-note');

    note.style.position = 'absolute';

    // console.log(animInstrument, animInstrument?.style);

    // note.style.left = animInstrument?.style.left;
    // note.style.bottom = animInstrument?.style.bottom;

    // console.log(note.style.left, note.style.bottom);
    // note.style.transform = `translateX(${getRandomRangeInt(-10, 10)}%)`;

    container?.appendChild(note);

    setTimeout(() => {
      container?.removeChild(note);
    }, 5000);
  }
}
