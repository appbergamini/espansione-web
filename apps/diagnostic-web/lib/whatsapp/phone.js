// Normalização compartilhada entre as telas públicas e as APIs do Mapa.
// Aceita números brasileiros com DDD e internacionais quando começam com +.
export function extrairTelefone(contato) {
  const texto = String(contato || '').trim();
  if (!texto || texto.includes('@')) return null;

  const digitos = texto.replace(/\D/g, '');
  if (digitos.length === 10 || digitos.length === 11) return `+55${digitos}`;
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith('55')) return `+${digitos}`;
  if (texto.startsWith('+') && digitos.length >= 8 && digitos.length <= 15) return `+${digitos}`;
  return null;
}

export function whatsappValido(contato) {
  return extrairTelefone(contato) != null;
}
