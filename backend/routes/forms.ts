import { Hono } from 'hono';
import { eq, like } from 'drizzle-orm';
import { preopForms } from '../db/schema';
import { generateId } from '../lib/password';
import { authMiddleware } from '../middleware/auth';
import type { Env, Variables } from '../index';

const formRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// All routes require authentication
formRoutes.use('*', authMiddleware);

// POST /api/forms - Submit new form (IMMUTABLE - no edit after save)
formRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const db = c.get('db');
    const currentUser = c.get('user');
    
    // Required fields validation
    const requiredFields = ['formDate', 'formTime', 'ward', 'hn', 'patientName'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return c.json({ 
          success: false, 
          message: `กรุณากรอก ${field}`,
          error: `Missing required field: ${field}` 
        }, 400);
      }
    }
    
    const now = new Date().toISOString();
    const formId = generateId();
    
    // Generate QR code data (simple version - just the form ID and HN)
    const qrCodeData = JSON.stringify({
      formId,
      hn: body.hn,
      an: body.an || null,
      createdAt: now,
    });
    
    await db.insert(preopForms).values({
      id: formId,
      
      // Header
      formDate: body.formDate,
      formTime: body.formTime,
      
      // Table header
      ward: body.ward,
      timeField: body.timeField || null,
      preparer: body.preparer || null,
      
      // Patient info (QA footer)
      hn: body.hn,
      an: body.an || null,
      patientName: body.patientName,
      sex: body.sex || null,
      age: body.age || null,
      dob: body.dob || null,
      department: body.department || null,
      weight: body.weight || null,
      rightSide: body.rightSide || null,
      allergy: body.allergy || null,
      attendingPhysician: body.attendingPhysician || null,
      bed: body.bed || null,
      
      // Checklists (JSON strings)
      orChecklist: body.orChecklist ? JSON.stringify(body.orChecklist) : null,
      anesChecklist: body.anesChecklist ? JSON.stringify(body.anesChecklist) : null,
      anesLab: body.anesLab ? JSON.stringify(body.anesLab) : null,
      consultMed: body.consultMed ? JSON.stringify(body.consultMed) : null,
      riskConditions: body.riskConditions ? JSON.stringify(body.riskConditions) : null,
      consentData: body.consentData ? JSON.stringify(body.consentData) : null,
      npoData: body.npoData ? JSON.stringify(body.npoData) : null,
      ivData: body.ivData ? JSON.stringify(body.ivData) : null,
      premedication: body.premedication || null,
      otherNotes: body.otherNotes || null,
      resultOr: body.resultOr ? JSON.stringify(body.resultOr) : null,
      resultAnes: body.resultAnes ? JSON.stringify(body.resultAnes) : null,
      
      // QR Code
      qrCodeData,
      
      // Metadata
      createdAt: now,
      createdBy: currentUser?.id || 'unknown',
    });
    
    return c.json({
      success: true,
      message: 'บันทึกข้อมูลสำเร็จ ข้อมูลนี้ไม่สามารถแก้ไขหรือลบได้อีกแล้ว',
      data: {
        formId,
        hn: body.hn,
        patientName: body.patientName,
        createdAt: now,
      }
    }, 201);
  } catch (error) {
    console.error('Submit form error:', error);
    return c.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
      error: 'Internal server error' 
    }, 500);
  }
});

// GET /api/forms/search?hn=xxx - Search by HN
formRoutes.get('/search', async (c) => {
  try {
    const hn = c.req.query('hn');
    
    if (!hn) {
      return c.json({ 
        success: false, 
        message: 'กรุณาระบุ HN เพื่อค้นหา',
        error: 'Please provide HN parameter for search' 
      }, 400);
    }
    
    const db = c.get('db');
    
    const results = await db
      .select({
        id: preopForms.id,
        hn: preopForms.hn,
        an: preopForms.an,
        patientName: preopForms.patientName,
        ward: preopForms.ward,
        formDate: preopForms.formDate,
        formTime: preopForms.formTime,
        createdAt: preopForms.createdAt,
      })
      .from(preopForms)
      .where(like(preopForms.hn, `%${hn}%`))
      .all();
    
    return c.json({
      success: true,
      message: results.length > 0 ? `พบ ${results.length} รายการ` : 'ไม่พบข้อมูล',
      data: {
        count: results.length,
        results,
      }
    });
  } catch (error) {
    console.error('Search form error:', error);
    return c.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการค้นหา',
      error: 'Internal server error' 
    }, 500);
  }
});

