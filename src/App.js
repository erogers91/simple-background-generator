import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-modal';

Modal.setAppElement('#root');

function App() {
  const [inputText, setInputText] = useState('');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Roboto');
  const [showModal, setShowModal] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const generateImage = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');

      const canvasWidth = 1200;
      const canvasHeight = 1200;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      const fontSize = 40;
      const selectedFontFamily = fontFamily ? fontFamily : 'Roboto';

      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = `${fontSize}px ${selectedFontFamily}`;

      context.clearRect(0, 0, canvasWidth, canvasHeight);

      if (backgroundImage) {
        context.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
      } else {
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      context.fillStyle = textColor;

      const words = inputText.split(' ');
      const lineHeight = fontSize * 1.2;
      const maxLines = Math.floor(canvasHeight / lineHeight);
      const lines = [];
      let currentLine = '';

      words.forEach((word) => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = context.measureText(testLine).width;

        if (testWidth > canvasWidth || lines.length === maxLines) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });

      lines.push(currentLine);

      const textX = canvasWidth / 2 + position.x;
      const textY = canvasHeight / 2 + position.y;

      lines.forEach((line, index) => {
        const textBaselineY = textY + lineHeight * (index + 0.5);
        context.fillText(line, textX, textBaselineY);
      });
    };

    generateImage();
  }, [inputText, backgroundImage, backgroundColor, textColor, fontFamily, position]);

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleFontFamilyChange = (event) => {
    setFontFamily(event.target.value);
  };

  function openModal() {
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }

  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    const imageFormat = 'jpeg';
    const imageQuality = 0.9;
    const downloadLink = document.createElement('a');
    const dataURL = canvas.toDataURL(`image/${imageFormat}`, imageQuality);

    downloadLink.href = dataURL;
    downloadLink.download = 'image.' + imageFormat;
    downloadLink.click();
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => setBackgroundImage(img);
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  };

  const handleMouseDown = (event) => {
    setIsDragging(true);
  
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
  
    const initialPosition = {
      x: offsetX - position.x,
      y: offsetY - position.y,
    };
  
    setPosition((prevPosition) => ({
      ...prevPosition,
      initial: initialPosition,
    }));
  };

  const handleMouseMove = (event) => {
    if (isDragging) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
  
      setPosition((prevPosition) => ({
        ...prevPosition,
        x: offsetX - prevPosition.initial.x,
        y: offsetY - prevPosition.initial.y,
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="App">
      <h1 className="title">Simple Background Maker</h1>
      <button onClick={openModal} className="help-button">
        How to Use
      </button>
      <Modal
        isOpen={showModal}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="overlay"
      >
        <h2>How to Use</h2>
        <p>
          This is a simple background text image generator. Enter your text in the input field, choose colors and font family, and the app will generate an image with the text rendered on a background. 
          <p>You can even upload your own image in the background and write over it. <br></br> Aswell as drag to move the text you added.</p>
        </p>
        <p>
          Use the "Save Image" button to download the generated image to your device.
        </p>
        <button onClick={closeModal} className="close-button">
          Close
        </button>
      </Modal>
      <button onClick={handleSaveImage} className="save-button">
        Save Image
      </button>

      <div className="input-container">
        <textarea
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Enter text"
          className="input-field"
        />
      </div>
      <div className="color-picker-container">
        <div className="color-picker-wrapper">
          <span className="label-text">Background Color</span>
          <label htmlFor="background-color-picker">
            <FontAwesomeIcon icon={faPalette} className="color-picker-icon" />
          </label>
          <input
            type="color"
            id="background-color-picker"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="color-picker"
          />
        </div>
        <div className="color-picker-wrapper">
          <span className="label-text">Text Color</span>
          <label htmlFor="text-color-picker">
            <FontAwesomeIcon icon={faPalette} className="color-picker-icon" />
          </label>
          <input
            type="color"
            id="text-color-picker"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="color-picker"
          />
        </div>
        <div className="font-family-wrapper">
          <span className="label-text">Font Family</span>
          <select value={fontFamily} onChange={handleFontFamilyChange} className="font-family-dropdown">
            <option value="Roboto">Roboto</option>
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
          </select>
        </div>
      </div>
      <div className="upload-container">
        <label htmlFor="image-upload" className="upload-label">
          Upload Background Image
        </label>
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          onChange={handleImageUpload}
          className="upload-input"
        />
      </div>
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          className="canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>
      <div className="footer">
        <div className="footer-text">Created by: Eric Rogers</div>
      </div>
    </div>
  );
}

export default App;
