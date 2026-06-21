import EspelhoSurvey from '../../../components/identidade/EspelhoSurvey';
import { FORM_ESPELHO_INTERNO } from '../../../lib/mapa-identidade/forms';

// Formulário 3 — Espelho Interno (anônimo, colaboradores). Público por token.
export default function EspelhoInterno() {
  return <EspelhoSurvey formDef={FORM_ESPELHO_INTERNO} slug="espelho-interno" />;
}
