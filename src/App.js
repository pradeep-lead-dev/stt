import { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import useClipboard from "react-use-clipboard";
import "./App.css";

const App = () => {
  const [textToCopy, setTextToCopy] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [autoCorrect, setAutoCorrect] = useState(false);
  const [isCopied, setCopied] = useClipboard(textToCopy, { successDuration: 1000 });
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const previousTranscript = useRef(""); // Stores previous transcript
  const userEdited = useRef(false); // Tracks manual edits

  // Append only new transcript chunks if auto-correct is off or user has edited
  useEffect(() => {
    if (!autoCorrect) {
      const newChunk = transcript.slice(previousTranscript.current.length);
      if (newChunk) {
        setTextToCopy((prev) => prev + newChunk);
      }
    } else if (!userEdited.current) {
      setTextToCopy(transcript);
    }
    previousTranscript.current = transcript;
  }, [transcript, autoCorrect]);

  useEffect(() => {
    // Restart recognition if it stops unexpectedly
    const interval = setInterval(() => {
      const isStopped = !SpeechRecognition.browserSupportsSpeechRecognition || SpeechRecognition._isListening === false;
      if (isRecording && isStopped) {
        console.log("Restarting speech recognition...");
        SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
      }
    }, 3000);
  
    return () => clearInterval(interval);
  }, [isRecording]);
  

  const handleListening = () => {
    if (isRecording) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript(); // Clear for fresh session
      previousTranscript.current = "";
      SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
    }
    setIsRecording(!isRecording);
  };

  const handleReset = () => {
    resetTranscript();
    previousTranscript.current = "";
    setTextToCopy("");
    userEdited.current = false;
  };

  const handleTextChange = (e) => {
    setTextToCopy(e.target.value);
    userEdited.current = true;
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

        <button className="action-btn reset-btn" onClick={handleReset}>
          Reset
        </button>

        <button className="action-btn copy-btn" onClick={setCopied}>
          {isCopied ? 'Copied!' : 'Copy'}
        </button>
{/* 
        <button
          className={`action-btn autocorrect-btn ${autoCorrect ? 'on' : 'off'}`}
          onClick={handleAutoCorrectToggle}
        >
          Auto-correct: {autoCorrect ? 'On' : 'Off'}
        </button> */}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default App;