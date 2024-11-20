import React, { useState, useEffect } from 'react';

function ManageImages() {
  const [cloudinaryImages, setCloudinaryImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('https://ad-display-backend.onrender.com/api/cloudinary-images');
        const result = await response.json();
        if (result.success) {
          setCloudinaryImages(result.data);
        } else {
          setMessage(result.error);
        }
      } catch (err) {
        console.error('Error fetching images:', err);
        setMessage('Failed to fetch images.');
      }
    };
    fetchImages();
  }, []);

  const handleDelete = async (publicId) => {
    try {
      const response = await fetch(`https://ad-display-backend.onrender.com/api/cloudinary-images/${publicId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCloudinaryImages(cloudinaryImages.filter((image) => image.public_id !== publicId));
        setMessage(`Image with Public ID ${publicId} deleted successfully!`);
      } else {
        const result = await response.json();
        setMessage(result.error);
      }
    } catch (err) {
      console.error('Error deleting image:', err);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const response = await fetch('https://ad-display-backend.onrender.com/api/cloudinary-images/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_ids: selectedImages }),
      });

      if (response.ok) {
        setCloudinaryImages(
          cloudinaryImages.filter((image) => !selectedImages.includes(image.public_id))
        );
        setSelectedImages([]);
        setMessage('Selected images deleted successfully!');
      } else {
        const result = await response.json();
        setMessage(result.error);
      }
    } catch (err) {
      console.error('Error deleting multiple images:', err);
    }
  };

  const toggleSelectImage = (publicId) => {
    setSelectedImages((prev) =>
      prev.includes(publicId) ? prev.filter((id) => id !== publicId) : [...prev, publicId]
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Manage Cloudinary Images</h1>
      {cloudinaryImages.length > 0 ? (
        <div>
          <button onClick={handleBulkDelete} disabled={selectedImages.length === 0}>
            Delete Selected Images
          </button>
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedImages.length === cloudinaryImages.length}
                    onChange={() =>
                      setSelectedImages(
                        selectedImages.length === cloudinaryImages.length
                          ? []
                          : cloudinaryImages.map((img) => img.public_id)
                      )
                    }
                  />
                </th>
                <th>Preview</th>
                <th>Public ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cloudinaryImages.map((image) => (
                <tr key={image.public_id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(image.public_id)}
                      onChange={() => toggleSelectImage(image.public_id)}
                    />
                  </td>
                  <td>
                    <img src={image.url} alt={image.public_id} style={{ width: '100px' }} />
                  </td>
                  <td>{image.public_id}</td>
                  <td>
                    <button onClick={() => handleDelete(image.public_id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No images found in Cloudinary.</p>
      )}
      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
}

export default ManageImages;
