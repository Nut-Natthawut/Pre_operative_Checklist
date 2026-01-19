// Shared types for Form components
// Extracted from FormNew.tsx and FormView.tsx

// Row data for checklist items (Yes/No/Time/Preparer)
export interface RowData {
    yes: boolean;
    no: boolean;
    time: string;
    preparer: string;
}

// All rows in the checklist
export interface RowsData {
    row1: RowData;
    row1_1: RowData;
    row1_2: RowData;
    row1_3: RowData;
    row2: RowData;
    row2_1: RowData;
    row2_2: RowData;
    row2_3: RowData;
    row3: RowData;
    row3_1: RowData;
    row3_2: RowData;
    row3_3: RowData;
    row3_4: RowData;
    row4: RowData;
    row5: RowData;
    row6: RowData;
    row7: RowData;
    row8: RowData;
    row9: RowData;
    row10: RowData;
    row11: RowData;
    row12: RowData;

}

// Inner data for specific fields (left column details)
export interface InnerData {
    // 6. ของมีค่า
    valuablesRemoved: boolean;
    valuablesFixed: boolean;
    // 8. Consent
    consentAdult: boolean;
    consentMarried: boolean;
    consentChild: boolean;
    consentChildGuardian: string;
    // 9. NPO
    npoSolid: boolean;
    npoLiquid: boolean;
    // 10. IV
    ivFluidDetail: string;
    // 11. Lab
    labCbc: boolean;
    labUa: boolean;
    labElectrolyte: boolean;
    labPtPtt: boolean;
    labOther: boolean;
    labOtherDetail: string;
    labFilm: boolean;
    // 12. Meds
    medsDetail: string;

}

// Bottom result section
export interface ResultData {
    complete: boolean;
    notComplete: boolean;
    checker: string;
    checkTime: string;
    checkDate: string;

}

// Main form data structure
export interface FormData {
    // Header info
    formDate: string;
    formMonth: string;
    formYear: string;
    // Patient info
    patientName: string;
    sex: string;
    age: string;
    allergy: string;
    ward: string;
    hn: string;
    an: string;
    bed: string;
    diagnosis: string;
    operation: string;
    physician: string;
    // Nested data
    rows: RowsData;
    innerData: InnerData;
    result: ResultData;

}

// Initial form data constant
export const initialFormData: FormData = {
    // Header info
    formDate: '',
    formMonth: '',
    formYear: '',
    // Patient info
    patientName: '',
    sex: '',
    age: '',
    allergy: '',
    ward: '',
    hn: '',
    an: '',
    bed: '',
    diagnosis: '',
    operation: '',
    physician: '',
    // Checklist rows
    rows: {
        row1: { yes: false, no: false, time: '', preparer: '' },
        row1_1: { yes: false, no: false, time: '', preparer: '' },
        row1_2: { yes: false, no: false, time: '', preparer: '' },
        row1_3: { yes: false, no: false, time: '', preparer: '' },
        row2: { yes: false, no: false, time: '', preparer: '' },
        row2_1: { yes: false, no: false, time: '', preparer: '' },
        row2_2: { yes: false, no: false, time: '', preparer: '' },
        row2_3: { yes: false, no: false, time: '', preparer: '' },
        row3: { yes: false, no: false, time: '', preparer: '' },
        row3_1: { yes: false, no: false, time: '', preparer: '' },
        row3_2: { yes: false, no: false, time: '', preparer: '' },
        row3_3: { yes: false, no: false, time: '', preparer: '' },
        row3_4: { yes: false, no: false, time: '', preparer: '' },
        row4: { yes: false, no: false, time: '', preparer: '' },
        row5: { yes: false, no: false, time: '', preparer: '' },
        row6: { yes: false, no: false, time: '', preparer: '' },
        row7: { yes: false, no: false, time: '', preparer: '' },
        row8: { yes: false, no: false, time: '', preparer: '' },
        row9: { yes: false, no: false, time: '', preparer: '' },
        row10: { yes: false, no: false, time: '', preparer: '' },
        row11: { yes: false, no: false, time: '', preparer: '' },
        row12: { yes: false, no: false, time: '', preparer: '' },
    },
    // Inner data
    innerData: {
        valuablesRemoved: false,
        valuablesFixed: false,
        consentAdult: false,
        consentMarried: false,
        consentChild: false,
        consentChildGuardian: '',
        npoSolid: false,
        npoLiquid: false,
        ivFluidDetail: '',
        labCbc: false,
        labUa: false,
        labElectrolyte: false,
        labPtPtt: false,
        labOther: false,
        labOtherDetail: '',
        labFilm: false,
        medsDetail: '',
    },
    // Result section
    result: {
        complete: false,
        notComplete: false,
        checker: '',
        checkTime: '',
        checkDate: '',
    }
};

// Thai month names (shared utility)
export const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

// Helper to get current Thai date
export const getCurrentThaiDate = () => {
    const now = new Date();
    return {
        day: now.getDate().toString(),
        month: thaiMonths[now.getMonth()],
        year: (now.getFullYear() + 543).toString()
    };
};

// Helper to get current time in HH:MM format
export const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
};
