/*export interface ApiValidationError {
    message: string;
    errors: Record<string, string[]>;
}
export function getFirstApiError(error: ApiValidationError): string | null {
    const errors = error.errors;

    const firstField = Object.keys(errors)[0];
    if (!firstField) return null;

    return errors[firstField][0] ?? null;
}
*/
