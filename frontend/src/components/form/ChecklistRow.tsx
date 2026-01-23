// ChecklistRow Component - Extracted from FormNew.tsx
// Renders Yes/No/Time/Preparer cells for each checklist row

import type { RowData } from '../../types/form';

interface ChecklistRowProps {
    rowKey: string;
    rowData: RowData;
    updateRow: (rowKey: string, field: string, value: unknown) => void;
    rowSpan?: number;
    disabled?: boolean;
    isLocked?: (path: string, subPath?: string) => boolean;
}

export default function ChecklistRow({
    rowKey,
    rowData,
    updateRow,
    rowSpan,
    disabled = false,
    isLocked
}: ChecklistRowProps) {
    // Helper to check if specific field is disabled/locked
    const checkLocked = (field: string) => {
        if (disabled) return true;
        if (isLocked) return isLocked('rows', `${rowKey}.${field}`);
        return false;
    };

    const isLockedYes = checkLocked('yes');
    const isLockedNo = checkLocked('no');
    const isLockedTime = checkLocked('time');
    const isLockedPreparer = checkLocked('preparer');


    const handleYesNoChange = (value: 'yes' | 'no') => {
        if (disabled) return;
        if (isLockedYes || isLockedNo) return;

        // Toggle off if already selected
        if (value === 'yes' && rowData.yes) {
            updateRow(rowKey, 'yes', false);
            return;
        }
        if (value === 'no' && rowData.no) {
            updateRow(rowKey, 'no', false);
            return;
        }

        // Select the clicked one
        if (value === 'yes') {
            updateRow(rowKey, 'yes', true);
            updateRow(rowKey, 'no', false);
        } else {
            updateRow(rowKey, 'yes', false);
            updateRow(rowKey, 'no', true);
        }
    };

    return (
        <>
            {/* Yes column */}
            <td
                className={`border-r border-black p-1 ${!(disabled || isLockedYes || isLockedNo) ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                rowSpan={rowSpan}
                onClick={() => handleYesNoChange('yes')}
            >
                <div className="flex items-center justify-center h-full">
                    <input
                        type="radio"
                        name={`yesno_${rowKey}`}
                        className="w-4 h-4 pointer-events-none"
                        checked={rowData.yes === true}
                        readOnly
                        disabled={disabled || isLockedYes || isLockedNo}
                    />
                </div>
            </td>

            {/* No column */}
            <td
                className={`border-r border-black p-1 ${!(disabled || isLockedYes || isLockedNo) ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                rowSpan={rowSpan}
                onClick={() => handleYesNoChange('no')}
            >
                <div className="flex items-center justify-center h-full">
                    <input
                        type="radio"
                        name={`yesno_${rowKey}`}
                        className="w-4 h-4 pointer-events-none"
                        checked={rowData.no === true}
                        readOnly
                        disabled={disabled || isLockedYes || isLockedNo}
                    />
                </div>
            </td>

            {/* Time column */}
            <td
                className={`border-r border-black p-0 text-center align-middle group relative ${!(disabled || isLockedTime) ? 'cursor-pointer hover:bg-blue-50' : ''}`}
                rowSpan={rowSpan}
                onClick={(e) => {
                    if (disabled || isLockedTime) return;
                    const input = e.currentTarget.querySelector('input');
                    if (input) {
                        input.focus();
                        if ('showPicker' in input) {
                            try {
                                (input as any).showPicker();
                            } catch (error) {
                                // Ignore
                            }
                        }
                    }
                }}
            >
                <div className="w-full h-full relative min-h-[24px]">
                    {/* Display Text */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className={`${!rowData.time ? 'text-transparent' : 'text-black'}`}>
                            {rowData.time || '--:--'}
                        </span>
                    </div>

                    {/* Invisible Input */}
                    <input
                        type="time"
                        className="absolute inset-0 w-full h-full cursor-pointer z-10"
                        value={rowData.time}
                        onChange={e => {
                            updateRow(rowKey, 'time', e.target.value);
                            // Blur only on non-touch devices (PC)
                            if (window.matchMedia && !window.matchMedia('(pointer: coarse)').matches) {
                                e.target.blur();
                            }
                        }}
                        style={{ opacity: 0 }}
                        disabled={disabled || isLockedTime}
                    />

                    {/* Clear Button */}
                    {rowData.time && !(disabled || isLockedTime) && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                updateRow(rowKey, 'time', '');
                            }}
                            className="absolute right-0.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 z-20 p-1 rounded-full hover:bg-gray-100"
                            title="ลบเวลา"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    )}
                </div>
            </td>

            {/* Preparer column */}
            <td
                className={`p-0 text-center align-middle ${!(disabled || isLockedPreparer) ? 'cursor-text hover:bg-blue-50' : ''}`}
                rowSpan={rowSpan}
                onClick={(e) => {
                    if (disabled || isLockedPreparer) return;
                    const input = e.currentTarget.querySelector('input');
                    if (input) input.focus();
                }}
            >
                <div className="w-full h-full p-2">
                    <input
                        type="text"
                        className="w-full h-full text-center outline-none bg-transparent"
                        value={rowData.preparer}
                        onChange={e => updateRow(rowKey, 'preparer', e.target.value)}
                        disabled={disabled || isLockedPreparer}
                    />
                </div>
            </td>
        </>
    );
}
