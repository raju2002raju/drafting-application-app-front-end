// AiChat.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { baseUrl } from '../Config';
import { Modal } from '../Modal/Modal';


export const AiChat = ({ isOpen, onClose, content, onUpdateContent }) => {
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${baseUrl}/api/ai-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateText: content, transcript: message })
      });

      const data = await response.json();
      const updatedContent = data.correctedText || data.success || '';
      onUpdateContent(updatedContent);
      onClose();
    } catch (error) {
      console.error('AI update failed:', error);
    }
    setIsProcessing(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">AI Assistant</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-700 overflow-auto max-h-60">{content}</p>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 border rounded resize-none h-32"
          placeholder="Enter your changes..."
        />

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Update'}
          </button>
        </div>
      </div>
    </Modal>
  );
};