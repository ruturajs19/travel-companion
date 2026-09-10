export class AIUnavailableError extends Error {
  constructor(message = 'AI service is currently unavailable') {
    super(message);
    this.name = 'AIUnavailableError';
  }
}

export class AIQuotaExceededError extends Error {
  constructor(message = 'AI request limit reached. Please try again shortly.') {
    super(message);
    this.name = 'AIQuotaExceededError';
  }
}

export class AIParseError extends Error {
  constructor(message = 'The AI response could not be understood') {
    super(message);
    this.name = 'AIParseError';
  }
}
