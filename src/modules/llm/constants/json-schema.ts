export const APPLICATION_JSON_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Job title' },
    company: { type: 'string', description: 'Company name' },
    description: {
      type: 'string',
      description: 'Job description summary (max 500 chars)',
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
    contacts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          firstname: { type: 'string' },
          lastname: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          profession: { type: 'string' },
        },
        required: [],
        additionalProperties: false,
      },
    },
  },
  required: ['title'],
  additionalProperties: false,
} as const;
