import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Participant, Challenge, AssessmentResult } from "@/data/types";
import { challengeById, challenges as allChallenges } from "@/data/challenges";
import { activeItems } from "@/data/methodology/assessmentItems";
import { demoResponses } from "@/data/mock/mockDemoResponses";
import { SAMPLE_CHALLENGE_IDS, SAMPLE_PARTICIPANT } from "@/data/mock/mockContext";
import { runFullAssessment } from "@/services/assessment/methodologyEngine";

export type Answer = number | null;
export type Answers = Record<string, Answer>;

interface PrototypeState {
  participant: Participant;
  setParticipant: (p: Participant) => void;
  selectedChallenges: Challenge[];
  toggleChallenge: (id: string) => void;
  answers: Answers;
  setAnswer: (id: string, value: number) => void;
  answeredCount: number;
  /** recurso demo: preenche as 60 questões e marca o resultado como demo */
  fillExampleAnswers: () => void;
  isDemo: boolean;
  /** resultado imutável do Assessment concluído (fonte única de verdade) ou null */
  latestAssessment: AssessmentResult | null;
  /** histórico de resultados (jornada anual — múltiplos assessments) */
  assessmentHistory: AssessmentResult[];
  /** conclui o Assessment: valida contexto + 60 respostas, calcula e guarda o resultado */
  completeAssessment: () => AssessmentResult | null;
  reset: () => void;
}

const PrototypeContext = createContext<PrototypeState | null>(null);

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [participant, setParticipant] = useState<Participant>(SAMPLE_PARTICIPANT);
  const [challengeIds, setChallengeIds] = useState<string[]>(SAMPLE_CHALLENGE_IDS);
  const [answers, setAnswers] = useState<Answers>({});
  const [isDemo, setIsDemo] = useState(false);
  // Sem resultado por padrão: nenhuma página usa INITIAL_DEMO_RESULT. O resultado
  // só existe após concluir o Assessment (real ou explicitamente demo).
  const [latestAssessment, setLatestAssessment] = useState<AssessmentResult | null>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentResult[]>([]);

  const toggleChallenge = useCallback((id: string) => {
    setChallengeIds((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }, []);

  const setAnswer = useCallback((id: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  /**
   * DEMO/DEV FEATURE: preenche as 60 questões com respostas fictícias e marca
   * o resultado como isDemo = true. Nunca misturar com dados reais de piloto.
   * isDemo NUNCA é ativado por preenchimento manual.
   */
  const fillExampleAnswers = useCallback(() => {
    setAnswers({ ...demoResponses });
    setIsDemo(true);
  }, []);

  /**
   * Submissão real: valida contexto + 60 respostas válidas (1–7) + desafios,
   * executa runFullAssessment com o contexto/respostas/versões atuais e
   * persistir o resultado (única fonte de verdade). Não reutiliza demo.
   */
  const completeAssessment = useCallback((): AssessmentResult | null => {
    if (challengeIds.length === 0) {
      console.warn("[Integridade] Submissão sem desafios selecionados.");
      return null;
    }
    if (activeItems.some((item) => answers[item.id] == null)) return null;
    const raw: Record<string, number> = {};
    for (const item of activeItems) {
      const value = answers[item.id];
      if (value == null || value < 1 || value > 7 || !Number.isInteger(value)) {
        console.warn(`[Integridade] Resposta inválida no item ${item.id}: ${String(value)}`);
        return null;
      }
      raw[item.id] = value;
    }
    const result = runFullAssessment(raw, challengeIds, isDemo, {
      lideraPessoas: participant.lideraPessoas,
      participaVendas: participant.participaVendas,
    });
    setAssessmentHistory((prev) => [...prev, result]);
    setLatestAssessment(result);
    return result;
  }, [answers, challengeIds, isDemo, participant.lideraPessoas, participant.participaVendas]);

  const reset = useCallback(() => {
    setParticipant(SAMPLE_PARTICIPANT);
    setChallengeIds(SAMPLE_CHALLENGE_IDS);
    setAnswers({});
    setIsDemo(false);
    setLatestAssessment(null);
    setAssessmentHistory([]);
  }, []);

  const value = useMemo<PrototypeState>(() => {
    const selectedChallenges = challengeIds
      .map((id) => challengeById.get(id))
      .filter((c): c is Challenge => Boolean(c));
    const answeredCount = activeItems.filter((item) => answers[item.id] != null).length;
    return {
      participant,
      setParticipant,
      selectedChallenges,
      toggleChallenge,
      answers,
      setAnswer,
      answeredCount,
      fillExampleAnswers,
      isDemo,
      latestAssessment,
      assessmentHistory,
      completeAssessment,
      reset,
    };
  }, [
    participant,
    challengeIds,
    toggleChallenge,
    answers,
    setAnswer,
    fillExampleAnswers,
    isDemo,
    latestAssessment,
    assessmentHistory,
    completeAssessment,
    reset,
  ]);

  return (
    <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>
  );
}

export function usePrototype(): PrototypeState {
  const ctx = useContext(PrototypeContext);
  if (!ctx) throw new Error("usePrototype deve ser usado dentro de PrototypeProvider");
  return ctx;
}

export { allChallenges };

