// Form Service - API operations and payload mapping
// Handles submitting, loading, and updating forms

import { api } from '../lib/api';
import type { FormData } from '../types/form';
import { initialFormData } from '../types/form';
import { toISODate, getCurrentTime, toThaiDate } from '../utils/date';
import { getAllergyValue, detectAllergyStatus } from '../utils/allergy';

// ============================================
// PAYLOAD MAPPING
// ============================================

/**
 * Create payload for submitting/updating a form
 * Maps frontend FormData to backend API format
 */
export function createFormPayload(formData: FormData) {
    // Convert Thai date to ISO
    const isoDate = toISODate(formData.formDate, formData.formMonth, formData.formYear)
        || new Date().toISOString().split('T')[0];

    return {
        // Header
        formDate: isoDate,
        formTime: getCurrentTime(),
        ward: formData.ward,

        // Patient Info
        hn: formData.hn,
        an: formData.an,
        patientName: formData.patientName,
        sex: formData.sex,
        age: formData.age,
        allergy: getAllergyValue(formData.allergyStatus, formData.allergy),
        bed: formData.bed,
        department: '',
        weight: '',
        attendingPhysician: formData.physician,

        // Checklists
        orChecklist: formData.rows,

        // Consent Data
        consentData: {
            consentAdult: formData.innerData.consentAdult,
            consentMarried: formData.innerData.consentMarried,
            consentChild: formData.innerData.consentChild,
            consentChildGuardian: formData.innerData.consentChildGuardian
        },

        // NPO Data
        npoData: {
            npoSolid: formData.innerData.npoSolid,
            npoLiquid: formData.innerData.npoLiquid
        },

        // IV Data
        ivData: {
            ivFluidDetail: formData.innerData.ivFluidDetail
        },

        // Lab Data
        anesLab: {
            labCbc: formData.innerData.labCbc,
            labUa: formData.innerData.labUa,
            labElectrolyte: formData.innerData.labElectrolyte,
            labPtPtt: formData.innerData.labPtPtt,
            labOther: formData.innerData.labOther,
            labOtherDetail: formData.innerData.labOtherDetail,
            labFilm: formData.innerData.labFilm
        },

        // Risk Conditions
        riskConditions: {
            valuablesRemoved: formData.innerData.valuablesRemoved,
            valuablesFixed: formData.innerData.valuablesFixed
        },

        // Premedication
        premedication: formData.innerData.medsDetail,

        // Result
        resultOr: formData.result,

        // Other Notes (diagnosis, operation stored as JSON)
        otherNotes: JSON.stringify({
            diagnosis: formData.diagnosis,
            operation: formData.operation
        })
    };
}

// ============================================
// API OPERATIONS
// ============================================

/**
 * Submit a new form
 */
export async function submitForm(formData: FormData) {
    const payload = createFormPayload(formData);
    return api.submitForm(payload);
}

/**
 * Load form by ID (delegates to api)
 */
export async function loadForm(formId: string) {
    return api.getForm(formId);
}

/**
 * Update existing form
 */
export async function updateForm(formId: string, formData: FormData) {
    const payload = createFormPayload(formData);
    return api.updateForm(formId, payload);
}

/**
 * Search forms by query
 */
export async function searchForms(query: string) {
    return api.searchForms(query);
}

/**
 * List forms with pagination
 */
export async function listForms(
    page: number,
    limit: number,
    startDate?: string,
    endDate?: string
) {
    return api.listForms(page, limit, startDate, endDate);
}

// ============================================
// BACKEND TO FRONTEND MAPPING
// ============================================


/**
 * Map backend API response to frontend FormData format
 * Used when loading a form from the database
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBackendToFormData(backendData: any): FormData {
    // Convert Date ISO -> Thai
    const { date: fDate, month: fMonth, year: fYear } = toThaiDate(backendData.formDate || '');
    
    // Detect allergy status from allergy value
    const { allergyStatus, allergyDetail } = detectAllergyStatus(backendData.allergy);
    
    // Parse other notes
    let diagnosis = '';
    let operation = '';
    if (backendData.otherNotes) {
        try {
            const parsed = JSON.parse(backendData.otherNotes);
            diagnosis = parsed.diagnosis || '';
            operation = parsed.operation || '';
        } catch {
            // Ignore parse errors
        }
    }
    
    // Get result data
    const resultOr = backendData.resultOr || initialFormData.result;
    
    // Transform checkDate to Thai format if needed
    const transformedResult = { ...resultOr };
    if (resultOr.checkDate) {
        const dateStr = resultOr.checkDate;
        let parsedDate: Date | null = null;

        if (dateStr.includes('-')) {
            parsedDate = new Date(dateStr);
        } else if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                const first = parseInt(parts[0]);
                const second = parseInt(parts[1]);
                const third = parseInt(parts[2]);

                if (third > 2500) {
                    // Already in DD/MM/พ.ศ. format
                } else {
                    if (first <= 12 && second <= 31) {
                        parsedDate = new Date(third, first - 1, second);
                    } else {
                        parsedDate = new Date(third, second - 1, first);
                    }
                }
            }
        }

        if (parsedDate && !isNaN(parsedDate.getTime())) {
            const day = parsedDate.getDate();
            const month = parsedDate.getMonth() + 1;
            const year = parsedDate.getFullYear() + 543;
            transformedResult.checkDate = `${day}/${month}/${year}`;
        }
    }
    
    return {
        formDate: fDate,
        formMonth: fMonth,
        formYear: fYear,

        patientName: backendData.patientName || '',
        sex: backendData.sex || '',
        age: backendData.age || '',
        allergyStatus,
        allergy: allergyDetail,
        ward: backendData.ward || '',
        hn: backendData.hn || '',
        an: backendData.an || '',
        bed: backendData.bed || '',
        diagnosis,
        operation,
        physician: backendData.attendingPhysician || '',

        rows: backendData.orChecklist || initialFormData.rows,

        innerData: {
            valuablesRemoved: backendData.riskConditions?.valuablesRemoved || false,
            valuablesFixed: backendData.riskConditions?.valuablesFixed || false,

            consentAdult: backendData.consentData?.consentAdult || false,
            consentMarried: backendData.consentData?.consentMarried || false,
            consentChild: backendData.consentData?.consentChild || false,
            consentChildGuardian: backendData.consentData?.consentChildGuardian || '',

            npoSolid: backendData.npoData?.npoSolid || false,
            npoLiquid: backendData.npoData?.npoLiquid || false,

            ivFluidDetail: backendData.ivData?.ivFluidDetail || '',

            labCbc: backendData.anesLab?.labCbc || false,
            labUa: backendData.anesLab?.labUa || false,
            labElectrolyte: backendData.anesLab?.labElectrolyte || false,
            labPtPtt: backendData.anesLab?.labPtPtt || false,
            labOther: backendData.anesLab?.labOther || false,
            labOtherDetail: backendData.anesLab?.labOtherDetail || '',
            labFilm: backendData.anesLab?.labFilm || false,

            medsDetail: backendData.premedication || '',
        },

        result: transformedResult,
    };
}
