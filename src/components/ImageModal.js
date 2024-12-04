import React from 'react';
import './ImageModal.css'; // Optional: Create a CSS file for styling

const ImageModal = ({ images, onClose, onDelete }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Manage Images</h2>
        <button onClick={onClose} className="close-button">Close</button>
        {images.length === 0 ? (
          <p>No images uploaded.</p>
        ) : (
          <div>
            {images.map((image, index) => (
              <div key={index} className="image-item">
                <img src={image.base64} alt={image.file.name} style={{ width: '100px', height: '100px' }} />
                <p>{image.file.name}</p>
                <button onClick={() => onDelete(index)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageModal;