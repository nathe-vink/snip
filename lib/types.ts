export interface BusinessType {
  id: string;
  label: string;
  icon: string;
  sub: string;
}

export interface QuestionOption {
  id: string;
  l: string;
}

export interface Question {
  id: string;
  q: string;
  type: "cards" | "opts" | "select" | "email";
  opts?: QuestionOption[];
  sub?: string;
  showIf?: (answers: IntakeAnswers) => boolean;
}

export type IntakeAnswers = Record<string, string | undefined>;

export type StepType = "form" | "walk" | "check";
export type Priority = "urgent" | "high" | "med" | "low" | "info";
export type StepStatus = "not_started" | "active" | "waiting" | "complete";

export interface WalkItem {
  text: string;
  url?: string;
  link?: string;
}

export interface CheckItem {
  id: string;
  text: string;
  url?: string;
  link?: string;
}

export interface FormField {
  id: string;
  label: string;
  kind: "text" | "select";
  options?: string[];
  ph?: string;
}

export interface ActionButton {
  label: string;
  primary?: boolean;
  url?: string;
}

export interface DoneField {
  label: string;
  ph: string;
}

export interface DoneOption {
  id: string;
  label: string;
}

export interface RoadmapStep {
  order: number;
  name: string;
  agency: string;
  why: string;
  cost: string;
  time: string;
  priority: Priority;
  type: StepType;
  tip?: string;
  walk?: WalkItem[];
  checks?: CheckItem[];
  fields?: FormField[];
  actions?: ActionButton[];
  done_field?: DoneField;
  done_options?: DoneOption[];
}

export interface RoadmapSummary {
  total: number;
  cost: string;
  time: string;
  bizLabel: string;
  autoFull: number;
}

export interface RoadmapResult {
  steps: RoadmapStep[];
  warns: string[];
  sum: RoadmapSummary;
}

export interface HelpFormData {
  name: string;
  email: string;
  note: string;
}
