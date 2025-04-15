import { useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import useClipboard from "react-use-clipboard";
import "./App.css";

const App = () => {
  const [textToCopy, setTextToCopy] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isCopied, setCopied] = useClipboard(textToCopy, { successDuration: 1000 });
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  // Update text to copy whenever transcript changes
  useEffect(() => {
    setTextToCopy(transcript);
  }, [transcript]);

  const handleListening = () => {
    if (isRecording) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
    }
    setIsRecording(!isRecording);
  };

  const handleReset = () => {
    resetTranscript();
    setTextToCopy("");
  };

  // Handle textarea changes
  const handleTextChange = (e) => {
    setTextToCopy(e.target.value);
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="container">
        <div className="error-message">
          Your browser doesn't support speech recognition. Please try Chrome or Edge.
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <h3>Dot-STT</h3>
      </header>
      <div className="floating-controls">
        <button
          className={`record-btn ${isRecording ? 'recording' : ''}`}
          onClick={handleListening}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          <div className="record-icon">
            <div className={!isRecording ? "record-circle" : "record-square"}></div>
          </div>
          <span>{isRecording ? 'Stop' : 'Start'}</span>
        </button>
        <button
          className="action-btn reset-btn"
          onClick={handleReset}
          aria-label="Reset text"
        >
          Reset
        </button>
        <button
          className="action-btn copy-btn"
          onClick={setCopied}
          aria-label="Copy to clipboard"
        >
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="text-container">
        <textarea
          className="main-content"
          value={textToCopy}
          onChange={handleTextChange}
          placeholder="Speech transcript will appear here..."
        />
        {isRecording && (
          <div className="recording-indicator">
            <div className="recording-waves">
              <div className="wave"></div>
              <div className="wave"></div>
              <div className="wave"></div>
            </div>
            <span>Recording...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;