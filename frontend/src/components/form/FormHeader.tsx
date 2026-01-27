// FormHeader Component - Extracted from FormNew.tsx
// Displays hospital name, form title, and date fields with DatePicker
import { useState } from 'react';
import { Calendar } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { th } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

// Register Thai locale
registerLocale('th', th);

// Thai month names
const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

interface FormHeaderProps {
    formDate: string;
    formMonth: string;
    formYear: string;
    updateField: (field: string, value: string) => void;
    fillCurrentDate: () => void;
    disabled?: boolean;
}

export default function FormHeader({
    formDate,
    formMonth,
    formYear,
    updateField,
    fillCurrentDate: _fillCurrentDate,
    disabled = false
}: FormHeaderProps) {
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    // Convert current form date to Date object for DatePicker
    const getSelectedDate = (): Date | null => {
        if (!formDate || !formMonth || !formYear) return null;
        const monthIndex = thaiMonths.indexOf(formMonth);
        if (monthIndex === -1) return null;
        const yearAD = parseInt(formYear) - 543;
        const day = parseInt(formDate);
        if (isNaN(yearAD) || isNaN(day)) return null;
        return new Date(yearAD, monthIndex, day);
    };

    // Handle date selection from picker
    const handleDateChange = (date: Date | null) => {
        if (date) {
            updateField('formDate', date.getDate().toString());
            updateField('formMonth', thaiMonths[date.getMonth()]);
            updateField('formYear', (date.getFullYear() + 543).toString());
        }
        setIsDatePickerOpen(false);
    };

    return (
        <div className="text-center mb-4">
            <h1 className="text-base font-bold">โรงพยาบาลมหาราชนครเชียงใหม่ คณะแพทยศาสตร์ มหาวิทยาลัยเชียงใหม่</h1>
            <h2 className="text-base font-bold mt-2">แบบสำรวจผู้ป่วยก่อนเข้าห้องผ่าตัด</h2>
            <div className="flex justify-center items-end mt-4 text-sm gap-2 group">
                <span>วันที่</span>
                <input
                    type="text"
                    className="border-b border-dotted border-black w-24 text-center outline-none"
                    value={formDate}
                    onChange={e => updateField('formDate', e.target.value)}
                    disabled={disabled}
                />
                <span>เดือน</span>
                <input
                    type="text"
                    className="border-b border-dotted border-black w-32 text-center outline-none"
                    value={formMonth}
                    onChange={e => updateField('formMonth', e.target.value)}
                    disabled={disabled}
                />
                <span>พ.ศ.</span>
                <input
                    type="text"
                    className="border-b border-dotted border-black w-24 text-center outline-none"
                    value={formYear}
                    onChange={e => updateField('formYear', e.target.value)}
                    disabled={disabled}
                />
                {!disabled && (
                    <div className={`relative ${formDate ? 'opacity-0 pointer-events-none' : ''}`}>
                        <button
                            type="button"
                            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                            className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-xs rounded transition-colors"
                            title="เลือกวันที่"
                        >
                            <Calendar className="w-4 h-4" />
                        </button>
                        {isDatePickerOpen && (
                            <div className="absolute z-50 right-0 top-8">
                                <DatePicker
                                    selected={getSelectedDate()}
                                    onChange={handleDateChange}
                                    locale="th"
                                    inline
                                    dateFormat="d MMMM yyyy"
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    onClickOutside={() => setIsDatePickerOpen(false)}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
