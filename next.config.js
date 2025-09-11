/** next.config.js **/
module.exports = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
  }
};
