# System Context

เอกสารนี้เป็น context กลางของระบบ `Form_hospital` เพื่อใช้เป็นจุดอ้างอิงเดียวเวลาพัฒนา, อธิบายระบบ, รีวิวโค้ด, หรือรับช่วงงานต่อ

## 1. เป้าหมายของระบบ

ระบบนี้คือระบบบันทึกและติดตาม `pre-operative checklist` สำหรับผู้ป่วยก่อนเข้าห้องผ่าตัด

ผู้ใช้หลักคือพยาบาลใน workflow ก่อนผ่าตัด

หน้าที่ของระบบคือ:

- เก็บข้อมูลผู้ป่วยและข้อมูลเตรียมก่อนผ่าตัด
- ให้หลายคนช่วยกันทำงานในฟอร์มเดียวกันได้
- ติดตามว่าสถานะผู้ป่วยรายนั้นพร้อมผ่าตัดหรือยัง
- แยกเคสที่ยังต้องติดตามออกจากเคสที่ผ่าตัดแล้ว

## 2. Requirement จริงที่ต้องยึด

ส่วนนี้สำคัญมาก และต้องถือเป็น source of truth มากกว่าการตีความจากโค้ดอย่างเดียว

- ระบบปัจจุบันถือว่าใกล้ requirement สมบูรณ์แล้วจากการคุยกับพี่พยาบาลหลายรอบ
- อย่าปรับระบบตาม ideal engineering อย่างเดียว ถ้า requirement จริงไม่ได้ขอ
- การเปิดให้ผู้ใช้แก้ฟอร์มเดิมได้ เป็น requirement จริงจากหน้างาน แม้เชิงระบบจะดูเสี่ยงกว่า immutable record
- หลายคนสามารถช่วยกันแก้ฟอร์มเดียวกันได้
- แนวคิดไม่ใช่ `owner ของฟอร์มคนเดียวแก้ได้`
- แนวคิดจริงคือ `หลายคนช่วยกันทำได้ แต่ไม่ควรไปแก้ส่วนของผู้อื่นแบบมั่ว`
- `Complete` กับ `Confirm surgery completed` เป็นคนละขั้นตอน
- เคสที่ผ่าตัดแล้วต้องถูกนำออกจากมุมมองของ user ปกติ เพื่อลดการรบกวนเคสที่ยังต้องตาม

## 3. ลำดับการใช้งานของระบบ

### 3.1 Login

- ผู้ใช้ล็อกอินผ่านหน้า `frontend/src/pages/Login.tsx`
- frontend เรียก `POST /api/auth/login`
- backend ตรวจ auth แล้วคืน `token` และ `refreshToken`

### 3.2 Dashboard / Search

- ผู้ใช้ดูรายการฟอร์มผ่าน `Dashboard`
- ค้นหาผู้ป่วยด้วย `HN` ผ่าน `Search`
- backend คำนวณสถานะฟอร์มเพื่อแสดงผล เช่น red / yellow / green

### 3.3 สร้างฟอร์มใหม่

- ใช้หน้า `FormNew`
- กรอกข้อมูลผู้ป่วยและ checklist
- กดบันทึกเพื่อสร้าง form ใหม่ในระบบ

### 3.4 เปิดฟอร์มเดิมและทำต่อ

- ใช้หน้า `FormView`
- โหลดข้อมูลเดิมจาก backend
- แสดง state ล่าสุดของฟอร์ม
- ผู้ใช้กลับมาทำงานต่อจากข้อมูลเดิมได้

### 3.5 ประเมินความพร้อม

- section ท้ายฟอร์มมี `Complete` / `ไม่ Complete`
- `Complete` หมายถึงพร้อมผ่าตัดในเชิง checklist

### 3.6 Confirm surgery completed

- หลังผ่าตัดจริงหรือจบ workflow แล้ว จะมีการ mark `surgery completed`
- เมื่อ mark แล้ว เคสนั้นจะไม่แสดงในรายการของ user ปกติ

## 4. RBAC และการจัดการผู้ใช้

ระบบนี้มี RBAC แบบพื้นฐาน

- `admin`
  - สร้าง user ได้
  - ลบ user ได้
  - เข้าหน้าจัดการผู้ใช้ได้
- `user`
  - ใช้งานฟอร์มตาม workflow ปกติ
  - ไม่มีสิทธิ์จัดการ user อื่น

ข้อเท็จจริงสำคัญ:

- ไม่มีระบบ self-registration
- user ทุกคนต้องถูกสร้างโดย admin ก่อน
- login ได้ก็ต่อเมื่อมี account อยู่ในระบบแล้ว

## 5. โครงสร้างระบบปัจจุบัน

### 5.1 Backend

ปัจจุบัน backend แยกชั้นแล้วประมาณนี้:

- `types`
- `services`
- `routes`
- `server`

โครงหลัก:

- `backend/types`
- `backend/services`
- `backend/routes`
- `backend/server`
- `backend/db/schema.ts`

แนวคิด:

- `types` กำหนด shape/context
- `services` ถือ business logic
- `routes` รับ request/response
- `server` ประกอบ app และ middleware

ข้อเท็จจริงสำคัญของโปรเจกต์นี้:

