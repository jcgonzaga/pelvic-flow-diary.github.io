export type RecordType = 'fluid-intake' | 'urination' | 'leakage' | 'urgency' | 'pad-use';

export interface BaseRecord {
  id: string;
  type: RecordType;
  timestamp: string;
  date: string;
  time: string;
}

export interface FluidIntakeRecord extends BaseRecord {
  type: 'fluid-intake';
  amount: number;
  drinkType: 'water' | 'coffee' | 'tea' | 'soda' | 'alcohol' | 'other';
}

export interface UrinationRecord extends BaseRecord {
  type: 'urination';
  amount: 'small' | 'medium' | 'large';
  arrivedOnTime: boolean;
  completeEmptying: boolean;
}

export interface LeakageRecord extends BaseRecord {
  type: 'leakage';
  amount: 'drops' | 'small' | 'moderate' | 'large';
  circumstance: 'cough' | 'sneeze' | 'laugh' | 'exercise' | 'urgency' | 'none';
  intensity: number; // 1-5
}

export interface UrgencyRecord extends BaseRecord {
  type: 'urgency';
  intensity: number; // 1-10
  reachedBathroom: 'yes' | 'no' | 'leakage';
  warningTime: '<10' | '10-30' | '30-60' | '>60'; // seconds
}

export interface PadUseRecord extends BaseRecord {
  type: 'pad-use';
  padType: 'pantyliner' | 'small' | 'medium' | 'large';
  condition: 'dry' | 'damp' | 'wet' | 'very-wet';
}

export type Record = FluidIntakeRecord | UrinationRecord | LeakageRecord | UrgencyRecord | PadUseRecord;
