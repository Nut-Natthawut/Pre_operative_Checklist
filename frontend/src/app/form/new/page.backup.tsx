// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/contexts/AuthContext';
// import { api } from '@/lib/api';
// import Link from 'next/link';
// import DatePicker from 'react-datepicker';
// import "react-datepicker/dist/react-datepicker.css";
// import { th } from 'date-fns/locale';

// // Sections with grouping for rowSpan
// const checklistSections = [
//     {
//         header: { id: '1.', label: 'การเตรียมบริเวณผิวหนัง' },
//         items: [
//             { id: '1.1', label: 'Clean&Shave' },
//             { id: '1.2', label: 'ทำความสะอาดผิวหนังด้วย Antiseptic Solution' },
//         ]
//     },
//     {
//         header: { id: '2.', label: 'การทำความสะอาดทั่วไป' },
//         items: [
//             { id: '2.1', label: 'อาบน้ำ/สระผม/แปรงฟัน' },
//             { id: '2.2', label: 'ตัดเล็บทำความสะอาดเล็บ' },
//             { id: '2.3', label: 'ตัดขนตา/ล้างตา' },
//             { id: '2.4', label: 'ล้าง Makeup แล้ว' },
//         ]
//     },
//     {
//         header: { id: '3.', label: 'การล้างสวน' },
//         items: [
//             { id: '3.1', label: 'NG tube' },
//             { id: '3.2', label: 'Douche/Bowel prep' },
//             { id: '3.3', label: 'Urethral cath' },
//             { id: '3.4', label: 'SSE' },
//         ]
//     },
//     {
//         header: null,
//         items: [
//             { id: '4.', label: 'การขับถ่ายปัสสาวะก่อนส่ง OR' },
//         ]
//     },
//     {
//         header: null,
//         items: [
//             { id: '5.', label: 'Film/CT/US/LAB' },
//         ]
//     },
//     {
//         header: null,
//         items: [
//             { id: '6.', label: 'ชุดชั้นในถอดแล้ว' },
//         ]
//     },
//     {
//         header: { id: '7.', label: 'ของมีค่า/ฟันปลอม' },
//         items: [
//             { id: '', label: '- ถอดออกแล้ว' },
//             { id: '', label: '- ติดแน่นไม่สามารถถอดออกได้' },
//         ]
//     },
//     {
//         header: null,
//         items: [
//             { id: '8.', label: 'ติดป้ายข้อมือ' },
//         ]
//     },
// ];

// // All checklist items (flat) for form state
// const checklistData = checklistSections.flatMap(section => {
//     const items = [];
//     if (section.header) {
//         items.push({ ...section.header, isHeader: true });
//     }
//     section.items.forEach(item => {
//         items.push({ ...item, isHeader: false });
//     });
//     return items;
// });

// // Initial form state
// const createInitialChecklist = () => {
//     return checklistData.map(item => ({
//         ...item,
//         or_yes: false,
//         or_no: false,
//         anes_yes: false,
//         anes_no: false,
//         note: '',
//         time: '',
//     }));
// };

// const initialFormData = {
//     // Header
//     formDate: String(new Date().getDate()),
//     formMonth: String(new Date().getMonth() + 1), // Months are 0-indexed
//     formYear: String(new Date().getFullYear() + 543), // Thai Buddhist Year
//     formTime: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false }),
//     // Table header
//     ward: '',
//     timeField: '',
//     preparer: '',
//     // Patient info
//     hn: '',
//     an: '',
//     patientName: '',
//     sex: '',
//     age: '',
//     dob: '',
//     department: '',
//     weight: '',
//     rightSide: '',
//     allergy: '',
//     attendingPhysician: '',
//     bed: '',
//     // OR/ANES Checklist
//     checklist: createInitialChecklist(),
//     // ANES Lab Checklist
//     anesLab: {
//         ekg: { done: false, add: false },
//         cxr: { done: false, add: false },
//         cbc: { done: false, add: false },
//         hb: { done: false, add: false },
//         hct: { done: false, add: false },
//         platelet: { done: false, add: false },
//         pt: { done: false, add: false },
//         ptt: { done: false, add: false },
//         bunCr: { done: false, add: false },
//         electrolyte: { done: false, add: false },
//         lft: { done: false, add: false },
//         abg: { done: false, add: false },
//         pft: { done: false, add: false },
//         gm: { done: false, add: false },
//     },
//     // CONSULT MED
//     consultMed: {
//         notNeeded: false,
//         needed: false,
//         neededDetail: '',
//         consulted: false,
//         waitingOrder: false,
//         consultInOr: false,
//         cancelCase: false,
//     },
//     // Condition for Consult
//     riskConditions: {
//         heartDisease: false,
//         dyspnea: false,
//         uncontrolledMedical: false,
//         multipleComplex: false,
//         renalCase: false,
//         hasOther: false,
//         otherDetail: '',
//     },
//     // ผลการตรวจสอบ (ANES)
//     anesResult: {
//         completeAll: false,
//         completeAccept: false,
//         noComplete: false,
//         acceptOr: false,
//         cancelCase: false,
//         checkedBy: '',
//     },
//     // 9. CONSENT
//     consent: {
//         adult20: false,
//         married17: false,
//         child20Guardian: '',
//         withWitness: false,
//     },
//     // 10. NPO
//     npo: {
//         solid6hr: false,
//         liquid23hr: false,
//     },
//     // 11. IV fluid
//     ivFluid: {
//         extensionTway: false,
//         cathNo: '',
//     },
//     // 12. Premedication
//     premedication: '',
//     // 13. อื่นๆ
//     otherNotes: '',
//     // Results
//     resultOr: {
//         complete: false,
//         notComplete: false,
//     },
//     resultAnes: {
//         completeAll: false,
//         completeAccept: false,
//         noComplete: false,
//         acceptOr: false,
//         cancelCase: false,
//     },
//     reviewerOr: '',
//     reviewerAnes: '',
// };

