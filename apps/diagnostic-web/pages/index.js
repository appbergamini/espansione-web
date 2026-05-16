import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/adm');
  }, []);

  return (
    <div style={{ padding: '3rem', textAlign: 'center', color: '#fff' }}>
      Redirecionando para o ambiente seguro...
    </div>
  );
}
