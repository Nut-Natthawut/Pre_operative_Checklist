

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

import { toast } from 'sonner';

// ข้อมูลเริ่มต้นของฟอร์ม
const initialFormData = {
    // Header info
    formDate: '',
    formMonth: '',
    formYear: '',

    // Patient info header
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

    // Checklist items
    rows: {
        row1: { yes: false, no: false, time: '', preparer: '' }, // 1. การเตรียมบริเวณผิวหนัง
        row1_1: { yes: false, no: false, time: '', preparer: '' }, // 1.1 Clean & Shave
        row1_2: { yes: false, no: false, time: '', preparer: '' }, // 1.2 ...
        row1_3: { yes: false, no: false, time: '', preparer: '' }, // 1.3 Mark site

        row2: { yes: false, no: false, time: '', preparer: '' }, // 2. การทำความสะอาดทั่วไป
        row2_1: { yes: false, no: false, time: '', preparer: '' },
        row2_2: { yes: false, no: false, time: '', preparer: '' },
        row2_3: { yes: false, no: false, time: '', preparer: '' }, // 2.3 ล้าง Makeup

        row3: { yes: false, no: false, time: '', preparer: '' }, // 3. การสวนล้าง
        row3_1: { yes: false, no: false, time: '', preparer: '' },
        row3_2: { yes: false, no: false, time: '', preparer: '' },
        row3_3: { yes: false, no: false, time: '', preparer: '' },
        row3_4: { yes: false, no: false, time: '', preparer: '' },

        row4: { yes: false, no: false, time: '', preparer: '' }, // 4.
        row5: { yes: false, no: false, time: '', preparer: '' }, // 5. ชุดชั้นในถอดแล้ว
        // ข้อ 6 ในรูปคือ ของมีค่า
        row6: { yes: false, no: false, time: '', preparer: '' },

        row7: { yes: false, no: false, time: '', preparer: '' }, // 7. ติดป้ายข้อมือ

        row8: { yes: false, no: false, time: '', preparer: '' }, // 8. CONSENT
        row9: { yes: false, no: false, time: '', preparer: '' }, // 9. NPO
        row10: { yes: false, no: false, time: '', preparer: '' }, // 10. IV fluid
        row11: { yes: false, no: false, time: '', preparer: '' }, // 11. ผลตรวจ
        row12: { yes: false, no: false, time: '', preparer: '' }, // 12. ยา
    },

    // Specific inner data (Left column data)
    innerData: {
        // 6. ของมีค่า
        valuablesRemoved: false,
        valuablesFixed: false,

        // 8. Consent
        consentAdult: false,
        consentMarried: false,
        consentChild: false,
        consentChildGuardian: '',

        // 9. NPO
        npoSolid: false,
        npoLiquid: false,

        // 10. IV
        ivFluidDetail: '',

        // 11. Lab
        labCbc: false,
        labUa: false,
        labElectrolyte: false,
        labPtPtt: false,
        labOther: false,
        labOtherDetail: '',
        labFilm: false,

        // 12. Meds
        medsDetail: '',
    },

    // Bottom Result
    result: {
        complete: false,
        notComplete: false,
        checker: '',
        checkTime: '',
        checkDate: '', // วันที่/เดือน/ปี
    }
};

type FormData = typeof initialFormData;

