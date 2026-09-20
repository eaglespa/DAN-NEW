import React from 'react';
import { X, Shield, FileText, Cookie, Check } from 'lucide-react';

export type LegalPolicyType = 'terms' | 'privacy' | 'cookie' | null;

interface LegalModalProps {
  policyType: LegalPolicyType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ policyType, onClose }) => {
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
              <div className="p-4 bg-[#181b28] rounded-xl border border-slate-800 text-xs text-amber-200/90 leading-relaxed">
                These are our terms and conditions for the use of our website <strong>STYLE AND CLASS</strong> and the purchase of products through the website.
              </div>

              <h3 className="text-base font-bold text-white">1. General Terms of Use</h3>
              <p>
                The terms and conditions herein together with any notices or conditions on other areas of this website will all together govern use by customers of this website. You should note that Style And Class may at any time make changes to or remove part of this website without any liability to customers for such changes. Style And Class reserves the right to change these terms and conditions in the future without specifically notifying customers, and continued use of the website or placing of orders after such changes shall be deemed to be acknowledgement and acceptance thereof.
              </p>

              <h3 className="text-base font-bold text-white">2. Pre-Loved &amp; 1-of-1 Inventory Policy</h3>
              <p>
                Unless otherwise explicitly marked as &quot;New Without Tags&quot;, items sold by Style And Class are authentic pre-loved, vintage, or pre-owned garments and accessories. Each item is unique (1-of-1). Once an order is confirmed, that unique item is immediately removed from the active store catalog and reserved for the purchasing customer.
              </p>

              <h3 className="text-base font-bold text-white">3. Condition Grading &amp; Authenticity</h3>
              <p>
                Every garment is hand-inspected, steam-pressed, and graded by our London team. Condition grades are defined as:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
                <li><strong>New Without Tags:</strong> Brand new, unworn, pristine condition with zero signs of wear.</li>
                <li><strong>Excellent:</strong> Near flawless, very lightly worn, no visible tears, marks, or fabric pilling.</li>
                <li><strong>Very Good:</strong> Well cared for pre-owned piece with minimal natural signs of gentle wear.</li>
                <li><strong>Good:</strong> Clean, wearable vintage piece with minor aesthetic character.</li>
              </ul>

              <h3 className="text-base font-bold text-white">4. Pricing, Payments &amp; Delivery</h3>
              <p>
                All prices are stated in British Pounds Sterling (GBP, £) and include UK mainland delivery options. Payments can be completed safely via PayPal UK with full Buyer Protection, card processing, or direct WhatsApp concierge arrangement. Orders are dispatched within 24 hours via tracked carriers (Evri, InPost, or Royal Mail).
              </p>

              <h3 className="text-base font-bold text-white">5. 7-Day UK Returns</h3>
              <p>
                If an item does not fit or does not meet your expectations, you may return it within 7 days of delivery in its original, unworn state with our security tag attached. Return postage is covered by the customer unless the item was misrepresented.
              </p>
            </div>
          )}

          {policyType === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#181b28] rounded-xl border border-slate-800 text-xs text-amber-200/90 leading-relaxed">
                This Privacy Policy describes how <strong>STYLE AND CLASS</strong> collects, uses, and protects your personal information when you visit or make a purchase from our website.
              </div>

              <h3 className="text-base font-bold text-white">1. How We Use Your Personal Information</h3>
              <p>
                We use the Order Information that we collect generally to fulfill any orders placed through and with the Site (including processing your payment information, arrangements for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
                <li>Communicate directly with you regarding your parcel dispatch and tracking.</li>
                <li>Screen orders for potential risk or fraud.</li>
                <li>Provide you with information or updates relating to new pre-loved collection drops when requested.</li>
              </ul>

              <h3 className="text-base font-bold text-white">2. WhatsApp Concierge Privacy</h3>
              <p>
                When you initiate a WhatsApp order or concierge inquiry, your telephone number and message history are used solely for handling your fashion order, coordinating courier drop-offs, and confirming size measurements. We never sell or share your contact numbers with third-party advertisers.
              </p>

              <h3 className="text-base font-bold text-white">3. Data Retention</h3>
              <p>
                When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.
              </p>

              <h3 className="text-base font-bold text-white">4. Contact Information</h3>
              <p>
                For more information about our privacy practices or if you would like to exercise your rights under UK GDPR, please contact us by email at{' '}
                <a href="mailto:styleandclasslondon@gmail.com" className="text-[#d4a853] underline">
                  styleandclasslondon@gmail.com
                </a>{' '}
                or via phone at{' '}
                <span className="text-[#d4a853] font-mono">+44 7591 878215</span>.
              </p>
            </div>
          )}

          {policyType === 'cookie' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#181b28] rounded-xl border border-slate-800 text-xs text-amber-200/90 leading-relaxed">
                This policy was last updated on 09/04/2024. When you visit or interact with our sites, we or our authorised service providers may use cookies, web beacons, and other similar technologies.
              </div>

              <h3 className="text-base font-bold text-white">1. What Are Cookies?</h3>
              <p>
                Like most websites, we use small data files placed on your computer, tablet, or mobile phone that allow us to record certain pieces of information whenever you visit our website, helping provide you with a faster, safer, and seamless shopping experience.
              </p>

              <h3 className="text-base font-bold text-white">2. Why We Use Cookies</h3>
              <p>
                We use cookies and local browser storage to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-300 text-xs">
                <li>Remember items placed in your Shopping Bag.</li>
                <li>Preserve your category filter selections (Women, Men, Kids, Accessories).</li>
                <li>Store your carrier delivery choice (Evri, InPost, Royal Mail).</li>
                <li>Prevent double-purchasing of exclusive 1-of-1 inventory items.</li>
              </ul>

              <h3 className="text-base font-bold text-white">3. Managing Your Cookies</h3>
              <p>
                You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website (such as the instant bag and PayPal checkout) may become inaccessible or not function properly.
              </p>
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