// type FormData = typeof initialFormData;

// export default function NewFormPage() {
//     const { isLoggedIn, isLoading, user } = useAuth();
//     const router = useRouter();
//     const [formData, setFormData] = useState<FormData>(initialFormData);
//     const [showSummary, setShowSummary] = useState(false);
//     const [submitting, setSubmitting] = useState(false);
//     const [error, setError] = useState('');

//     if (!isLoading && !isLoggedIn) {
//         router.push('/login');
//         return null;
//     }

//     const updateField = (field: string, value: unknown) => {
//         setFormData(prev => ({ ...prev, [field]: value }));
//     };

//     const updateChecklist = (index: number, field: string, value: boolean | string) => {
//         setFormData(prev => {
//             const newChecklist = [...prev.checklist];
//             newChecklist[index] = { ...newChecklist[index], [field]: value };
//             return { ...prev, checklist: newChecklist };
//         });
//     };

//     const updateAnesLab = (item: string, field: string, value: boolean) => {
//         setFormData(prev => ({
//             ...prev,
//             anesLab: {
//                 ...prev.anesLab,
//                 [item]: { ...(prev.anesLab as Record<string, Record<string, boolean>>)[item], [field]: value },
//             },
//         }));
//     };

//     const updateNested = (section: string, field: string, value: unknown) => {
//         setFormData(prev => ({
//             ...prev,
//             [section]: { ...(prev[section as keyof FormData] as Record<string, unknown>), [field]: value },
//         }));
//     };

//     const renderTimeInput = (index: number) => {
//         const timeValue = formData.checklist[index]?.time || '';
//         const getChecklistDate = (timeStr: string) => {
//             if (!timeStr) return new Date();
//             const [hours, minutes] = timeStr.split(':');
//             const date = new Date();
//             date.setHours(parseInt(hours) || 0);
//             date.setMinutes(parseInt(minutes) || 0);
//             return date;
//         };

//         return (
//             <div className="flex items-center justify-center relative group">
//                 <input
//                     type="text"
//                     value={timeValue}
//                     onChange={(e) => {
//                         const val = e.target.value;
//                         // Allow only numbers and :
//                         if (/^[0-9:]*$/.test(val) && val.length <= 5) {
//                             updateChecklist(index, 'time', val);
//                         }
//                     }}
//                     className="w-full text-center outline-none bg-transparent text-sm"
//                 />
//                 <div className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
//                     <DatePicker
//                         selected={getChecklistDate(timeValue)}
//                         onChange={(date: Date | null) => {
//                             if (date) updateChecklist(index, 'time', date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false }));
//                         }}
//                         showTimeSelect
//                         showTimeSelectOnly
//                         timeIntervals={15}
//                         timeCaption="Time"
//                         dateFormat="HH:mm"
//                         locale={th}
//                         customInput={
//                             <button className="p-0.5 text-blue-600 bg-white hover:bg-blue-50 rounded border border-blue-200 shadow-sm" type="button">
//                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
//                                     <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                 </svg>
//                             </button>
//                         }
//                     />
//                 </div>
//             </div>
//         );
//     };

//     const handleReview = () => {
//         if (!formData.ward || !formData.hn || !formData.patientName) {
//             setError('กรุณากรอก WARD, HN และชื่อผู้ป่วย');
//             return;
//         }
//         setError('');
//         setShowSummary(true);
//     };

//     const handleConfirm = async () => {
//         setSubmitting(true);
//         setError('');

//         const submitData = {
//             ...formData,
//             formDate: `${formData.formDate}/${formData.formMonth}/${formData.formYear}`,
//             formTime: formData.formTime,
//         };

//         const response = await api.submitForm(submitData as unknown as Record<string, unknown>);
//         if (response.success) {
//             router.push(`/form/${response.data?.formId}?success=true`);
//         } else {
//             setError(response.message);
//             setSubmitting(false);
//         }
//     };

//     if (isLoading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-100">
//                 <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//             </div>
//         );
//     }

//     const labItems = [
//         { key: 'ekg', label: 'EKG' },
//         { key: 'cxr', label: 'CXR' },
//         { key: 'cbc', label: 'CBC*' },
//         { key: 'hb', label: 'Hb' },
//         { key: 'hct', label: 'Hct' },
//         { key: 'platelet', label: 'Platelet*' },
//         { key: 'pt', label: 'PT*' },
//         { key: 'ptt', label: 'PTT*' },
//         { key: 'bunCr', label: 'BUN, Cr' },
//         { key: 'electrolyte', label: 'Electrolyte' },
//         { key: 'lft', label: 'LFT' },
//         { key: 'abg', label: 'ABG' },
//         { key: 'pft', label: 'PFT' },
//         { key: 'gm', label: 'G/M*' },
//     ];