export default function ViewFormPage() {
    const { isLoggedIn, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const params = useParams();
    const formId = params.id as string;

    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Editable state: true if notComplete is true
    const [isEditable, setIsEditable] = useState(false);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            navigate('/login');
        }
    }, [authLoading, isLoggedIn, navigate]);

    // Thai month names
    const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

    // Load Data
    useEffect(() => {
        const loadForm = async () => {
            if (!formId) return;
            setLoading(true);
            try {
                const response = await api.getForm(formId);
                if (response.success && response.data) {
                    const backendData = response.data.form as any;

                    // Convert Date ISO -> Thai
                    let fDate = '', fMonth = '', fYear = '';
                    if (backendData.formDate) {
                        const dateObj = new Date(backendData.formDate);
                        fDate = dateObj.getDate().toString();
                        fMonth = thaiMonths[dateObj.getMonth()];
                        fYear = (dateObj.getFullYear() + 543).toString();
                    }

                    // Check if editable (Not Complete)
                    const resultOr = backendData.resultOr || initialFormData.result;
                    const canEdit = resultOr.notComplete === true;
                    setIsEditable(canEdit);

                    // Map fields back
                    setFormData({
                        formDate: fDate,
                        formMonth: fMonth,
                        formYear: fYear,

                        patientName: backendData.patientName || '',
                        sex: backendData.sex || '',
                        age: backendData.age || '',
                        allergy: backendData.allergy || '',
                        ward: backendData.ward || '',
                        hn: backendData.hn || '',
                        an: backendData.an || '',
                        bed: backendData.bed || '',
                        diagnosis: backendData.otherNotes ? (JSON.parse(backendData.otherNotes).diagnosis || '') : '',
                        operation: backendData.otherNotes ? (JSON.parse(backendData.otherNotes).operation || '') : '',
                        physician: backendData.attendingPhysician || '',

                        rows: backendData.orChecklist || initialFormData.rows,

                        innerData: {
                            valuablesRemoved: backendData.riskConditions?.valuablesRemoved || false,
                            valuablesFixed: backendData.riskConditions?.valuablesFixed || false,

                            consentAdult: backendData.consentData?.consentAdult || false,
                            consentMarried: backendData.consentData?.consentMarried || false,
                            consentChild: backendData.consentData?.consentChild || false,
                            consentChildGuardian: backendData.consentData?.consentChildGuardian || '',

                            npoSolid: backendData.npoData?.npoSolid || false,
                            npoLiquid: backendData.npoData?.npoLiquid || false,

                            ivFluidDetail: backendData.ivData?.ivFluidDetail || '',

                            labCbc: backendData.anesLab?.labCbc || false,
                            labUa: backendData.anesLab?.labUa || false,
                            labElectrolyte: backendData.anesLab?.labElectrolyte || false,
                            labPtPtt: backendData.anesLab?.labPtPtt || false,
                            labOther: backendData.anesLab?.labOther || false,
                            labOtherDetail: backendData.anesLab?.labOtherDetail || '',
                            labFilm: backendData.anesLab?.labFilm || false,

                            medsDetail: backendData.premedication || '',
                        },

                        result: resultOr,
                    });
                }
            } catch (err) {
                console.error(err);
                toast.error("ไม่สามารถดึงข้อมูลได้");
            } finally {
                setLoading(false);
            }
        };

        if (isLoggedIn) {
            loadForm();
        }
    }, [formId, isLoggedIn]);

    // Helpers
    const updateField = (field: string, value: unknown) => {
        if (!isEditable) return;
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateRow = (rowKey: string, field: string, value: unknown) => {
        if (!isEditable) return;
        setFormData(prev => ({
            ...prev,
            rows: {
                ...prev.rows,
                [rowKey]: {
                    ...(prev.rows as any)[rowKey],
                    [field]: value
                }
            }
        }));
    };

    const updateInner = (field: string, value: unknown) => {
        if (!isEditable) return;
        setFormData(prev => ({
            ...prev,
            innerData: {
                ...prev.innerData,
                [field]: value
            }
        }));
    };

    const updateResult = (field: string, value: unknown) => {
        if (!isEditable) return;
        setFormData(prev => ({
            ...prev,
            result: {
                ...prev.result,
                [field]: value
            }
        }));
    };

    const fillCurrentDate = () => {
        if (!isEditable) return;
        const now = new Date();
        const day = now.getDate().toString();
        const month = thaiMonths[now.getMonth()];
        const year = (now.getFullYear() + 543).toString();
        setFormData(prev => ({
            ...prev,
            formDate: day,
            formMonth: month,
            formYear: year
        }));
    };

    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    };

    const fillRowTime = (rowKey: string) => {
        if (!isEditable) return;
        updateRow(rowKey, 'time', getCurrentTime());
    };

    const handleUpdate = () => {
        setShowConfirmModal(true);
    };

    const confirmUpdate = async () => {
        setSubmitting(true);

        try {
            // 1. Convert Date
            const thaiMonthIndex = thaiMonths.indexOf(formData.formMonth);
            const yearAD = parseInt(formData.formYear || '0') - 543;
            const monthStr = (thaiMonthIndex + 1).toString().padStart(2, '0');
            const dayStr = formData.formDate.padStart(2, '0');

            let isoDate = '';
            if (thaiMonthIndex !== -1 && !isNaN(yearAD) && formData.formDate) {
                isoDate = `${yearAD}-${monthStr}-${dayStr}`;
            } else {
                isoDate = new Date().toISOString().split('T')[0];
            }

            // 2. Prepare Payload
            const payload = {
                formDate: isoDate,
                formTime: getCurrentTime(),
                ward: formData.ward,
                hn: formData.hn,
                an: formData.an,
                patientName: formData.patientName,
                sex: formData.sex,
                age: formData.age,
                allergy: formData.allergy,
                bed: formData.bed,
                attendingPhysician: formData.physician,
                // Checklists
                orChecklist: formData.rows,
                // Inner Data
                consentData: {
                    consentAdult: formData.innerData.consentAdult,
                    consentMarried: formData.innerData.consentMarried,
                    consentChild: formData.innerData.consentChild,
                    consentChildGuardian: formData.innerData.consentChildGuardian
                },
                npoData: {
                    npoSolid: formData.innerData.npoSolid,
                    npoLiquid: formData.innerData.npoLiquid
                },
                ivData: {
                    ivFluidDetail: formData.innerData.ivFluidDetail
                },
                anesLab: {
                    labCbc: formData.innerData.labCbc,
                    labUa: formData.innerData.labUa,
                    labElectrolyte: formData.innerData.labElectrolyte,
                    labPtPtt: formData.innerData.labPtPtt,
                    labOther: formData.innerData.labOther,
                    labOtherDetail: formData.innerData.labOtherDetail,
                    labFilm: formData.innerData.labFilm
                },
                riskConditions: {
                    valuablesRemoved: formData.innerData.valuablesRemoved,
                    valuablesFixed: formData.innerData.valuablesFixed
                },
                premedication: formData.innerData.medsDetail,
                resultOr: formData.result,
                otherNotes: JSON.stringify({
                    diagnosis: formData.diagnosis,
                    operation: formData.operation
                })
            };

            const response = await api.updateForm(formId, payload);

            if (response.success) {
                toast.success('อัปเดตข้อมูลเรียบร้อย');
                navigate('/dashboard');
            } else {
                toast.error(`เกิดข้อผิดพลาด: ${response.message}`);
            }
        } catch (err) {
            console.error(err);
            toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        } finally {
            setSubmitting(false);
            setShowConfirmModal(false);
        }
    };

    if (authLoading || loading) {
        return <div className="min-h-screen flex items-center justify-center">กำลังโหลดข้อมูล...</div>;
    }

    const renderGridCells = (rowKey: string, rowSpan?: number) => {
        const rowData = (formData.rows as any)[rowKey] || {};

        const handleYesNoChange = (value: 'yes' | 'no') => {
            if (!isEditable) return;
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
                <td
                    className={`border-r border-black p-1 text-center ${isEditable ? 'cursor-pointer hover:bg-blue-50' : ''}`}
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
                            disabled={!isEditable}
                        />
                    </div>
                </td>
                <td
                    className={`border-r border-black p-1 text-center ${isEditable ? 'cursor-pointer hover:bg-blue-50' : ''}`}
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
                            disabled={!isEditable}
                        />
                    </div>
                </td>
                <td
                    className={`border-r border-black p-0 text-center align-middle group ${isEditable ? 'cursor-text' : ''}`}
                    rowSpan={rowSpan}
                >
                    <div className="flex items-center justify-center w-full h-full p-1 gap-1">
                        <input
                            type="text"
                            className="flex-1 text-center outline-none bg-transparent min-w-0"
                            value={rowData.time}
                            onChange={e => updateRow(rowKey, 'time', e.target.value)}
                            disabled={!isEditable}
                        />
                        {isEditable && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); fillRowTime(rowKey); }}
                                className="opacity-0 group-hover:opacity-100 text-xs px-1 py-0.5 bg-blue-100 hover:bg-blue-200 rounded transition-opacity print:hidden"
                                title="เวลาปัจจุบัน"
                            >
                                🕐
                            </button>
                        )}
                    </div>
                </td>
                <td
                    className={`p-0 text-center align-middle ${isEditable ? 'cursor-text hover:bg-blue-50' : ''}`}
                    rowSpan={rowSpan}
                >
                    <div className="flex items-center justify-center w-full h-full p-2">
                        <input
                            type="text"
                            className="w-full text-center outline-none bg-transparent"
                            value={rowData.preparer}
                            onChange={e => updateRow(rowKey, 'preparer', e.target.value)}
                            disabled={!isEditable}
                        />
                    </div>
                </td>
            </>
        );
    };

    return (
        <div className="min-h-screen bg-gray-200 p-8 flex justify-center text-black font-sans leading-tight relative">

            {/* Banner */}
            <div className="absolute top-4 right-8 px-4 py-1 rounded-full font-bold shadow-sm print:hidden z-10 flex items-center gap-2">
                {isEditable ? (
                    <span className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full">Edit Mode (Not Complete)</span>
                ) : (
                    <span className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full">View Only Mode</span>
                )}
            </div>

            {/* Paper Container - A4ish */}
            <div className="w-[210mm] bg-white shadow-xl p-10 relative">

                {/* Navigation Back */}
                <div className="absolute left-4 top-4 print:hidden">
                    <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 flex items-center gap-1">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </Link>
                </div>

                {/* Header */}
                <div className="text-center mb-4">
                    <h1 className="text-base font-bold">โรงพยาบาลมหาราชนครเชียงใหม่ คณะแพทยศาสตร์ มหาวิทยาลัยเชียงใหม่</h1>
                    <h2 className="text-base font-bold mt-2">แบบสำรวจผู้ป่วยก่อนเข้าห้องผ่าตัด</h2>
                    <div className="flex justify-center items-end mt-4 text-sm gap-2 group">
                        <span>วันที่</span>
                        <input className="border-b border-dotted border-black w-24 text-center outline-none" value={formData.formDate} onChange={e => updateField('formDate', e.target.value)} disabled={!isEditable} />
                        <span>เดือน</span>
                        <input className="border-b border-dotted border-black w-32 text-center outline-none" value={formData.formMonth} onChange={e => updateField('formMonth', e.target.value)} disabled={!isEditable} />
                        <span>พ.ศ.</span>
                        <input className="border-b border-dotted border-black w-24 text-center outline-none" value={formData.formYear} onChange={e => updateField('formYear', e.target.value)} disabled={!isEditable} />
                        {isEditable && (
                            <button
                                type="button"
                                onClick={fillCurrentDate}
                                className="opacity-0 group-hover:opacity-100 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-xs rounded transition-opacity print:hidden"
                                title="วันที่ปัจจุบัน"
                            >
                                📅
                            </button>
                        )}
                    </div>
                </div>

                {/* Patient Info Table */}
                <table className="w-full border-collapse border border-black text-sm table-fixed">
                    <tbody>
                        <tr className="border-b border-black">
                            <td className="border-r border-black px-2 py-2" style={{ width: '35%' }}>
                                <div className="flex items-center h-full">
                                    <span className="mr-3 whitespace-nowrap font-medium">Name:</span>
                                    <input className="flex-1 outline-none min-w-0 bg-transparent border-b border-dotted border-black" value={formData.patientName} onChange={e => updateField('patientName', e.target.value)} disabled={!isEditable} />
                                </div>
                            </td>
                            <td className="border-r border-black px-2 py-2" style={{ width: '20%' }}>
                                <div className="flex items-center h-full">
                                    <span className="mr-3 whitespace-nowrap font-medium">Sex:</span>
                                    <input className="flex-1 outline-none min-w-0 bg-transparent border-b border-dotted border-black" value={formData.sex} onChange={e => updateField('sex', e.target.value)} disabled={!isEditable} />
                                </div>
                            </td>
                            <td className="border-r border-black px-2 py-2" style={{ width: '20%' }}>
                                <div className="flex items-center h-full">
                                    <span className="mr-3 whitespace-nowrap font-medium">Age:</span>
                                    <input className="flex-1 outline-none min-w-0 bg-transparent border-b border-dotted border-black" value={formData.age} onChange={e => updateField('age', e.target.value)} disabled={!isEditable} />
                                </div>
                            </td>
                            <td className="px-2 py-2" style={{ width: '25%' }}>
                                <div className="flex items-center h-full">
                                    <span className="mr-3 whitespace-nowrap font-medium">แพ้ยา:</span>
                                    <input className="flex-1 outline-none min-w-0 text-red-600 bg-transparent border-b border-dotted border-black" value={formData.allergy} onChange={e => updateField('allergy', e.target.value)} disabled={!isEditable} />
                                </div>
                            </td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="border-r border-black px-2 py-2">
                                <div className="flex items-center h-full">
                                    <span className="mr-3 whitespace-nowrap font-medium">Ward:</span>
                                    <input className="flex-1 outline-none min-w-0 bg-transparent border-b border-dotted border-black" value={formData.ward} onChange={e => updateField('ward', e.target.value)} disabled={!isEditable} />
                                </div>
                            </td>
                            <td className="border-r border-black px-2 py-2">
                                <div className="flex items-center h-full">
                                    <span className="mr-3 whitespace-nowrap font-medium">HN:</span>
                                    <input className="flex-1 outline-none min-w-0 font-bold bg-transparent border-b border-dotted border-black" value={formData.hn} onChange={e => updateField('hn', e.target.value)} disabled={!isEditable} />
                                </div>
                            </td>
                            <td className="border-r border-black px-2 py-2">
                                <div className="flex items-center h-full">
                                    <span className="mr-3 whitespace-nowrap font-medium">AN:</span>
                                    <input className="flex-1 outline-none min-w-0 bg-transparent border-b border-dotted border-black" value={formData.an} onChange={e => updateField('an', e.target.value)} disabled={!isEditable} />
                                </div>
                            </td>
                            <td className="px-2 py-2">
                                <div className="flex items-center h-full">
                                    <span className="mr-3 whitespace-nowrap font-medium">Bed:</span>
                                    <input className="flex-1 outline-none min-w-0 bg-transparent border-b border-dotted border-black" value={formData.bed} onChange={e => updateField('bed', e.target.value)} disabled={!isEditable} />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className="border-r border-black px-2 py-2" colSpan={2}>
                                <div className="flex items-center h-full">
                                    <span className="mr-3 whitespace-nowrap font-medium">Diagnosis:</span>
                                    <input className="flex-1 outline-none min-w-0 bg-transparent border-b border-dotted border-black" value={formData.diagnosis} onChange={e => updateField('diagnosis', e.target.value)} disabled={!isEditable} />
                                </div>
                            </td>
                            <td className="border-r border-black px-2 py-2">
                                <div className="flex items-center h-full">
                                    <span className="mr-3 whitespace-nowrap font-medium">Operation:</span>
                                    <input className="flex-1 outline-none min-w-0 bg-transparent border-b border-dotted border-black" value={formData.operation} onChange={e => updateField('operation', e.target.value)} disabled={!isEditable} />
                                </div>
                            </td>
                            <td className="px-2 py-2">
                                <div className="flex items-center h-full">
                                    <span className="mr-3 whitespace-nowrap font-medium">Physician:</span>
                                    <input className="flex-1 outline-none min-w-0 bg-transparent border-b border-dotted border-black" value={formData.physician} onChange={e => updateField('physician', e.target.value)} disabled={!isEditable} />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="h-6"></div>

                <table className="w-full border-collapse border border-black text-sm table-fixed">
                    <thead>
                        <tr className="border-b border-black bg-gray-50">
                            <th className="border-r border-black py-2 px-2 font-medium w-[50%] text-center">รายการ</th>
                            <th className="border-r border-black py-2 px-1 font-medium w-[7%] text-center">Yes</th>
                            <th className="border-r border-black py-2 px-1 font-medium w-[7%] text-center">No</th>
                            <th className="border-r border-black py-2 px-1 font-medium w-[10%] text-center">เวลา</th>
                            <th className="py-2 px-1 font-medium w-[26%] text-center">ผู้เตรียม</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b-0 hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3">1. การเตรียมบริเวณผิวหนัง</td>
                            {renderGridCells('row1', 4)}
                        </tr>
                        <tr className="border-b-0 hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-6">1.1 Clean & Shave</td>
                        </tr>
                        <tr className="border-b-0 hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-6">1.2 ทำความสะอาดผิวหนังด้วย Antiseptic Solution</td>
                        </tr>
                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-6">1.3 Mark site</td>
                        </tr>

                        <tr className="border-b-0 hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3">2. การทำความสะอาดทั่วไป</td>
                            {renderGridCells('row2', 4)}
                        </tr>
                        <tr className="border-b-0 hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-6">2.1 อาบน้ำ/สระผม/แปรงฟัน</td>
                        </tr>
                        <tr className="border-b-0 hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-6">2.2 ตัดเล็บ/ทำความสะอาดเล็บ</td>
                        </tr>
                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-6">2.3 ล้าง Makeup</td>
                        </tr>

                        <tr className="border-b-0 hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3">3. การสวนล้าง</td>
                            {renderGridCells('row3', 5)}
                        </tr>
                        <tr className="border-b-0 hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-6">3.1 NG tube</td>
                        </tr>
                        <tr className="border-b-0 hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-6">3.2 Doushe/Bowel prep</td>
                        </tr>
                        <tr className="border-b-0 hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-6">3.3 Urethral cath</td>
                        </tr>
                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-6">3.4 SSE</td>
                        </tr>

                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3">4. การขับถ่ายปัสสาวะก่อนส่ง OR</td>
                            {renderGridCells('row4')}
                        </tr>

                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3">5. ชุดชั้นในถอดแล้ว</td>
                            {renderGridCells('row5')}
                        </tr>

                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3 align-top">
                                <div>6. ของมีค่า/ฟันปลอม</div>
                                <div className="ml-3 mt-1 space-y-1">
                                    <label className={`flex items-center gap-2 ${isEditable ? 'cursor-pointer' : ''}`}>
                                        <input type="checkbox" className="w-4 h-4" checked={formData.innerData.valuablesRemoved} onChange={e => updateInner('valuablesRemoved', e.target.checked)} disabled={!isEditable} />
                                        <span>ถอดออกแล้ว</span>
                                    </label>
                                    <label className={`flex items-center gap-2 ${isEditable ? 'cursor-pointer' : ''}`}>
                                        <input type="checkbox" className="w-4 h-4" checked={formData.innerData.valuablesFixed} onChange={e => updateInner('valuablesFixed', e.target.checked)} disabled={!isEditable} />
                                        <span>ติดแน่นไม่สามารถถอดออกได้</span>
                                    </label>
                                </div>
                            </td>
                            {renderGridCells('row6')}
                        </tr>

                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3">7. ติดป้ายข้อมือ</td>
                            {renderGridCells('row7')}
                        </tr>

                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3 align-top">
                                <div>8. CONSENT FORM</div>
                                <div className="ml-1 mt-1 space-y-1">
                                    <div className="pl-1">Adult &gt; 20 ปี</div>
                                    <div className="pl-1">&gt; 17 ปี มีทะเบียนสมรส</div>
                                    <div className="pl-1">Child &lt; 20 ปี ผู้ปกครองเซ็น มีพยานเซ็นรับรอง 2 คน</div>
                                </div>
                            </td>
                            {renderGridCells('row8')}
                        </tr>

                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3 align-top">
                                <div>9. NPO</div>
                                <div className="ml-3 mt-1 flex flex-col gap-1">
                                    <label className={`flex items-center gap-2 ${isEditable ? 'cursor-pointer' : ''}`}>
                                        <input type="checkbox" className="w-4 h-4" checked={formData.innerData.npoSolid} onChange={e => updateInner('npoSolid', e.target.checked)} disabled={!isEditable} />
                                        <span>อาหาร/นม/ครีมเหลว &gt; 6 ชม.</span>
                                    </label>
                                    <label className={`flex items-center gap-2 ${isEditable ? 'cursor-pointer' : ''}`}>
                                        <input type="checkbox" className="w-4 h-4" checked={formData.innerData.npoLiquid} onChange={e => updateInner('npoLiquid', e.target.checked)} disabled={!isEditable} />
                                        <span>น้ำ/น้ำหวาน &gt;2-3 ชม.</span>
                                    </label>
                                </div>
                            </td>
                            {renderGridCells('row9')}
                        </tr>

                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3">
                                <div className="flex items-center">
                                    <span>10. IV fluid</span>
                                    <input className="ml-2 border-b border-dotted border-black flex-1 outline-none" value={formData.innerData.ivFluidDetail} onChange={e => updateInner('ivFluidDetail', e.target.value)} disabled={!isEditable} />
                                </div>
                            </td>
                            {renderGridCells('row10')}
                        </tr>

                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3 align-top">
                                <div>11. ผลตรวจห้องปฏิบัติการ</div>
                                <div className="ml-3 mt-1 space-y-1">
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        <label className={`flex items-center gap-2 ${isEditable ? 'cursor-pointer' : ''}`}>
                                            <input type="checkbox" className="w-4 h-4" checked={formData.innerData.labCbc} onChange={e => updateInner('labCbc', e.target.checked)} disabled={!isEditable} /> CBC
                                        </label>
                                        <label className={`flex items-center gap-2 ${isEditable ? 'cursor-pointer' : ''}`}>
                                            <input type="checkbox" className="w-4 h-4" checked={formData.innerData.labUa} onChange={e => updateInner('labUa', e.target.checked)} disabled={!isEditable} /> UA
                                        </label>
                                        <label className={`flex items-center gap-2 ${isEditable ? 'cursor-pointer' : ''}`}>
                                            <input type="checkbox" className="w-4 h-4" checked={formData.innerData.labElectrolyte} onChange={e => updateInner('labElectrolyte', e.target.checked)} disabled={!isEditable} /> Electrolyte
                                        </label>
                                        <label className={`flex items-center gap-2 ${isEditable ? 'cursor-pointer' : ''}`}>
                                            <input type="checkbox" className="w-4 h-4" checked={formData.innerData.labPtPtt} onChange={e => updateInner('labPtPtt', e.target.checked)} disabled={!isEditable} /> PT,PTT,INR
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className={`flex items-center gap-2 whitespace-nowrap ${isEditable ? 'cursor-pointer' : ''}`}>
                                            <input type="checkbox" className="w-4 h-4" checked={formData.innerData.labOther} onChange={e => updateInner('labOther', e.target.checked)} disabled={!isEditable} /> อื่น ๆ
                                        </label>
                                        <input className="border-b border-dotted border-black flex-1 outline-none ml-1" value={formData.innerData.labOtherDetail} onChange={e => updateInner('labOtherDetail', e.target.value)} disabled={!isEditable} />
                                    </div>
                                    <label className={`flex items-center gap-2 ${isEditable ? 'cursor-pointer' : ''}`}>
                                        <input type="checkbox" className="w-4 h-4" checked={formData.innerData.labFilm} onChange={e => updateInner('labFilm', e.target.checked)} disabled={!isEditable} /> Film/PACs
                                    </label>
                                </div>
                            </td>
                            {renderGridCells('row11')}
                        </tr>

                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3 align-top h-24">
                                <div>12. ยา & อุปกรณ์พิเศษที่ต้องนำมาพร้อมผู้ป่วย</div>
                                <textarea
                                    className="w-full mt-1 bg-transparent border-none outline-none resize-none h-16 leading-relaxed mb-1"
                                    style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 1.5rem, #ccc 1.5rem, #ccc calc(1.5rem + 1px))', backgroundAttachment: 'local', lineHeight: '1.5rem' }}
                                    value={formData.innerData.medsDetail}
                                    onChange={e => updateInner('medsDetail', e.target.value)}
                                    disabled={!isEditable}
                                ></textarea>
                            </td>
                            {renderGridCells('row12')}
                        </tr>

                        <tr className="border-b-0">
                            <td className="border-r border-black p-1"></td>
                            <td colSpan={4} className="p-2 align-top">
                                <div className="flex gap-4 mb-2">
                                    <label className={`flex items-center gap-2 ${isEditable ? 'cursor-pointer' : ''}`}>
                                        <input type="radio" name="completion" className="w-4 h-4" checked={formData.result.complete} onChange={() => { updateResult('complete', true); updateResult('notComplete', false); }} disabled={!isEditable} />
                                        <span>Complete</span>
                                    </label>
                                    <label className={`flex items-center gap-2 ${isEditable ? 'cursor-pointer' : ''}`}>
                                        <input type="radio" name="completion" className="w-4 h-4" checked={formData.result.notComplete} onChange={() => { updateResult('complete', false); updateResult('notComplete', true); }} disabled={!isEditable} />
                                        <span>ไม่ Complete</span>
                                    </label>
                                </div>
                                <div className="flex items-center gap-1 mb-1">
                                    <span>ผู้ตรวจสอบ</span>
                                    <input className="border-b border-dotted border-black flex-1 outline-none text-center" value={formData.result.checker} onChange={e => updateResult('checker', e.target.value)} disabled={!isEditable} />
                                </div>
                                <div className="flex items-center gap-1">
                                    <span>เวลา</span>
                                    <input className="border-b border-dotted border-black w-16 outline-none text-center" value={formData.result.checkTime} onChange={e => updateResult('checkTime', e.target.value)} disabled={!isEditable} />
                                    <span>วันที่/เดือน/ปี</span>
                                    <input className="border-b border-dotted border-black flex-1 outline-none text-center" value={formData.result.checkDate} onChange={e => updateResult('checkDate', e.target.value)} disabled={!isEditable} />
                                </div>
                            </td>
                        </tr>

                    </tbody>
                </table>

                {isEditable && (
                    <div className="flex justify-center mt-8 print:hidden">
                        <button
                            onClick={handleUpdate}
                            disabled={submitting}
                            className="bg-yellow-600 text-white px-8 py-2 rounded shadow hover:bg-yellow-700 transition disabled:opacity-50"
                        >
                            {submitting ? 'กำลังบันทึก...' : 'อัปเดตข้อมูล'}
                        </button>
                    </div>
                )}
            </div>

            {/* Confirm Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">ยืนยันการอัปเดตข้อมูล?</h3>
                        </div>
                        <div className="px-6 py-6">
                            <p className="text-gray-600 mb-4">
                                กรุณาตรวจสอบความถูกต้อง ข้อมูลที่อัปเดตแล้วจะไม่สามารถแก้ไขได้
                            </p>
                            <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm text-blue-800">
                                <div className="flex justify-between">
                                    <span className="font-semibold">HN:</span>
                                    <span>{formData.hn || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">ชื่อผู้ป่วย:</span>
                                    <span>{formData.patientName || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold">Ward:</span>
                                    <span>{formData.ward || '-'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                disabled={submitting}
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={confirmUpdate}
                                disabled={submitting}
                                className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 font-medium shadow-sm transition-colors flex items-center gap-2"
                            >
                                {submitting && (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {submitting ? 'กำลังบันทึก...' : 'ยืนยัน'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
