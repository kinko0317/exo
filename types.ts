
export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandData {
  landmarks: HandLandmark[];
  worldLandmarks: HandLandmark[];
  handedness: 'Left' | 'Right';
}

export interface SpellAnalysis {
  name: string;
  type: string;
  description: string;
  energyLevel: string;
  colorHex: string;
}

export enum AppState {
  IDLE = 'IDLE',
  LOADING_MODEL = 'LOADING_MODEL',
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR'
}

export interface HandPosition {
  x: number;
  y: number;
  z: number;
  quaternion: { x: number, y: number, z: number, w: number };
  isActive: boolean;
}
