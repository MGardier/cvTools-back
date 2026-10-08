import type { ExecutionContext } from '@nestjs/common';
import { INTERCEPTORS_METADATA } from '@nestjs/common/constants.js';
import type { Reflector } from '@nestjs/core';
import { ImplementInterceptor } from '@orpc/nest';
import type { TEnvelope } from '@cvtools/contracts';
import type { Request } from 'express';
import type { IOrpcRouteMeta } from '#src/shared/types/api.types.js';

/** Helpers for oRPC contract routes (@cvtools/contracts). */
export abstract class ContractRoute {
  /**
   * Builds the success envelope of a contract route.
   * The status is read from the contract (`successStatus`), single source of truth.
   */
  static buildSuccessResponse<T>(
    procedure: { '~orpc': IOrpcRouteMeta },
    data: T,
    request: Request,
  ): TEnvelope<T> {
    const DEFAULT_SUCCESS_STATUS = 200;

    return {
      success: true,
      status: procedure['~orpc'].route?.successStatus ?? DEFAULT_SUCCESS_STATUS,
      data,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
  }

  /**
   * True when the handler is an oRPC contract route (decorated with @Implement).
   * oRPC writes the response itself: global serialization / envelope must be skipped.
   */
  static isContractRoute(
    reflector: Reflector,
    context: ExecutionContext,
  ): boolean {
    const interceptors = reflector.get<unknown[] | undefined>(
      INTERCEPTORS_METADATA,
      context.getHandler(),
    );
    return interceptors?.includes(ImplementInterceptor) ?? false;
  }
}
