// useForm hook - manages form state and handlers
// Shared by FormNew.tsx and FormView.tsx

import { useState, useCallback } from 'react';
import type { FormData } from '../types/form';
import { initialFormData } from '../types/form';
import { getCurrentThaiDate } from '../utils/date';

interface UseFormReturn {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;

    // Field update handlers
    updateField: (field: string, value: unknown) => void;
    updateRow: (rowKey: string, field: string, value: unknown) => void;
    updateInner: (field: string, value: unknown) => void;
    updateResult: (field: string, value: unknown) => void;

    // Utility functions
    fillCurrentDate: () => void;
    resetForm: () => void;
}

/**
 * Custom hook for managing form state
 * @param initial - Optional initial form data (for editing existing forms)
 */
export function useForm(initial?: FormData): UseFormReturn {
    const [formData, setFormData] = useState<FormData>(initial || initialFormData);

    // Update a top-level field
    const updateField = useCallback((field: string, value: unknown) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }, []);

    // Update a row in the checklist
    const updateRow = useCallback((rowKey: string, field: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            rows: {
                ...prev.rows,
                [rowKey]: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...(prev.rows as any)[rowKey],
                    [field]: value
                }
            }
        }));
    }, []);

    // Update inner data (consent, NPO, lab, etc.)
    const updateInner = useCallback((field: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            innerData: {
                ...prev.innerData,
                [field]: value
            }
        }));
    }, []);

    // Update result section
    const updateResult = useCallback((field: string, value: unknown) => {
        setFormData(prev => ({
            ...prev,
            result: {
                ...prev.result,
                [field]: value
            }
        }));
    }, []);

    // Fill current Thai date in header
    const fillCurrentDate = useCallback(() => {
        const { date, month, year } = getCurrentThaiDate();
        setFormData(prev => ({
            ...prev,
            formDate: date,
            formMonth: month,
            formYear: year
        }));
    }, []);

    // Reset form to initial state
    const resetForm = useCallback(() => {
        setFormData(initialFormData);
    }, []);

    return {
        formData,
        setFormData,
        updateField,
        updateRow,
        updateInner,
        updateResult,
        fillCurrentDate,
        resetForm
    };
}
