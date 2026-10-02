import React, { useState } from 'react';
import { X, Shield, FileText, Cookie, Check, Sliders, CheckCircle2, Lock } from 'lucide-react';

export type LegalPolicyType = 'terms' | 'privacy' | 'cookie' | null;

interface LegalModalProps {
  policyType: LegalPolicyType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ policyType, onClose }) => {
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const [performanceCookiesEnabled, setPerformanceCookiesEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('styleandclass_perf_cookies');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleSaveCookiePreferences = () => {
    try {
      localStorage.setItem('styleandclass_perf_cookies', JSON.stringify(performanceCookiesEnabled));
    } catch {}
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  if (!policyType) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0e1017] border border-[#d4a853]/40 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-[#141722]">
          <div className="flex items-center gap-3">
            {policyType === 'terms' && <FileText className="w-5 h-5 text-[#d4a853]" />}
            {policyType === 'privacy' && <Shield className="w-5 h-5 text-[#d4a853]" />}
            {policyType === 'cookie' && <Cookie className="w-5 h-5 text-[#d4a853]" />}
            <div>
              <h2 className="text-lg font-bold text-white font-serif uppercase tracking-wider">
                {policyType === 'terms' && 'Terms & Conditions'}
                {policyType === 'privacy' && 'Privacy Policy'}
                {policyType === 'cookie' && 'Cookie Policy'}
              </h2>
              <p className="text-xs text-slate-400">
                Official policy for Style And Class London
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed">
          {policyType === 'terms' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#181b28] rounded-xl border border-slate-800 text-xs text-amber-200/90 leading-relaxed space-y-2">
                <p>
                  These are our terms and conditions for the use of our website <strong>STYLE AND CLASS</strong> and the purchase of products through the website.
                </p>
                <p className="text-slate-300">
                  If you have any queries about these terms, please contact us using the contact form.
                </p>
              </div>

              <p>
                The terms and conditions herein together with any notices or conditions on other areas of this website will all together govern use by customers of this website. You should note that Style and Class may at any time make changes to or remove part of this website without any liability to customers for such changes. Style and Class reserves the right to change these terms and conditions in the future without specifically notifying customers and continued use of the website or placing of orders after such changes shall be deemed to be acknowledgement and acceptance thereof.
              </p>

              <p>
                A contract will only come into existence between you the customer and us once your order has been processed and dispatched.
              </p>

              <div className="space-y-2">
                <p>When you as a customer place an order via this website, you warrant by placing the order that:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-xs sm:text-sm">
                  <li>You are not a minor or otherwise legally incapable of entering into a binding contract.</li>
                  <li>The personal details which you give us on registration are fully complete and accurate.</li>
                  <li>You are not using a false name or the name of any other person or body which you are not authorised to use.</li>
                </ul>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <strong className="text-white font-bold">Placement of an order —</strong>{' '}
                  <span className="text-slate-300">When you place your order you are doing so in acceptance of these terms and conditions and it is important that you have read them before you go ahead and order.</span>
                </div>

                <div>
                  <strong className="text-white font-bold">Cancelling an order —</strong>{' '}
                  <span className="text-slate-300">As a customer, you are free to cancel an order within 7 days and will be refunded amount of your order to their account the order originally was paid from.</span>
                </div>

                <div>
                  <strong className="text-white font-bold">Acceptance of an order —</strong>{' '}
                  <span className="text-slate-300">When an order is placed you will get an order confirmation sent to the email address you provided during checkout, containing information about order content, prices.</span>
                </div>

                <div>
                  <strong className="text-white font-bold">Delivery —</strong>{' '}
                  <span className="text-slate-300">You as a buyer are free to choose from mentioned and at the time relevant delivery option(s). Style and Class assumes no responsibility for damages during transport or damages caused from any delays beyond its control.</span>
                </div>

                <div>
                  <strong className="text-white font-bold">Returns Policy —</strong>{' '}
                  <span className="text-slate-300">Style and Class accepts returns within 7 days if products are not used, changed, washed or otherwise manipulated. Products need to be returned in original packaging. No products may be returned to Style and Class without the prior written consent of Style And Class Fashion and are subject to a return charge.</span>
                </div>

                <div>
                  <strong className="text-white font-bold">Liability —</strong>{' '}
                  <span className="text-slate-300">We try to have the information on this website as accurate as possible but we make no warranties, whether express or implied, regarding its accuracy. We also do not make any warranties regarding any matters relating to the use of this website and it is a matter for you to ensure that your own equipment is protected from viruses or other external factors.</span>
                </div>
              </div>

              <p>
                Your rights are protected by the Sale of Goods and Supply of Services Act, 1980, and also the Consumer Protection Act, 2007, where you are a consumer. Nothing in this website shall affect your rights under the applicable law.
              </p>

              <div>
                <strong className="text-white font-bold">Severance —</strong>{' '}
                <span className="text-slate-300">If any of these terms and conditions shall prove to be void, unlawful, or unenforceable for any reason then such term or condition shall be deemed to be severed from the remaining terms and conditions which shall remain valid and enforceable.</span>
              </div>
            </div>
          )}

          {policyType === 'privacy' && (
            <div className="space-y-5">
              <div className="p-4 bg-[#181b28] rounded-xl border border-slate-800 text-xs text-amber-200/90 leading-relaxed">
                This Privacy Policy describes how <strong>STYLE AND CLASS</strong> collects, uses, and protects your personal information when you visit or make a purchase from our website.
              </div>

              {/* Section 1 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#d4a853]">
                  How do we use your personal information?
                </h3>
                <p>
                  We use the Order Information that we collect generally to fulfill any orders placed through and with the Site (including processing your payment information, arrangements for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-300 text-xs sm:text-sm">
                  <li>Communicate with you;</li>
                  <li>Screen orders for potential risk or fraud; and</li>
                  <li>When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</li>
                </ul>
                <p className="pt-1">
                  We are processing your information in order to fulfill contracts we might have with you (for example if you make an order through the Site), or otherwise to pursue our legitimate business interests listed above.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#d4a853]">
                  Data retention
                </h3>
                <p>
                  When you place an order through the Site, we will maintain your Order Information for as long as necessary to carry out our services to you or for as long as we are required by relevant laws. After this period, your personal data will be deleted.
                </p>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#d4a853]">
                  Changes
                </h3>
                <p>
                  We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#d4a853]">
                  Contact us
                </h3>
                <p>
                  For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us via contact form that can be found at the bottom of this page.
                </p>
              </div>
            </div>
          )}

          {policyType === 'cookie' && (
            <div className="space-y-5">
              {/* Introduction Callout */}
              <div className="p-4 bg-[#181b28] rounded-xl border border-slate-800 text-xs text-amber-200/90 leading-relaxed space-y-2">
                <p>
                  When you visit or interact with our sites, we or our authorised service providers may use cookies, web beacons, and other similar technologies for storing information to help provide you with a better, faster, and safer experience and for advertising purposes.
                </p>
                <p className="text-slate-300">
                  This page is designed to help you understand more about these technologies and our use of them on our sites. Below is a summary of a few key things you should know about our use of such technologies.
                </p>
              </div>

              {/* Section 1 */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#d4a853]">
                  What are cookies, web beacons, and similar technologies?
                </h3>
                <p>
                  Like most sites, we use technologies that are essentially small data files placed on your computer, tablet, mobile phone, or other devices (referred to collectively as a &quot;device&quot;) that allow us to record certain pieces of information whenever you visit or interact with our sites, services, applications, messaging, and tools.
                </p>
                <p>
                  The specific names and types of the cookies, web beacons, and other similar technologies we use may change from time to time. In order to help you better understand this Policy and our use of such technologies we have provided the following limited terminology and definitions:
                </p>

                <div className="space-y-3 pl-3 border-l-2 border-[#d4a853]/40 text-xs sm:text-sm">
                  <div>
                    <strong className="text-white block font-bold">Cookies —</strong>
                    <p className="text-slate-300 mt-0.5">
                      Small text files (typically made up of letters and numbers) placed in the memory of your browser or device when you visit a website or view a message. Cookies allow a website to recognise a particular device or browser.
                    </p>
                    <div className="mt-2 pl-3 border-l border-slate-800 space-y-1.5 text-xs text-slate-300">
                      <p className="font-semibold text-slate-200">There are several types of cookies:</p>
                      <ul className="list-disc pl-5 space-y-1 text-slate-300">
                        <li>
                          <strong className="text-slate-200">Session cookies</strong> expire at the end of your browser session and allow us to link your actions during that browser session.
                        </li>
                        <li>
                          <strong className="text-slate-200">Persistent cookies</strong> are stored on your device in between browser sessions, allowing us to remember your preferences or actions across multiple sites.
                        </li>
                        <li>
                          <strong className="text-slate-200">First-party cookies</strong> are set by the site you are visiting.
                        </li>
                        <li>
                          <strong className="text-slate-200">Third-party cookies</strong> are set by a third-party site separate from the site you are visiting.
                        </li>
                      </ul>
                      <p className="pt-1 text-slate-400">
                        Cookies can be disabled or removed by tools that are available in most commercial browsers. The preferences for each browser you use will need to be set separately and different browsers offer different functionality and options.
                      </p>
                    </div>
                  </div>

                  <div>
                    <strong className="text-white block font-bold">Web beacons —</strong>
                    <p className="text-slate-300 mt-0.5">
                      Small graphic images (also known as &quot;pixel tags&quot; or &quot;clear GIFs&quot;) that may be included on our sites, services, applications, messaging, and tools, that typically work in conjunction with cookies to identify our users and user behaviour.
                    </p>
                  </div>

                  <div>
                    <strong className="text-white block font-bold">Other similar technologies —</strong>
                    <p className="text-slate-300 mt-0.5">
                      Technologies that store information in your browser or device utilising local shared objects or local storage, such as flash cookies, HTML 5 cookies, and other web application software methods. These technologies can operate across all your browsers, and in some instances may not be fully managed by your browser and may require management directly through your installed applications or device. We do not use these technologies for storing information to target advertising to you on or off our sites.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  We may use the terms &quot;cookies&quot; or &quot;similar technologies&quot; interchangeably in our policies to refer to all technologies that we may use to store data in your browser or device or that collect information or help us identify you in the manner described above.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#d4a853]">
                  Cookies used on this website
                </h3>
                <p>
                  This website uses performance cookies.
                </p>
                <div className="p-3.5 bg-[#12141e] rounded-xl border border-slate-800 text-xs leading-relaxed space-y-1">
                  <strong className="text-white block font-bold">Performance Cookies —</strong>
                  <p className="text-slate-300">
                    These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site. All information these cookies collect is aggregated and therefore anonymous. If you do not allow these cookies we will not know when you have visited our site, and will not be able to monitor its performance.
                  </p>
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#d4a853]">
                  About this policy
                </h3>
                <p>
                  We may amend the Cookie policy from time to time, in whole or in part, at our discretion. The latest version of this document will always be available at our website and will take effect on the date that it is updated.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[#d4a853]">
                  Updating your preference
                </h3>
                <p>
                  You can customise your choice with respect to cookies (except required cookies) by clicking on the &quot;Cookie Settings&quot; button below:
                </p>

                {/* Cookie Settings Trigger Button */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowCookieSettings(!showCookieSettings)}
                    className="px-4 py-2.5 bg-[#1a1d2d] hover:bg-[#22263a] text-[#d4a853] font-bold text-xs rounded-xl border border-[#d4a853]/50 flex items-center gap-2 transition-all shadow-md cursor-pointer hover:scale-101"
                  >
                    <Sliders className="w-4 h-4 text-[#d4a853]" />
                    <span>Cookie Settings</span>
                  </button>
                </div>

                {/* Interactive Cookie Preference Drawer / Panel */}
                {showCookieSettings && (
                  <div className="p-4 bg-[#12141f] rounded-2xl border border-[#d4a853]/40 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-[#d4a853]" />
                          Customize Cookie Preferences
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Manage which cookies you allow on Style &amp; Class London
                        </p>
                      </div>
                      {settingsSaved && (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Preferences saved!
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Required Cookies */}
                      <div className="p-3 bg-[#0a0c13] rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">Strictly Necessary Cookies</span>
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              Always Active
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Required for essential store features like your Shopping Bag, 1-of-1 inventory checks, and checkout.
                          </p>
                        </div>
                        <span className="text-slate-500 font-mono text-[11px] shrink-0 font-bold">Required</span>
                      </div>

                      {/* Performance Cookies Toggle */}
                      <div className="p-3 bg-[#0a0c13] rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                        <div className="space-y-0.5 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">Performance &amp; Analytics Cookies</span>
                            <span className="text-[9px] bg-[#d4a853]/20 text-[#d4a853] font-bold px-1.5 py-0.5 rounded border border-[#d4a853]/30">
                              Optional
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Help us count visits and traffic sources to measure and improve our site performance. Collected anonymously.
                          </p>
                        </div>

                        {/* Switch */}
                        <button
                          type="button"
                          onClick={() => setPerformanceCookiesEnabled(!performanceCookiesEnabled)}
                          className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 shrink-0 ${
                            performanceCookiesEnabled ? 'bg-[#d4a853]' : 'bg-slate-700'
                          }`}
                          aria-label="Toggle performance cookies"
                        >
                          <div
                            className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                              performanceCookiesEnabled ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleSaveCookiePreferences}
                        className="px-4 py-2 bg-gradient-to-r from-[#d4a853] to-[#c5953b] hover:from-[#e0b764] hover:to-[#d4a853] text-black font-extrabold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Cookie Preferences</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#141722] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#d4a853] hover:bg-[#c29642] text-black font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Understood &amp; Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
