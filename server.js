require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static(__dirname));
app.use('/debitos.cadastrar.inc', express.static(__dirname + '/debitos.cadastrar.inc'));

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
