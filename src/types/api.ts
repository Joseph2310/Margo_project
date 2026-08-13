export interface ApiErrorShape {
  message: string;
  code?: string;
  fieldErrors?: Record<string, string>;
}

export interface MutationResult<T> {
  data: T;
  message?: string;
}

/** Endpoint paths and wire DTOs remain intentionally absent until Swagger is supplied. */
export interface BackendContractStatus {
  configured: false;
  reason: 'swagger-not-supplied';
}
