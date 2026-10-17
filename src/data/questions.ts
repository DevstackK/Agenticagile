import type { Answers, StageKey } from '../lib/schema'

export type Question = {
  id: string
  label: string
  type: 'text' | 'select'
  options?: string[]
  required: boolean
  grounding: string
}

export type StageDefinition = {
  key: StageKey
  title: string
  questions: Question[]
}

const LEAN_INCEPTION = 'Lean Inception'
const JTBD_OST = 'Jobs-to-be-Done / Opportunity Solution Trees'
const BABOK = 'BABOK'
const ADR_TCO = 'Architecture Decision Records / TCO analysis'

export const STAGES: StageDefinition[] = [
  {
    key: 'businessCase',
    title: 'Business Case Discovery',
    questions: [
      {
        id: 'problemStatement',
        label: 'What problem does this solve, and for whom specifically?',
        type: 'text',
        required: true,
        grounding: LEAN_INCEPTION,
      },
      {
        id: 'costOfInaction',
        label: "What happens if we do nothing for 6-12 months? What's the cost of inaction?",
        type: 'text',
        required: true,
        grounding: LEAN_INCEPTION,
      },
      {
        id: 'buildBuyDecision',
        label: 'Is this build, buy, or do-nothing? Has an off-the-shelf option been checked?',
        type: 'select',
        options: ['Build', 'Buy', 'Do nothing'],
        required: true,
        grounding: LEAN_INCEPTION,
      },
      {
        id: 'sponsorAndSuccessMetric',
        label: 'Who is the sponsor, and what outcome will they measure success against?',
        type: 'text',
        required: true,
        grounding: LEAN_INCEPTION,
      },
      {
        id: 'budgetTimeline',
        label: "What's the budget envelope and timeline pressure?",
        type: 'text',
        required: true,
        grounding: LEAN_INCEPTION,
      },
      {
        id: 'urgencyDriver',
        label: "What's driving urgency now versus later?",
        type: 'text',
        required: true,
        grounding: LEAN_INCEPTION,
      },
    ],
  },
  {
    key: 'userResearch',
    title: 'User Research',
    questions: [
      {
        id: 'userTypesVolume',
        label: 'Who are the actual users, and how many, how often?',
        type: 'text',
        required: true,
        grounding: JTBD_OST,
      },
      {
        id: 'currentWorkflow',
        label: "What's the current workflow without this — manual process, spreadsheet, legacy system?",
        type: 'text',
        required: true,
        grounding: JTBD_OST,
      },
      {
        id: 'jobToBeDone',
        label: "What's the job-to-be-done — what are users trying to accomplish, not what feature do they want?",
        type: 'text',
        required: true,
        grounding: JTBD_OST,
      },
      {
        id: 'usageContext',
        label: 'What context/environment do they work in (mobile, desktop, field, office)?',
        type: 'text',
        required: true,
        grounding: JTBD_OST,
      },
      {
        id: 'whatsBroken',
        label: "What's actually broken or painful today that this is supposed to fix?",
        type: 'text',
        required: true,
        grounding: JTBD_OST,
      },
    ],
  },
  {
    key: 'baRequirements',
    title: 'BA Requirements Elicitation',
    questions: [
      {
        id: 'functionalRequirements',
        label: 'What must the system do, end to end?',
        type: 'text',
        required: true,
        grounding: BABOK,
      },
      {
        id: 'nonFunctionalRequirements',
        label: 'What are the non-functional requirements (expected scale, latency, uptime SLA)?',
        type: 'text',
        required: true,
        grounding: BABOK,
      },
      {
        id: 'dataResidencyOwnership',
        label: 'What data is involved, where must it reside, and who owns it?',
        type: 'text',
        required: true,
        grounding: BABOK,
      },
      {
        id: 'integrations',
        label: 'What existing systems must this integrate with?',
        type: 'text',
        required: true,
        grounding: BABOK,
      },
      {
        id: 'securityCompliance',
        label: 'What security/compliance regime applies (GDPR, HIPAA, PCI, internal policy)?',
        type: 'text',
        required: true,
        grounding: BABOK,
      },
      {
        id: 'orgConstraints',
        label: 'What organizational constraints exist (existing vendor relationship, team skill set)?',
        type: 'text',
        required: true,
        grounding: BABOK,
      },
    ],
  },
  {
    key: 'tradeoffs',
    title: 'Trade-off Analysis',
    questions: [
      {
        id: 'buildBuyExtend',
        label: 'Build, buy, or extend an existing system?',
        type: 'select',
        options: ['Build', 'Buy', 'Extend existing system'],
        required: true,
        grounding: ADR_TCO,
      },
      {
        id: 'platformVendorTradeoff',
        label: 'What are the platform/vendor choice trade-offs (cost, lock-in, team familiarity)?',
        type: 'text',
        required: true,
        grounding: ADR_TCO,
      },
      {
        id: 'architecturePatternTradeoff',
        label: 'What are the architecture pattern trade-offs (cost/control/speed)?',
        type: 'text',
        required: true,
        grounding: ADR_TCO,
      },
      {
        id: 'speedVsMaintainability',
        label: 'Speed-to-market versus long-term maintainability — where does this land?',
        type: 'text',
        required: true,
        grounding: ADR_TCO,
      },
      {
        id: 'lockInRiskVsTimeSaved',
        label: 'Vendor lock-in risk versus time saved — is it worth it?',
        type: 'text',
        required: true,
        grounding: ADR_TCO,
      },
    ],
  },
]

export function getMissingRequiredQuestionIds(stage: StageDefinition, answers: Answers[StageKey]): string[] {
  return stage.questions
    .filter((question) => question.required)
    .filter((question) => {
      const value = answers[question.id]
      return !value || value.trim().length === 0
    })
    .map((question) => question.id)
}
