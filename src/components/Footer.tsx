import Link from "next/link";
import { Mountain, Mail, Phone, MapPin, ArrowRight } from "lucide-react";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 01-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 01-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 011.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418zM15.194 12 10 15V9l5.194 3z" clipRule="evenodd" />
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M13.6823 10.6218L20.2391 3h-1.5766l-5.7135 6.6142L8.35 3H3.1829l6.8914 10.0031L3.1829 21h1.5765l6.0229-6.9811L15.65 21h5.1671l-7.1348-10.3782zm-2.1318 2.4718-.6983-.9981L5.1342 4.1196h2.3893l4.4834 6.4181.6983.9981 5.8299 8.3394h-2.3893l-4.7573-6.8035z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
  </svg>
);

const footerLinks = {
  Explore: [
    { label: "Hotels & Resorts", href: "/stays?type=hotel" },
    { label: "Traditional Homestays", href: "/stays?type=homestay" },
    { label: "Dal Lake Houseboats", href: "/stays?type=houseboat" },
    { label: "Cultural Tour Packages", href: "/tours" },
    { label: "Local Guides", href: "/guides" },
    { label: "Taxi Booking", href: "/taxis" },
  ],
  Destinations: [
    { label: "Srinagar", href: "/destinations" },
    { label: "Gulmarg", href: "/destinations" },
    { label: "Pahalgam", href: "/destinations" },
    { label: "Sonamarg", href: "/destinations" },
    { label: "Ladakh", href: "/destinations" },
    { label: "Jammu", href: "/destinations" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Our Vision", href: "/our-vision" },
    { label: "Blog", href: "/blog" },
    { label: "Careers (Coming Soon)", href: "#" },
    { label: "Press", href: "/press" },
    { label: "Partner With Us", href: "/partner/register" },
    { label: "Contact", href: "/contact" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Cancellation Policy", href: "/cancellation" },
    { label: "Safety Guidelines", href: "/safety" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Sitemap", href: "/sitemap.xml" },
  ],
};

export default function Footer() {
  return (
    <footer className="text-slate-400 bg-[var(--slate-900)]">
      {/* Newsletter Banner */}
      <div className="py-12 bg-[var(--primary)] text-white">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl font-bold">
              Get Kashmir Travel Deals & Tips
            </h3>
            <p className="text-white/80 mt-1 text-sm">
              Early access to seasonal offers, travel guides, and insider recommendations.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 md:w-72 px-4 py-3 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all border border-white/20 whitespace-nowrap">
              Subscribe <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src="/brand-icon.jpg" alt="WanderKashmir logo" className="w-full h-full object-cover rounded-md shadow-sm" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-white leading-none mt-1">
                  <span className="text-[#f97316]">Wander</span>Kashmir
                </span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Kashmir&apos;s first all-in-one travel marketplace. Book verified
              stays, taxis, tours, and local guides — all in one place.
            </p>
            <div className="space-y-3 mb-8">
              <a
                href="tel:+916005888754"
                className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-3"
              >
                <Phone className="w-4 h-4 text-[var(--primary)]" />
                +91 60058 88754
              </a>
              <a
                href="mailto:support@wanderkashmir.com"
                className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-3"
              >
                <Mail className="w-4 h-4 text-[var(--primary)]" />
                support@wanderkashmir.com
              </a>
              <div className="flex items-center gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
                Devlok Block Majra Dehradhun Uttrakhand
              </div>
            </div>
            {/* Social */}
            <div className="flex gap-3">
              {[
                { Icon: InstagramIcon, href: "https://instagram.com/wander__kashmir", label: "Instagram" },
                { Icon: FacebookIcon, href: "https://facebook.com/wanderkashmir", label: "Facebook" },
                { Icon: YoutubeIcon, href: "https://youtube.com/@wanderkashmir", label: "YouTube" },
                { Icon: XIcon, href: "https://x.com/wanderkashmir", label: "Twitter" },
                { Icon: LinkedinIcon, href: "https://www.linkedin.com/company/wanderkashmir/", label: "LinkedIn" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-[var(--primary)] flex items-center justify-center transition-all hover:text-white"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav Columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-semibold text-white mb-5">{heading}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-[var(--primary)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>
            © {new Date().getFullYear()} WanderKashmir. All rights reserved.
            Made with ❤️ in Kashmir.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy
            </Link>
            <Link href="/cookies" className="hover:text-slate-300 transition-colors">
              Cookies
            </Link>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-700">
              <span>🇮🇳</span>
              <span>India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
