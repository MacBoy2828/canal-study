export type CardStatus = 'active' | 'archived';

export type Deck = {
  id: string;
  sourceLanguage: string;
  destinationLanguage: string;
  createdAt: number;
  updatedAt: number;
};

export type Flashcard = {
  id: string;
  deckId: string;
  sourceText: string;
  destinationText: string;
  exampleText: string;
  timesShown: number;
  timesCorrect: number;
  status: CardStatus;
  createdAt: number;
  updatedAt: number;
};

export type Settings = {
  displayLimit: number;
  activeDeckId: string | null;
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
};

export type StudyMode = 'source-to-dest' | 'dest-to-source';

export type NewFlashcard = {
  sourceText: string;
  destinationText: string;
  exampleText?: string;
};

export type NewDeck = {
  sourceLanguage: string;
  destinationLanguage: string;
};
