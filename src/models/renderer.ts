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
    animInstrument?.classList.toggle(`playing-${getRandomRangeInt(1, 2)}`);
  }

  animateNote(instrumentName: string, hand: string) {
    const container = document.getElementById('notes-container');
    const note = document.createElement('img');

    const animInstrument = document.getElementById(
      (hand === 'left' ? 'left-' : 'right-') + instrumentName
    );

    if (!animInstrument) {
      return;
    }

    note.src = `/assets/notes/${getRandomRangeInt(1, 6)}.png`;
    note.classList.add('floating-note');

    note.style.position = 'absolute';

    note.style.left = `${animInstrument.getBoundingClientRect().x + getRandomRangeInt(50, 100)}px`;
    note.style.bottom = `${animInstrument.getBoundingClientRect().y - getRandomRangeInt(250, 300)}px`;

    container?.appendChild(note);

    setTimeout(() => {
      container?.removeChild(note);
    }, 5000);
  }
}
