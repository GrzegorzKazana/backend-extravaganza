type ServerErrorDTO = { status: 'error'; statusCode: number; message: string } & Record<
    string,
    // eslint-disable-next-line
    any
>;

export class ServerError extends Error {
    constructor(message: string, public statusCode: number = 500) {
        super(message);
    }

    public toJson(): ServerErrorDTO {
        return {
            status: 'error',
            statusCode: this.statusCode,
            message: this.message,
        };
    }
}

export class PayloadGuardError extends ServerError {
    constructor(message: string, private inputErrors: Record<string, string>) {
        super(message, 400);
    }

    toJson(): ServerErrorDTO {
        return {
            ...ServerError.prototype.toJson.call(this),
            errors: this.inputErrors,
        };
    }
}
