

export const ErrorCodes = {
    USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    USER_BLOCKED: 'USER_BLOCKED',
    ACCOUNT_EXPIRED: 'ACCOUNT_EXPIRED',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
};


export class AppError extends Error {
    public readonly code: string;
    public readonly extensions: any;

    constructor(code: string, extensions: any = {}) {
        super(code);
        this.code = code;
        this.extensions = { ...extensions, code };
        Object.setPrototypeOf(this, AppError.prototype);
    }
}