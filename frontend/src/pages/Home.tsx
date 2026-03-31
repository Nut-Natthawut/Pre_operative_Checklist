import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, Shield, Users, ArrowRight, Activity, ClipboardList } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const features = [
  {
    title: 'จัดการเอกสารดิจิทัล (Digital Forms)',
    description: 'สร้าง จัดเก็บ และจัดการแบบฟอร์มทางการแพทย์ทั้งหมดของโรงพยาบาลมหาราชฯ ในฐานข้อมูลระบบเดียวที่ปลอดภัยและเรียกดูง่าย',
    icon: FileText,
  },
  {
    title: 'ระบบค้นหาอัจฉริยะ (Smart Search)',
    description: 'ค้นหาประวัติและฟอร์มผู้ป่วยได้อย่างรวดเร็ว แม่นยำ ช่วยลดเวลาการทำงานของบุคลากรทางการแพทย์ลงอย่างเห็นได้ชัด',
    icon: Search,
  },
  {
    title: 'กำหนดสิทธิ์การเข้าถึง (Role-Based Access)',
    description: 'รักษาความลับของผู้ป่วยด้วยระบบแบ่งระดับการเข้าถึงข้อมูลที่ปรับแต่งได้ สำหรับแพทย์ พยาบาล และเจ้าหน้าที่บริหาร',
    icon: Users,
  },
  {
    title: 'ปลอดภัยระดับสากล (Secure & Compliant)',
    description: 'ระบบถูกออกแบบตามมาตรฐานความปลอดภัยทางสาธารณสุข ปกป้องข้อมูลผู้ป่วยและการรักษาไว้เป็นความลับสูงสุด',
    icon: Shield,
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
    }, '-=0.2');
  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      {/* Minimal Navbar */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white group-hover:bg-blue-700 transition-colors shadow-sm group-hover:shadow-blue-500/30">
                <Activity size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">Suandok Forms</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-sm hover:shadow-blue-500/20 active:scale-95">
                เข้าสู่ระบบ (Sign in)
              </Link>
              {/* <Link to="/dashboard" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-sm hover:shadow-blue-500/20 active:scale-95">
                กระดานหลัก (Dashboard)
              </Link> */}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden flex items-center justify-center min-h-[70vh]">
        {/* Abstract Background Shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] md:w-[1000px] h-[500px] opacity-40 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 blur-[100px] rounded-full mix-blend-multiply opacity-50"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-teal-300 blur-[100px] rounded-full mix-blend-multiply opacity-50"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-300 blur-[100px] rounded-full mix-blend-multiply opacity-40"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center w-full">
          <div className="hero-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100/50 text-blue-600 text-sm font-medium mb-8 shadow-sm backdrop-blur-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Modern Hospital Management System
          </div>
          
          <h1 className="hero-title text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto leading-[1.1] md:leading-[1.15]">
            ระบบจัดการเอกสารทางการแพทย์ <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">โรงพยาบาลมหาราชนครเชียงใหม่</span>
          </h1>
          
          <p className="hero-desc text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            เปลี่ยนจากระบบใช้กระดาษแบบเดิม สู่แพลตฟอร์มการจัดการแบบฟอร์มแบบดิจิทัลที่ทันสมัย รวดเร็ว ปลอดภัย และออกแบบมาเพื่อบุคลากรทางการแพทย์โดยเฉพาะ
          </p>
          
          <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login" className="flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-slate-900 rounded-full hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto shadow-lg shadow-slate-900/20">
              เริ่มต้นใช้งาน <ArrowRight size={18} />
            </Link>
            <Link to="/dashboard" className="flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto shadow-sm">
              <ClipboardList size={18} /> เข้าสู่หน้าระบบ
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">เครื่องมือครบครันสำหรับการจัดการแบบฟอร์มผู้ป่วย</h2>
            <p className="text-lg text-slate-600">แพลตฟอร์มของเรามอบเครื่องมือระดับสูงเพื่อช่วย สร้าง, จัดระบบ และค้นหา ฟอร์มของโรงพยาบาลอย่างมีประสิทธิภาพ พลิกโฉมเบื้องหลังการทำงานให้รวดเร็วและปลอดภัยยิ่งขึ้น</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="feature-card group p-8 rounded-2xl bg-white border border-slate-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:-translate-y-2 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/30 transition-all duration-300">
                    <Icon size={26} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Action / Banner Section */}
      <section className="py-20 bg-slate-900 text-white text-center px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-10 md:p-16 border border-slate-700/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400"></div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">พร้อมที่จะก้าวสู่ระบบเอกสารดิจิทัลหรือยัง?</h2>
          <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">มาร่วมเป็นส่วนหนึ่งของการเปลี่ยนแปลงรูปแบบการทำงาน เพื่อให้การดูแลผู้ป่วยเป็นไปอย่างรวดเร็วและมีประสิทธิภาพมากขึ้น</p>
          <Link to="/login" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-slate-900 bg-white rounded-full hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 shadow-lg">
            เข้าสู่ระบบเลย
          </Link>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="py-8 bg-slate-50 border-t border-slate-200 text-center">
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} ศูนย์พัฒนาระบบดิจิทัล โรงพยาบาลมหาราชนครเชียงใหม่ (Suandok Hospital). All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Homepage;