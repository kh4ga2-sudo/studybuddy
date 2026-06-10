import { useApp } from "../context/AppContext";

export default function Hero() {
  const { state, setView } = useApp();
  const isAr = state.lang === 'ar';

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center" id="home">
      <div>
        <p className={`uppercase text-purple-700 text-sm font-extrabold ${isAr ? 'tracking-normal' : 'tracking-[0.25em]'}`}>
          {isAr ? "المرافق الأكاديمي" : "Academic Companion"}
        </p>

        <h1 
          className={`text-5xl sm:text-7xl lg:text-[6rem] tracking-tight text-[#24113f] mt-4 font-extrabold ${isAr ? 'font-arabic' : 'font-serif'}`}
          style={{ lineHeight: isAr ? '1.4' : '1.05' }}
        >
          {isAr ? (
            <>
              تعلموا
              معاً.
              <br />
              وانجحوا
              معاً.
            </>
          ) : (
            <>
              LEARN
              <br />
              TOGETHER.
              <br />
              GROW
              <br />
              TOGETHER.
            </>
          )}
        </h1>

        <p className="mt-6 text-xl lg:text-2xl text-gray-600 max-w-xl leading-relaxed">
          {isAr ? (
            <>
              ستادي بادي هو رفيقك الأكاديمي الأمثل.<br />
              تعاون، تعلّم، وحقق أفضل النتائج — معاً.
            </>
          ) : (
            <>
              Study Buddy is your academic companion.<br />
              Collaborate, learn, and achieve more—together.
            </>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-6 mt-8">
          <button 
            onClick={() => setView('auth')}
            className="bg-purple-700 hover:bg-purple-800 text-white px-9 py-4 rounded-xl font-bold text-lg shadow-md shadow-purple-200 transition-all flex items-center gap-2 hover:scale-[1.02]"
          >
            {isAr ? "ابدأ الآن" : "Get Started"} <span className="text-xl" style={{ transform: isAr ? 'rotate(180deg)' : 'none', display: 'inline-block' }}>→</span>
          </button>

          <a 
            href="#features" 
            className="text-purple-700 hover:text-purple-900 transition-colors font-bold text-lg border-b-2 border-purple-200 hover:border-purple-700 pb-1"
          >
            {isAr ? "استكشف المزايا" : "Explore Features"}
          </a>
        </div>
      </div>

      <div className={`relative flex justify-center items-center ${isAr ? 'lg:pr-10' : 'lg:pl-10'}`}>
        {/* Render the stunning high-fidelity 3D book stack image provided by the user */}
        <div className="w-full max-w-[450px] transition-transform duration-500 hover:scale-[1.03] filter drop-shadow-[0_15px_15px_rgba(139,92,246,0.15)]">
          <img 
            src="/hero_books_3d.png" 
            alt="Study Buddy Book Stack 3D" 
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
}
