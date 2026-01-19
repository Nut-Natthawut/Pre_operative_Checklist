// FormHeader Component - Extracted from FormNew.tsx
// Displays hospital name, form title, and date fields

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
    fillCurrentDate,
    disabled = false
}: FormHeaderProps) {
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
                <button
                    type="button"
                    onClick={fillCurrentDate}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-xs rounded transition-opacity print:hidden"
                    title="วันที่ปัจจุบัน"
                    disabled={disabled}
                >
                    📅
                </button>
            </div>
        </div>
    );
}
