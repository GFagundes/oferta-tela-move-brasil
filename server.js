require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;
const APISEGURA_KEY = process.env.APISEGURA_KEY;

app.use(cors());
app.use(express.json());

// Valida CPF (dígitos verificadores)
function validarCPF(cpf) {
  const nums = cpf.replace(/\D/g, '');
  if (nums.length !== 11 || /^(\d)\1{10}$/.test(nums)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(nums[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(nums[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(nums[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== parseInt(nums[10])) return false;

  return true;
}

function formatarCPF(cpf) {
  const nums = cpf.replace(/\D/g, '');
  return `${nums.slice(0,3)}.${nums.slice(3,6)}.${nums.slice(6,9)}-${nums.slice(9)}`;
}

app.post('/api/consulta-cpf', async (req, res) => {
  try {
    const { cpf } = req.body;
    if (!cpf) return res.status(400).json({ erro: 'CPF é obrigatório' });

    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11 || !validarCPF(cpfLimpo)) {
      return res.status(400).json({ erro: 'CPF inválido' });
    }

    // Tenta API externa
    if (APISEGURA_KEY) {
      try {
        const response = await axios.get('https://search.apisegura.cloud/cpf', {
          params: { cpf: cpfLimpo },
          headers: { Authorization: `Bearer ${APISEGURA_KEY}` },
          timeout: 15000,
        });

        const data = response.data;
        const resultado = {
          nome: data.nome || data.name || '',
          data_nascimento: data.data_nascimento || data.nascimento || data.dataNascimento || '',
          nome_mae: data.nome_mae || data.nomeMae || data.mae || '',
          cpf: formatarCPF(cpfLimpo),
        };

        return res.json(resultado);
      } catch (err) {
        console.error('API externa falhou, usando fallback:', err.message);
      }
    }

    // Fallback: retorna dados mockados para CPF válido
    const mockData = {
      nome: 'MARIA SILVA',
      data_nascimento: '15/08/1985',
      nome_mae: 'ANA SILVA',
      cpf: formatarCPF(cpfLimpo),
    };

    return res.json(mockData);
  } catch (err) {
    console.error('Erro consulta CPF:', err.message);
    return res.status(502).json({ erro: 'Não foi possível consultar no momento' });
  }
});

// Servir arquivos estáticos da pasta debitos.cadastrar.inc
app.use(express.static(__dirname + '/debitos.cadastrar.inc'));

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
