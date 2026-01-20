import { Hono } from 'hono';
import { eq, like, desc, and, gte, lte, sql } from 'drizzle-orm';
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
        // Fetch fields for status calculation
        resultOr: preopForms.resultOr,
        anesLab: preopForms.anesLab,
        attendingPhysician: preopForms.attendingPhysician,
        preparer: preopForms.preparer,
        orChecklist: preopForms.orChecklist,
        consentData: preopForms.consentData,
        npoData: preopForms.npoData,
      })
      .from(preopForms)
      .where(like(preopForms.hn, `%${hn}%`))
      .all();
    
    // Calculate Status for each result (Same logic as list endpoint)
    const resultsWithStatus = results.map(form => {
        let status: 'green' | 'yellow' | 'red' = 'red';
        let statusMessage = '';
        const pendingItems: string[] = [];

        try {
            const resultOr = form.resultOr ? JSON.parse(form.resultOr) : {};
            const orChecklist = form.orChecklist ? JSON.parse(form.orChecklist) : {};
            const anesLab = form.anesLab ? JSON.parse(form.anesLab) : {};
            const consentData = form.consentData ? JSON.parse(form.consentData) : {};
            const npoData = form.npoData ? JSON.parse(form.npoData) : {};

            // Check if checklist has ANY activity
            const hasChecklistActivity = Object.keys(orChecklist).some(key => {
                const row = orChecklist[key];
                return row && (row.yes === true || row.no === true || (row.time && row.time.length > 0));
            });

            // Check what's still pending
            const hasConsent = orChecklist.row8?.yes === true;
            const hasNPO = npoData.npoSolid === true || npoData.npoLiquid === true || orChecklist.row9?.yes === true;
            const hasLab = anesLab.labCbc || anesLab.labUa || anesLab.labElectrolyte || anesLab.labPtPtt || orChecklist.row11?.yes === true;

            if (!hasConsent && hasChecklistActivity) pendingItems.push('Consent');
            if (!hasNPO && hasChecklistActivity) pendingItems.push('NPO');
            if (!hasLab && hasChecklistActivity) pendingItems.push('Lab');
            if (!form.attendingPhysician && hasChecklistActivity) pendingItems.push('แพทย์');

            // Determine status
            if (resultOr.complete === true) {
                status = 'green';
                statusMessage = `พร้อมผ่าตัด`;
            } else if (hasChecklistActivity) {
                status = 'yellow';
                if (resultOr.notComplete === true) {
                    statusMessage = 'ยังไม่พร้อม (ตรวจสอบแล้ว)';
                } else if (pendingItems.length > 0) {
                    statusMessage = `รอ ${pendingItems.slice(0, 3).join(', ')}`;
                } else {
                    statusMessage = 'กำลังดำเนินการ';
                }
            } else {
                status = 'red';
                statusMessage = 'ยังไม่เริ่มต้น';
            }
        } catch (e) {
            console.error('Error parsing form data for status:', e);
            status = 'red';
            statusMessage = 'ข้อผิดพลาด';
        }

        return {
            ...form,
            status,
            statusMessage
        };
    });

    return c.json({
      success: true,
      message: resultsWithStatus.length > 0 ? `พบ ${resultsWithStatus.length} รายการ` : 'ไม่พบข้อมูล',
      data: {
        count: resultsWithStatus.length,
        results: resultsWithStatus,
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

// GET /api/forms - List all forms (with pagination and date range filter)
formRoutes.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const startDate = c.req.query('startDate'); // Format: YYYY-MM-DD
    const endDate = c.req.query('endDate'); // Format: YYYY-MM-DD
    const offset = (page - 1) * limit;
    
    const db = c.get('db');
    
    // Build date filter condition (optional - if no dates, show all)
    let whereCondition = undefined;
    if (startDate && endDate) {
      // Filter by date range
      const startOfDay = `${startDate}T00:00:00.000Z`;
      const endOfDay = `${endDate}T23:59:59.999Z`;
      whereCondition = and(
        gte(preopForms.createdAt, startOfDay),
        lte(preopForms.createdAt, endOfDay)
      );
    } else if (startDate) {
      // Only start date provided
      const startOfDay = `${startDate}T00:00:00.000Z`;
      whereCondition = gte(preopForms.createdAt, startOfDay);
    } else if (endDate) {
      // Only end date provided
      const endOfDay = `${endDate}T23:59:59.999Z`;
      whereCondition = lte(preopForms.createdAt, endOfDay);
    }
    // If no dates provided, whereCondition stays undefined = show all
    
    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(preopForms)
      .where(whereCondition)
      .get();
    const totalCount = countResult?.count || 0;
    
    // Get paginated forms
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
        orChecklist: preopForms.orChecklist,
        consentData: preopForms.consentData,
        npoData: preopForms.npoData,
      })
      .from(preopForms)
      .where(whereCondition)
      .orderBy(desc(preopForms.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    // Calculate Status for each form
    // 🔴 RED = Only header filled (Name, HN, Bed) but checklist not started
    // 🟡 YELLOW = Checklist in progress, but not complete yet (show what's pending)
    // 🟢 GREEN = Complete and ready for surgery
    const formsWithStatus = forms.map(form => {
        let status: 'green' | 'yellow' | 'red' = 'red';
        let statusMessage = '';
        const pendingItems: string[] = [];

        try {
            const resultOr = form.resultOr ? JSON.parse(form.resultOr) : {};
            const orChecklist = form.orChecklist ? JSON.parse(form.orChecklist) : {};
            const anesLab = form.anesLab ? JSON.parse(form.anesLab) : {};
            const consentData = form.consentData ? JSON.parse(form.consentData) : {};
            const npoData = form.npoData ? JSON.parse(form.npoData) : {};

            // Check if checklist has ANY activity (Yes/No selected or Time filled)
            const hasChecklistActivity = Object.keys(orChecklist).some(key => {
                const row = orChecklist[key];
                return row && (row.yes === true || row.no === true || (row.time && row.time.length > 0));
            });

            // Check what's still pending
            const hasConsent = orChecklist.row8?.yes === true;
            const hasNPO = npoData.npoSolid === true || npoData.npoLiquid === true || orChecklist.row9?.yes === true;
            const hasLab = anesLab.labCbc || anesLab.labUa || anesLab.labElectrolyte || anesLab.labPtPtt || orChecklist.row11?.yes === true;
            const hasPrep = orChecklist.row1?.yes === true || orChecklist.row2?.yes === true;

            // Build pending items list
            if (!hasConsent && hasChecklistActivity) pendingItems.push('Consent');
            if (!hasNPO && hasChecklistActivity) pendingItems.push('NPO');
            if (!hasLab && hasChecklistActivity) pendingItems.push('Lab');
            if (!form.attendingPhysician && hasChecklistActivity) pendingItems.push('แพทย์');

            // Determine status
            if (resultOr.complete === true) {
                // 🟢 GREEN: Complete
                status = 'green';
                statusMessage = `พร้อมผ่าตัด`;
            } else if (hasChecklistActivity) {
                // 🟡 YELLOW: In progress
                status = 'yellow';
                if (resultOr.notComplete === true) {
                    statusMessage = 'ยังไม่พร้อม (ตรวจสอบแล้ว)';
                } else if (pendingItems.length > 0) {
                    statusMessage = `รอ ${pendingItems.slice(0, 3).join(', ')}`;
                } else {
                    statusMessage = 'กำลังดำเนินการ';
                }
            } else {
                // 🔴 RED: Not started (only header filled)
                status = 'red';
                statusMessage = 'ยังไม่เริ่มต้น';
            }
        } catch (e) {
            console.error('Error parsing form data for status:', e);
            status = 'red';
            statusMessage = 'ข้อผิดพลาด';
        }

        return {
            ...form,
            status,
            statusMessage,
            resultOr: undefined,
            anesLab: undefined,
            orChecklist: undefined,
            consentData: undefined,
            npoData: undefined
        };
    });
    
    return c.json({
      success: true,
      message: `แสดงหน้าที่ ${page}`,
      data: {
        page,
        limit,
        totalCount,
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
