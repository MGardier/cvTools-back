import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

import { CreateApplicationRequestDto } from './create-application.dto';
import { DtoErrorCodeEnum } from 'src/shared/enums/dto-error-codes.enum';

// =============================================================================
//                            HELPERS
// =============================================================================

const buildDto = (
  payload: Record<string, unknown>,
): CreateApplicationRequestDto =>
  plainToInstance(CreateApplicationRequestDto, payload);

const validateDto = async (
  payload: Record<string, unknown>,
): Promise<ValidationError[]> => validate(buildDto(payload));

const allMessages = (errors: ValidationError[]): string[] =>
  errors.flatMap((error) => Object.values(error.constraints ?? {}));

// =============================================================================
//                            AT LEAST ONE OF
// =============================================================================

describe('CreateApplicationRequestDto', () => {
  describe('at least one identifying field', () => {
    it.each([
      ['company', { company: 'Anthropic' }],
      ['title', { title: 'Backend Developer' }],
      ['subject', { subject: 'Opportunité via meetup' }],
      ['url', { url: 'https://example.com/job/42' }],
    ])('accepts a payload with only %s', async (_field, payload) => {
      const errors = await validateDto(payload);

      expect(errors).toHaveLength(0);
    });

    it('rejects an empty payload', async () => {
      const errors = await validateDto({});

      expect(allMessages(errors)).toContain(
        DtoErrorCodeEnum.AT_LEAST_ONE_OF_REQUIRED,
      );
    });

    it('rejects a payload where every field is whitespace-only', async () => {
      const errors = await validateDto({
        title: '   ',
        company: '\t',
        subject: '  ',
        url: '   ',
      });

      expect(allMessages(errors)).toContain(
        DtoErrorCodeEnum.AT_LEAST_ONE_OF_REQUIRED,
      );
    });
  });

  // ===========================================================================
  //                            TRIM
  // ===========================================================================

  describe('trim', () => {
    it('trims surrounding whitespace on provided values', async () => {
      const dto = buildDto({ title: '  Backend Developer  ' });

      expect(dto.title).toBe('Backend Developer');
      expect(await validate(dto)).toHaveLength(0);
    });

    it('turns a whitespace-only field into undefined', () => {
      const dto = buildDto({ title: '   ', company: 'Anthropic' });

      expect(dto.title).toBeUndefined();
      expect(dto.company).toBe('Anthropic');
    });
  });

  // ===========================================================================
  //                            FIELD RULES
  // ===========================================================================

  describe('field rules', () => {
    it('rejects an invalid URL', async () => {
      const errors = await validateDto({ url: 'not-a-valid-url' });

      expect(allMessages(errors)).toContain(
        DtoErrorCodeEnum.APPLICATION_URL_INVALID,
      );
    });

    it('rejects a title longer than 100 characters', async () => {
      const errors = await validateDto({ title: 'a'.repeat(101) });

      expect(allMessages(errors)).toContain(
        DtoErrorCodeEnum.APPLICATION_TITLE_TOO_LONG,
      );
    });

    it('rejects a company longer than 100 characters', async () => {
      const errors = await validateDto({ company: 'a'.repeat(101) });

      expect(allMessages(errors)).toContain(
        DtoErrorCodeEnum.APPLICATION_COMPANY_TOO_LONG,
      );
    });

    it('rejects a subject longer than 150 characters', async () => {
      const errors = await validateDto({ subject: 'a'.repeat(151) });

      expect(allMessages(errors)).toContain(
        DtoErrorCodeEnum.APPLICATION_SUBJECT_TOO_LONG,
      );
    });

    it('a field-level error does not hide the other provided values', async () => {
      const dto = buildDto({ url: 'not-a-valid-url', company: 'Anthropic' });
      const errors = await validate(dto);

      expect(allMessages(errors)).toContain(
        DtoErrorCodeEnum.APPLICATION_URL_INVALID,
      );
      expect(dto.company).toBe('Anthropic');
    });
  });
});
