import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="fl-logo"><img src="/logo.png" alt="SNAR"/></div>
          <p>SNAR sportswear is built to push your limits and ignite your edge. Every product is a step towards stronger, better you.</p>
          <div className="fl-social">
            <Link href="#" className="fl-soc">ig</Link>
            <Link href="#" className="fl-soc">fb</Link>
            <Link href="#" className="fl-soc">yt</Link>
            <Link href="#" className="fl-soc">tw</Link>
          </div>
        </div>
        <div className="footer-col">
          <h4>Shop</h4>
          <ul>
            <li><Link href="/men">Men</Link></li>
            <li><Link href="/women">Women</Link></li>
            <li><Link href="/accessories">Accessories</Link></li>
            <li><Link href="#">New Arrivals</Link></li>
            <li><Link href="#">Best Sellers</Link></li>
            <li><Link href="/collections">Collections</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="#">Our Technology</Link></li>
            <li><Link href="#">Sustainability</Link></li>
            <li><Link href="#">Careers</Link></li>
            <li><Link href="#">Blog</Link></li>
            <li><Link href="#">Contact Us</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Help</h4>
          <ul>
            <li><Link href="#">Size Guide</Link></li>
            <li><Link href="#">Shipping Info</Link></li>
            <li><Link href="#">Returns & Exchanges</Link></li>
            <li><Link href="#">Track Order</Link></li>
            <li><Link href="#">FAQs</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Newsletter</h4>
          <p style={{fontSize:".8rem",color:"var(--muted)",lineHeight:1.65,marginBottom:".5rem"}}>Stay updated with our latest releases and offers.</p>
          <div className="nl-input-wrap">
            <input className="nl-input" type="email" placeholder="Enter your email"/>
            <button className="nl-send">
              <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-copy">© 2024 SNAR. All rights reserved.</div>
        <div className="footer-legal">
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms & Conditions</Link>
        </div>
      </div>
    </footer>
  );
}
