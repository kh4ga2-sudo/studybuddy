import {
  Users,
  BookOpen,
  Target,
  TrendingUp,
} from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Features() {
  const { state } = useApp();
  const isAr = state.lang === 'ar';

  const featuresList = [
    {
      icon: Users,
      title: isAr ? "الدراسة معاً" : "STUDY TOGETHER",
      text: isAr ? "تواصل مع زملائك ومجموعات الدراسة في الوقت الفعلي." : "Connect with classmates and study groups in real time.",
    },
    {
      icon: BookOpen,
      title: isAr ? "مشاركة المعرفة" : "SHARE KNOWLEDGE",
      text: isAr ? "تبادل الملاحظات والمصادر والأفكار بكل سهولة." : "Exchange notes, resources, and ideas effortlessly.",
    },
    {
      icon: Target,
      title: isAr ? "التنظيم المستمر" : "STAY ORGANIZED",
      text: isAr ? "خطط لمهامك، حدد أهدافك، وتابع تقدمك الأكاديمي." : "Plan tasks, set goals, and track your progress.",
    },
    {
      icon: TrendingUp,
      title: isAr ? "إنجاز المزيد" : "ACHIEVE MORE",
      text: isAr ? "أدوات ذكية ورؤى مخصصة لمساعدتك في تحقيق أقصى إمكاناتك." : "Smart tools and insights to help you reach your potential.",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-20" id="features">
      {/* Grid of 4 features with vertical dividers */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-6 border-b border-purple-100 pb-20">
        {featuresList.map((feature, idx) => (
          <div
            key={feature.title}
            className={`flex flex-col items-center lg:items-start text-center ${isAr ? 'lg:text-right' : 'lg:text-left'} px-4 ${
              idx > 0 ? (isAr ? "lg:border-r lg:border-purple-200" : "lg:border-l lg:border-purple-200") : ""
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shadow-sm border border-purple-100/50 transition-transform duration-300 hover:scale-110">
              <feature.icon className="w-8 h-8" />
            </div>

            <h3 className={`mt-6 text-lg lg:text-xl font-extrabold text-[#24113f] ${isAr ? 'tracking-normal' : 'tracking-[0.1em]'}`}>
              {feature.title}
            </h3>

            <p className="mt-3 text-[15px] lg:text-base text-gray-500 leading-relaxed max-w-[280px]">
              {feature.text}
            </p>
          </div>
        ))}
      </div>

      {/* Designed to inspire block section (Picture deleted, converted to stunning full-width centered text card) */}
      <div className="max-w-3xl mx-auto text-center mt-24 border-t border-purple-100 pt-16">
        <p className={`uppercase text-purple-700 text-sm font-extrabold ${isAr ? 'tracking-normal' : 'tracking-[0.25em]'}`}>
          {isAr ? "صُمم للتعلم" : "Built for Learning"}
        </p>

        <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#24113f] leading-tight mt-4 ${isAr ? 'font-arabic' : 'font-serif'}`}>
          {isAr ? (
            <>صُمم <span className={`italic font-normal text-purple-700 ${isAr ? 'font-arabic' : 'font-serif'}`}>ليُلهمك</span> التركيز والتعاون المشترك.</>
          ) : (
            <>Designed to <span className="italic font-normal text-purple-700 font-serif">inspire</span> focus and collaboration.</>
          )}
        </h2>

        <p className="mt-6 text-gray-500 text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto">
          {isAr 
            ? "يجمع ستادي بادي بين جمال التصميم وقوة الأداء ليخلق مساحة ملهمة للطلاب للتعلم والمشاركة والنجاح معاً."
            : "Study Buddy combines beautiful design with powerful functionality to create a space where students can learn, share, and grow—together."}
        </p>

        <div className="mt-8">
          <a 
            href="#about" 
            className="text-purple-700 hover:text-purple-900 transition-colors font-bold text-base lg:text-lg border-b-2 border-purple-200 hover:border-purple-700 pb-1 inline-flex items-center gap-2"
          >
            {isAr ? "تعرف علينا أكثر" : "Learn More"} <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
