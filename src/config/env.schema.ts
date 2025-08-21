import { z } from 'zod';

export const envSchema  =z.object({
//DATABASE
DATABASE_URL : z.string({ error: "You must provide DATABASE_URL ."}),

//HASH
HASH_SALT_ROUND: z.string().optional() ,

//JWT SECRET
JWT_DEFAULT_SECRET: z.string({ error: "You must provide JWT_DEFAULT_SECRET ."}),
JWT_REFRESH_SECRET: z.string({ error: "You must provide JWT_REFRESH_SECRET ."}),
JWT_FORGOT_PASSWORD_SECRET: z.string({ error: "You must provide JWT_FORGOT_PASSWORD_SECRET ."}),

//JWT EXPIRATION
JWT_CONFIRMATION_ACCOUNT_EXPIRATION: z.string({ error: "You must provide JWT_CONFIRMATION_ACCOUNT_EXPIRATION in ms."}),
JWT_FORGOT_PASSWORD_EXPIRATION: z.string({ error: "You must provide JWT_FORGOT_PASSWORD_EXPIRATION in ms."}),
JWT_REFRESH_EXPIRATION: z.string({ error: "You must provide JWT_REFRESH_EXPIRATION in ms ."}),
JWT_ACCESS_EXPIRATION: z.string({ error: "You must provide JWT_ACCESS_EXPIRATION in ms ."}),

//URL
FRONT_URL_CONFIRMATION_ACCOUNT: z.url({ error: "You must provide DATABASE_URL ."}),
FRONT_URL_RESET_PASSWORD: z.url({ error: "You must provide DATABASE_URL ."}),

// NATS
NATS_DNS:z.string({ error: "You must provide DATABASE_URL ."}),
NATS_PORT: z.string({ error: "You must provide DATABASE_URL ."})

})




export type EnvConfig = z.infer<typeof envSchema>;