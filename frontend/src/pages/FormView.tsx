
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { toast } from 'sonner';

// Import shared types and components
import type { FormData } from '../types/form';
import { initialFormData } from '../types/form';
import { PatientInfo, FormHeader, ChecklistRow, FormFooter } from '../components/form';
import { mapBackendToFormData } from '../services/formService';
import { thaiMonthsFull, toISODate, getCurrentTime } from '../utils/date';

// GSAP
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);


export default function ViewFormPage() {
    const { isLoggedIn, isLoading: authLoading, isAdmin, user } = useAuth();
    const navigate = useNavigate();
    const params = useParams();
    const formId = params.id as string;

    // State Declarations
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [originalData, setOriginalData] = useState<FormData | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isEditable, setIsEditable] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    // GSAP Animation
    useGSAP(() => {
        if (loading) return;

        const tl = gsap.timeline();

        // Hospital Speed: Fast & Professional (Total time ~0.6s)
        tl.from(".paper-container", { y: 20, opacity: 0, duration: 0.4, ease: "power2.out" })
            .from("h1, h2, h3", { y: -10, opacity: 0, stagger: 0.05, duration: 0.3 }, "-=0.2")
            .from(".form-header, .patient-info", { x: -10, opacity: 0, stagger: 0.1, duration: 0.3 }, "-=0.2")
            .from("tr", { y: 10, opacity: 0, stagger: 0.01, duration: 0.3 }, "-=0.1")
            .from(".form-footer", { y: 10, opacity: 0, duration: 0.3 }, "-=0.2");

    }, { scope: containerRef, dependencies: [loading] });

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            navigate('/login');
        }
    }, [authLoading, isLoggedIn, navigate]);



    // Load Data
    useEffect(() => {
        const loadFormData = async () => {
            if (!formId) return;
            setLoading(true);
            try {
                const response = await api.getForm(formId);
                if (response.success && response.data) {
                    const backendData = response.data.form as any;

                    // Use helper to map backend data to FormData
                    const mappedData = mapBackendToFormData(backendData);

                    // Check if editable:
                    // 1. If Admin -> Always editable
                    // 2. If Owner -> Editable if 'Complete' is NOT checked
                    // 3. Others -> Read only
                    const resultOr = backendData.resultOr || initialFormData.result;
                    let canEdit = true;


                    if (!isAdmin && resultOr.complete) {
                        canEdit = false;
                    }

                    setIsEditable(canEdit);

                    // Set form data and original data for locking
                    setFormData(mappedData);
                    setOriginalData(mappedData);
                }
            } catch (err) {
                console.error(err);
                toast.error("ไม่สามารถดึงข้อมูลได้");
            } finally {
                setLoading(false);
            }
        };

        if (isLoggedIn) {
            loadFormData();
        }
    }, [formId, isLoggedIn, isAdmin, user]);

    // Helpers

    // Helper to check if a field is locked (had value in originalData)
    // Admin ignores lock (can edit everything)
    const isLocked = (path: string, subPath?: string) => {
        // Admin can edit everything
        if (isAdmin) return false;

        // If form is not editable (Completed), everything is locked
        if (!isEditable) return true;

        if (!originalData) return false;

        if (path === 'rows') {
            // Usage: isLocked('rows', 'row1.yes') 
            if (!subPath) return false;
            // subPath e.g. 'row1.yes'
            const [rowKey] = subPath.split('.');

            // Check originalData to see if it WAS locked permissions-wise.
            const originalRow = originalData.rows[rowKey as keyof typeof originalData.rows];
            if (!originalRow) return false;

            // Row Locking Logic:
            // Case 1: Empty row (No preparer signature)
            // -> Editable by ANYONE (First come, first served)
            if (!originalRow.preparer) return false;

            // Case 2: Row already signed - Check by User ID first (reliable)
            // Then fall back to name comparison for backward compatibility
            if (user?.id && originalRow.preparerId === user.id) {
                return false; // Unlock for me (matched by ID)
            }

            // Fallback: Compare by name (for data saved before preparerId was added)
            if (user?.fullName && originalRow.preparer?.trim() === user.fullName?.trim()) {
                return false; // Unlock for me (matched by name)
            }

            // Case 3: Signed by someone else
            // -> Locked for me (Read-only)
            return true;
        }

        if (path === 'innerData') {
            if (!subPath) return false;
            const val = originalData.innerData[subPath as keyof typeof originalData.innerData];
            return !!val;
        }

        if (path === 'result') {
            if (!subPath) return false;
            // originalData.result is our structured object
            const val = (originalData.result as any)[subPath];
            return !!val;
        }

        // Top level fields
        const val = (originalData as any)[path];
        return !!val;
    };
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
        const month = thaiMonthsFull[now.getMonth()];
        const year = (now.getFullYear() + 543).toString();
        setFormData(prev => ({
            ...prev,
            formDate: day,
            formMonth: month,
            formYear: year
        }));
    };





    const handleUpdate = () => {
        setShowConfirmModal(true);
    };

    const confirmUpdate = async () => {
        setSubmitting(true);

        try {
            // 1. Convert Date using helper
            const isoDate = toISODate(formData.formDate, formData.formMonth, formData.formYear)
                || new Date().toISOString().split('T')[0];

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

        return (
            <ChecklistRow
                rowKey={rowKey}
                rowData={rowData}
                updateRow={updateRow}
                rowSpan={rowSpan}
                disabled={!isEditable && !isAdmin}
                isLocked={isLocked}
                currentUserFullName={user?.fullName}
                currentUserId={user?.id}
            />
        );
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-gray-200 p-8 flex justify-center text-black font-sans leading-tight relative">

            {/* Banner */}
            <div className="absolute top-4 right-8 px-4 py-1 rounded-full font-bold shadow-sm print:hidden z-10 flex items-center gap-2">
                {isEditable ? (
                    <span className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full">Edit Mode (Not Complete)</span>
                ) : (
                    <span className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full">View Only Mode</span>
                )}
            </div>

            {/* Paper Container - A4ish */}
            <div className="paper-container w-[240mm] bg-white shadow-lg p-10 relative">

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
                <FormHeader
                    formDate={formData.formDate}
                    formMonth={formData.formMonth}
                    formYear={formData.formYear}
                    updateField={updateField}
                    fillCurrentDate={fillCurrentDate}
                    disabled={!isEditable && !isAdmin}
                />

                <PatientInfo
                    formData={formData}
                    updateField={updateField}
                    disabled={!isEditable && !isAdmin}
                    isLocked={isLocked}
                />

                <div className="h-6"></div>

                <table className="w-full border-collapse border border-black text-sm table-fixed">
                    <thead>
                        <tr className="border-b border-black bg-gray-50">
                            <th className="border-r border-black py-2 px-2 font-medium w-[50%] text-center">รายการ</th>
                            <th className="border-r border-black py-2 px-1 font-medium w-[7%] text-center">Yes</th>
                            <th className="border-r border-black py-2 px-1 font-medium w-[7%] text-center">No</th>
                            <th className="border-r border-black py-2 px-1 font-medium w-[18%] text-center">เวลา/วันที่</th>
                            <th className="py-2 px-1 font-medium w-[18%] text-center">ผู้เตรียม</th>
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
                                    <label className={`flex items-center gap-2 ${isEditable && !isLocked('innerData', 'valuablesRemoved') ? 'cursor-pointer' : ''}`}>
                                        <input type="checkbox" className="w-4 h-4" checked={formData.innerData.valuablesRemoved} onChange={e => updateInner('valuablesRemoved', e.target.checked)} disabled={!isEditable || isLocked('innerData', 'valuablesRemoved')} />
                                        <span>ถอดออกแล้ว</span>
                                    </label>
                                    <label className={`flex items-center gap-2 ${isEditable && !isLocked('innerData', 'valuablesFixed') ? 'cursor-pointer' : ''}`}>
                                        <input type="checkbox" className="w-4 h-4" checked={formData.innerData.valuablesFixed} onChange={e => updateInner('valuablesFixed', e.target.checked)} disabled={!isEditable || isLocked('innerData', 'valuablesFixed')} />
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
                                    <label className={`flex items-center gap-2 ${isEditable && !isLocked('innerData', 'npoSolid') ? 'cursor-pointer' : ''}`}>
                                        <input type="checkbox" className="w-4 h-4" checked={formData.innerData.npoSolid} onChange={e => updateInner('npoSolid', e.target.checked)} disabled={!isEditable || isLocked('innerData', 'npoSolid')} />
                                        <span>อาหาร/นม/ครีมเหลว &gt; 6 ชม.</span>
                                    </label>
                                    <label className={`flex items-center gap-2 ${isEditable && !isLocked('innerData', 'npoLiquid') ? 'cursor-pointer' : ''}`}>
                                        <input type="checkbox" className="w-4 h-4" checked={formData.innerData.npoLiquid} onChange={e => updateInner('npoLiquid', e.target.checked)} disabled={!isEditable || isLocked('innerData', 'npoLiquid')} />
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
                                    <input className="ml-2 border-b border-dotted border-black flex-1 outline-none" value={formData.innerData.ivFluidDetail} onChange={e => updateInner('ivFluidDetail', e.target.value)} disabled={!isEditable || isLocked('innerData', 'ivFluidDetail')} />
                                </div>
                            </td>
                            {renderGridCells('row10')}
                        </tr>

                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3 align-top">
                                <div>11. ผลตรวจห้องปฏิบัติการ</div>
                                <div className="ml-3 mt-1 space-y-1">
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        <label className={`flex items-center gap-2 ${isEditable && !isLocked('rows', 'row11.preparer') ? 'cursor-pointer' : ''}`}>
                                            <input type="checkbox" className="w-4 h-4" checked={formData.innerData.labCbc} onChange={e => updateInner('labCbc', e.target.checked)} disabled={!isEditable || isLocked('rows', 'row11.preparer')} /> CBC
                                        </label>
                                        <label className={`flex items-center gap-2 ${isEditable && !isLocked('rows', 'row11.preparer') ? 'cursor-pointer' : ''}`}>
                                            <input type="checkbox" className="w-4 h-4" checked={formData.innerData.labUa} onChange={e => updateInner('labUa', e.target.checked)} disabled={!isEditable || isLocked('rows', 'row11.preparer')} /> UA
                                        </label>
                                        <label className={`flex items-center gap-2 ${isEditable && !isLocked('rows', 'row11.preparer') ? 'cursor-pointer' : ''}`}>
                                            <input type="checkbox" className="w-4 h-4" checked={formData.innerData.labElectrolyte} onChange={e => updateInner('labElectrolyte', e.target.checked)} disabled={!isEditable || isLocked('rows', 'row11.preparer')} /> Electrolyte
                                        </label>
                                        <label className={`flex items-center gap-2 ${isEditable && !isLocked('rows', 'row11.preparer') ? 'cursor-pointer' : ''}`}>
                                            <input type="checkbox" className="w-4 h-4" checked={formData.innerData.labPtPtt} onChange={e => updateInner('labPtPtt', e.target.checked)} disabled={!isEditable || isLocked('rows', 'row11.preparer')} /> PT,PTT,INR
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className={`flex items-center gap-2 whitespace-nowrap ${isEditable && !isLocked('rows', 'row11.preparer') ? 'cursor-pointer' : ''}`}>
                                            <input type="checkbox" className="w-4 h-4" checked={formData.innerData.labOther} onChange={e => updateInner('labOther', e.target.checked)} disabled={!isEditable || isLocked('rows', 'row11.preparer')} /> อื่น ๆ
                                        </label>
                                        <input className="border-b border-dotted border-black flex-1 outline-none ml-1" value={formData.innerData.labOtherDetail} onChange={e => updateInner('labOtherDetail', e.target.value)} disabled={!isEditable || isLocked('rows', 'row11.preparer')} />
                                    </div>
                                    <label className={`flex items-center gap-2 ${isEditable && !isLocked('rows', 'row11.preparer') ? 'cursor-pointer' : ''}`}>
                                        <input type="checkbox" className="w-4 h-4" checked={formData.innerData.labFilm} onChange={e => updateInner('labFilm', e.target.checked)} disabled={!isEditable || isLocked('rows', 'row11.preparer')} /> Film/PACs
                                    </label>
                                    <label className={`flex items-center gap-2 ${isEditable && !isLocked('rows', 'row11.preparer') ? 'cursor-pointer' : ''}`}>
                                        <input type="checkbox" className="w-4 h-4" checked={formData.innerData.labEkg} onChange={e => updateInner('labEkg', e.target.checked)} disabled={!isEditable || isLocked('rows', 'row11.preparer')} /> EKG
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
                                    disabled={!isEditable || isLocked('rows', 'row12.preparer')}
                                ></textarea>
                            </td>
                            {renderGridCells('row12')}
                        </tr>

                        <FormFooter
                            result={formData.result}
                            updateResult={updateResult}
                            disabled={!isEditable && !isAdmin}
                        />
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
                                className="px-4 py-2 text-white rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 hover:opacity-90"
                                style={{ backgroundColor: '#009CA6' }}
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
