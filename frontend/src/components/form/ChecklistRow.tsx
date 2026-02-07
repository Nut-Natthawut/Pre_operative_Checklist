// ChecklistRow Component - Extracted from FormNew.tsx
// Renders Yes/No/Time/Date/Preparer cells for each checklist row

import { useState, useEffect, useRef } from 'react';
import type { RowData } from '../../types/form';
import DatePicker, { registerLocale } from 'react-datepicker';
import { th } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import gsap from 'gsap';

// Register Thai locale
registerLocale('th', th);

// Thai month names
const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

interface ChecklistRowProps {
    rowKey: string;
    rowData: RowData;
    updateRow: (rowKey: string, field: string, value: unknown) => void;
    rowSpan?: number;
    disabled?: boolean;
    isLocked?: (path: string, subPath?: string) => boolean;
    currentUserFullName?: string;
    currentUserId?: string;
}

export default function ChecklistRow({
    rowKey,
    rowData,
    updateRow,
    rowSpan,
    disabled = false,
    isLocked,
    currentUserFullName,
    currentUserId
}: ChecklistRowProps) {
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const prevDateRef = useRef(rowData.date);

    // Animation Refs
    const yesRef = useRef<HTMLInputElement>(null);
    const noRef = useRef<HTMLInputElement>(null);

    // Pop Animation Effect
    useEffect(() => {
        if (rowData.yes && yesRef.current) {
            gsap.fromTo(yesRef.current,
                { scale: 0.5 },
                { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" }
            );
        }
    }, [rowData.yes]);

    useEffect(() => {
        if (rowData.no && noRef.current) {
            gsap.fromTo(noRef.current,
                { scale: 0.5 },
                { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" }
            );
        }
    }, [rowData.no]);

    // Close DatePicker when date changes (after selection)
    useEffect(() => {
        if (prevDateRef.current !== rowData.date && rowData.date) {
            setIsDatePickerOpen(false);
        }
        prevDateRef.current = rowData.date;
    }, [rowData.date]);

    // Helper to check if specific field is disabled/locked
    const checkLocked = (field: string) => {
        if (disabled) return true;
        if (isLocked) return isLocked('rows', `${rowKey}.${field}`);
        return false;
    };

    const isLockedYes = checkLocked('yes');
    const isLockedNo = checkLocked('no');
    const isLockedTime = checkLocked('time');
    const isLockedDate = checkLocked('date');
    const isLockedPreparer = checkLocked('preparer');

    // Parse date string (DD/MM/YYYY BE) to Date object
    const parseDate = (dateStr: string): Date | null => {
        if (!dateStr) return null;
        const parts = dateStr.split('/');
        if (parts.length !== 3) return null;
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const yearBE = parseInt(parts[2]);
        if (isNaN(day) || isNaN(month) || isNaN(yearBE)) return null;
        return new Date(yearBE - 543, month, day);
    };

    // Format Date to display string
    const formatDateDisplay = (dateStr: string): string => {
        if (!dateStr) return '';
        const parts = dateStr.split('/');
        if (parts.length !== 3) return dateStr;
        const day = parts[0];
        const month = parseInt(parts[1]) - 1;
        const yearBE = parts[2];
        return `${day} ${thaiMonths[month]} ${yearBE}`;
    };

    // Handle date selection from picker
    const handleDateChange = (date: Date | null) => {
        if (date) {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const yearBE = (date.getFullYear() + 543).toString();
            updateRow(rowKey, 'date', `${day}/${month}/${yearBE}`);
        }
        setIsDatePickerOpen(false);
    };

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
                        ref={yesRef}
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
                        ref={noRef}
                        type="radio"
                        name={`yesno_${rowKey}`}
                        className="w-4 h-4 pointer-events-none"
                        checked={rowData.no === true}
                        readOnly
                        disabled={disabled || isLockedYes || isLockedNo}
                    />
                </div>
            </td>

            {/* Time + Date column (combined) */}
            <td
                className={`border-r border-black p-0 text-center align-middle min-w-[120px]`}
                rowSpan={rowSpan}
            >
                <div className="flex flex-col gap-1 p-2">
                    {/* Time Row */}
                    <div
                        className={`relative h-8 ${!(disabled || isLockedTime) ? 'cursor-pointer hover:bg-blue-50 rounded' : ''}`}
                        onClick={(e) => {
                            if (disabled || isLockedTime) return;
                            const input = e.currentTarget.querySelector('input[type="time"]') as HTMLInputElement;
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
                        {/* Display Text */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                            <span className={`text-xs ${!rowData.time ? 'text-gray-300' : 'text-black'}`}>
                                {rowData.time ? `${rowData.time} น.` : '--:-- น.'}
                            </span>
                        </div>

                        {/* Invisible Input */}
                        <input
                            type="time"
                            className="absolute inset-0 w-full h-full cursor-pointer opacity-0 z-10"
                            value={rowData.time}
                            onChange={e => {
                                updateRow(rowKey, 'time', e.target.value);
                                // Blur only on non-touch devices (PC)
                                if (window.matchMedia && !window.matchMedia('(pointer: coarse)').matches) {
                                    e.target.blur();
                                }
                            }}
                            disabled={disabled || isLockedTime}
                        />
                    </div>

                    {/* Date Row */}
                    <div
                        className={`relative min-h-[24px] ${!(disabled || isLockedDate) ? 'cursor-pointer hover:bg-blue-50 rounded' : ''}`}
                        onClick={() => {
                            if (disabled || isLockedDate) return;
                            setIsDatePickerOpen(true);
                        }}
                    >
                        <div className="flex items-center justify-center">
                            <span className={`text-xs ${!rowData.date ? 'text-gray-300' : 'text-black'}`}>
                                {rowData.date ? formatDateDisplay(rowData.date) : 'วว/ดด/ปปปป'}
                            </span>
                        </div>

                        {/* DatePicker Popup */}
                        {isDatePickerOpen && (
                            <div className="absolute z-50 left-1/2 -translate-x-1/2 top-6">
                                <DatePicker
                                    selected={parseDate(rowData.date)}
                                    onChange={handleDateChange}
                                    onSelect={() => setIsDatePickerOpen(false)}
                                    locale="th"
                                    inline
                                    dateFormat="dd/MM/yyyy"
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    onClickOutside={() => setIsDatePickerOpen(false)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Clear buttons */}
                    {(rowData.time || rowData.date) && !(disabled || (isLockedTime && isLockedDate)) && (
                        <div className="flex justify-center gap-1">
                            {rowData.time && !isLockedTime && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        updateRow(rowKey, 'time', '');
                                    }}
                                    className="text-gray-400 hover:text-red-500 text-xs px-1 rounded hover:bg-gray-100"
                                    title="ลบเวลา"
                                >
                                    ลบเวลา
                                </button>
                            )}
                            {rowData.date && !isLockedDate && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        updateRow(rowKey, 'date', '');
                                    }}
                                    className="text-gray-400 hover:text-red-500 text-xs px-1 rounded hover:bg-gray-100"
                                    title="ลบวันที่"
                                >
                                    ลบวันที่
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </td>

            {/* Preparer column */}
            <td
                className={`p-0 text-center align-middle ${!(disabled || isLockedPreparer) ? 'cursor-text hover:bg-blue-50' : ''}`}
                rowSpan={rowSpan}
                onClick={(e) => {
                    if (disabled || isLockedPreparer) return;
                    const textarea = e.currentTarget.querySelector('textarea');
                    if (textarea) textarea.focus();
                }}
            >
                <div className="w-full h-full p-1">
                    <textarea
                        className="w-full text-center text-xs outline-none bg-transparent resize-none break-words leading-tight"
                        rows={2}
                        value={rowData.preparer}
                        onChange={e => updateRow(rowKey, 'preparer', e.target.value)}
                        onFocus={() => {
                            // ถ้าช่องว่าง + เรามีชื่อ + ช่องไม่ถูกล็อค
                            if (!rowData.preparer && currentUserFullName && !disabled && !isLockedPreparer) {
                                // เติมชื่อเราลงไป
                                updateRow(rowKey, 'preparer', currentUserFullName);
                                // เก็บ User ID สำหรับเทียบ lock
                                if (currentUserId) {
                                    updateRow(rowKey, 'preparerId', currentUserId);
                                }
                            }
                        }}
                        disabled={disabled || isLockedPreparer}
                    />
                </div>
            </td>
        </>
    );
}
