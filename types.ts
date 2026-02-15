
export enum TauntCategory {
  ESSENTIAL = 'Essential',
  COMBAT = 'Combat',
  INTEL = 'Intel',
  PLAYERS = 'Players',
  FLAVOR = 'Flavor'
}

export interface Taunt {
  id: number;
  text: string;
  category: TauntCategory;
  color?: string; // For player-specific taunts
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
