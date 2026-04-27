import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import {
  getFormDetail,
  listForms,
  markSurgeryCompleted,
  searchForms,
  submitForm,
  updateForm
} from '../services/formService';
import type { Env, Variables } from '../types/app';
import type { FormSubmissionPayload } from '../types/forms';

const formRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

formRoutes.use('*', authMiddleware);

formRoutes.post('/', async (c) => {
  const body = await c.req.json<FormSubmissionPayload>();
  const data = await submitForm(c.get('db'), c.get('user'), body);
  return c.json(
    {
      success: true,
      message: 'บันทึกข้อมูลสำเร็จ ข้อมูลนี้ไม่สามารถแก้ไขหรือลบได้อีกแล้ว',
      data
    },
    201
  );
});

formRoutes.get('/search', async (c) => {
  const data = await searchForms(c.get('db'), c.get('user'), c.req.query('hn') || '');
  return c.json({
    success: true,
    message: data.count > 0 ? `พบ ${data.count} รายการ` : 'ไม่พบข้อมูล',
    data
  });
});

formRoutes.get('/:id', async (c) => {
  const form = await getFormDetail(c.get('db'), c.req.param('id'));
  return c.json({
    success: true,
    message: 'ดึงข้อมูลสำเร็จ (อ่านอย่างเดียว)',
    data: {
      form,
      readonly: true
    }
  });
});

formRoutes.get('/', async (c) => {
  const data = await listForms(c.get('db'), c.get('user'), {
    page: parseInt(c.req.query('page') || '1'),
    limit: parseInt(c.req.query('limit') || '20'),
    startDate: c.req.query('startDate'),
    endDate: c.req.query('endDate')
  });

  return c.json({
    success: true,
    message: `แสดงหน้าที่ ${data.page}`,
    data
  });
});

formRoutes.put('/:id', async (c) => {
  const body = await c.req.json<FormSubmissionPayload>();
  const data = await updateForm(c.get('db'), c.get('user'), c.req.param('id'), body);
  return c.json({
    success: true,
    message: 'อัปเดตข้อมูลเรียบร้อย',
    data
  });
});

formRoutes.patch('/:id/surgery-completed', async (c) => {
  const data = await markSurgeryCompleted(c.get('db'), c.get('user'), c.req.param('id'));
  return c.json({
    success: true,
    message: 'ทำเครื่องหมายผ่าตัดแล้วเรียบร้อย',
    data
  });
});

export default formRoutes;