//     // Summary Modal
//     if (showSummary) {
//         return (
//             <div className="min-h-screen bg-gray-100 p-4">
//                 <div className="max-w-4xl mx-auto">
//                     <div className="card">
//                         <div className="warning-banner mb-6 text-center">
//                             <h2 className="text-xl font-bold">⚠️ กรุณาตรวจสอบความถูกต้อง</h2>
//                             <p className="mt-2 text-lg font-medium text-red-700">หากยืนยันแล้วจะไม่สามารถแก้ไขหรือลบได้</p>
//                         </div>

//                         <div className="mb-6 grid grid-cols-2 gap-4">
//                             <div><strong>HN:</strong> {formData.hn}</div>
//                             <div><strong>AN:</strong> {formData.an || '-'}</div>
//                             <div><strong>ชื่อ:</strong> {formData.patientName}</div>
//                             <div><strong>Ward:</strong> {formData.ward}</div>
//                         </div>

//                         {error && <div className="error-banner mb-6">{error}</div>}

//                         <div className="flex gap-4">
//                             <button onClick={() => setShowSummary(false)} className="btn-secondary flex-1" disabled={submitting}>
//                                 ← กลับแก้ไข
//                             </button>
//                             <button onClick={handleConfirm} disabled={submitting} className="btn-success flex-1">
//                                 {submitting ? 'กำลังบันทึก...' : '✓ ยืนยันบันทึก'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }



//     // Helper to parse current form data into a Date object
//     const getSelectedDate = () => {
//         try {
//             const day = parseInt(formData.formDate);
//             const month = parseInt(formData.formMonth) - 1; // 0-indexed
//             const year = parseInt(formData.formYear) - 543; // Convert Thai year to AD

//             if (day && !isNaN(month) && year) {
//                 const date = new Date(year, month, day);
//                 if (formData.formTime) {
//                     const [hours, minutes] = formData.formTime.split(':');
//                     date.setHours(parseInt(hours) || 0);
//                     date.setMinutes(parseInt(minutes) || 0);
//                 }
//                 return date;
//             }
//         } catch (e) {
//             return new Date();
//         }
//         return new Date();
//     };

//     const handleDateChange = (date: Date | null) => {
//         if (!date) return;
//         setFormData(prev => ({
//             ...prev,
//             formDate: String(date.getDate()),
//             formMonth: String(date.getMonth() + 1),
//             formYear: String(date.getFullYear() + 543),
//             formTime: date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })
//         }));
//     };

//     // Main Form
//     return (
//         <div className="min-h-screen bg-white">
//             {/* Header */}
//             <div className="border-b-2 border-black p-4">
//                 <div className="max-w-7xl mx-auto flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                         <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 print:hidden">
//                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                             </svg>
//                         </Link>
//                         <div className="text-center flex-1">
//                             <h1 className="text-2xl font-bold">รายงานการเตรียมผู้ป่วยก่อนผ่าตัด</h1>
//                             <p className="text-sm">โรงพยาบาลนครพิงค์ | Nakornping Hospital</p>
//                         </div>
//                     </div>
//                     <div className="flex flex-wrap gap-2 items-center text-sm justify-end">
//                         <div className="flex items-center gap-1">
//                             <span>วันที่</span>
//                             <input type="text" value={formData.formDate} onChange={(e) => updateField('formDate', e.target.value)} className="border-b border-black border-dotted w-10 text-center" placeholder="วัน" />
//                             <span>เดือน</span>
//                             <input type="text" value={formData.formMonth} onChange={(e) => updateField('formMonth', e.target.value)} className="border-b border-black border-dotted w-10 text-center" placeholder="เดือน" />
//                             <span>พ.ศ.</span>
//                             <input type="text" value={formData.formYear} onChange={(e) => updateField('formYear', e.target.value)} className="border-b border-black border-dotted w-14 text-center" placeholder="ปี" />
//                             <span className="ml-2">เวลา</span>
//                             <input
//                                 type="text"
//                                 value={formData.formTime}
//                                 onChange={(e) => {
//                                     const val = e.target.value;
//                                     if (/^[0-9:]*$/.test(val) && val.length <= 5) {
//                                         updateField('formTime', val);
//                                     }
//                                 }}
//                                 className="border-b border-black border-dotted w-14 text-center"
//                                 placeholder="00:00"
//                             />
//                         </div>
//                         <div className="print:hidden">
//                             <DatePicker
//                                 selected={getSelectedDate()}
//                                 onChange={handleDateChange}
//                                 showTimeSelect
//                                 locale={th}
//                                 dateFormat="d MMMM yyyy HH:mm"
//                                 timeFormat="HH:mm"
//                                 timeIntervals={15}
//                                 customInput={
//                                     <button className="p-1 text-blue-600 hover:text-blue-800" title="เลือกวันเวลา">
//                                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
//                                             <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
//                                         </svg>
//                                     </button>
//                                 }
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {error && <div className="error-banner m-4">{error}</div>}

