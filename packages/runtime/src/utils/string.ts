
export function isNotEmptyString(value: string): boolean {
    return value !== '';
}

export function isNotBlankOrEmptyString(value: string): boolean {
    return isNotEmptyString(value.trim());
}