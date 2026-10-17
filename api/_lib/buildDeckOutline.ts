const QUESTION_LABELS: Record<string, string> = {
  problemStatement: 'What problem does this solve, and for whom specifically?',
  costOfInaction: "What happens if we do nothing for 6-12 months? What's the cost of inaction?",
  buildBuyDecision: 'Is this build, buy, or do-nothing? Has an off-the-shelf option been checked?',
  sponsorAndSuccessMetric: 'Who is the sponsor, and what outcome will they measure success against?',
  budgetTimeline: "What's the budget envelope and timeline pressure?",
  urgencyDriver: "What's driving urgency now versus later?",
}

export function buildDeckOutline(businessCaseAnswers: Record<string, string>): string {
  const sections = Object.entries(businessCaseAnswers)
    .filter(([, answer]) => answer && answer.trim().length > 0)
    .map(([questionId, answer]) => {
      const label = QUESTION_LABELS[questionId] ?? questionId
      return `## ${label}\n${answer}`
    })

  return `# Business Case Discovery\n\n${sections.join('\n\n')}`
}