- backend ใช้ `Cloudflare Workers + Cloudflare D1`
- D1 ไม่ได้สร้าง table จากโค้ดให้เองอัตโนมัติ
- ถ้ามี feature ใหม่ที่ต้องใช้ table ใหม่ ต้อง `apply migration` หรือสร้าง schema ใน D1 ก่อน
- ถ้า route หรือ service ใหม่ query table ที่ยังไม่ได้ถูกสร้างใน D1 จะพังที่ backend ทันที
- อย่าสรุปว่า “โค้ดมีแล้วก็ใช้ได้เลย” ถ้ายังไม่ได้ push schema/table ขึ้น DB จริง

### 5.2 Frontend

frontend ยังใช้โครงที่ค่อนข้างเหมาะสมกับ React app และยังไม่ควรรื้อใหญ่

โครงหลัก:

- `frontend/src/pages`
- `frontend/src/components`
- `frontend/src/hooks`
- `frontend/src/services`
- `frontend/src/lib`
- `frontend/src/types`
- `frontend/src/utils`

แนวคิด:

- `pages` คุม flow ของแต่ละหน้า
- `components` เป็น UI ย่อย
- `hooks` ถือ state/interaction logic
- `services` ทำ mapping และ logic คุยข้อมูล
- `lib/api.ts` เป็น API client กลาง
- `types` เป็นหน้าตาข้อมูล

## 6. จุดเปราะบางของระบบ

ส่วนที่เปราะบางที่สุดตอนนี้คือ:

- `frontend/src/pages/FormNew.tsx`
- `frontend/src/pages/FormView.tsx`

สาเหตุ:

- เป็นหน้า checklist table ขนาดใหญ่
- มีหลาย field ผูกกับ state และ row mapping
- layout ตารางพังง่าย
- date/time picker และ input ใน table มีความเสี่ยงซ้อน/เลื่อนผิดตำแหน่ง

กติกาสำคัญ:

- อย่ารื้อหน้า form ใหญ่โดยไม่จำเป็น
- ถ้าจะ refactor ให้ใช้วิธี `small safe extraction`
- ถ้าจะแก้ table structure ต้องตรวจ HTML/table wiring ให้ละเอียด

## 7. สิ่งที่ถือว่า “ขาดจริง” มากกว่าของปรับปรุง

หากมองตาม requirement ที่ระบบปัจจุบันตอบโจทย์แล้ว ของที่ยังถือว่าขาดจริงมีแนวโน้มเป็น:

- backup / recovery playbook
- change/reset password flow
- วิธีรับมือกรณีหลายคนแก้ฟอร์มชนกัน
- documentation ขั้นต่ำสำหรับผู้รับช่วงระบบ

สิ่งเหล่านี้ควรถูกมองเป็น “ความครบของระบบ” มากกว่า “refactor ตามใจ dev”

## 7.1 Audit Log V1

ระบบมี `audit log v1` แล้วในระดับ backend + frontend

- backend เขียน audit log จาก service layer
- เก็บลง table `audit_logs`
- table `audit_logs` ต้องถูกสร้างใน D1 ก่อน จึงจะใช้งาน route audit log ได้
- `admin` เห็น log ทั้งหมด
- `user` เห็นเฉพาะ log ของตัวเอง หรือ log ของฟอร์มที่ตัวเองเคยแตะ
- นิยาม “เคยแตะฟอร์ม” ใน v1 คือ
  - เป็น `createdBy`
  - หรือมีข้อมูล `preparerId` / `preparer` ของตัวเองอยู่ใน checklist JSON
- `form.update` เก็บ field-level / row-level changes
- ถ้า audit log เขียนไม่สำเร็จ จะไม่ block workflow หลักของการใช้งานฟอร์ม
- ถ้าเพิ่งเพิ่ม feature audit log แล้ว table ยังไม่ถูก migrate ขึ้น D1 จะเกิด error ฝั่ง backend แม้ frontend และ route จะมีครบแล้ว

## 8. สถานะการสำรองข้อมูลล่าสุด

มีการเตรียม backup ไว้ในโปรเจกต์แล้ว

- `backup-export`
- `backup-import`

ชุด backup ที่สำคัญ:

- forms
- users
- users พร้อม `password_hash`
- SQL สำหรับ import forms
- SQL สำหรับ import users

ดังนั้นถ้าวันหนึ่งต้องย้ายระบบจริง จะไม่ต้องเริ่มจากศูนย์

## 9. ข้อควรจำเวลาอธิบายระบบนี้

- อย่าอธิบายจากโค้ดอย่างเดียว ให้ยึด workflow จริงจากผู้ใช้ด้วย
- อย่าฟันธงว่า immutable ต้องดีกว่าเสมอในเคสนี้ เพราะ requirement จริงต้องการแก้ไขได้
- อย่าตีความว่า owner ของฟอร์มคนเดียวแก้ได้ ถ้าไม่ได้ยืนยันจาก requirement
- ให้แยกความหมายของ `Complete` กับ `surgery completed` ให้ชัดทุกครั้ง

## 10. ประโยคสรุปสั้นของระบบ

ระบบนี้คือระบบ checklist ก่อนผ่าตัดสำหรับพยาบาล ที่ออกแบบให้หลายคนช่วยกันทำงานในฟอร์มเดียวกันได้ ติดตามสถานะความพร้อมของผู้ป่วย และแยกเคสที่ผ่าตัดแล้วออกจากเคสที่ยังต้องติดตาม โดยต้องยึด workflow จริงของหน้างานมากกว่าการออกแบบเชิง ideal เพียงอย่างเดียว
