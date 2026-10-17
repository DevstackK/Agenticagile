import { STAGES } from '../data/questions'

type Props = {
  activeStageIndex: number
}

export function ProgressIndicator({ activeStageIndex }: Props) {
  return (
    <ol className="progress-indicator">
      {STAGES.map((stage, index) => (
        <li
          key={stage.key}
          className={index === activeStageIndex ? 'progress-step active' : 'progress-step'}
          aria-current={index === activeStageIndex ? 'step' : undefined}
        >
          <span className="progress-step-number">{index + 1}</span>
          <span className="progress-step-title">{stage.title}</span>
        </li>
      ))}
    </ol>
  )
}
