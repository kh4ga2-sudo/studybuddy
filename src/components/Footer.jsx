import { useApp } from "../context/AppContext";

export default function Footer() {
  const { state } = useApp();
  const isAr = state.lang === 'ar';

  return (
    <footer className="border-t border-purple-200 bg-white/30 backdrop-blur-md pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 pb-12 border-b border-purple-100">
          {/* Brand Logo and Copyright */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <img src="/logo.svg" className="h-[54px] md:h-[65px] w-auto" alt="STUDY BUDDY Logo" />
            </div>
            <p className="text-xs text-gray-400">
              {isAr ? "© ٢٠٢٦ ستادي بادي. جميع الحقوق محفوظة." : "© 2026 Study Buddy. All rights reserved."}
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#24113f] mb-4">
              {isAr ? "المنصة" : "Platform"}
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><a href="#features" className="hover:text-purple-700 transition-colors">{isAr ? "المزايا" : "Features"}</a></li>
              <li><a href="#pricing" className="hover:text-purple-700 transition-colors">{isAr ? "الأسعار" : "Pricing"}</a></li>
                          </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#24113f] mb-4">
              {isAr ? "المصادر" : "Resources"}
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
                                          <li><a href="#faq" className="hover:text-purple-700 transition-colors">{isAr ? "مركز المساعدة" : "Help Center"}</a></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#24113f] mb-4">
              {isAr ? "الشركة" : "Company"}
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-500 mb-4">
              <li><a href="#about" className="hover:text-purple-700 transition-colors">{isAr ? "من نحن" : "About Us"}</a></li>
                            <li><a href="mailto:support@studybuddy.app" className="hover:text-purple-700 transition-colors">{isAr ? "اتصل بنا" : "Contact"}</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar links */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-8 text-xs text-gray-400 gap-4">
          <div className="flex gap-8">
            <a href="#privacy" className="hover:text-purple-700 transition-colors">{isAr ? "سياسة الخصوصية" : "Privacy Policy"}</a>
            <a href="#terms" className="hover:text-purple-700 transition-colors">{isAr ? "شروط الخدمة" : "Terms of Service"}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
