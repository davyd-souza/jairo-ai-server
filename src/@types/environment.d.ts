declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string
      OPENAI_KEY: string
      CLOUDFLARE_ACCOUNT_ID: string
      AWS_BUCKET_NAME: string
      AWS_ACCESS_KEY_ID: string
      AWS_SECRET_ACCESS_KEY: string
      PORT?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
