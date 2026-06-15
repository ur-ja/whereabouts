export interface Entry {
  id: string;
  date: string;
  lean: number;
  tags: string[];
  note: string;
  created_at: string;
}

export interface EntryInput {
  date: string;
  lean: number;
  tags: string[];
  note: string;
}

export interface FactorStat {
  tag: string;
  count: number;
  indiaCount: number;
  australiaCount: number;
}
