import { ErrorCode, type TErrorCode } from '@cvtools/contracts';

// Single source of truth: @cvtools/contracts. Kept under this name so existing
// `ErrorCodeEnum.X` usages (value and type) stay unchanged.
export const ErrorCodeEnum = ErrorCode;
export type ErrorCodeEnum = TErrorCode;
