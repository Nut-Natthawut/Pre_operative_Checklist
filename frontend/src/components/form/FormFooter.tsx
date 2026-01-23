// FormFooter Component - Extracted from FormNew.tsx
// Contains result evaluation (Complete/ไม่ Complete) and checker info

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { ResultData } from '../../types/form';

interface FormFooterProps {
    result: ResultData;
    updateResult: (field: string, value: unknown) => void;
    disabled?: boolean;
}

export default function FormFooter({ result, updateResult, disabled = false }: FormFooterProps) {
    // Thai month names for date picker
    const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

    // Parse Thai date string to Date object
    const parseThaiDate = (dateStr: string): Date | null => {
        if (!dateStr) return null;
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const monthIndex = monthNames.indexOf(parts[1]);
            const month = monthIndex !== -1 ? monthIndex : parseInt(parts[1]) - 1;
            const thaiYear = parseInt(parts[2]);
            const year = thaiYear > 2500 ? thaiYear - 543 : thaiYear;
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                return new Date(year, month, day);
            }
        }
        return null;
    };

    // Format Date to Thai date string
    const formatThaiDate = (date: Date): string => {
        const day = date.getDate();
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear() + 543;
        return `${day}/${month}/${year}`;
    };

    return (
        <tr className="border-b-0">
            <td className="border-r border-black p-1"></td>
            <td colSpan={4} className="p-2 align-top">
                <div className="flex gap-4 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="completion"
                            className="w-4 h-4"
                            checked={result.complete}
                            onChange={() => {
                                updateResult('complete', true);
                                updateResult('notComplete', false);
                            }}
                            disabled={disabled}
                        />
                        <span>Complete</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="completion"
                            className="w-4 h-4"
                            checked={result.notComplete}
                            onChange={() => {
                                updateResult('complete', false);
                                updateResult('notComplete', true);
                            }}
                            disabled={disabled}
                        />
                        <span>ไม่ Complete</span>
                    </label>
                </div>
                <div className="flex items-center gap-1 mb-1">
                    <span>ผู้ตรวจสอบ</span>
                    <input
                        className="border-b border-dotted border-black flex-1 outline-none text-center"
                        value={result.checker}
                        onChange={e => updateResult('checker', e.target.value)}
                        disabled={disabled}
                    />
                </div>
                <div className="flex items-center gap-1">
                    <span>เวลา</span>
                    <div className="border-b border-dotted border-black w-24 flex justify-center items-center">
                        <input
                            type="time"
                            className={`outline-none text-center p-0 bg-transparent ${!result.checkTime ? 'text-transparent' : ''}`}
                            value={result.checkTime}
                            onChange={e => {
                                updateResult('checkTime', e.target.value);
                                // Blur only on non-touch devices (PC) to close popup
                                // Keep open on touch devices (iPad) for scrolling
                                if (window.matchMedia && !window.matchMedia('(pointer: coarse)').matches) {
                                    e.target.blur();
                                }
                            }}
                            style={{ appearance: 'none', textAlign: 'center' }}
                            disabled={disabled}
                        />
                    </div>
                    <span>น.</span>
                    <span className="whitespace-nowrap">วันที่/เดือน/ปี</span>
                    <input
                        className="border-b border-dotted border-black flex-1 outline-none text-center"
                        value={result.checkDate}
                        readOnly
                        placeholder="เลือกวันที่"
                        onClick={() => {
                            if (!disabled) {
                                const picker = document.getElementById('checkDatePicker');
                                if (picker) picker.click();
                            }
                        }}
                        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                    />
                    <DatePicker
                        id="checkDatePicker"
                        selected={parseThaiDate(result.checkDate)}
                        onChange={(date: Date | null) => {
                            if (date) {
                                updateResult('checkDate', formatThaiDate(date));
                            } else {
                                updateResult('checkDate', '');
                            }
                        }}
                        renderCustomHeader={({
                            date,
                            decreaseMonth,
                            increaseMonth,
                            prevMonthButtonDisabled,
                            nextMonthButtonDisabled,
                        }) => (
                            <div className="flex items-center justify-between px-2 py-2">
                                <button type="button" onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="p-1 hover:bg-gray-100 rounded">
                                    &lt;
                                </button>
                                <span className="font-medium">
                                    {date.toLocaleDateString('th-TH', { month: 'long' })} {date.getFullYear() + 543}
                                </span>
                                <button type="button" onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="p-1 hover:bg-gray-100 rounded">
                                    &gt;
                                </button>
                            </div>
                        )}
                        customInput={<span style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />}
                        portalId="root"
                        popperPlacement="top-start"
                        disabled={disabled}
                    />
                </div>
            </td>
        </tr>
    );
}
