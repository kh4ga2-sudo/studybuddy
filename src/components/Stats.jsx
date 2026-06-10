import { useApp } from "../context/AppContext";

export default function Stats() {
  const { state } = useApp();
  const isAr = state.lang === 'ar';

  const stats = [
    { value: isAr ? "٨٣٦" : "836", label: isAr ? "طلاب نشطين" : "ACTIVE STUDENTS" },
    { value: "4.8", label: isAr ? "تقييم المستخدمين" : "USER RATING", stars: true },
    { value: isAr ? "١٢٨" : "128", label: isAr ? "مجموعات دراسية" : "STUDY GROUPS" },
    { value: "98%", label: isAr ? "نسبة الرضا" : "SATISFACTION RATE" },
  ];

  return (
    <section className="bg-gradient-to-r from-[#5b21b6] to-[#4338ca] text-white py-16 shadow-inner" id="stats">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative">
        {stats.map((stat, idx) => (
          <div
            key={stat.label}
            className={`flex flex-col items-center justify-center relative ${idx > 0 ? "md:before:content-[''] md:before:absolute md:before:left-0 md:before:top-1/4 md:before:h-1/2 md:before:w-[1px] md:before:bg-white/20" : ""
              }`}
          >
            <h2 className={`text-5xl sm:text-7xl font-extrabold tracking-tight ${isAr ? 'font-arabic' : 'font-serif'}`}>
              {stat.value}
            </h2>

            {stat.stars && (
              <div className="flex gap-1 my-1.5 text-yellow-300 text-base">
                {"★★★★★".split("").map((star, i) => (
                  <span key={i}>{star}</span>
                ))}
              </div>
            )}

            <p className={`uppercase text-purple-100 mt-2 text-sm font-extrabold ${isAr ? 'tracking-normal' : 'tracking-[0.2em]'}`}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
