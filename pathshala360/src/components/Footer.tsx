import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <img src={logo} alt="360 Pathshala" className="h-11 w-auto" />
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
              A 360° Student Management System that blends the soul of traditional
              Pathshala with modern technology — empowering schools, teachers,
              students and parents through one beautiful platform.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Product</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><Link to="/features" className="hover:text-primary">Features</Link></li>
              <li><Link to="/about" className="hover:text-primary">About</Link></li>
              <li><Link to="/demo" className="hover:text-primary">Book a Demo</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground">Get in touch</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 text-accent" /> hello@360pathshala.com</li>
              <li className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-accent" /> +977 98-00000000</li>
              <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-accent" /> Kathmandu, Nepal</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} 360 Pathshala. All rights reserved.</p>
          <p>Crafted with care for modern educators.</p>
        </div>
      </div>
    </footer>
  );
}
