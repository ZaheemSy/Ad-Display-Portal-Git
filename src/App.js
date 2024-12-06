import React, { useState, useEffect } from 'react'; 
import ImageUpload from './components/ImageUpload';
import Resizer from 'react-image-file-resizer';
import ImageModal from './components/ImageModal';

function App() {
  // State variables
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [divideTime, setDivideTime] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState('2024-11-25');
  const [endDate, setEndDate] = useState('2024-11-25');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('22:00');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fetchedImages, setFetchedImages] = useState([]); // State for fetched images

  // Fetch images from the backend on component mount
  useEffect(() => {
    const fetchImages = async () => {
        try {
            const response = await fetch('https://ad-display-backend.onrender.com/api/images');
            const result = await response.json();
            console.log('Fetched images:', result); // Log the fetched images

            // Check if the fetch was successful and if data is an array
            if (result.success && Array.isArray(result.data)) {
                setFetchedImages(result.data); // Update state with fetched images
            } else {
                console.error('Fetched data is not an array:', result.data);
                setFetchedImages([]); // Set to empty array if not valid
            }
        } catch (error) {
            console.error('Error fetching images:', error);
            setMessage('An error occurred while fetching images.');
        }
    };
    fetchImages();
  }, []); // Empty dependency array to fetch images only once on mount

  // Handle image deletion from the gallery
  const handleDeleteImage = async (index) => {
      const imageToDelete = fetchedImages[index];

      try {
          const response = await fetch(`https://ad-display-backend.onrender.com/api/images/${imageToDelete.id}`, {
              method: 'DELETE',
              headers: {
                  'Content-Type': 'application/json',
              },
          });

          if (response.ok) {
              // If the delete was successful, update the state
              const updatedFiles = [...fetchedImages];
              updatedFiles.splice(index, 1);
              setFetchedImages(updatedFiles);
              setMessage(`Image ${imageToDelete.imageName} deleted successfully!`);
          } else {
              const errorData = await response.json();
              setMessage(errorData.error || `Failed to delete ${imageToDelete.imageName}.`);
          }
      } catch (error) {
          console.error('Error deleting image:', error);
          setMessage('An error occurred while deleting the image.');
      }
  };

  // Resize the uploaded image before uploading
  const resizeImage = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        800, // Max width
        800, // Max height
        'JPEG', // Format
        90, // Quality
        0, // Rotation (0 for no rotation)
        (uri) => resolve(uri), // Resolve with resized image
        'base64' // Return as base64 string
      );
    });

  // Handle image upload and resize images before setting them
  const handleUpload = async (files) => {
    const resizedImages = await Promise.all(
      Array.from(files).map((file) => resizeImage(file)) // Resize each file
    );
    setUploadedFiles(
      resizedImages.map((base64, index) => ({
        file: files[index],
        base64,
        duration: 0,
      }))
    );
  };

  // Remove an uploaded image from the list
  const handleRemoveImage = (index) => {
    const updatedFiles = [...uploadedFiles];
    updatedFiles.splice(index, 1); // Remove image by index
    setUploadedFiles(updatedFiles);
  };

  // Handle duration change for a specific image
  const handleDurationChange = (index, value) => {
    const updatedFiles = [...uploadedFiles];
    updatedFiles[index].duration = value; // Update the duration
    setUploadedFiles(updatedFiles);
  };

  // Calculate the divided duration when the checkbox is checked
  const calculateDividedDuration = () => {
    if (uploadedFiles.length > 0 && totalDuration > 0) {
      return Math.floor((totalDuration * 60) / uploadedFiles.length); // Divide duration equally
    }
    return 0;
  };

  // Check if the submit button should be disabled
  const isSubmitDisabled = () => {
    if (!startDate || !endDate || !startTime || !endTime) return true; // Disable if required fields are missing
    if (divideTime || uploadedFiles.length === 0) return false; // Allow submit if dividing time or files are present
    return uploadedFiles.some((image) => image.duration === 0); // Disable if any image has no duration set
  };

  // Handle form submission to upload images to the backend
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
        duration: divideTime ? calculateDividedDuration() : Number(image.duration), // Use divided or custom duration
        userId: 1,
        isDBUpdated: 'y', // Mark as needing sync
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
    setUploadedFiles([]); // Clear uploaded images
  };

  // Fetch images from the backend (used in multiple places)
  const handleFetchImages = async () => {
    try {
      const response = await fetch('https://ad-display-backend.onrender.com/api/images');
      const result = await response.json();
      console.log('Fetched images:', result); // Log the fetched images
  
      // Check if the fetch was successful
      if (result.success) {
        setFetchedImages(result.data); // Update state with fetched images
      } else {
        setMessage(result.message || 'Failed to fetch images.');
      }
    } catch (error) {
      console.error('Error fetching images:', error); // Log the error for debugging
      setMessage('An error occurred while fetching images.');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Ad Display Portal v32</h1>

      {/* Date and Time Input */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Common Start/End Dates and Times</h3>
        {/* Start Date */}
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
        {/* End Date */}
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
        {/* Start Time */}
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
        {/* End Time */}
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
      <div>
            <h1>Image Gallery</h1>
            <button onClick={() => setIsModalOpen(true)}>Manage Images</button>
            {isModalOpen && (
                <ImageModal
                    images={fetchedImages}
                    onClose={() => setIsModalOpen(false)}
                    onDelete={handleDeleteImage} // Pass the delete handler
                />
            )}
            {message && <p>{message}</p>}
        </div>

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
          images={fetchedImages} // Pass fetched images to the modal
          onClose={() => setIsModalOpen(false)}
          onDelete={handleDeleteImage} // Corrected line
        />
      )}
    </div>
  );
}

export default App;
