export class ServerError extends Error {
  constructor(
    public key: string = 'server.error',
    public data: string[] = [],
    public httpStatus: number = 500
  ) {
    super(key);
    this.data = data;
    this.httpStatus = httpStatus;
  }
}

export class NotFoundError extends ServerError {
  constructor(objectType: string, filter: string) {
    super('server.not_found', [objectType, filter], 400);
  }
}

export class ParameterError extends ServerError {
  constructor(parametername: string) {
    super('server.invalid_parameter', [parametername], 400);
  }
}
