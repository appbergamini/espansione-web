import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Flag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePrototype } from "@/prototype/context";
import { allChallenges } from "@/prototype/context";
import { cn } from "@/lib/utils";

const EMPRESA_OPTIONS = [
  "Somente eu",
  "2 a 9 funcionários",
  "10 a 49 funcionários",
  "50 a 249 funcionários",
  "250+ funcionários",
];

const MAX_CHALLENGES = 3;

function BooleanField({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-input bg-white p-0.5">
      {[true, false].map((v) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            value === v ? "bg-navy-800 text-white" : "text-muted-foreground hover:text-navy-900"
          )}
        >
          {v ? "Sim" : "Não"}
        </button>
      ))}
    </div>
  );
}

export default function Contexto() {
  const { participant, setParticipant, selectedChallenges, toggleChallenge } = usePrototype();
  const navigate = useNavigate();
  const [showHint, setShowHint] = useState(false);

  const nameOk = participant.name.trim().length > 0;
  const challengesOk = selectedChallenges.length >= 1;
  const canContinue = nameOk && challengesOk;

  const handleContinue = () => {
    if (!canContinue) {
      setShowHint(true);
      return;
    }
    navigate("/assessment");
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 md:py-16">
      <div className="mb-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-800">
          Etapa 1 de 2
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-950 sm:text-4xl">
          Vamos contextualizar o seu momento
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Estes dados ajudam a interpretar o mapa considerando quem você é hoje e o
          desafio que quer enfrentar no próximo nível.
        </p>
      </div>

      {/* Dados do participante */}
      <Card className="rounded-2xl shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-xl text-navy-950">Seus dados</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              value={participant.name}
              onChange={(e) => setParticipant({ ...participant, name: e.target.value })}
              placeholder="Como devemos chamá-lo?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="atuacao">Atuação atual</Label>
            <Input
              id="atuacao"
              value={participant.atuacao}
              onChange={(e) => setParticipant({ ...participant, atuacao: e.target.value })}
              placeholder="Ex.: CEO e fundador — serviços B2B"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresa">Tamanho da empresa</Label>
            <Select
              value={participant.empresa}
              onValueChange={(v) => setParticipant({ ...participant, empresa: v })}
            >
              <SelectTrigger id="empresa" className="h-10">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {EMPRESA_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-white/70 bg-gradient-soft px-4 py-3">
            <div>
              <Label className="text-sm font-semibold text-navy-950">Lidera pessoas?</Label>
              <p className="text-xs text-muted-foreground">Você tem pessoas sob sua gestão</p>
            </div>
            <BooleanField value={participant.lideraPessoas} onChange={(v) => setParticipant({ ...participant, lideraPessoas: v })} />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-white/70 bg-gradient-soft px-4 py-3 md:col-span-2">
            <div>
              <Label className="text-sm font-semibold text-navy-950">
                Participa diretamente de vendas ou negociação?
              </Label>
              <p className="text-xs text-muted-foreground">
                Você está na linha de frente com clientes e acordos
              </p>
            </div>
            <BooleanField value={participant.participaVendas} onChange={(v) => setParticipant({ ...participant, participaVendas: v })} />
          </div>
        </CardContent>
      </Card>

      {/* Desafio */}
      <Card className="mt-8 rounded-2xl shadow-card">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="font-display text-xl text-navy-950">
              O que precisa acontecer para seu negócio avançar para o próximo nível?
            </CardTitle>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Flag className="h-4 w-4 text-navy-800" />
              Escolha até 3 desafios que melhor representam o momento atual.
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-sm font-semibold",
              selectedChallenges.length >= MAX_CHALLENGES
                ? "border-status-prioridade/30 bg-status-prioridade-bg text-status-prioridade"
                : "border-navy-800/15 bg-secondary text-navy-900"
            )}
          >
            {selectedChallenges.length} de {MAX_CHALLENGES}
          </span>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {allChallenges.map((challenge) => {
              const selected = selectedChallenges.some((c) => c.id === challenge.id);
              const disabled = !selected && selectedChallenges.length >= MAX_CHALLENGES;
              return (
                <button
                  key={challenge.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleChallenge(challenge.id)}
                  aria-pressed={selected}
                  className={cn(
                    "flex items-start justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all",
                    selected
                      ? "border-navy-800 bg-navy-800 text-white shadow-card"
                      : "border-input bg-white text-foreground hover:border-navy-800/40",
                    disabled && "cursor-not-allowed opacity-45 hover:border-input"
                  )}
                >
                  <span className="leading-snug">{challenge.label}</span>
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      selected ? "border-white bg-white text-navy-800" : "border-muted-foreground/40"
                    )}
                  >
                    {selected && <Check className="h-3.5 w-3.5" />}
                  </span>
                </button>
              );
            })}
          </div>

          {showHint && !challengesOk && (
            <p className="mt-4 text-sm font-medium text-status-prioridade">
              Selecione pelo menos um desafio para continuar.
            </p>
          )}
          {showHint && !nameOk && (
            <p className="mt-4 text-sm font-medium text-status-prioridade">
              Informe seu nome para continuar.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="mt-10 flex items-center justify-between">
        <Button asChild variant="ghost" className="text-muted-foreground">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <Button onClick={handleContinue} size="lg" className="h-12 rounded-full px-7 text-base shadow-brand">
          Continuar
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
