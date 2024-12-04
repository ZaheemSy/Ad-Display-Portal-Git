import React from 'react';

const ImageModal = ({ images, onClose, onDelete }) => {





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






    return (
        <div className="modal" style={modalStyles}>
            <h2>Manage Images</h2>
            {images.length === 0 ? (
                <p>No images uploaded.</p>
            ) : (
                <div>
                    {images.map((image, index) => (
                        <div key={index} style={imageContainerStyles}>
                            <img src={image.imageUrl} alt={image.imageName} style={imageStyles} />
                            <span style={imageNameStyles}>{image.imageName}</span>
                            <button onClick={() => onDelete(index)} style={deleteButtonStyles}>
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <button onClick={onClose} style={closeButtonStyles}>Close</button>
        </div>
    );
};

// Styles for the modal and its contents
const modalStyles = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    width: '400px',
    borderRadius: '8px',
};

const imageContainerStyles = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
};

const imageStyles = {
    width: '60px',
    height: '60px',
    borderRadius: '4px',
};

const imageNameStyles = {
    marginLeft: '10px',
    flexGrow: 1,
};

const deleteButtonStyles = {
    marginLeft: '10px',
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    cursor: 'pointer',
    borderRadius: '4px',
};

const closeButtonStyles = {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: 'blue',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '4px',
};

export default ImageModal;