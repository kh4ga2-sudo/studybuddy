import { useApp } from "../context/AppContext";

export default function CTA() {
  const { state, setView } = useApp();
  const isAr = state.lang === 'ar';

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid lg:grid-cols-3 gap-12 items-center border-t border-purple-100" id="pricing">
      {/* Left Column: Heading */}
      <div>
        <h2 
          className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#24113f] ${isAr ? 'font-arabic' : 'font-serif'}`}
          style={{ lineHeight: isAr ? '1.4' : '1.15' }}
        >
          {isAr ? (
            <>رحلتك نحو تعلّم <span className={`italic font-normal text-purple-700 ${isAr ? 'font-arabic' : 'font-serif'}`}>أفضل</span> تبدأ من هنا.</>
          ) : (
            <>Your journey to <span className="italic font-normal text-purple-700 font-serif">better</span> learning starts here.</>
          )}
        </h2>
      </div>

      {/* Middle Column: 3D Books stack */}
      <div className="flex justify-center">
        <div className="w-72 h-56 relative overflow-hidden rounded-2xl shadow-xl border border-purple-100/50 bg-[#efe1ff]/10 p-1 flex items-center justify-center transition-transform hover:scale-[1.03]">
          <img 
            src="/cta_books_3d.png" 
            alt="Study Buddy stacked guide books" 
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      </div>

      {/* Right Column: Description Copy & Action Button */}
      <div className={isAr ? 'lg:pr-6' : 'lg:pl-6'}>
        <p className="text-gray-500 text-lg lg:text-xl leading-relaxed">
          {isAr 
            ? "انضم إلى آلاف الطلاب الذين يتعلمون بذكاء وفاعلية أكبر معاً باستخدام ستادي بادي."
            : "Join thousands of students who are learning smarter together with Study Buddy."}
        </p>

        <button 
          onClick={() => setView('auth')}
          className="mt-8 px-9 py-4 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-lg shadow-md shadow-purple-200 transition-all flex items-center gap-2 hover:scale-[1.02]"
        >
          {isAr ? "انضم إلينا الآن" : "Join Now"} <span className="text-xl" style={{ transform: isAr ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>→</span>
        </button>
      </div>
    </section>
  );
}
