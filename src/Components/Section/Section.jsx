// Section.jsx
import React, { useRef, useState } from 'react';
import { Pencil, Copy, Trash2, Plus, Square, Mic } from 'lucide-react';
import { baseUrl } from '../Config';
import { AiChat } from '../AiChat/AiChat';

export const Section = ({
  section,
  onDuplicate,
  onDelete,
  onAdd,
  isSelected,
  onSelect,
  isDisabled,
  onUpdateContent,
}) => {
  const [showAiChat, setShowAiChat] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);

  const handleAiUpdate = (updatedContent) => {
    onUpdateContent(section.id, updatedContent);
    setShowAiChat(false);
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordingTime(0);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
        audioBitsPerSecond: 128000
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const wavBlob = await convertToWav(audioBlob);
        await sendAudioToBackend(wavBlob);
        stream.getTracks().forEach(track => track.stop());
        stopTimer();
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      startTimer();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  const convertToWav = async (webmBlob) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 16000
    });
    const arrayBuffer = await webmBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

   
    const wavBuffer = audioContext.createBuffer(
      1,  
      audioBuffer.length,
      16000 
    );

    wavBuffer.copyToChannel(audioBuffer.getChannelData(0), 0);

    const wavBlob = await new Promise(resolve => {
      const offlineContext = new OfflineAudioContext(1, wavBuffer.length, 16000);
      const source = offlineContext.createBufferSource();
      source.buffer = wavBuffer;
      source.connect(offlineContext.destination);
      source.start();

      offlineContext.startRendering().then(renderedBuffer => {
        const wav = new Blob([createWaveFileData(renderedBuffer)], { type: 'audio/wav' });
        resolve(wav);
      });
    });

    return wavBlob;
  };

  const createWaveFileData = (audioBuffer) => {
    const frameLength = audioBuffer.length;
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numberOfChannels * bitsPerSample / 8;
    const blockAlign = numberOfChannels * bitsPerSample / 8;
    const wavDataByteLength = frameLength * numberOfChannels * 2;
    const headerByteLength = 44;
    const totalLength = headerByteLength + wavDataByteLength;
    const waveFileData = new Uint8Array(totalLength);
    const view = new DataView(waveFileData.buffer);


    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + wavDataByteLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, wavDataByteLength, true);

    const channelData = audioBuffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < frameLength; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }

    return waveFileData;
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const sendAudioToBackend = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', new File([audioBlob], 'recording.wav', { type: 'audio/wav' }));
      formData.append('templateText', section.content);

      console.log('Sending to backend:', {
        audio: audioBlob,
        templateText: section.content
      });

      const response = await fetch(`${baseUrl}/api/asr`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('ASR request failed');
      }

      const data = await response.json();
      console.log('Response from backend:', data);

      if (data.chatResponse && data.chatResponse.mergedText) {
        const cleanMergedText = data.chatResponse.mergedText.replace(/^"|"$/g, '');
        onUpdateContent(section.id, cleanMergedText);
      }

    } catch (error) {
      console.error('Error sending audio to ASR:', error);
      alert('Error processing audio: ' + error.message);
    }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div
        className={`border rounded-lg p-4 relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => !isDisabled && onSelect(section.id)}
      >
        <div className='flex justify-between gap-10'>
          <div>
            <h3 className="font-medium mb-2">{section.title}</h3>
            <div className="text-gray-800 whitespace-pre-wrap">{section.content}</div>
          </div>

          {!isDisabled && (
            <div className="flex space-x-5 mt-3">
              {isSelected && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isRecording) {
                        stopRecording();
                      } else {
                        startRecording();
                      }
                    }}
                    className={`p-1 hover:bg-gray-100 rounded ${isRecording ? 'bg-red-100' : ''}`}
                    title={isRecording ? 'Stop Recording' : 'Start Recording'}
                  >
                    {isRecording ? (
                      <Square className="h-10 w-10 text-red-500" />
                    ) : (
                      <Mic className="h-10 w-10 text-gray-500" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAiChat(true);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <div className="h-10 w-10 text-gray-500 flex items-center gap-1 text-5xl font-bold">
                      <img src="/Images/christmas-stars.png" alt="AI" />
                    </div>
                  </button>

                  {isRecording && (
                    <span className="text-red-500 text-sm">
                      {formatTime(recordingTime)}
                    </span>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        
        <AiChat
          isOpen={showAiChat}
          onClose={() => setShowAiChat(false)}
          content={section.content}
          onUpdateContent={handleAiUpdate}
        />
      </div>
      
      <div className='mt-4'>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(section.id);
          }}
          className="p-1 hover:bg-gray-100 rounded"
          title="Duplicate"
        >
          <Copy className="h-4 w-4 text-gray-500" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd(section.id);  
          }}
          className="p-1 hover:bg-gray-100 rounded"
          title="Add Below"
        >
          <Plus className="h-4 w-4 text-gray-500" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(section.id);
          }}
          className="p-1 hover:bg-gray-100 rounded"
          title="Delete"
        >
          <Trash2 className="h-4 w-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
};