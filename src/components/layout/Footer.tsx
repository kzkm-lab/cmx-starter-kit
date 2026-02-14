import Link from "next/link"

const footerLinks = [
  { href: "/about", label: "会社概要" },
  { href: "/contact", label: "お問い合わせ" },
  { href: "/blog", label: "ブログ" },
  { href: "/news", label: "ニュース" },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-600">
      <div className="container mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-slate-900">CMX</span>
            </Link>
            <p className="text-sm text-slate-500 max-w-xs">
              AI-first MDX CMS。
              <br />
              次世代のコンテンツ管理を、ここから。
            </p>
          </div>

          {/* Product Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  Updates
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {currentYear} CMX Corporation. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="/admin" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Admin Login
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