// GET /api/forms/:id - View form detail (READ-ONLY)
formRoutes.get('/:id', async (c) => {
  try {
    const formId = c.req.param('id');
    const db = c.get('db');
    
    const form = await db.select().from(preopForms).where(eq(preopForms.id, formId)).get();
    
    if (!form) {
      return c.json({ 
        success: false, 
        message: 'ไม่พบข้อมูลฟอร์ม',
        error: 'Form not found' 
      }, 404);
    }
    
    // Parse JSON fields
    const formData = {
      ...form,
      orChecklist: form.orChecklist ? JSON.parse(form.orChecklist) : null,
      anesChecklist: form.anesChecklist ? JSON.parse(form.anesChecklist) : null,
      anesLab: form.anesLab ? JSON.parse(form.anesLab) : null,
      consultMed: form.consultMed ? JSON.parse(form.consultMed) : null,
      riskConditions: form.riskConditions ? JSON.parse(form.riskConditions) : null,
      consentData: form.consentData ? JSON.parse(form.consentData) : null,
      npoData: form.npoData ? JSON.parse(form.npoData) : null,
      ivData: form.ivData ? JSON.parse(form.ivData) : null,
      resultOr: form.resultOr ? JSON.parse(form.resultOr) : null,
      resultAnes: form.resultAnes ? JSON.parse(form.resultAnes) : null,
      qrCodeData: form.qrCodeData ? JSON.parse(form.qrCodeData) : null,
    };
    
    return c.json({
      success: true,
      message: 'ดึงข้อมูลสำเร็จ (อ่านอย่างเดียว)',
      data: {
        form: formData,
        readonly: true
      }
    });
  } catch (error) {
    console.error('Get form error:', error);
    return c.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล',
      error: 'Internal server error' 
    }, 500);
  }
});

// GET /api/forms - List all forms (with pagination)
formRoutes.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;
    
    const db = c.get('db');
    
    const forms = await db
      .select({
        id: preopForms.id,
        hn: preopForms.hn,
        an: preopForms.an,
        patientName: preopForms.patientName,
        ward: preopForms.ward,
        formDate: preopForms.formDate,
        formTime: preopForms.formTime,
        createdAt: preopForms.createdAt,
        // Fetch fields for status calculation
        resultOr: preopForms.resultOr,
        anesLab: preopForms.anesLab,
        attendingPhysician: preopForms.attendingPhysician,
        preparer: preopForms.preparer,
      })
      .from(preopForms)
      .limit(limit)
      .offset(offset)
      .all();

    // Calculate Status for each form
    const formsWithStatus = forms.map(form => {
        let status: 'green' | 'yellow' | 'red' = 'red';
        let statusMessage = '';

        try {
            const resultOr = form.resultOr ? JSON.parse(form.resultOr) : {};
            const anesLab = form.anesLab ? JSON.parse(form.anesLab) : {};

            if (resultOr.complete) {
                status = 'green';
                statusMessage = `ผู้เตรียม: ${form.preparer || 'พยาบาล'}`;
            } else {
                // Logic for Yellow
                const isLabIncomplete = (!anesLab.labCbc && !anesLab.labUa && !anesLab.labElectrolyte && !anesLab.labPtPtt && !anesLab.labOther); 
                // Or simplified: if user hasn't checked *any* major lab? Or specific ones? 
                // Let's assume if *all* major labs are unchecked, it might be waiting for lab?
                // Or maybe if some are checked but not all?
                // User said: "รอผลตรวจเลือดอยู่" implies we know they are waiting.
                // Let's stick to simple logic: If Result is NOT complete:
                
                if (!form.attendingPhysician) {
                    status = 'yellow';
                    statusMessage = 'รอรายงานแพทย์';
                } else if (resultOr.notComplete) {
                   status = 'yellow';
                   statusMessage = 'ยังไม่พร้อม (ตรวจสอบแล้ว)';
                } else {
                    // Default Red (Not started / In progress but vague)
                    status = 'red';
                }
            }
        } catch (e) {
            console.error('Error parsing form data for status:', e);
            status = 'red';
        }

        return {
            ...form,
            status,
            statusMessage,
            // Remove raw JSON strings to save bandwidth if not needed, 
            // but Frontend might not need them anyway. Keep them or omit?
            // Let's keep specific fields clean.
            resultOr: undefined,
            anesLab: undefined
        };
    });
    
    return c.json({
      success: true,
      message: `แสดงหน้าที่ ${page}`,
      data: {
        page,
        limit,
        count: forms.length,
        forms: formsWithStatus,
      }
    });
  } catch (error) {
    console.error('List forms error:', error);
    return c.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการดึงรายการ',
      error: 'Internal server error' 
    }, 500);
  }
});

