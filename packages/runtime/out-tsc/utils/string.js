export function isNotEmptyString(value) {
    return value !== '';
}
export function isNotBlankOrEmptyString(value) {
    return isNotEmptyString(value.trim());
}
