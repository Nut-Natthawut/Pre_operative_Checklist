import type { FormData } from '../types/form';

interface CurrentUser {
    id?: string;
    fullName?: string;
}

interface CanEditLoadedFormParams {
    isAdmin: boolean;
    currentUser?: CurrentUser | null;
    isComplete?: boolean;
    surgeryCompleted?: number | null;
}

interface IsFormFieldLockedParams {
    isAdmin: boolean;
    isEditable: boolean;
    originalData: FormData | null;
    currentUser?: CurrentUser | null;
    path: string;
    subPath?: string;
}

export function canEditLoadedForm({
    isAdmin,
    currentUser,
    isComplete,
    surgeryCompleted
}: CanEditLoadedFormParams) {
    if (isAdmin) return true;
    if (!currentUser?.id) return false;
    if (surgeryCompleted === 1) return false;
    if (isComplete) return false;
    return true;
}

export function isFormFieldLocked({
    isAdmin,
    isEditable,
    originalData,
    currentUser,
    path,
    subPath
}: IsFormFieldLockedParams) {
    if (isAdmin) return false;
    if (!isEditable) return true;
    if (!originalData) return false;

    if (path === 'rows') {
        if (!subPath) return false;

        const [rowKey] = subPath.split('.');
        const originalRow = originalData.rows[rowKey as keyof typeof originalData.rows];
        if (!originalRow) return false;

        if (!originalRow.preparer) return false;

        if (currentUser?.id && originalRow.preparerId === currentUser.id) {
            return false;
        }

        if (currentUser?.fullName && originalRow.preparer?.trim() === currentUser.fullName.trim()) {
            return false;
        }

        return true;
    }

    if (path === 'innerData') {
        if (!subPath) return false;
        const value = originalData.innerData[subPath as keyof typeof originalData.innerData];
        return !!value;
    }

    if (path === 'result') {
        if (!subPath) return false;
        const value = originalData.result[subPath as keyof typeof originalData.result];
        return !!value;
    }

    const value = originalData[path as keyof FormData];
    return !!value;
}
