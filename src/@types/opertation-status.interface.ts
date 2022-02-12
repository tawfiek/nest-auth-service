export interface OperationStatus {
    success: boolean;
    message?: string;
}

export interface OperationStatusWithData<T> extends OperationStatus {
    data: T;
}
