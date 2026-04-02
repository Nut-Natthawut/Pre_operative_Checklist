import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Users, ArrowRight, Activity, Zap, Lock } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const features = [
  {
    title: 'จัดการเอกสารดิจิทัล',
    subtitle: 'Digital Forms',
    description: 'สร้าง จัดเก็บ และจัดการแบบฟอร์มทางการแพทย์ทั้งหมดของโรงพยาบาลมหาราชฯ ในฐานข้อมูลระบบเดียวที่ปลอดภัยและเรียกดูง่าย',
    icon: FileText,
    gradient: false,
  },
  {
    title: 'ระบบค้นหาอัจฉริยะ',
    subtitle: 'Smart Search',
    description: 'ค้นหาประวัติและฟอร์มผู้ป่วยได้อย่างรวดเร็ว แม่นยำ ช่วยลดเวลาการทำงานของบุคลากรทางการแพทย์ลงอย่างเห็นได้ชัด',
    icon: Search,
    gradient: true,
  },
  {
    title: 'กำหนดสิทธิ์การเข้าถึง',
    subtitle: 'Role-Based Access',
    description: 'รักษาความลับของผู้ป่วยด้วยระบบแบ่งระดับการเข้าถึงข้อมูลที่ปรับแต่งได้ สำหรับแพทย์ พยาบาล และเจ้าหน้าที่บริหาร',
    icon: Users,
    gradient: false,
  },
];

