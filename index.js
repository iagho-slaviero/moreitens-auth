const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/', (req, res) => {
  res.send('API MoreItens com Banco de Dados Online!');
});

app.post('/validate', async (req, res) => {
  const { license_key, hwid, ip, port, plugin, version } = req.body;

  if (!license_key || !hwid) {
    return res.status(400).json({ valid: false, message: "Dados incompletos." });
  }

  try {
    const { data: license, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', license_key)
      .single();

    if (error || !license) {
      return res.status(403).json({ valid: false, message: "Licença não encontrada." });
    }

    if (!license.is_active) {
      return res.status(403).json({ valid: false, message: "Esta licença foi desativada." });
    }

    if (!license.hwid) {
      const { error: updateError } = await supabase
        .from('licenses')
        .update({ 
            hwid: hwid, 
            ip: ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            last_seen: new Date()
        })
        .eq('id', license.id);

      if (updateError) {
        return res.status(500).json({ valid: false, message: "Erro ao ativar licença." });
      }

      const sessionToken = Buffer.from(`${hwid}-TOKEN-SEGURO`).toString('base64');
      return res.status(200).json({ valid: true, token: sessionToken, message: "Licença ativada com sucesso!" });
    }

    if (license.hwid === hwid) {
      await supabase.from('licenses').update({ last_seen: new Date() }).eq('id', license.id);
      
      const sessionToken = Buffer.from(`${hwid}-TOKEN-SEGURO`).toString('base64');
      return res.status(200).json({ valid: true, token: sessionToken, message: "Licença válida." });
    } else {
      console.log(`ALERTA: Tentativa de uso da chave ${license_key} em HWID diferente!`);
      return res.status(403).json({ 
        valid: false, 
        message: "HWID Inválido. Esta chave já está registrada em outro servidor." 
      });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ valid: false, message: "Erro interno no servidor." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});