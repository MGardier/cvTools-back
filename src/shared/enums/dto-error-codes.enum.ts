import { DtoErrorCode, type TDtoErrorCode } from '@cvtools/contracts';

// Single source of truth: @cvtools/contracts. Kept under this name so existing
// `DtoErrorCodeEnum.X` usages (value and type) stay unchanged.
export const DtoErrorCodeEnum = DtoErrorCode;
export type DtoErrorCodeEnum = TDtoErrorCode;