// PUT /api/forms/:id - Update form (Allow editing if needed)
formRoutes.put('/:id', async (c) => {
  try {
    const formId = c.req.param('id');
    const body = await c.req.json();
    const db = c.get('db');
    // const currentUser = c.get('user'); // If we want to track who updated

    // Check if form exists
    const existingForm = await db.select().from(preopForms).where(eq(preopForms.id, formId)).get();
    if (!existingForm) {
      return c.json({ success: false, message: 'ไม่พบข้อมูลฟอร์ม' }, 404);
    }

    // Prepare update data (Similar to POST but updating)
    // We update fields that are present in the body
    const updateData: any = {
      // Header
      formDate: body.formDate,
      formTime: body.formTime,
      ward: body.ward,
      
      // Patient Info
      hn: body.hn,
      an: body.an || null,
      patientName: body.patientName,
      sex: body.sex || null,
      age: body.age || null,
      dob: body.dob || null,
      department: body.department || null,
      weight: body.weight || null,
      rightSide: body.rightSide || null,
      allergy: body.allergy || null,
      attendingPhysician: body.attendingPhysician || null,
      bed: body.bed || null,

      // JSON Fields
      orChecklist: body.orChecklist ? JSON.stringify(body.orChecklist) : null,
      anesChecklist: body.anesChecklist ? JSON.stringify(body.anesChecklist) : null,
      anesLab: body.anesLab ? JSON.stringify(body.anesLab) : null,
      consultMed: body.consultMed ? JSON.stringify(body.consultMed) : null,
      riskConditions: body.riskConditions ? JSON.stringify(body.riskConditions) : null,
      consentData: body.consentData ? JSON.stringify(body.consentData) : null,
      npoData: body.npoData ? JSON.stringify(body.npoData) : null,
      ivData: body.ivData ? JSON.stringify(body.ivData) : null,
      premedication: body.premedication || null,
      otherNotes: body.otherNotes || null,
      resultOr: body.resultOr ? JSON.stringify(body.resultOr) : null,
      resultAnes: body.resultAnes ? JSON.stringify(body.resultAnes) : null,
    };

    await db.update(preopForms).set(updateData).where(eq(preopForms.id, formId));

    return c.json({
      success: true,
      message: 'อัปเดตข้อมูลเรียบร้อย',
      data: { formId }
    });

  } catch (error) {
    console.error('Update form error:', error);
    return c.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล',
      error: 'Internal server error' 
    }, 500);
  }
});

// NOTE: DELETE endpoint - still not implemented unless requested

export default formRoutes;
