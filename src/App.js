import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import Resizer from 'react-image-file-resizer';
import ImageModal from './components/ImageModal'; // Import the modal component

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [divideTime, setDivideTime] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState('2024-11-25');
  const [endDate, setEndDate] = useState('2024-11-25');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('22:00');
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility

  const resizeImage = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        800,
        800,
        'JPEG',
        90,
        0,
        (uri) => resolve(uri),
        'base64'
      );
    });

  const handleUpload = async (files) => {
    const resizedImages = await Promise.all(
      Array.from(files).map((file) => resizeImage(file))
    );
    setUploadedFiles(
      resizedImages.map((base64, index) => ({
        file: files[index],
        base64,
        duration: 0,
      }))
    );
  };

  const handleRemoveImage = (index) => {
    const updatedFiles = [...uploadedFiles];
    updatedFiles.splice(index, 1);
    setUploadedFiles(updatedFiles);
  };

 const handleDurationChange = (index, value) => {
    const updatedFiles = [...uploadedFiles];
    updatedFiles[index].duration = value;
    setUploadedFiles(updatedFiles);
  };

  const calculateDividedDuration = () => {
    if (uploadedFiles.length > 0 && totalDuration > 0) {
      return Math.floor((totalDuration * 60) / uploadedFiles.length);
    }
    return 0;
  };

  const isSubmitDisabled = () => {
    if (!startDate || !endDate || !startTime || !endTime) return true;
    if (divideTime || uploadedFiles.length === 0) return false;
    return uploadedFiles.some((image) => image.duration === 0);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');

    for (const image of uploadedFiles) {
      const payload = {
        imageName: image.file.name,
        imageUrl: image.base64,
        startDate,
        endDate,
        startTime,
        endTime,
        duration: divideTime ? calculateDividedDuration() : Number(image.duration),
        userId: 1,
      };

      try {
        const response = await fetch('https://ad-display-backend.onrender.com/api/images', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const result = await response.json();
          setMessage(`Image ${image.file.name} uploaded successfully!`);
        } else {
          const errorData = await response.json();
          setMessage(errorData.error || `Failed to upload ${image.file.name}.`);
        }
      } catch (err) {
        setMessage(`An error occurred while uploading ${image.file.name}.`);
      }
    }

    setLoading(false);
    setUploadedFiles([]);
  };

  const handleDeleteImage = (index) => {
    const updatedFiles = [...uploadedFiles];
    updatedFiles.splice(index, 1);
    setUploadedFiles(updatedFiles);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Ad Display Portal v2</h1>

      {/* Date and Time Input */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Common Start/End Dates and Times</h3>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ marginLeft: '10px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ marginLeft: '10px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Start Time:
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{ marginLeft: '10px' }}
            />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            End Time:
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={{ marginLeft: '10px' }}
            />
          </label>
        </div>
      </div>

      {/* Upload Section */}
      <ImageUpload onUpload={handleUpload} />

      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <label>
            <input
              type="checkbox"
              checked={divideTime}
              onChange={(e) => setDivideTime(e.target.checked)}
            />
            Divide time Duration equally
          </label>

          {divideTime && (
            <div style={{ marginTop: '10px' }}>
              <label>Total Duration (in minutes): </label>
              <input
                type="number"
                value={totalDuration}
                onChange={(e) => setTotalDuration(e.target.value)}
                style={{ marginLeft: '10px' }}
              />
            </div>
          )}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Uploaded Images</h3>
 {uploadedFiles.map((image, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <img src={image.base64} alt={image.file.name} style={{ width: '60px', height: '60px' }} />
              <input
                type="number"
                value={divideTime ? calculateDividedDuration() : image.duration}
                onChange={(e) => handleDurationChange(index, e.target.value)}
                disabled={divideTime}
                style={{ marginLeft: '10px' }}
              />
              <button onClick={() => handleRemoveImage(index)} style={{ marginLeft: '10px' }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Manage Button */}
      <button onClick={() => setIsModalOpen(true)} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: 'green', color: 'white' }}>
        Manage
      </button>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitDisabled() || loading}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: isSubmitDisabled() ? 'grey' : 'blue',
          color: 'white',
        }}
      >
        {loading ? 'Uploading...' : 'Submit'}
      </button>

      {/* Message */}
      {message && <p style={{ marginTop: '20px', color: 'red' }}>{message}</p>}

      {/* Modal for Managing Images */}
      {isModalOpen && (
        <ImageModal
          images={uploadedFiles}
          onClose={() => setIsModalOpen(false)}
          onDelete={handleDeleteImage}
        />
      )}
    </div>
  );
}

export default App;