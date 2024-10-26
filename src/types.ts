import * as Tone from 'tone';

export type Sample = Tone.SamplerOptions;
export type Scale = { [key: string]: { [key: number]: { [key: number]: string } } };
