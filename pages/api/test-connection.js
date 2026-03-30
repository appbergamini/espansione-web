import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  try {
    // Testa a conexão listando as tabelas disponíveis
    const { data, error } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1);

    // Erro 42P01 (relation does not exist) significa que a conexão funcionou,
    // mas a tabela não existe — o que é esperado
    if (error && error.code === '42P01') {
      return res.status(200).json({
        status: 'ok',
        message: 'Conexão com Supabase estabelecida com sucesso!',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      });
    }

    if (error) {
      return res.status(500).json({
        status: 'erro',
        message: error.message,
        code: error.code,
        hint: error.hint,
      });
    }

    return res.status(200).json({
      status: 'ok',
      message: 'Conexão com Supabase estabelecida com sucesso!',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    });
  } catch (err) {
    return res.status(500).json({
      status: 'erro',
      message: err.message,
    });
  }
}
