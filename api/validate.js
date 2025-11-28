
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { license_key, hwid, port, plugin, version } = req.body;

  if (!license_key || !hwid) {
    return res.status(400).json({ valid: false, message: "Dados incompletos." });
  }

  const isKeyValid = (license_key === "ADMIN-123");

  if (isKeyValid) {
    const sessionToken = Buffer.from(`${hwid}-AUTORIZADO-2024`).toString('base64');

    return res.status(200).json({
      valid: true,
      token: sessionToken,
      message: "Licença ativa e autorizada."
    });
  } else {
    return res.status(403).json({
      valid: false,
      message: "Licença inválida ou bloqueada."
    });
  }
}