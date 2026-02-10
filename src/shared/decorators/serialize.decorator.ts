import { SetMetadata } from '@nestjs/common';

export const SERIALIZE_KEY = 'serialize';
export const SKIP_SERIALIZE_KEY = 'skipSerialize';

export type TDtoClass<T = unknown> = new (...args: unknown[]) => T;

export const SerializeWith = <T>(dto: TDtoClass<T>) =>
  SetMetadata(SERIALIZE_KEY, dto);

export const SkipSerialize = () => SetMetadata(SKIP_SERIALIZE_KEY, true);
