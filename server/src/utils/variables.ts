const { env } = process as { env: { [key: string]: string } };

export const {
  PORT,
  MONGO_URI,
  MAILTRAP_USER,
  MAILTRAP_PASS,
  VERIFICATION_MAIL,
  PASSWORD_RESET_LINK,
  SIGN_IN_URL,
  JWT_SECRET,
  CLOUD_NAME,
  CLOUD_KEY,
  CLOUD_SECREC,
} = env;
