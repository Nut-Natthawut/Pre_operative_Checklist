// Allergy utilities for form data conversion
// Handles allergyStatus <-> allergy field mapping

type AllergyStatus = 'unknown' | 'yes' | 'no';

/**
 * Convert allergyStatus to allergy value for database storage
 * @param allergyStatus - 'yes' | 'no' | 'unknown'
 * @param allergyDetail - Allergy details (only used when status is 'yes')
 * @returns String to store in database
 */
export function getAllergyValue(allergyStatus: AllergyStatus, allergyDetail: string): string {
    switch (allergyStatus) {
        case 'no':
            return 'NKDA';  // No Known Drug Allergies
        case 'yes':
            return allergyDetail || '';
        case 'unknown':
        default:
            return '';
    }
}

/**
 * Detect allergyStatus from allergy value loaded from database
 * @param allergy - Allergy string from database
 * @returns { allergyStatus, allergyDetail }
 */
export function detectAllergyStatus(allergy: string | null | undefined): {
    allergyStatus: AllergyStatus;
    allergyDetail: string;
} {
    if (!allergy) {
        return { allergyStatus: 'unknown', allergyDetail: '' };
    }

    if (allergy === 'NKDA') {
        return { allergyStatus: 'no', allergyDetail: '' };
    }

    return { allergyStatus: 'yes', allergyDetail: allergy };
}
