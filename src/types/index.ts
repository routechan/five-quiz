export type RoomStatus =
  | 'waiting'
  | 'playing'
  | 'answering'
  | 'answered'
  | 'judging'
  | 'finished';

export interface Room {
  id: string;
  roomCode: string;
  status: RoomStatus;
  currentQuizId: string | null;
  correctCount: number;
  questionCount: number;
}

export interface Player {
  id: string;
  roomId: string;
  nickname: string;
  position: number | null;
  isHost: boolean;
  isBot: boolean;
  isSpectator: boolean;
}

export interface Quiz {
  id: string;
  question: string;
  answer?: string;
}

export interface Answer {
  id: string;
  roomId: string;
  quizId: string;
  playerId: string;
  drawingData: string;
  isCorrect: boolean | null;
}

// API Response Types
export interface CreateRoomResponse {
  roomCode: string;
  roomId: string;
  playerId: string;
}

export interface JoinRoomResponse {
  roomId: string;
  playerId: string;
}

export interface RoomStateResponse {
  room: Room;
  players: Player[];
  answers: Answer[];
  currentQuiz?: {
    id: string;
    question: string;
    answer?: string;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
