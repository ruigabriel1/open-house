# 📜 gemini.md — Constituição do Projeto Open House

> **Versão:** 0.3
> **Status:** Fase 5 — Gatilho (Deploy) — Layout Aprovado
> **Última Atualização:** 2026-05-17

---

## 1. Esquemas de Dados (Schemas)

### 1.1 Entrada (Input — Formulário RSVP)
```json
{
  "titular": {
    "nome": "string (obrigatório, min: 2 chars)",
    "email": "string (obrigatório, formato e-mail válido)",
    "idade": "number (obrigatório, min: 1, max: 120)",
    "instagram": "string (opcional, formato @usuario)"
  },
  "convidados": [
    {
      "nome": "string (obrigatório)",
      "email": "string (obrigatório)",
      "idade": "number (obrigatório)",
      "instagram": "string (opcional)"
    }
  ]
}
```

### 1.2 Saída (Output — Linha no Google Sheets)
```json
{
  "timestamp": "ISO 8601 datetime",
  "nome": "string",
  "email": "string",
  "idade": "number",
  "instagram": "string",
  "tipo": "titular | convidado",
  "convidado_de": "string (nome do titular, vazio se for titular)"
}
```

### 1.3 Configuração do Evento
```json
{
  "nome_evento": "OPEN HOUSE",
  "senha_acesso": "06/08",
  "data_evento": "A DEFINIR",
  "local_evento": "A DEFINIR",
  "logo": "assets/logo_openhouse.jpg"
}
```

---

## 2. Regras Comportamentais

1. O sistema deve ser simples e intuitivo para o público da igreja.
2. A senha de acesso (`06/08`) é uma ferramenta de **engajamento**, não segurança.
3. O formulário deve ter validação nos campos obrigatórios (nome, e-mail, idade).
4. O site deve ser responsivo (**mobile-first** — público usa celular).
5. Nenhum dado sensível além do necessário deve ser coletado.
6. A lista de confirmados deve ser **pública e visível em tempo real**.
7. O cronômetro deve funcionar mesmo com data "A DEFINIR" (exibir placeholder).
8. O titular pode adicionar convidados (cada convidado vira uma linha separada no Sheets).

---

## 3. Invariantes Arquiteturais

1. **Sem custos recorrentes:** Google Sheets como banco de dados (gratuito).
2. **Reutilizável:** A estrutura deve suportar múltiplos eventos futuros.
3. **Dados persistentes:** Google Sheets API para leitura e escrita.
4. **Sem backend complexo:** HTML + CSS + JS puro, sem framework pesado.
5. **Single-page:** Todo o fluxo em uma única página com scroll vertical.
6. **Dark theme:** Fundo preto, tipografia branca, detalhes em verde limão (cor da marca).

---

## 4. Regras Operacionais de Sessão

1. **`CLAUDE.md`** deve ser atualizado ao **fim de cada chat**, refletindo o estado atual do projeto, último passo executado e próximo passo.
2. **`gemini.md`** deve ser atualizado quando schemas, regras ou arquitetura mudarem.
3. Ambos os arquivos garantem continuidade caso os tokens se esgotem ou o modelo mude.

---

## 5. Log de Manutenção

| Data | Alteração | Motivo |
|------|-----------|--------|
| 2026-05-16 | Criação inicial | Protocolo 0 — Inicialização |
| 2026-05-16 | Adicionado `CLAUDE.md` e regra de continuidade | Garantir handoff entre sessões |
| 2026-05-16 | Schemas definidos (v0.2) | Respostas de Descoberta recebidas |
| 2026-05-16 | Frontend construído (Fases 2-3) | Arquitetura e Link concluídos |
| 2026-05-17 | Layout aprovado (Fase 4) | Usuário aprovou design visual |
| 2026-05-17 | Versão atualizada para v0.3 | Entrada na Fase 5 — Deploy |
