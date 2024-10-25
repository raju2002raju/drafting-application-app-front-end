// Preview.jsx
import React from 'react';
import { X, Download } from 'lucide-react';

export const Preview = ({ isOpen, onClose, sections, onExport }) => {
  if (!isOpen) return null;

  return (
    <div className="flex justify-end border">
      <div className="overflow-auto">
        <div className="sticky top-0 bg-white z-10 p-6 border-b">
          <div className="flex justify-between items-center">
            <div className="space-x-2">
              <button
                onClick={() => onExport('pdf')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <Download className="w-4 h-4 inline-block mr-2" />
                Export PDF
              </button>
              <button
                onClick={() => onExport('docx')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                <Download className="w-4 h-4 inline-block mr-2" />
                Export DOCX
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {sections.map((section, index) => (
              <div
                key={index}
                className="preview-section p-4 rounded-lg"
              >
                <h3 className="font-medium mb-2">{section.title}</h3>
                {typeof section.content === 'string' ? section.content : JSON.stringify(section.content)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};