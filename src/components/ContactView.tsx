import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle2, Instagram, Video, Share2, Sparkles } from 'lucide-react';
import { StoreSettings } from '../types';

interface ContactViewProps {
  settings: StoreSettings;
  onNavigateHome: () => void;
  onNavigateCollections: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ settings, onNavigateHome, onNavigateCollections }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [customSearchQuery, setCustomSearchQuery] = useState('');

  const cleanPhone = (settings.merchantWhatsApp || '+447591878215').replace(/[^0-9+]/g, '').replace('+', '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hi Style & Class London! I am reaching out from your website.')}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleCustomWaSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearchQuery.trim()) return;
    const msg = `Hi Style & Class London! I am looking for a specific item: "${customSearchQuery.trim()}". Can you source this for me?`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-slate-200">
      {/* Page Header matching Style And Class */}
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <span className="text-[11px] font-bold text-[#d4a853] uppercase tracking-[0.25em] block mb-2">
          Customer Concierge &middot; London Studio
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-serif tracking-tight">
          Get In <em className="text-[#d4a853] not-italic italic font-serif">Touch</em>
        </h1>
        <div className="w-16 h-0.5 bg-[#d4a853] mx-auto my-4" />
        <p className="text-sm text-slate-400">
          We&apos;d love to hear from you. Inquire about vintage garments, ask for size measurements, or request custom pre-loved sourcing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Info Box */}
          <div className="p-6 sm:p-8 bg-[#0e1017] rounded-2xl border border-slate-800 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white font-serif uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#d4a853]" />
              <span>London Studio Direct Contact</span>
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#141722] border border-slate-800/80">
                <Mail className="w-5 h-5 text-[#d4a853] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">Email Address</span>
                  <a href={`mailto:${settings.merchantEmail || 'styleandclasslondon@gmail.com'}`} className="text-white hover:text-[#d4a853] transition-colors font-medium">
                    {settings.merchantEmail || 'styleandclasslondon@gmail.com'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#141722] border border-slate-800/80">
                <Phone className="w-5 h-5 text-[#d4a853] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">Phone Support</span>
                  <a href={`tel:${settings.merchantPhone || '+4407591878215'}`} className="text-white hover:text-[#d4a853] transition-colors font-mono font-medium">
                    {settings.merchantPhone || '+44 07591878215'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#141722] border border-slate-800/80">
                <MessageCircle className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5 fill-[#25D366]" />
                <div>
                  <span className="text-[11px] uppercase font-bold text-[#25D366] block">Direct WhatsApp</span>
                  <a href={waUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#25D366] transition-colors font-mono font-medium">
                    {settings.merchantWhatsApp || '+44 7591 878215'}
                  </a>
                  <p className="text-[11px] text-slate-400 mt-0.5">Average reply time: under 15 minutes</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#141722] border border-slate-800/80">
                <MapPin className="w-5 h-5 text-[#d4a853] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">Location</span>
                  <span className="text-white font-medium">{settings.location || 'London, United Kingdom'} — Open 24/7</span>
                </div>
              </div>
            </div>

            {/* Social Media Links from styleandclass.store */}
            <div className="pt-4 border-t border-slate-800">
              <span className="text-[11px] uppercase font-bold text-slate-400 block mb-3">Follow Us</span>
              <div className="flex items-center gap-3">
                <a
                  href={settings.instagram || 'https://www.instagram.com/danmark.uk'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#181b26] hover:bg-[#E1306C] border border-slate-700/80 text-xs font-bold flex items-center gap-2 text-slate-200 hover:text-white transition-all"
                >
                  <Instagram className="w-4 h-4" />
                  <span>@danmark.uk</span>
                </a>
                <a
                  href={settings.tiktok || 'https://www.tiktok.com/@danmark.fashion5'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#181b26] hover:bg-black border border-slate-700/80 text-xs font-bold flex items-center gap-2 text-slate-200 hover:text-[#00f2fe] transition-all"
                >
                  <Video className="w-4 h-4" />
                  <span>@danmark.fashion5</span>
                </a>
                <a
                  href={settings.facebook || 'https://www.facebook.com/share/1DV7Qjem6m/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-[#181b26] hover:bg-[#1877F2] border border-slate-700/80 text-xs font-bold text-slate-200 hover:text-white transition-all"
                  title="Facebook"
                >
                  <Share2 className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Sourcing Concierge Box */}
          <div className="p-6 bg-gradient-to-br from-[#121c17] to-[#0c1310] border border-[#25D366]/40 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-[#25D366]">
              <Sparkles className="w-5 h-5" />
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                Order a Specific Product
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Looking for something specific? A particular designer coat, silk dress, or rare vintage piece? Send us a message on WhatsApp and our London curators will source it for you.
            </p>
            <form onSubmit={handleCustomWaSearch} className="flex gap-2">
              <input
                type="text"
                value={customSearchQuery}
                onChange={(e) => setCustomSearchQuery(e.target.value)}
                placeholder="e.g. Burberry Trench UK 12 or Kate Spade Handbag"
                className="flex-1 bg-black/50 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#25D366]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shrink-0"
              >
                <MessageCircle className="w-4 h-4 fill-black" />
                <span>Send on WhatsApp</span>
              </button>
            </form>
          </div>
        </div>

        {/* Contact Form & Newsletter */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 bg-[#0e1017] rounded-2xl border border-slate-800 shadow-xl">
            <h3 className="text-lg font-bold text-white font-serif uppercase tracking-wider mb-2">
              Send Us a Message
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Fill in your inquiry below and our UK support team will respond promptly.
            </p>

            {submitted ? (
              <div className="p-6 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Thank You for Your Message!</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  We have received your message and will reply to <strong>{formData.email}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-bold text-[#d4a853] hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Jane Doe"
                      className="w-full bg-[#141722] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4a853]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. jane@example.com"
                      className="w-full bg-[#141722] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4a853]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +44 7123 456789"
                      className="w-full bg-[#141722] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4a853]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Subject / Garment Code
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Inquiry on BOX 1 -1 or Sizing"
                      className="w-full bg-[#141722] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4a853]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about the item or query..."
                    className="w-full bg-[#141722] border border-slate-700/80 rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4a853]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-[#d4a853] hover:bg-[#c29642] text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-3 bg-[#181b26] hover:bg-[#25D366] text-slate-200 hover:text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366] group-hover:text-black" />
                    <span>Or Chat on WhatsApp</span>
                  </a>
                </div>
              </form>
            )}
          </div>

          {/* Stay in the Loop Newsletter from styleandclass.store */}
          <div className="p-6 bg-[#0e1017] rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-bold text-white font-serif uppercase tracking-wider">
                Stay in the Loop
              </h4>
              <p className="text-xs text-slate-400">
                Subscribe to get exclusive updates, new arrivals, and special offers straight to your inbox.
              </p>
            </div>

            {newsletterSuccess ? (
              <span className="text-xs font-bold text-emerald-400 px-4 py-2 bg-emerald-950/50 rounded-xl border border-emerald-800">
                Thanks for subscribing!
              </span>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newsletterEmail) setNewsletterSuccess(true);
                }}
                className="flex w-full sm:w-auto gap-2"
              >
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-[#141722] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4a853]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d4a853] hover:bg-[#c29642] text-black font-extrabold text-xs rounded-xl transition-all"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
