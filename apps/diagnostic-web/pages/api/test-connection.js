import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  try {
    const { error } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1);

    if (error && error.code !== '42P01') {
      return res.status(500).json({ status: 'erro', message: error.message, code: error.code, hint: error.hint });
    }

    return res.status(200).json({ status: 'ok', message: 'Conexão com Supabase estabelecida.' });
  } catch (err) {
    return res.status(500).json({ status: 'erro', message: err.message });
  }
}