//             {/* Main Content */}
//             <div className="max-w-7xl mx-auto p-4">
//                 <div className="flex gap-4">
//                     {/* Left Side - Main Checklist Table */}
//                     <div className="flex-1">
//                         <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
//                             <thead>
//                                 <tr>
//                                     <th className="border border-black p-2 text-left bg-white" rowSpan={2} style={{ width: '40%' }}>WARD</th>
//                                     <th className="border border-black p-2 text-center bg-white" rowSpan={2} style={{ width: '10%' }}>เวลา</th>
//                                     <th className="border border-black p-2 text-center bg-white" rowSpan={2} style={{ width: '10%' }}>ผู้เตรียม</th>
//                                     <th className="border border-black p-1 text-center bg-white" colSpan={2} style={{ width: '10%' }}>OR</th>
//                                     <th className="border border-black p-1 text-center bg-white" colSpan={2} style={{ width: '10%' }}>ANES</th>
//                                     <th className="border border-black p-2 text-center bg-white" rowSpan={2} style={{ width: '15%' }}>หมายเหตุ</th>
//                                 </tr>
//                                 <tr>
//                                     <th className="border border-black p-1 text-center text-xs bg-white">YES</th>
//                                     <th className="border border-black p-1 text-center text-xs bg-white">NO</th>
//                                     <th className="border border-black p-1 text-center text-xs bg-white">YES</th>
//                                     <th className="border border-black p-1 text-center text-xs bg-white">NO</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {/* 1. การเตรียมบริเวณผิวหนัง */}
//                                 <tr>
//                                     <td className="border border-black p-1">
//                                         <div className="font-bold">1. การเตรียมบริเวณผิวหนัง</div>
//                                         <div className="text-sm ml-2 mt-1">1.1 Clean&Shave</div>
//                                         <div className="text-sm ml-2">1.2 ทำความสะอาดผิวหนังด้วย Antiseptic Solution</div>
//                                     </td>
//                                     <td className="border border-black p-1">{renderTimeInput(0)}</td>
//                                     <td className="border border-black p-1"><input type="text" className="w-full outline-none text-center text-sm" /></td>
//                                     <td className="border border-black p-1 text-center">
//                                         <input type="radio" name="or_1" className="w-4 h-4" />
//                                     </td>
//                                     <td className="border border-black p-1 text-center">
//                                         <input type="radio" name="or_1" className="w-4 h-4" />
//                                     </td>
//                                     <td className="border border-black p-1 text-center">
//                                         <input type="radio" name="anes_1" className="w-4 h-4" />
//                                     </td>
//                                     <td className="border border-black p-1 text-center">
//                                         <input type="radio" name="anes_1" className="w-4 h-4" />
//                                     </td>
//                                     <td className="border border-black p-1"><input type="text" className="w-full outline-none text-sm" /></td>
//                                 </tr>

//                                 {/* 2. การทำความสะอาดทั่วไป */}
//                                 <tr>
//                                     <td className="border border-black p-1">
//                                         <div className="font-bold">2. การทำความสะอาดทั่วไป</div>
//                                         <div className="text-sm ml-2 mt-1">2.1 อาบน้ำ/สระผม/แปรงฟัน</div>
//                                         <div className="text-sm ml-2">2.2 ตัดเล็บทำความสะอาดเล็บ</div>
//                                         <div className="text-sm ml-2">2.3 ตัดขนตา/ล้างตา</div>
//                                         <div className="text-sm ml-2">2.4 ล้าง Makeup แล้ว</div>
//                                     </td>
//                                     <td className="border border-black p-1">{renderTimeInput(3)}</td>
//                                     <td className="border border-black p-1"><input type="text" className="w-full outline-none text-center text-sm" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="or_2" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="or_2" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="anes_2" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="anes_2" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1"><input type="text" className="w-full outline-none text-sm" /></td>
//                                 </tr>

//                                 {/* 3. การล้างสวน */}
//                                 <tr>
//                                     <td className="border border-black p-1">
//                                         <div className="font-bold">3. การล้างสวน</div>
//                                         <div className="text-sm ml-2 mt-1">3.1 NG tube</div>
//                                         <div className="text-sm ml-2">3.2 Douche/Bowel prep</div>
//                                         <div className="text-sm ml-2">3.3 Urethral cath</div>
//                                         <div className="text-sm ml-2">3.4 SSE</div>
//                                     </td>
//                                     <td className="border border-black p-1">{renderTimeInput(8)}</td>
//                                     <td className="border border-black p-1"><input type="text" className="w-full outline-none text-center text-sm" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="or_3" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="or_3" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="anes_3" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="anes_3" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1"><input type="text" className="w-full outline-none text-sm" /></td>
//                                 </tr>

//                                 {/* 4. การขับถ่ายปัสสาวะก่อนส่ง OR */}
//                                 <tr>
//                                     <td className="border border-black px-1 py-3">
//                                         <div className="font-bold">4. การขับถ่ายปัสสาวะก่อนส่ง OR</div>
//                                     </td>
//                                     <td className="border border-black p-1">{renderTimeInput(13)}</td>
//                                     <td className="border border-black p-1"><input type="text" className="w-full outline-none text-center text-sm" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="or_4" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="or_4" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="anes_4" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="anes_4" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1"><input type="text" className="w-full outline-none text-sm" /></td>
//                                 </tr>

//                                 {/* 5. Film/CT/US/LAB */}
//                                 <tr>
//                                     <td className="border border-black px-1 py-3">
//                                         <div className="font-bold">5. Film/CT/US/LAB</div>
//                                     </td>
//                                     <td className="border border-black p-1">{renderTimeInput(14)}</td>
//                                     <td className="border border-black p-1"><input type="text" className="w-full outline-none text-center text-sm" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="or_5" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="or_5" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="anes_5" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="anes_5" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1"><input type="text" className="w-full outline-none text-sm" /></td>
//                                 </tr>

