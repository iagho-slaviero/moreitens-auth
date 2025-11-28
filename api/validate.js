const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('API MoreItens está Online!');
});

app.post('/validate', (req, res) => {
  const { license_key, hwid, port, plugin, version } = req.body;

  console.log(`Recebendo validação: Key=${license_key}, HWID=${hwid}`);

  if (!license_key || !hwid) {
    return res.status(400).json({ valid: false, message: "Dados incompletos." });
  }

  const validKeys = ["ADMIN-123", "CLIENTE-VIP-01"];
  
  const isKeyValid = validKeys.includes(license_key);

  if (isKeyValid) {
    const sessionToken = Buffer.from(`${hwid}-AUTORIZADO-SERVER`).toString('base64');

    return res.status(200).json({
      valid: true,
      token: sessionToken,
      message: "Licença ativa."
    });
  } else {
    return res.status(403).json({
      valid: false,
      message: "Licença inválida."
    });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});