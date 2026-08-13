export class ApiContractUnavailableError extends Error {
  constructor() {
    super(
      'Backend contract is not configured. Supply Swagger before wiring this operation.',
    );
    this.name = 'ApiContractUnavailableError';
  }
}
