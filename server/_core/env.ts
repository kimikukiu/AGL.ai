export const ENV = {
  appId: process***REMOVED***.VITE_APP_ID ?? "",
  cookieSecret: process***REMOVED***.JWT_SECRET ?? "",
  databaseUrl: process***REMOVED***.DATABASE_URL ?? "",
  oAuthServerUrl: process***REMOVED***.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process***REMOVED***.OWNER_OPEN_ID ?? "",
  isProduction: process***REMOVED***.NODE_ENV === "production",
  forgeApiUrl: process***REMOVED***.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process***REMOVED***.BUILT_IN_FORGE_API_KEY ?? "",
};
