export type FormStatus = 'green' | 'yellow' | 'red';

export interface FormSubmissionPayload {
  formDate: string;
  formTime: string;
  ward: string;
  hn: string;
  patientName: string;
  timeField?: string | null;
  preparer?: string | null;
  an?: string | null;
  sex?: string | null;
  age?: string | null;
  dob?: string | null;
  department?: string | null;
  weight?: string | null;
  rightSide?: string | null;
  allergy?: string | null;
  attendingPhysician?: string | null;
  bed?: string | null;
  orChecklist?: Record<string, unknown> | null;
  anesChecklist?: Record<string, unknown> | null;
  anesLab?: Record<string, unknown> | null;
  consultMed?: Record<string, unknown> | null;
  riskConditions?: Record<string, unknown> | null;
  consentData?: Record<string, unknown> | null;
  npoData?: Record<string, unknown> | null;
  ivData?: Record<string, unknown> | null;
  premedication?: string | null;
  otherNotes?: string | null;
  resultOr?: Record<string, unknown> | null;
  resultAnes?: Record<string, unknown> | null;
}

export interface FormListQuery {
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
}

export interface FormSearchResult {
  id: string;
  hn: string;
  an: string | null;
  patientName: string;
  ward: string;
  formDate: string;
  formTime: string;
  createdAt: string;
  surgeryCompleted: number | null;
  status: FormStatus;
  statusMessage: string;
}
