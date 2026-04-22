import { useEffect, useRef, useState } from 'react';

/**
 * Persiste estado do formulário em sessionStorage com debounce.
 * Chave escopada por (tipoFormulario + token) para evitar colisão
 * entre respondentes diferentes no mesmo dispositivo.
 *
 * sessionStorage (não localStorage): limpa ao fechar o navegador —
 * garantia de privacidade em dispositivos compartilhados.
 */
export function useFormPersistence(tipoFormulario, token, estadoInicial = {}) {
  const storageKey = `form_${tipoFormulario}_${token || 'anon'}`;
  const [dados, setDados] = useState(estadoInicial);
  const [inicializado, setInicializado] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!token) { setInicializado(true); return; }
    try {
      const stored = typeof window !== 'undefined' ? window.sessionStorage.getItem(storageKey) : null;
      if (stored) setDados(JSON.parse(stored));
    } catch (err) {
      console.warn('[useFormPersistence] erro ao restaurar:', err.message);
    } finally {
      setInicializado(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, token]);

  useEffect(() => {
    if (!inicializado) return;
    if (typeof window === 'undefined') return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      try {
        window.sessionStorage.setItem(storageKey, JSON.stringify(dados));
      } catch (err) {
        console.warn('[useFormPersistence] erro ao salvar:', err.message);
      }
    }, 500);
    return () => clearTimeout(debounceRef.current);
  }, [dados, storageKey, inicializado]);

  function atualizar(campo, valor) {
    setDados(prev => ({ ...prev, [campo]: valor }));
  }

  function limparStorage() {
    try {
      if (typeof window !== 'undefined') window.sessionStorage.removeItem(storageKey);
    } catch (err) {
      console.warn('[useFormPersistence] erro ao limpar:', err.message);
    }
  }

  return { dados, atualizar, setDados, inicializado, limparStorage };
}
