import React, { useState } from 'react';

function ImageUpload({ onUpload }) {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files); // Store files locally
    onUpload(files); // Pass files to the parent
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        style={{ marginBottom: '10px' }}
      />
      <div style={{ marginTop: '10px' }}>
        {selectedFiles.map((file, index) => (
          <p key={index}>{file.name}</p>
        ))}
      </div>
    </div>
  );
}

export default ImageUpload;
