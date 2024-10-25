// Navbar.jsx
import React from 'react';
import { Pencil, Printer } from 'lucide-react';

export const Navbar = ({ toggleNotepad, togglePreview }) => {
  return (
    <nav className="bg-white border-b">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img src='/Images/firstdraftlogowithbackground.png' className='w-10 rounded' alt="Logo" />
            </div>
            <div className="ml-4 flex space-x-8">
              <span className="text-blue-600 font-medium">GENERATE DOCUMENT</span>
              <span className="text-gray-500">MY DOCUMENTS</span>
              <span className="text-gray-500">LOGOUT</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={toggleNotepad} title="Notes">
              <Pencil className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </button>
            <button onClick={togglePreview} title="Preview">
              <Printer className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

