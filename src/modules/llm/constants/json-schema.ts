export const APPLICATION_JSON_SCHEMA = {
  type: 'object',
  properties: {
    isSuccess: {
      type: 'boolean',
      description:
        'true if enough information was found to extract a job posting, false otherwise',
    },
    title: { type: 'string', description: 'Job title' },
    company: { type: 'string', description: 'Company name' },
    description: {
      type: 'string',
      description:
        'Full job description in Markdown format (headings, lists, bold, etc.). Max 20000 characters.',
    },
    contractType: {
      type: 'string',
      enum: ['CDI', 'CDD', 'FREELANCE', 'ALTERNANCE'],
      description: 'Contract type',
    },
    salaryMin: {
      type: 'number',
      description: 'Minimum annual salary in euros',
    },
    salaryMax: {
      type: 'number',
      description: 'Maximum annual salary in euros',
    },
    experience: {
      type: 'string',
      enum: ['JUNIOR', 'MID', 'SENIOR'],
      description: 'Required experience level',
    },
    remotePolicy: {
      type: 'string',
      enum: ['FULL', 'HYBRID', 'ONSITE'],
      description: 'Remote work policy',
    },
    publishedAt: {
      type: 'string',
      description: 'Publication date in ISO 8601 format',
    },
    skills: {
      type: 'array',
      items: { type: 'string' },
      description: 'List of required technical skills',
    },
    jobboard: {
      type: 'string',
      enum: [
        'LINKEDIN',
        'INDEED',
        'WTTJ',
        'FRANCE_TRAVAIL',
        'GLASSDOOR',
        'APEC',
        'HELLO_WORK',
        'METEO_JOB',
        'UNKNOW',
      ],
      description:
        'The job board platform where this offer was posted. Infer from the URL domain if available.',
    },
    address: {
      type: 'object',
      properties: {
        city: { type: 'string' },
        postalCode: { type: 'string' },
        street: { type: 'string' },
        complement: { type: 'string' },
        streetNumber: { type: 'string' },
      },
      required: [],
      additionalProperties: false,
    },
  },
  required: ['isSuccess', 'title'],
  additionalProperties: false,
} as const;
