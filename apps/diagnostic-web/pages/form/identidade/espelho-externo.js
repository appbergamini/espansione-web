import EspelhoSurvey from '../../../components/identidade/EspelhoSurvey';
import { FORM_ESPELHO_EXTERNO } from '../../../lib/mapa-identidade/forms';

// Formulário 4 — Espelho Externo (clientes/parceiros). Público por token.
export default function EspelhoExterno() {
  return <EspelhoSurvey formDef={FORM_ESPELHO_EXTERNO} slug="espelho-externo" />;
}