const Homepage = () => {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    
    tl.from('.hero-badge', {
      y: -20,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    })
    .from('.hero-title', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.4')
    .from('.hero-desc', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.4')
    .from('.hero-buttons', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.4')
    .from('.feature-card', {
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power3.out'
    }, '-=0.2')
    .from('.workspace-section', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.2')
    .from('.cta-section', {
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.out'
    }, '-=0.2');
  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-[#faf8ff] text-[#131b2e] selection:bg-blue-200 medical-grid" style={{ fontFamily: "'Sarabun', 'Inter', sans-serif" }}>
      {/* Navbar — Glassmorphism */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-[#c3c6d7]/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#004ac6] to-[#2563eb] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Activity size={20} strokeWidth={2} />
              </div>
              <span className="font-black text-xl tracking-tight text-gradient-primary" style={{ fontFamily: "'Inter', sans-serif" }}>Suandok Forms</span>
            </div>
            <Link to="/login" className="text-sm font-bold text-[#004ac6] hover:bg-[#004ac6]/5 px-5 py-2 rounded-lg transition-all">
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 px-4 sm:px-6 lg:px-8 hero-gradient">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
          {/* Left: Text */}
          <div className="lg:col-span-7 space-y-8 relative z-10">
            <div className="hero-badge inline-flex items-center gap-3 px-4 py-1.5 bg-[#004ac6]/10 rounded-full border border-[#004ac6]/20 text-[#004ac6] text-xs uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#004ac6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#004ac6]"></span>
              </span>
              Pre-operative Checklist System
            </div>
            
            <h1 className="hero-title text-5xl md:text-7xl tracking-tighter leading-[0.95]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}>
              ระบบจัดการเอกสาร{' '}
              <br className="hidden md:block" />
              <span className="text-gradient-primary">การเตรียมผู้ป่วย</span>
              <br />
              ก่อนผ่าตัด
            </h1>
            
            <p className="hero-desc text-xl text-[#434655] max-w-xl font-medium leading-relaxed opacity-90">
              เปลี่ยนจากระบบกระดาษแบบเดิม สู่แพลตฟอร์มดิจิทัลที่ทันสมัย รวดเร็ว ปลอดภัย ออกแบบมาเพื่อบุคลากร
              <span className="font-bold text-[#131b2e]"> โรงพยาบาลมหาราชนครเชียงใหม่</span>
            </p>
            
            <div className="hero-buttons flex flex-wrap gap-4 pt-2">
              <Link to="/login" className="px-8 py-4 bg-[#004ac6] text-white font-bold rounded-2xl shadow-[0_16px_40px_rgba(0,74,198,0.3)] hover:shadow-[0_20px_50px_rgba(0,74,198,0.4)] transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                เริ่มต้นใช้งาน <ArrowRight size={18} />
              </Link>
              {/* <Link to="/dashboard" className="px-8 py-4 bg-white text-[#131b2e] border border-[#c3c6d7]/30 font-bold rounded-2xl hover:bg-[#f2f3ff] transition-all active:scale-95 shadow-sm flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                <ClipboardList size={18} /> เข้าสู่หน้าระบบ
              </Link> */}
            </div>
          </div>

          {/* Right: Visual */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="relative p-4">
              <div className="absolute inset-0 bg-[#004ac6]/20 blur-[100px] rounded-full scale-75 animate-pulse"></div>
              <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 border-4 border-white/50">
                <img 
                  alt="ระบบจัดการข้อมูลทางคลินิก" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcfopyD0rWMnCvhfvIVVBHtPIMw34YHB-ho_Ok8b_BNKsxVF8J1T3ZoVIPGH5oy5b0JTUJbIAf8gvyKphiBjj1-rrhqX01nXi_O8SqstFudw4VtzrW885xLqveLoDJ2uExfDlFy3ooECx9QMh_o5G0wcf_5C-al5RqTJ5bKGyW-0D8a4-QNiHuNNAdGbC6PTvUYyZ0sAgIIEbJVuZFktJgk_t9QKBXqTviDVx7L0wl091mDiHyoMdaxslsoOpt3d0EtaRWCawYY2w7"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#004ac6]/30 via-transparent to-white/10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl tracking-tight mb-6" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}>
              เครื่องมือครบครัน
              <span className="text-gradient-primary"> สำหรับจัดการฟอร์ม</span>
            </h2>
            <p className="text-lg text-[#434655] font-medium leading-relaxed">
              แพลตฟอร์มของเรามอบเครื่องมือระดับสูงเพื่อช่วยสร้าง จัดระบบ และค้นหาฟอร์มของโรงพยาบาลอย่างมีประสิทธิภาพ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              if (feature.gradient) {
                return (
                  <div key={idx} className="feature-card bg-gradient-to-br from-[#004ac6] to-[#2563eb] text-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-white/20 text-white rounded-2xl flex items-center justify-center mb-8 backdrop-blur-xl">
                        <Icon size={26} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-2xl mb-2 tracking-tight" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}>{feature.title}</h3>
                      <p className="text-xs uppercase tracking-widest text-white/60 mb-4" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>{feature.subtitle}</p>
                      <p className="text-white/80 text-base leading-relaxed font-medium">{feature.description}</p>
                    </div>
                  </div>
                );
              }
              return (
                <div key={idx} className="feature-card group bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#c3c6d7]/10 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                  <div className="w-14 h-14 bg-[#004ac6]/5 text-[#004ac6] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#004ac6] group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/30 transition-all duration-500">
                    <Icon size={26} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl mb-2 tracking-tight" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}>{feature.title}</h3>
                  <p className="text-xs uppercase tracking-widest text-[#434655]/60 mb-4" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>{feature.subtitle}</p>
                  <p className="text-[#434655] text-base leading-relaxed font-medium">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workspace Preview — Dark Section */}
      <section className="workspace-section py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 medical-grid opacity-10"></div>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20 relative z-10">
          <div className="lg:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-white/60 text-[10px] uppercase tracking-widest" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>
              ระบบจัดการเอกสาร
            </div>
            <h2 className="text-4xl md:text-5xl tracking-tight leading-tight" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}>
              มุ่งเน้นที่ผู้ป่วย{' '}
              <br />
              <span className="text-blue-300">ระบบจัดการข้อมูลให้</span>
            </h2>
            <p className="text-xl text-slate-400 leading-relaxed font-medium">
              ระบบออกแบบตามลำดับขั้นตอนการทำงานจริงของบุคลากร ไม่ต้องหาฟิลด์ ไม่พลาดขั้นตอนสำคัญ
            </p>
            <ul className="space-y-6 pt-4">
              <li className="flex items-start gap-5">
                <div className="p-2 bg-[#004ac6]/20 rounded-xl flex-shrink-0">
                  <Zap className="text-blue-300" size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>กรอกข้อมูลรวดเร็ว</h4>
                  <p className="text-slate-500 font-medium">ระบบ Auto-validation ช่วยลดข้อผิดพลาดและเร่งกระบวนการบันทึกข้อมูล</p>
                </div>
              </li>
              <li className="flex items-start gap-5">
                <div className="p-2 bg-[#004ac6]/20 rounded-xl flex-shrink-0">
                  <Lock className="text-blue-300" size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>ปลอดภัยระดับสากล</h4>
                  <p className="text-slate-500 font-medium">ข้อมูลเข้ารหัสและกำหนดสิทธิ์การเข้าถึงอย่างรัดกุม</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="bg-[#004ac6]/20 rounded-[2.5rem] p-4 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
              <div className="bg-slate-800 rounded-[2rem] shadow-inner p-8 transform rotate-1">
                <div className="flex items-center justify-between mb-10">
                  <div className="h-5 w-40 bg-slate-700 rounded-full"></div>
                  <div className="h-10 w-10 bg-[#004ac6] rounded-xl flex items-center justify-center">
                    <FileText className="text-white" size={18} />
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="h-12 bg-slate-700/50 rounded-xl flex items-center px-6">
                    <div className="h-2 w-full bg-slate-600 rounded-full"></div>
                  </div>
                  <div className="h-12 bg-slate-700/50 rounded-xl flex items-center px-6">
                    <div className="h-2 w-2/3 bg-slate-600 rounded-full"></div>
                  </div>
                  <div className="h-32 bg-slate-700/30 rounded-2xl border border-white/5 flex items-center justify-center">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                      </div>
                      <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                      </div>
                      <div className="w-10 h-10 bg-rose-500/20 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -z-10 inset-0 bg-[#004ac6]/30 blur-[150px]"></div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-[#004ac6] via-[#004ac6] to-[#4648d4] rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-[0_40px_80px_rgba(0,74,198,0.25)]">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl mb-8 tracking-tight text-white leading-tight" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}>
                พร้อมเริ่มต้นใช้งาน
                <br />
                ระบบเอกสารดิจิทัลหรือยัง?
              </h2>
              <p className="text-xl mb-12 max-w-2xl mx-auto text-white/80 font-medium">
                มาร่วมเป็นส่วนหนึ่งของการเปลี่ยนแปลง เพื่อให้การดูแลผู้ป่วยเป็นไปอย่างรวดเร็วและมีประสิทธิภาพมากขึ้น
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 px-12 py-5 bg-white text-[#004ac6] rounded-2xl shadow-2xl hover:shadow-white/20 transition-all hover:scale-105 active:scale-95 text-lg" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}>
                เข้าสู่ระบบเลย <ArrowRight size={20} />
              </Link>
            </div>
            {/* Decorative shapes */}
            <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-white/10 rounded-full blur-[120px]"></div>
            <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-black/10 rounded-full blur-[120px]"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-[#c3c6d7]/10 bg-white pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#004ac6] to-[#2563eb] flex items-center justify-center text-white">
                <Activity size={14} />
              </div>
              <span className="text-lg tracking-tight text-[#004ac6]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 900 }}>Suandok Forms</span>
            </div>
            <p className="text-xs text-[#434655] opacity-60 text-center" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>
              © {new Date().getFullYear()} ศูนย์พัฒนาระบบดิจิทัล โรงพยาบาลมหาราชนครเชียงใหม่ (Suandok Hospital). All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;