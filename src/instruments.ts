import * as Tone from 'tone';
import samples from './assets/samples.json';

export default {
  piano: new Tone.Sampler(samples.piano).toDestination(),
  guitar: new Tone.Sampler(samples.guitar).toDestination(),
  kalimba: new Tone.Sampler(samples.kalimba).toDestination(),
  drum: new Tone.Sampler(samples.drum).toDestination(),
};
