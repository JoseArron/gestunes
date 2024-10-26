import * as Tone from 'tone';
import instruments from '../instruments';

import type { Scale } from '../types';
import scales from '../assets/scales.json';
import { Frequency } from 'tone/build/esm/core/type/Units';
import scaleValue from '../utils/scaleValue';

interface AudioPlayerProps {
  animateInstrument: (instrumentName: string, hand: string) => void;
  animateNote: (instrumentName: string, hand: string) => void;
}

export default class AudioPlayer {
  props: AudioPlayerProps;
  noteValue: string = '16n';
  noteDuration: number = 1.5;
  rightInstrument: Tone.Sampler;
  leftInstrument: Tone.Sampler;
  rightScale: Scale;
  leftScale: Scale;
  rightLoop: Tone.Loop;
  leftLoop: Tone.Loop;

  rightNoteIndex: number = 0;
  leftNoteIndex: number = 0;
  rightScaleIndex: number = 0;
  leftScaleIndex: number = 0;

  rightMidiVel: number = 0.3;
  leftMidiVel: number = 0.3;
  rightPrevX: number = 0.6;
  leftPrevX: number = 0.4;
  rightPrevY: number = 0;
  leftPrevY: number = 0;
  rightVel: number = 0;
  leftVel: number = 0;
  minVel: number = 0.3;
  maxVel: number = 0.95;

  constructor(props: AudioPlayerProps) {
    this.props = props;
    this.rightInstrument = instruments.piano;
    this.leftInstrument = instruments.piano;
    this.rightScale = scales.piano;
    this.leftScale = scales.piano;
    this.rightLoop = new Tone.Loop(time => {
      this.rightInstrument.triggerAttackRelease(
        this.rightScale[this.rightScaleIndex][this.rightNoteIndex] as Frequency,
        this.noteDuration,
        time,
        this.rightMidiVel
      );
    }, this.noteValue);
    this.leftLoop = new Tone.Loop(time => {
      this.leftInstrument.triggerAttackRelease(
        this.leftScale[this.leftScaleIndex][this.leftNoteIndex] as Frequency,
        this.noteDuration,
        time,
        this.leftMidiVel
      );
    }, this.noteValue);
  }

  play() {
    Tone.getTransport().bpm.value = 120;
    Tone.getTransport().start();
  }

  setRightNoteIndex(index: number) {
    this.rightNoteIndex = index;
  }

  setLeftNoteIndex(index: number) {
    this.leftNoteIndex = index;
  }

  setRightInstrument(instrument: keyof typeof instruments) {
    this.rightInstrument = instruments[instrument];
    this.rightScale = scales[instrument];
  }

  getRightInstrument() {
    if (this.rightInstrument === instruments.piano) return 'piano';
    if (this.rightInstrument === instruments.guitar) return 'guitar';
    if (this.rightInstrument === instruments.drum) return 'drum';
    if (this.rightInstrument === instruments.kalimba) return 'kalimba';
  }

  setLeftInstrument(instrument: keyof typeof instruments) {
    this.leftInstrument = instruments[instrument];
    this.leftScale = scales[instrument];
  }

  getLeftInstrument() {
    if (this.leftInstrument === instruments.piano) return 'piano';
    if (this.leftInstrument === instruments.guitar) return 'guitar';
    if (this.leftInstrument === instruments.drum) return 'drum';
    if (this.leftInstrument === instruments.kalimba) return 'kalimba';
  }

  getRightVelocity(index: { x: number; y: number }) {
    this.rightVel =
      Math.sqrt((index.x - this.rightPrevX) ** 2 + (index.y - this.rightPrevY) ** 2) / 0.1;
    this.rightPrevX = index.x;
    this.rightPrevY = index.y;
    if (this.rightVel > 0.1) {
      this.rightLoop.start();
      this.props.animateInstrument(this.getRightInstrument() as string, 'right');
      this.props.animateNote(this.getRightInstrument() as string, 'right');
    } else {
      this.rightLoop.stop();
    }
    this.rightMidiVel = scaleValue(this.rightVel, [0.15, 2], [this.minVel, this.maxVel]);
  }

  getLeftVelocity(index: { x: number; y: number }) {
    this.leftVel =
      Math.sqrt((index.x - this.leftPrevX) ** 2 + (index.y - this.leftPrevY) ** 2) / 0.1;
    this.leftPrevX = index.x;
    this.leftPrevY = index.y;
    if (this.leftVel > 0.1) {
      this.leftLoop.start();
      this.props.animateInstrument(this.getLeftInstrument() as string, 'left');
      this.props.animateNote(this.getLeftInstrument() as string, 'left');
    } else {
      this.leftLoop.stop();
    }
    this.leftMidiVel = scaleValue(this.leftVel, [0.15, 2], [this.minVel, this.maxVel]);
  }
}
