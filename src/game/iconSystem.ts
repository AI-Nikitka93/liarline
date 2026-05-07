export const ICON_SYSTEM = {
  family: "lucide-react",
  strokeWidth: 2,
  sizes: {
    inline: "h-4 w-4",
    control: "h-5 w-5",
    prominent: "h-6 w-6"
  },
  hitTargets: {
    iconOnly: "min-h-11 min-w-11",
    labeled: "min-h-11"
  },
  states: {
    default: "text-text-200",
    active: "text-forensic-500",
    disabled: "text-text-600",
    danger: "text-signal-500",
    system: "text-cyan-400",
    verified: "text-green-400"
  },
  rules: [
    "Use one icon family only.",
    "Keep stroke width at 2px.",
    "Do not replace primary action labels with icon-only controls.",
    "Use red icons only for contradiction, danger, failure, or accusation risk.",
    "Keep icon-only buttons inside 44px minimum hit targets."
  ]
} as const;

export type IconState = keyof typeof ICON_SYSTEM.states;

export function iconClass(state: IconState = "default", size: keyof typeof ICON_SYSTEM.sizes = "control"): string {
  return `${ICON_SYSTEM.sizes[size]} ${ICON_SYSTEM.states[state]}`;
}
