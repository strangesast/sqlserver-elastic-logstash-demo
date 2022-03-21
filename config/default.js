module.exports = {
  port: 3000,
  db: {
    user: "sa",
    password: "Password--",
    server: "localhost",
    requestTimeout: 360000,
    database: 'objects',
    options: {
      trustServerCertificate: true,
    },
  },
};