//                                 {/* 6. ชุดชั้นในถอดแล้ว */}
//                                 <tr>
//                                     <td className="border border-black px-1 py-3">
//                                         <div className="font-bold">6. ชุดชั้นในถอดแล้ว</div>
//                                     </td>
//                                     <td className="border border-black p-1">{renderTimeInput(15)}</td>
//                                     <td className="border border-black p-1"><input type="text" className="w-full outline-none text-center text-sm" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="or_6" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="or_6" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="anes_6" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="anes_6" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1"><input type="text" className="w-full outline-none text-sm" /></td>
//                                 </tr>

//                                 {/* 7. ของมีค่า/ฟันปลอม */}
//                                 <tr>
//                                     <td className="border border-black p-1">
//                                         <div className="font-bold">7. ของมีค่า/ฟันปลอม</div>
//                                         <div className="text-sm ml-2 mt-1">- ถอดออกแล้ว</div>
//                                         <div className="text-sm ml-2">- ติดแน่นไม่สามารถถอดออกได้</div>
//                                     </td>
//                                     <td className="border border-black p-1">{renderTimeInput(16)}</td>
//                                     <td className="border border-black p-1"><input type="text" className="w-full outline-none text-center text-sm" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="or_7" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="or_7" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="anes_7" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="anes_7" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1"><input type="text" className="w-full outline-none text-sm" /></td>
//                                 </tr>

//                                 {/* 8. ติดป้ายข้อมือ */}
//                                 <tr>
//                                     <td className="border border-black px-1 py-3">
//                                         <div className="font-bold">8. ติดป้ายข้อมือ</div>
//                                     </td>
//                                     <td className="border border-black p-1">{renderTimeInput(19)}</td>
//                                     <td className="border border-black p-1"><input type="text" className="w-full outline-none text-center text-sm" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="or_8" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="or_8" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="anes_8" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1 text-center"><input type="radio" name="anes_8" className="w-4 h-4" /></td>
//                                     <td className="border border-black p-1"><input type="text" className="w-full outline-none text-sm" /></td>
//                                 </tr>

//                                 {/* 9. CONSENT - all content in WARD column */}
//                                 <tr>
//                                     <td className="border border-black p-1">
//                                         <div className="font-bold">9. CONSENT</div>
//                                         <div className="text-xs space-y-1 mt-1">
//                                             <label className="flex items-center gap-1">
//                                                 <input type="checkbox" checked={formData.consent.adult20} onChange={(e) => updateNested('consent', 'adult20', e.target.checked)} className="w-3 h-3" />
//                                                 Adult &gt; 20 ปี
//                                             </label>
//                                             <label className="flex items-center gap-1">
//                                                 <input type="checkbox" checked={formData.consent.married17} onChange={(e) => updateNested('consent', 'married17', e.target.checked)} className="w-3 h-3" />
//                                                 &gt; 17 ปี มีทะเบียนสมรส
//                                             </label>
//                                             <label className="flex items-center gap-1">
//                                                 Child &lt; 20 ปี ผู้ปกครองเซ็น
//                                                 <input type="text" value={formData.consent.child20Guardian} onChange={(e) => updateNested('consent', 'child20Guardian', e.target.value)} className="border-b border-black border-dotted w-24" />
//                                             </label>
//                                             <label className="flex items-center gap-1">
//                                                 <input type="checkbox" checked={formData.consent.withWitness} onChange={(e) => updateNested('consent', 'withWitness', e.target.checked)} className="w-3 h-3" />
//                                                 มีพยานเซ็นรองรับ 2 คน
//                                             </label>
//                                         </div>
//                                     </td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                 </tr>

//                                 {/* 10. NPO - all content in WARD column */}
//                                 <tr>
//                                     <td className="border border-black p-1">
//                                         <div className="font-bold">10. NPO</div>
//                                         <div className="text-xs space-y-1 mt-1">
//                                             <label className="flex items-center gap-1">
//                                                 <input type="checkbox" checked={formData.npo.solid6hr} onChange={(e) => updateNested('npo', 'solid6hr', e.target.checked)} className="w-3 h-3" />
//                                                 อาหาร/นม/ครีมเหลว &gt; 6 ชม.
//                                             </label>
//                                             <label className="flex items-center gap-1">
//                                                 <input type="checkbox" checked={formData.npo.liquid23hr} onChange={(e) => updateNested('npo', 'liquid23hr', e.target.checked)} className="w-3 h-3" />
//                                                 น้ำ/น้ำหวาน &gt; 2-3 ชม.
//                                             </label>
//                                         </div>
//                                     </td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                 </tr>

//                                 {/* 11. IV fluid */}
//                                 <tr>
//                                     <td className="border border-black p-1">
//                                         <div className="font-bold">11. IV fluid</div>
//                                         <div className="text-xs space-y-1 mt-1">
//                                             <label className="flex items-center gap-1">
//                                                 <input type="checkbox" checked={formData.ivFluid.extensionTway} onChange={(e) => updateNested('ivFluid', 'extensionTway', e.target.checked)} className="w-3 h-3" />
//                                                 Extension/T-Way (ถ้ามี)
//                                             </label>
//                                             <label className="flex items-center gap-1">
//                                                 On IV cath No.
//                                                 <input type="text" value={formData.ivFluid.cathNo} onChange={(e) => updateNested('ivFluid', 'cathNo', e.target.value)} className="border-b border-black border-dotted w-20" />
//                                             </label>
//                                         </div>
//                                     </td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                 </tr>

