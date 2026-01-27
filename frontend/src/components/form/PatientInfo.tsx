// PatientInfo Component - Extracted from FormNew.tsx
// Handles patient identification fields (Name, HN, AN, Ward, etc.)

import type { FormData } from '../../types/form';

interface PatientInfoProps {
    formData: FormData;
    updateField: (field: string, value: string) => void;
    disabled?: boolean;
    isLocked?: (field: string) => boolean;
}

export default function PatientInfo({ formData, updateField, disabled = false, isLocked }: PatientInfoProps) {
    // Helper to check if field should be disabled
    const isFieldDisabled = (field: string) => {
        if (disabled) return true;
        if (isLocked) return isLocked(field);
        return false;
    };

    return (
        <div className="border border-black p-4 rounded-sm text-sm mb-4">
            <div className="flex flex-col gap-4">
                {/* Row 1: Name, Sex, Age, Allergy */}
                <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                    <div className="flex items-end gap-2 flex-[2_1_300px]">
                        <span className="font-bold whitespace-nowrap mb-1">Name:</span>
                        <input
                            className="flex-1 min-w-0 bg-transparent border-b border-dotted border-black outline-none py-1 px-1"
                            value={formData.patientName}
                            onChange={e => updateField('patientName', e.target.value)}
                            disabled={isFieldDisabled('patientName')}
                        />
                    </div>
                    <div className="flex items-end gap-2 flex-[1_1_120px]">
                        <span className="font-bold whitespace-nowrap mb-1">Sex:</span>
                        <select
                            className="flex-1 min-w-0 bg-transparent border-b border-dotted border-black outline-none py-1 px-1 cursor-pointer appearance-none"
                            value={formData.sex}
                            onChange={e => updateField('sex', e.target.value)}
                            disabled={isFieldDisabled('sex')}
                            style={{ WebkitAppearance: 'none', MozAppearance: 'none' } as React.CSSProperties}
                        >
                            <option value="" disabled hidden></option>
                            <option value="ชาย">ชาย</option>
                            <option value="หญิง">หญิง</option>
                            <option value="อื่นๆ">อื่นๆ</option>
                        </select>
                    </div>
                    <div className="flex items-end gap-2 flex-[0_1_80px]">
                        <span className="font-bold whitespace-nowrap mb-1">Age:</span>
                        <input
                            type="number"
                            min="0"
                            max="150"
                            className="w-16 bg-transparent border-b border-dotted border-black outline-none py-1 px-0 text-center"
                            value={formData.age}
                            onChange={e => updateField('age', e.target.value)}
                            disabled={isFieldDisabled('age')}
                        />
                    </div>
                    <div className="flex items-end gap-2 flex-[3_1_350px]">
                        <span className="font-bold whitespace-nowrap mb-1">แพ้ยา:</span>
                        <label className="flex items-center gap-1 cursor-pointer">
                            <input
                                type="radio"
                                name="allergyStatus"
                                className="w-4 h-4"
                                checked={formData.allergyStatus === 'no'}
                                onChange={() => {
                                    updateField('allergyStatus', 'no');
                                    updateField('allergy', '');
                                }}
                                disabled={isFieldDisabled('allergyStatus')}
                            />
                            <span className="text-sm">ปฏิเสธ</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                            <input
                                type="radio"
                                name="allergyStatus"
                                className="w-4 h-4"
                                checked={formData.allergyStatus === 'yes'}
                                onChange={() => updateField('allergyStatus', 'yes')}
                                disabled={isFieldDisabled('allergyStatus')}
                            />
                            <span className="text-sm">แพ้</span>
                        </label>
                        {formData.allergyStatus === 'yes' && (
                            <input
                                className="flex-1 min-w-[100px] bg-transparent border-b border-dotted border-black outline-none py-1 px-1 text-red-600 font-semibold"
                                value={formData.allergy}
                                onChange={e => updateField('allergy', e.target.value)}
                                disabled={isFieldDisabled('allergy')}
                                placeholder="ระบุยาที่แพ้..."
                            />
                        )}
                        {formData.allergyStatus === 'no' && (
                            <span className="text-sm text-gray-500 border-b border-dotted border-black py-1 px-1">ไม่มี</span>
                        )}
                    </div>
                </div>

                {/* Row 2: Ward, HN, AN, Bed */}
                <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                    <div className="flex items-end gap-2 flex-[1_1_150px]">
                        <span className="font-bold whitespace-nowrap mb-1">Ward:</span>
                        <input
                            className="flex-1 min-w-0 bg-transparent border-b border-dotted border-black outline-none py-1 px-1"
                            value={formData.ward}
                            onChange={e => updateField('ward', e.target.value)}
                            disabled={isFieldDisabled('ward')}
                        />
                    </div>
                    <div className="flex items-end gap-2 flex-[1_1_200px]">
                        <span className="font-bold whitespace-nowrap mb-1">HN:</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={7}
                            className="flex-1 min-w-0 font-bold bg-transparent border-b border-dotted border-black outline-none py-1 px-1"
                            value={formData.hn}
                            onChange={e => {
                                const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 7);
                                updateField('hn', val);
                            }}
                            disabled={isFieldDisabled('hn')}
                        />
                    </div>
                    <div className="flex items-end gap-2 flex-[1_1_150px]">
                        <span className="font-bold whitespace-nowrap mb-1">AN:</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="flex-1 min-w-0 bg-transparent border-b border-dotted border-black outline-none py-1 px-1 text-center"
                            value={formData.an}
                            onChange={e => updateField('an', e.target.value)}
                            disabled={isFieldDisabled('an')}
                        />
                    </div>
                    <div className="flex items-end gap-2 flex-[0_1_100px]">
                        <span className="font-bold whitespace-nowrap mb-1">Bed:</span>
                        <input
                            className="flex-1 min-w-0 bg-transparent border-b border-dotted border-black outline-none py-1 px-1"
                            value={formData.bed}
                            onChange={e => updateField('bed', e.target.value)}
                            disabled={isFieldDisabled('bed')}
                        />
                    </div>
                </div>

                {/* Row 3: Diagnosis, Operation, Physician */}
                <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
                    <div className="flex items-end gap-2 flex-[2_1_400px]">
                        <span className="font-bold whitespace-nowrap mb-1">Diagnosis:</span>
                        <input
                            className="flex-1 min-w-0 bg-transparent border-b border-dotted border-black outline-none py-1 px-1"
                            value={formData.diagnosis}
                            onChange={e => updateField('diagnosis', e.target.value)}
                            disabled={isFieldDisabled('diagnosis')}
                        />
                    </div>
                    <div className="flex items-end gap-2 flex-[2_1_300px]">
                        <span className="font-bold whitespace-nowrap mb-1">Operation:</span>
                        <input
                            className="flex-1 min-w-0 bg-transparent border-b border-dotted border-black outline-none py-1 px-1"
                            value={formData.operation}
                            onChange={e => updateField('operation', e.target.value)}
                            disabled={isFieldDisabled('operation')}
                        />
                    </div>
                    <div className="flex items-end gap-2 flex-[1_1_250px]">
                        <span className="font-bold whitespace-nowrap mb-1">Physician:</span>
                        <input
                            className="flex-1 min-w-0 bg-transparent border-b border-dotted border-black outline-none py-1 px-1"
                            value={formData.physician}
                            onChange={e => updateField('physician', e.target.value)}
                            disabled={isFieldDisabled('physician')}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
