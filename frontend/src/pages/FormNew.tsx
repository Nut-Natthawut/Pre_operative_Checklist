// FormNew Page - Create new pre-operative form
// Refactored to use hooks and services for cleaner code

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import 'react-datepicker/dist/react-datepicker.css';

// Hooks & Services
import { useForm } from '../hooks/useForm';
import { submitForm } from '../services/formService';

// Types
import type { RowsData } from '../types/form';

// Components
import { PatientInfo, FormHeader, ChecklistRow, FormFooter } from '../components/form';

// ============================================
// MAIN COMPONENT
// ============================================

export default function NewFormPage() {
    const { isLoggedIn, isLoading, user } = useAuth();
    const navigate = useNavigate();

    // Form state from custom hook
    const {
        formData,
        updateField,
        updateRow,
        updateInner,
        updateResult,
        fillCurrentDate
    } = useForm();

    // UI state
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // ============================================
    // AUTH CHECK
    // ============================================

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            navigate('/login');
        }
    }, [isLoading, isLoggedIn, navigate]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>;
    }

    if (!isLoggedIn) {
        return null;
    }

    // ============================================
    // HANDLERS
    // ============================================

    const handleSubmit = () => {
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setSubmitting(true);

        try {
            const response = await submitForm(formData);

            if (response.success) {
                toast.success('บันทึกข้อมูลเรียบร้อย');
                navigate('/dashboard');
            } else {
                toast.error(`เกิดข้อผิดพลาด: ${response.message}`);
            }
        } catch (err) {
            console.error(err);
            toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        } finally {
            setSubmitting(false);
        }
    };

    // ============================================
    // RENDER HELPERS
    // ============================================

    const renderGridCells = (rowKey: keyof RowsData, rowSpan?: number) => {
        const rowData = formData.rows[rowKey] || {};
        return (
            <ChecklistRow
                rowKey={rowKey}
                rowData={rowData}
                updateRow={updateRow}
                rowSpan={rowSpan}
                currentUserFullName={user?.fullName}
                currentUserId={user?.id}
            />
        );
    };

    // ============================================
    // RENDER
    // ============================================

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex justify-center text-black font-sans leading-tight">
            {/* Paper Container - A4ish */}
            <div className="w-[240mm] bg-white shadow-lg p-10 relative">

                {/* Navigation Back */}
                <div className="absolute left-4 top-4 print:hidden">
                    <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 flex items-center gap-1">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </Link>
                </div>

                {/* Form Header */}
                <FormHeader
                    formDate={formData.formDate}
                    formMonth={formData.formMonth}
                    formYear={formData.formYear}
                    updateField={updateField}
                    fillCurrentDate={fillCurrentDate}
                />

                {/* Patient Info */}
                <PatientInfo
                    formData={formData}
                    updateField={updateField}
                />

                {/* Gap */}
                <div className="h-6"></div>

                {/* Main Checklist Table */}
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
                        {/* 1 - Skin Prep (4 rows) */}
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

                        {/* 2 - General Cleaning (4 rows) */}
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

                        {/* 3 - Irrigation (5 rows) */}
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

                        {/* 4 - Urination */}
                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3">4. การขับถ่ายปัสสาวะก่อนส่ง OR</td>
                            {renderGridCells('row4')}
                        </tr>

                        {/* 5 - Underwear */}
                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3">5. ชุดชั้นในถอดแล้ว</td>
                            {renderGridCells('row5')}
                        </tr>

                        {/* 6 - Valuables */}
                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3 align-top">
                                <div>6. ของมีค่า/ฟันปลอม</div>
                                <div className="ml-3 mt-1 space-y-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4" checked={formData.innerData.valuablesRemoved} onChange={e => updateInner('valuablesRemoved', e.target.checked)} />
                                        <span>ถอดออกแล้ว</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4" checked={formData.innerData.valuablesFixed} onChange={e => updateInner('valuablesFixed', e.target.checked)} />
                                        <span>ติดแน่นไม่สามารถถอดออกได้</span>
                                    </label>
                                </div>
                            </td>
                            {renderGridCells('row6')}
                        </tr>

                        {/* 7 - Wristband */}
                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3">7. ติดป้ายข้อมือ</td>
                            {renderGridCells('row7')}
                        </tr>

                        {/* 8 - Consent */}
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

                        {/* 9 - NPO */}
                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3 align-top">
                                <div>9. NPO</div>
                                <div className="ml-3 mt-1 flex flex-col gap-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4" checked={formData.innerData.npoSolid} onChange={e => updateInner('npoSolid', e.target.checked)} />
                                        <span>อาหาร/อาหารอ่อน/นม &gt; 6 ชม.</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4" checked={formData.innerData.npoLiquid} onChange={e => updateInner('npoLiquid', e.target.checked)} />
                                        <span>น้ำ/น้ำหวาน &gt;2-3 ชม.</span>
                                    </label>
                                </div>
                            </td>
                            {renderGridCells('row9')}
                        </tr>

                        {/* 10 - IV Fluid */}
                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3">
                                <div className="flex items-center">
                                    <span>10. IV fluid</span>
                                    <input className="ml-2 border-b border-dotted border-black flex-1 outline-none" value={formData.innerData.ivFluidDetail} onChange={e => updateInner('ivFluidDetail', e.target.value)} />
                                </div>
                            </td>
                            {renderGridCells('row10')}
                        </tr>

                        {/* 11 - Lab Results */}
                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3 align-top">
                                <div>11. ผลตรวจห้องปฏิบัติการ</div>
                                <div className="ml-3 mt-1 space-y-1">
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" className="w-4 h-4" checked={formData.innerData.labCbc} onChange={e => updateInner('labCbc', e.target.checked)} /> CBC
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" className="w-4 h-4" checked={formData.innerData.labUa} onChange={e => updateInner('labUa', e.target.checked)} /> UA
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" className="w-4 h-4" checked={formData.innerData.labElectrolyte} onChange={e => updateInner('labElectrolyte', e.target.checked)} /> Electrolyte
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" className="w-4 h-4" checked={formData.innerData.labPtPtt} onChange={e => updateInner('labPtPtt', e.target.checked)} /> PT,PTT,INR
                                        </label>
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" className="w-4 h-4" checked={formData.innerData.labFilm} onChange={e => updateInner('labFilm', e.target.checked)} /> Film
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" className="w-4 h-4" checked={formData.innerData.labEkg} onChange={e => updateInner('labEkg', e.target.checked)} /> EKG
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="flex items-center gap-2 whitespace-nowrap">
                                            <input type="checkbox" className="w-4 h-4" checked={formData.innerData.labOther} onChange={e => updateInner('labOther', e.target.checked)} /> อื่น ๆ
                                        </label>
                                        <input className="border-b border-dotted border-black flex-1 outline-none ml-1" value={formData.innerData.labOtherDetail} onChange={e => updateInner('labOtherDetail', e.target.value)} />
                                    </div>
                                </div>
                            </td>
                            {renderGridCells('row11')}
                        </tr>

                        {/* 12 - Medications */}
                        <tr className="border-b border-black hover:bg-gray-50">
                            <td className="border-r border-black px-2 py-1 pl-3 align-top h-24">
                                <div>12. ยา & อุปกรณ์พิเศษที่ต้องนำมาพร้อมผู้ป่วย</div>
                                <textarea
                                    className="w-full mt-1 bg-transparent border-none outline-none resize-none h-16 leading-relaxed mb-1"
                                    style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 1.5rem, #ccc 1.5rem, #ccc calc(1.5rem + 1px))', backgroundAttachment: 'local', lineHeight: '1.5rem' }}
                                    value={formData.innerData.medsDetail}
                                    onChange={e => updateInner('medsDetail', e.target.value)}
                                ></textarea>
                            </td>
                            {renderGridCells('row12')}
                        </tr>

                        {/* Footer */}
                        <FormFooter
                            result={formData.result}
                            updateResult={updateResult}
                        />
                    </tbody>
                </table>

                {/* Save Button */}
                <div className="flex justify-center mt-8 print:hidden">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="text-white px-8 py-2 rounded shadow transition disabled:opacity-50"
                        style={{ backgroundColor: '#009CA6' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#007a82'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#009CA6'}
                    >
                        {submitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                    </button>
                </div>
            </div>

            {/* Confirm Modal */}
            {showConfirmModal && (
                <ConfirmModal
                    formData={formData}
                    submitting={submitting}
                    onCancel={() => setShowConfirmModal(false)}
                    onConfirm={confirmSubmit}
                />
            )}
        </div>
    );
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface ConfirmModalProps {
    formData: { hn: string; patientName: string; ward: string };
    submitting: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

function ConfirmModal({ formData, submitting, onCancel, onConfirm }: ConfirmModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">ยืนยันการบันทึกข้อมูล?</h3>
                </div>
                <div className="px-6 py-6">
                    <p className="text-gray-600 mb-4">
                        กรุณาตรวจสอบความถูกต้อง ข้อมูลที่บันทึกแล้วจะไม่สามารถแก้ไขได้
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
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        disabled={submitting}
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={onConfirm}
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
    );
}