//                                 {/* 12. Premedication */}
//                                 <tr>
//                                     <td className="border border-black p-1">
//                                         <div className="font-bold">12. Premedication/เวลา/(ระบุ)</div>
//                                         <input type="text" value={formData.premedication} onChange={(e) => updateField('premedication', e.target.value)} className="w-full outline-none text-xs border-b border-black border-dotted mt-1" />
//                                         <div className="w-full border-b border-black border-dotted mt-4"></div>
//                                     </td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                 </tr>

//                                 {/* 13. อื่นๆ / ผลการตรวจสอบ OR */}
//                                 <tr>
//                                     <td className="border border-black p-1 align-top">
//                                         <div className="font-bold">13. อื่นๆ</div>
//                                         <input type="text" value={formData.otherNotes} onChange={(e) => updateField('otherNotes', e.target.value)} className="w-full outline-none text-xs border-b border-black border-dotted mt-1" />
//                                     </td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1 align-top" colSpan={5}>
//                                         <div className="font-bold">ผลการตรวจสอบ OR</div>
//                                         <div className="flex gap-4 mt-2 text-sm">
//                                             <label className="flex items-center gap-1 whitespace-nowrap">
//                                                 <input type="checkbox" checked={formData.resultOr.complete} onChange={(e) => updateNested('resultOr', 'complete', e.target.checked)} className="w-4 h-4" />
//                                                 Complete
//                                             </label>
//                                             <label className="flex items-center gap-1 whitespace-nowrap">
//                                                 <input type="checkbox" checked={formData.resultOr.notComplete} onChange={(e) => updateNested('resultOr', 'notComplete', e.target.checked)} className="w-4 h-4" />
//                                                 ไม่ Complete
//                                             </label>
//                                         </div>
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td className="border border-black p-1 text-xs">
//                                         <div className="flex items-center gap-1">
//                                             ผู้ตรวจสอบ <input type="text" className="border-b border-black border-dotted flex-1 min-w-0" />
//                                         </div>
//                                     </td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1"></td>
//                                     <td className="border border-black p-1 text-xs" colSpan={5}>
//                                         <div className="flex items-center gap-1">
//                                             ผู้ตรวจสอบ <input type="text" value={formData.reviewerOr} onChange={(e) => updateField('reviewerOr', e.target.value)} className="border-b border-black border-dotted flex-1" />
//                                         </div>
//                                     </td>
//                                 </tr>
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Right Side - ANES Check list */}
//                     <div className="w-64">
//                         <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
//                             <thead>
//                                 <tr>
//                                     <th className="border border-black p-2 text-left bg-white" colSpan={3}>ANES Check list</th>
//                                 </tr>
//                                 <tr className="text-xs">
//                                     <th className="border border-black p-1 bg-white">รายการ</th>
//                                     <th className="border border-black p-1 bg-white text-center">ทำแล้ว</th>
//                                     <th className="border border-black p-1 bg-white text-center">ทำเพิ่ม</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {labItems.map((item) => (
//                                     <tr key={item.key}>
//                                         <td className="border border-black p-1">{item.label}</td>
//                                         <td className="border border-black p-1 text-center">
//                                             <input type="checkbox" checked={(formData.anesLab as Record<string, Record<string, boolean>>)[item.key]?.done || false} onChange={(e) => updateAnesLab(item.key, 'done', e.target.checked)} className="w-4 h-4" />
//                                         </td>
//                                         <td className="border border-black p-1 text-center">
//                                             <input type="checkbox" checked={(formData.anesLab as Record<string, Record<string, boolean>>)[item.key]?.add || false} onChange={(e) => updateAnesLab(item.key, 'add', e.target.checked)} className="w-4 h-4" />
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>

//                         {/* CONSULT MED */}
//                         <table className="w-full text-sm mt-2" style={{ borderCollapse: 'collapse' }}>
//                             <thead>
//                                 <tr>
//                                     <th className="border border-black p-2 text-left bg-white"><u>การ CONSULT MED</u></th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 <tr>
//                                     <td className="border border-black p-2 text-xs space-y-1">
//                                         <div className="flex items-center gap-4">
//                                             <label className="flex items-center gap-1"><input type="checkbox" checked={formData.consultMed.notNeeded} onChange={(e) => updateNested('consultMed', 'notNeeded', e.target.checked)} className="w-3 h-3" /> ไม่จำเป็น </label>
//                                             <div className="flex items-center gap-1"><input type="checkbox" checked={formData.consultMed.needed} onChange={(e) => updateNested('consultMed', 'needed', e.target.checked)} className="w-3 h-3" /> จำเป็น<input type="text" value={formData.consultMed.neededDetail} onChange={(e) => updateNested('consultMed', 'neededDetail', e.target.value)} className="border-b border-black border-dotted w-16 ml-1" />(ให้ระบุเลือก)</div>
//                                         </div>
//                                         <div className="flex items-center gap-4 ml-[85px]">
//                                             <label className="flex items-center gap-1"><input type="checkbox" checked={formData.consultMed.consulted} onChange={(e) => updateNested('consultMed', 'consulted', e.target.checked)} className="w-3 h-3" /> Consult แล้ว</label>
//                                         </div>
//                                         <div className="ml-[85px] space-y-1">
//                                             <label className="flex items-center gap-1"><input type="checkbox" checked={formData.consultMed.waitingOrder} onChange={(e) => updateNested('consultMed', 'waitingOrder', e.target.checked)} className="w-3 h-3" /> ยังไม่ได้ Consult</label>
//                                             <div className="items-center ml-3">
//                                                 <label className="flex items-center gap-1"><input type="checkbox" checked={formData.consultMed.consultInOr} onChange={(e) => updateNested('consultMed', 'consultInOr', e.target.checked)} className="w-3 h-3" /> แจ้งแพทย์รอคำสั่ง</label>
//                                                 <label className="flex items-center gap-1"><input type="checkbox" checked={formData.consultMed.consultInOr} onChange={(e) => updateNested('consultMed', 'consultInOr', e.target.checked)} className="w-3 h-3" /> Consult ใน OR</label>
//                                                 <label className="flex items-center gap-1"><input type="checkbox" checked={formData.consultMed.cancelCase} onChange={(e) => updateNested('consultMed', 'cancelCase', e.target.checked)} className="w-3 h-3" /> งด Case ไปก่อน</label>
//                                             </div>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             </tbody>
//                         </table>

