export default () => ({
  port: parseInt(process.env.PORT || "3000", 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiration: process.env.JWT_EXPIRATION || "15m",
    refreshExpiration: process.env.REFRESH_TOKEN_EXPIRATION || "7d",
  },
  apis: {
    googleMaps: process.env.GOOGLE_MAPS_API_KEY,
    openWeather: process.env.OPENWEATHER_API_KEY,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
});
