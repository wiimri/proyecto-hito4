const createApp = require("./app");

const app = createApp();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`API Mercado Vecino disponible en http://localhost:${port}/api`);
});
