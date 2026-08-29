// TEMPORÁRIO — função node sem nenhuma dependência, para separar problema de
// runtime (função nova não responde) de problema no caminho do Supabase.
export default function handler(req, res) {
  res.status(200).json({ ok: true, regiao: process.env.VERCEL_REGION || null, agora: Date.now() });
}
