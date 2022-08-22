export type Subject = {
  id: number;
  name: string;
  creditCount: number;
  code: string;
  maxSlots: number;
  currentSlots: number;
  lecturer: string[];
  fee: number;
  schedule: string[];
  invalid: boolean;
};