//                         {/* Condition for Consult */}
//                         <table className="w-full text-sm mt-2 table-fixed" style={{ borderCollapse: 'collapse' }}>
//                             <thead>
//                                 <tr>
//                                     <th className="border border-black p-2 text-left bg-white text-xs w-full"> <u>เลือก Condition for Consult</u></th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 <tr>
//                                     <td className="border border-black p-2 text-xs space-y-1 break-words">
//                                         <label className="flex items-start gap-1"><input type="checkbox" checked={formData.riskConditions.heartDisease} onChange={(e) => updateNested('riskConditions', 'heartDisease', e.target.checked)} className="w-3 h-3 mt-0.5 shrink-0" /> Heart disease</label>
//                                         <label className="flex items-start gap-1"><input type="checkbox" checked={formData.riskConditions.dyspnea} onChange={(e) => updateNested('riskConditions', 'dyspnea', e.target.checked)} className="w-3 h-3 mt-0.5 shrink-0" /> Dyspnea (due to medical condition)</label>
//                                         <label className="flex items-start gap-1"><input type="checkbox" checked={formData.riskConditions.uncontrolledMedical} onChange={(e) => updateNested('riskConditions', 'uncontrolledMedical', e.target.checked)} className="w-3 h-3 mt-0.5 shrink-0" /> Uncontrolled medical disease</label>
//                                         <label className="flex items-start gap-1"><input type="checkbox" checked={formData.riskConditions.multipleComplex} onChange={(e) => updateNested('riskConditions', 'multipleComplex', e.target.checked)} className="w-3 h-3 mt-0.5 shrink-0" /> Multiple, complex, severe medical disease</label>
//                                         <label className="flex items-start gap-1"><input type="checkbox" checked={formData.riskConditions.renalCase} onChange={(e) => updateNested('riskConditions', 'renalCase', e.target.checked)} className="w-3 h-3 mt-0.5 shrink-0" /> Anuria, ARF, CRF (prerenal, renal, case)</label>
//                                         <div className="ml-4 mt-1">
//                                             <label className="flex flex-wrap items-center gap-1">with complication <input type="checkbox" checked={formData.riskConditions.hasOther} onChange={(e) => updateNested('riskConditions', 'hasOther', e.target.checked)} className="w-3 h-3 shrink-0" />อื่นๆ</label>
//                                             <input type="text" value={formData.riskConditions.otherDetail} onChange={(e) => updateNested('riskConditions', 'otherDetail', e.target.value)} className="w-full border-b border-black border-dotted outline-none mt-1" />
//                                         </div>
//                                     </td>
//                                 </tr>
//                             </tbody>
//                         </table>

//                         {/* ANES Result */}
//                         <table className="w-full text-sm mt-2" style={{ borderCollapse: 'collapse' }}>
//                             <thead>
//                                 <tr>
//                                     <th className="border border-black p-2 text-left bg-white text-xs"><u>ผลการตรวจสอบ (ANES)</u></th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 <tr>
//                                     <td className="border border-black p-2 text-xs space-y-2 h-[85px] align-top">
//                                         <label className="flex items-center gap-1"><input type="checkbox" checked={formData.anesResult.completeAll} onChange={(e) => updateNested('anesResult', 'completeAll', e.target.checked)} className="w-3 h-3" /> Complete all</label>
//                                         <div className="flex flex-col gap-1">
//                                             <label className="flex items-center gap-1"><input type="checkbox" checked={formData.anesResult.completeAccept} onChange={(e) => updateNested('anesResult', 'completeAccept', e.target.checked)} className="w-3 h-3" /> Complete accept (Lab,G/M,Consult med</label>
//                                             <div className="ml-5">ครบถ้วน อื่นๆยังไม่ครบถ้วน)</div>
//                                         </div>
//                                         <div className="flex items-center gap-4">
//                                             <label className="flex items-center gap-1"><input type="checkbox" checked={formData.anesResult.noComplete} onChange={(e) => updateNested('anesResult', 'noComplete', e.target.checked)} className="w-3 h-3" /> No complete</label>
//                                             <label className="flex items-center gap-1"><input type="checkbox" checked={formData.anesResult.acceptOr} onChange={(e) => updateNested('anesResult', 'acceptOr', e.target.checked)} className="w-3 h-3" /> Accept OR</label>
//                                             <label className="flex items-center gap-1"><input type="checkbox" checked={formData.anesResult.cancelCase} onChange={(e) => updateNested('anesResult', 'cancelCase', e.target.checked)} className="w-3 h-3" /> งด Case</label>
//                                         </div>
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td className="border border-black p-2 text-xs">
//                                         <div className="flex items-center gap-2">
//                                             ผู้ตรวจสอบ <input type="text" value={formData.anesResult.checkedBy} onChange={(e) => updateNested('anesResult', 'checkedBy', e.target.value)} className="border-b border-black border-dotted flex-1 border-dotted" />
//                                         </div>
//                                     </td>
//                                 </tr>
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>

