// GenerateDocument.jsx

import React, { useRef, useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { baseUrl } from '../Config';
import { Navbar } from '../Navbar/Navbar';
import { Footer } from '../Footer/Footer';
import { Section } from '../Section/Section';
import { Preview } from '../Preview/Preview';
import { Modal } from '../Modal/Modal';

const GenerateDocument2 = () => {
    const fileInputRef = useRef(null);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [documentData, setDocumentData] = useState(null);
    const [notes, setNotes] = useState('');
    const [isShowNote, setIsShowNote] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [sections, setSections] = useState([]);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [isResetting, setIsResetting] = useState(false);
    const [showAddContent, setShowAddContent] = useState(false);
    const [addPosition, setAddPosition] = useState(null);
    const [newContent, setNewContent] = useState('');

    useEffect(() => {
        fetchTemplates();
      }, []);


      const fetchTemplates = async () => {
        try {
          const response = await fetch(`${baseUrl}/api/documents`);
          const data = await response.json();
          setTemplates(data);
        } catch (error) {
          console.error('Error fetching templates:', error);
        }
      };
    
      const toggleNotepad = () => {
        setIsShowNote(!isShowNote);
      };
    
    
      const handleTemplateChange = async (e) => {
        const templateId = e.target.value;
        if (templateId) {
          try {
            setIsResetting(true);
            const response = await fetch(`${baseUrl}/api/documents/${templateId}`);
            const data = await response.json();
            setSelectedTemplate(templateId);
            setDocumentData(data);
    
            const formattedSections = data.Sheet1.map((item, index) => ({
              id: index,
              title: item['NameofFields'],
              content: item['ExampleContent'],
            }));
            setSections(formattedSections);
          } catch (error) {
            console.error('Error fetching document data:', error);
          } finally {
            setIsResetting(false);
          }
        } else {
          handleReset();
        }
      };
    
      const handleReset = () => {
        setIsResetting(true);
        setSelectedTemplate(null);
        setDocumentData(null);
        setSections([]);
        setSelectedSectionId(null);
        setTimeout(() => setIsResetting(false), 500);
      };
    
      const handleDuplicate = (sectionId) => {
        const sectionIndex = sections.findIndex(section => section.id === sectionId);
        const sectionToDuplicate = sections[sectionIndex];
        const newSection = {
          ...sectionToDuplicate,
          id: Date.now()
        };
        const newSections = [...sections];
        newSections.splice(sectionIndex + 1, 0, newSection);
        setSections(newSections);
      };
    
      const handleDelete = (sectionId) => {
        setSections(sections.filter(section => section.id !== sectionId));
        if (selectedSectionId === sectionId) {
          setSelectedSectionId(null);
        }
      };
    
      const handleAddBelowSection = (sectionId) => {
        const sectionIndex = sections.findIndex(section => section.id === sectionId);
        setShowAddContent(true);
        setAddPosition(sectionIndex + 1);
      };

        const handleAddContent = () => {
    if (newContent.trim()) {
      const newSection = {
        id: Date.now(),
        title: 'New Section',
        content: newContent,
        type: 'text'
      };
      
      if (addPosition !== null) {
        const newSections = [...sections];
        newSections.splice(addPosition, 0, newSection);
        setSections(newSections);
      } else {
        setSections([...sections, newSection]);
      }
      
      setNewContent('');
      setShowAddContent(false);
      setAddPosition(null);
    }
  };
    
      const handleUpdateSectionContent = (sectionId, newContent) => {
        setSections(sections.map(section =>
          section.id === sectionId
            ? { ...section, content: newContent }
            : section
        ));
      };
    
      const handleExport = async (format) => {
        try {
          const response = await fetch(`${baseUrl}/api/export/${format}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sections })
          });
    
          if (!response.ok) {
            throw new Error(`Failed to export ${format} file`);
          }
    
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `document.${format}`;
          a.click();
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Export failed:', error);
        }
      };

      const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
      
        const MAX_FILE_SIZE = 10 * 1024 * 1024; 
        if (file.size > MAX_FILE_SIZE) {
          alert('File size exceeds 10MB limit. Please choose a smaller file.');
          e.target.value = '';
          return;
        }
      
        try {
          const formData = new FormData();
          formData.append('file', file);
      
          const extractResponse = await fetch(`${baseUrl}/api/extract-text`, {
            method: 'POST',
            body: formData
          });
      
          if (!extractResponse.ok) {
            throw new Error('Failed to extract text from file');
          }
      
          const { text } = await extractResponse.json();
          
          // Split text into individual sections
          const processContent = (text) => {
            const sections = [];
            let sectionCounter = 1; 
            
            // Split text into lines and clean them
            const lines = text.split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0);
            
            let currentParagraph = '';
            
            lines.forEach((line, index) => {
              const isBulletPoint = /^[\u2022\u2023\u25E6\u2043\u2022\-\*]\s+/.test(line);
              const isNumberedList = /^\d+[\.)]\s+/.test(line);
              
              if (isBulletPoint) {
                if (currentParagraph) {
                  sections.push({
                    NameofFields: `Section ${sectionCounter}`,
                    ExampleContent: currentParagraph.trim()
                  });
                  sectionCounter++;
                  currentParagraph = '';
                }
                
                const bulletContent = line.replace(/^[\u2022\u2023\u25E6\u2043\u2022\-\*]\s+/, '').trim();
                sections.push({
                  NameofFields: `Section ${sectionCounter}`,
                  ExampleContent: '• ' + bulletContent
                });
                sectionCounter++;
              }
              else if (isNumberedList) {
                if (currentParagraph) {
                  sections.push({
                    NameofFields: `Section ${sectionCounter}`,
                    ExampleContent: currentParagraph.trim()
                  });
                  sectionCounter++;
                  currentParagraph = '';
                }
                
                const numberMatch = line.match(/^\d+/)[0];
                const numberedContent = line.replace(/^\d+[\.)]\s+/, '').trim();
                sections.push({
                  NameofFields: `Section ${sectionCounter}`,
                  ExampleContent: `${numberMatch}. ${numberedContent}`
                });
                sectionCounter++;
              }
              else {
                if (currentParagraph && 
                    (currentParagraph.endsWith('.') || 
                     currentParagraph.endsWith('!') || 
                     currentParagraph.endsWith('?'))) {
                  sections.push({
                    NameofFields: `Section ${sectionCounter}`,
                    ExampleContent: currentParagraph.trim()
                  });
                  sectionCounter++;
                  currentParagraph = line;
                } else {
                  // Add to current paragraph with proper spacing
                  currentParagraph = currentParagraph 
                    ? currentParagraph + ' ' + line 
                    : line;
                }
              }
            });
            
            // Add any remaining paragraph
            if (currentParagraph) {
              sections.push({
                NameofFields: `Section ${sectionCounter}`,
                ExampleContent: currentParagraph.trim()
              });
            }
            
            return sections;
          };
      
          const sheet1 = processContent(text);
          
          const documentData = {
            id: uuidv4(),
            Sheet1: sheet1
          };
      
          // Handle large documents with chunking
          const CHUNK_SIZE = 500 * 1024;
          if (JSON.stringify(documentData).length > CHUNK_SIZE) {
            const chunks = [];
            for (let i = 0; i < sheet1.length; i += 50) {
              chunks.push({
                id: uuidv4(),
                Sheet1: sheet1.slice(i, i + 50),
                chunkIndex: i / 50,
                totalChunks: Math.ceil(sheet1.length / 50)
              });
            }
      
            // Upload chunks sequentially
            for (const chunk of chunks) {
              const response = await fetch(`${baseUrl}/api/court-document`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(chunk)
              });
      
              if (!response.ok) {
                throw new Error(`Failed to store chunk ${chunk.chunkIndex + 1}`);
              }
            }
          } else {
            // Upload small document in one request
            const response = await fetch(`${baseUrl}/api/court-document`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(documentData)
            });
      
            if (!response.ok) {
              throw new Error('Failed to store document');
            }
          }
      
          // Update the sections state to trigger re-render with new boxes
          setDocumentData(documentData);
          const formattedSections = documentData.Sheet1.map((item, index) => ({
            id: index,
            title: item.NameofFields,
            content: item.ExampleContent,
          }));
          setSections(formattedSections);
      
          e.target.value = '';
          alert('Document uploaded successfully!');
      
        } catch (error) {
          console.error('Error processing file:', error);
          alert(`Error processing file: ${error.message}`);
        }
      };

  return (
    <div className="min-h-screen bg-white">
        <Navbar 
        toggleNotepad={() => setIsShowNote(!isShowNote)} 
        togglePreview={() => setShowPreview(!showPreview)} 
      />
       {/* Main content */}
       <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            className="text-blue-600 font-medium outline-none"
            disabled={isResetting}
          >
            USE MY OWN DOCUMENT
          </button>
          <hr className='w-48 mt-6 border-blue-600' />
        </div>

        {sections.length > 0 ? (
          <div className="mt-8  flex w-full gap-3">
            <div className='w-full'>
              <div className="flex space-x-4 mb-8">
                <select
                  className="w-full p-2 border rounded-md text-gray-500 outline-none"
                  onChange={handleTemplateChange}
                  value={selectedTemplate || ''}
                  disabled={isResetting}
                >
                 <option value="">Select Template (Optional)</option>
{templates.map((template) => (
  <option key={template._id} value={template._id}>
    {template.name.length > 20 ? `${template.name.substring(0, 96)}...` : template.name}
  </option>
))}

                </select>

                {selectedTemplate && (
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          RESET
        </button>
      )}

<div className="flex space-x-4">
        <button
          className={`px-6 py-2 text-white rounded-md flex items-center ${
            selectedTemplate ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-500 hover:bg-blue-600'
          }`}
          onClick={() => fileInputRef.current.click()}
          disabled={selectedTemplate}
        >
          <Upload className="mr-2 h-5 w-5" />
          UPLOAD FILE
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          disabled={selectedTemplate}
          accept=".txt,.doc,.docx,.pdf"
          onChange={handleFileUpload}
        />
      </div>
              </div>
              {sections.map(section => (
                <Section
                  key={section.id}
                  section={section}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onAdd={handleAddBelowSection}
                  isSelected={selectedSectionId === section.id}
                  onSelect={setSelectedSectionId}
                  isDisabled={isResetting}
                  onUpdateContent={handleUpdateSectionContent}
                />

              ))}

            </div>
           
            <div>
              <Preview
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                sections={sections}
                onExport={handleExport}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex space-x-4 mb-8">
              <select
                className="w-full p-2 border rounded-md text-gray-500 outline-none"
                onChange={handleTemplateChange}
                value={selectedTemplate || ''}
                disabled={isResetting}
              >
                            <option value="">Select Template (Optional)</option>
{templates.map((template) => (
  <option key={template._id} value={template._id}>
    {template.name.length > 20 ? `${template.name.substring(0, 96)}...` : template.name}
  </option>
))}
              </select>

              {selectedTemplate && (
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  RESET
                </button>
              )}

              <div className="flex space-x-4">
                <button
                  className="px-6 py-2 bg-gray-500 text-white rounded-md flex items-center hover:bg-blue-600"
                  onClick={() => fileInputRef.current.click()}
                  disabled={isResetting}
                >
                  <Upload className="mr-2 h-5 w-5" />
                  UPLOAD FILE
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  disabled={isResetting}
                  accept=".txt,.doc,.docx,.pdf"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
            <div className="text-center mb-60">
              <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
                Welcome to First Draft
                <img src='/Images/Group (9).png' className='w-6 ml-5' alt="First Draft Icon" />
              </h1>
              <h2 className="text-2xl font-bold mb-4">
                Get started now and take the hassle out of legal paperwork!
              </h2>
              <p className="text-gray-600">
                Enjoy a smooth, guided process that empowers you to create professional, reliable documents with ease.
              </p>
            </div>
          </>
        )}

<Modal isOpen={showAddContent} onClose={() => setShowAddContent(false)}>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Content</h2>
              <button 
                onClick={() => setShowAddContent(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <textarea
              placeholder="Enter your content here..."
              className="w-full p-2 border rounded mb-4 h-32 resize-none"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddContent(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddContent}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </Modal>

        {isShowNote && (
          <div className="fixed top-20 right-24 border bg-white p-4 rounded-lg shadow-lg z-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Add Notes</h3>
              <button onClick={toggleNotepad}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              placeholder="Write Your Notes Here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-64 h-32 p-2 border rounded outline-none resize-none"
            />
          </div>
        )}
      </div>

    <Footer />
    </div>
  )
}

export default GenerateDocument2
