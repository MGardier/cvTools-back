export class NotAJobPostingError extends Error {
  constructor() {
    super('LLM determined the content is not a job posting');
    this.name = 'NotAJobPostingError';
  }
}