//                 {/* Patient Info Footer */}
//                 <div className="border-2 border-black mt-4 p-3">
//                     <div className="grid grid-cols-6 gap-2 text-sm">
//                         <div>
//                             <span className="text-gray-500 text-xs">Name</span>
//                             <input type="text" value={formData.patientName} onChange={(e) => updateField('patientName', e.target.value)} className="w-full border-b border-black border-dotted font-medium outline-none" placeholder="ชื่อ-นามสกุล" />
//                         </div>
//                         <div>
//                             <span className="text-gray-500 text-xs">Sex</span>
//                             <input type="text" value={formData.sex} onChange={(e) => updateField('sex', e.target.value)} className="w-full border-b border-black border-dotted outline-none" placeholder="เพศ" />
//                         </div>
//                         <div>
//                             <span className="text-gray-500 text-xs">Age</span>
//                             <input type="text" value={formData.age} onChange={(e) => updateField('age', e.target.value)} className="w-full border-b border-black border-dotted outline-none" placeholder="อายุ" />
//                         </div>
//                         <div>
//                             <span className="text-gray-500 text-xs">DOB</span>
//                             <input type="text" value={formData.dob} onChange={(e) => updateField('dob', e.target.value)} className="w-full border-b border-black border-dotted outline-none" placeholder="วันเกิด" />
//                         </div>
//                         <div>
//                             <span className="text-gray-500 text-xs">HN</span>
//                             <input type="text" value={formData.hn} onChange={(e) => updateField('hn', e.target.value)} className="w-full border-b border-black border-dotted font-medium text-blue-600 outline-none" placeholder="HN" />
//                         </div>
//                         <div>
//                             <span className="text-gray-500 text-xs">AN</span>
//                             <input type="text" value={formData.an} onChange={(e) => updateField('an', e.target.value)} className="w-full border-b border-black border-dotted outline-none" placeholder="AN" />
//                         </div>
//                     </div>
//                     <div className="grid grid-cols-6 gap-2 text-sm mt-2">
//                         <div>
//                             <span className="text-gray-500 text-xs">Department</span>
//                             <input type="text" value={formData.department} onChange={(e) => updateField('department', e.target.value)} className="w-full border-b border-black border-dotted outline-none" />
//                         </div>
//                         <div>
//                             <span className="text-gray-500 text-xs">Right ข้างที่เจาะ</span>
//                             <input type="text" value={formData.rightSide} onChange={(e) => updateField('rightSide', e.target.value)} className="w-full border-b border-black border-dotted outline-none" />
//                         </div>
//                         <div>
//                             <span className="text-gray-500 text-xs">Weight</span>
//                             <input type="text" value={formData.weight} onChange={(e) => updateField('weight', e.target.value)} className="w-full border-b border-black border-dotted outline-none" />
//                         </div>
//                         <div>
//                             <span className="text-gray-500 text-xs">Ward หอผู้ป่วย</span>
//                             <input type="text" value={formData.ward} onChange={(e) => updateField('ward', e.target.value)} className="w-full border-b border-black border-dotted outline-none" />
//                         </div>
//                         <div>
//                             <span className="text-gray-500 text-xs">Bed</span>
//                             <input type="text" value={formData.bed} onChange={(e) => updateField('bed', e.target.value)} className="w-full border-b border-black border-dotted outline-none" />
//                         </div>
//                         <div>
//                             <span className="text-gray-500 text-xs">แพ้ยา</span>
//                             <input type="text" value={formData.allergy} onChange={(e) => updateField('allergy', e.target.value)} className="w-full border-b border-black border-dotted text-red-600 outline-none" />
//                         </div>
//                     </div>
//                     <div className="mt-2 text-sm">
//                         <span className="text-gray-500 text-xs">Attending Physician</span>
//                         <input type="text" value={formData.attendingPhysician} onChange={(e) => updateField('attendingPhysician', e.target.value)} className="w-full border-b border-black border-dotted outline-none" />
//                     </div>
//                 </div>

//                 {/* Submit Button */}
//                 <div className="flex justify-center mt-6 mb-8 print:hidden">
//                     <button onClick={handleReview} className="btn-success text-lg px-12 py-4">
//                         ✓ ตรวจสอบและบันทึกข้อมูล
//                     </button>
//                 </div>

//                 <div className="text-sm text-gray-500 text-center print:hidden">
//                     FR-NKP-034 | {user?.fullName}
//                 </div>
//             </div>
//         </div>
//     );
// }
