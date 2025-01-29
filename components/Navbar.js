


'use client'
import Link from 'next/link';
import { useState } from 'react';
import {UserButton} from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';
export default function Navbar() {
  const user = useUser();
  console.log(user.user?.id);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-white">AskC</Link> 
        <div className="md:hidden">
          <button 
            className="text-white hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
            onClick={toggleMenu}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <nav className="hidden md:flex space-x-4">
          <Link href="/" className="  text-white  hover:text-blue-500">Home</Link>
          <Link href="/forums" className=  " text-white  hover:text-blue-500">Forums</Link>
          <Link href="/chat" className=" text-white hover:text-blue-500">UserChat</Link>
          <li>
          <UserButton />
          
         </ li>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="bg-white pt-2 pb-4 space-y-6">
          <Link href="/" className="text-gray-900 block px-4 py-2 hover:bg-gray-100">Home</Link>
          <Link href="/about" className="text-gray-900 block px-4 py-2 hover:bg-gray-100">About</Link>
          <Link href="/contact" className="text-gray-900 block px-4 py-2 hover:bg-gray-100">Contact</Link>
          <li>
          <UserButton />
          
         </ li>
        
        </div>
      </div>
    </header>
  );
}