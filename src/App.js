import React, { useState, useEffect } from 'react';
import ImageUpload from './components/ImageUpload';
import Resizer from 'react-image-file-resizer';
import ImageModal from './components/ImageModal';

const TrashIcon = ({ size = 20, color = "#e74c3c" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 6h18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 6v6m4-6v6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [ads, setAds] = useState([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('');
  const [title, setTitle] = useState('');
  const [assignedVehicles, setAssignedVehicles] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setAdsLoading(true);
    setMessage('');
    try {
      const res = await fetch('https://ad-display-backend.onrender.com/api/ads');
      const result = await res.json();
      setAds(Array.isArray(result.ads) ? result.ads : []);
    } catch (e) {
      setMessage('Could not fetch ads.');
    }
    setAdsLoading(false);
  };

  const resizeImage = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        800, 800, 'JPEG', 90, 0,
        (uri) => resolve(uri),
        'base64'
      );
    });

  const handleUpload = async (files) => {
    setSubmitLoading(true);
    const resizedImages = await Promise.all(
      Array.from(files).map((file) => resizeImage(file))
    );
    setUploadedFiles(prev =>
      [
        ...prev,
        ...Array.from(files).map((file, idx) => ({
          file,
          base64: resizedImages[idx],
          name: file.name,
        }))
      ]
    );
    setSubmitLoading(false);
  };

  const handleRemoveImage = (idx) => {
    const updated = [...uploadedFiles];
    updated.splice(idx, 1);
    setUploadedFiles(updated);
  };

  const handleDeleteAd = async (adId) => {
    setAdsLoading(true);
    await fetch(`https://ad-display-backend.onrender.com/api/ads/${adId}`, { method: 'DELETE' });
    setMessage('Ad deleted.');
    fetchAds();
    setAdsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!title || !startDate || !endDate || !startTime || !endTime || !duration || uploadedFiles.length === 0) {
      setMessage('Fill all fields and upload at least one image.');
      return;
    }
    setSubmitLoading(true);

    const adsPayload = uploadedFiles.map(img => ({
      title,
      images: [img.base64],
      startDate,
      endDate,
      startTime,
      endTime,
      duration: Number(duration),
      assignedVehicles: assignedVehicles.split(',').map(v => v.trim()).filter(Boolean),
    }));

    try {
      const res = await fetch('https://ad-display-backend.onrender.com/api/ads/add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ ads: adsPayload }),
      });
      if (res.ok) {
        setMessage('Ad(s) added successfully.');
        setUploadedFiles([]);
        setTitle('');
        setStartDate('');
        setEndDate('');
        setStartTime('');
        setEndTime('');
        setDuration('');
        setAssignedVehicles('');
        fetchAds();
      } else {
        const err = await res.text();
        setMessage(`Failed to add ad. ${err}`);
      }
    } catch {
      setMessage('Failed to add ad.');
    }
    setSubmitLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7fafd',
      padding: '30px 0',
      fontFamily: 'Inter, Arial, sans-serif'
    }}>
      <div style={{
        background: 'white', maxWidth: 700, margin: 'auto',
        borderRadius: 16, boxShadow: '0 4px 24px #0001', padding: 32
      }}>
        <h2 style={{fontWeight: 800, fontSize: 28, letterSpacing: 1}}>Ad Display Portal</h2>
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom: 16}}>
            <label style={{fontWeight: 600}}>Ad Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              required className="input" style={inputStyle}/>
          </div>
          <div style={{display: 'flex', gap: 16, marginBottom: 16}}>
            <div style={{flex: 1}}>
              <label style={{fontWeight: 600}}>Start Date *</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                required className="input" style={inputStyle}/>
            </div>
            <div style={{flex: 1}}>
              <label style={{fontWeight: 600}}>End Date *</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                required className="input" style={inputStyle}/>
            </div>
          </div>
          <div style={{display: 'flex', gap: 16, marginBottom: 16}}>
            <div style={{flex: 1}}>
              <label style={{fontWeight: 600}}>Start Time *</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                required className="input" style={inputStyle}/>
            </div>
            <div style={{flex: 1}}>
              <label style={{fontWeight: 600}}>End Time *</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                required className="input" style={inputStyle}/>
            </div>
          </div>
          <div style={{display: 'flex', gap: 16, marginBottom: 16}}>
            <div style={{flex: 1}}>
              <label style={{fontWeight: 600}}>Duration (min) *</label>
              <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
                min={1} required className="input" style={inputStyle}/>
            </div>
            <div style={{flex: 1}}>
              <label style={{fontWeight: 600}}>Assigned Vehicles (comma separated)</label>
              <input value={assignedVehicles} onChange={e => setAssignedVehicles(e.target.value)}
                className="input" style={inputStyle}/>
            </div>
          </div>
          <div style={{margin: '16px 0'}}>
            <label style={{fontWeight: 600}}>Upload Images *</label>
            <ImageUpload onUpload={handleUpload} />
            <div style={{
              display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12,
              minHeight: uploadedFiles.length ? 72 : 0
            }}>
              {uploadedFiles.map((img, idx) => (
                <div key={idx} style={{
                  border: '1px solid #ddd', borderRadius: 8, padding: 4,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  position: 'relative', background: '#fafdff'
                }}>
                  <img src={img.base64} alt={img.name} style={{width: 64, height: 64, borderRadius: 8, objectFit: 'cover'}} />
                  <span style={{fontSize: 10, color: '#666', marginTop: 2, maxWidth: 80, textAlign: 'center'}}>{img.name}</span>
                  <button type="button" title="Remove" onClick={() => handleRemoveImage(idx)} style={{
                    position: 'absolute', top: 2, right: 2, background: 'none', border: 'none', cursor: 'pointer'
                  }}>
                    <TrashIcon size={16}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button type="submit"
            disabled={submitLoading}
            style={{
              marginTop: 12, background: '#006cff', color: 'white',
              border: 'none', padding: '10px 28px', fontWeight: 700,
              borderRadius: 8, fontSize: 16, cursor: submitLoading ? 'wait' : 'pointer'
            }}>
            {submitLoading ? "Submitting..." : "Add Ad"}
          </button>
        </form>
        {message && <div style={{
          background: '#ffecec', color: '#a60000',
          border: '1px solid #ffd0d0', borderRadius: 8,
          marginTop: 18, padding: '8px 16px', fontWeight: 600
        }}>{message}</div>}
      </div>

      <div style={{
        maxWidth: 900, margin: '48px auto 0', background: '#fff',
        borderRadius: 16, boxShadow: '0 2px 10px #0001', padding: 24
      }}>
        <h3 style={{fontWeight: 700, fontSize: 22, marginBottom: 14}}>All Ads to show</h3>
        {adsLoading ? (
          <div>Loading...</div>
        ) : ads.length === 0 ? (
          <div style={{color: '#aaa'}}>No ads found.</div>
        ) : (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 16
          }}>
            {ads.map((ad) => (
              <div key={ad.id} style={{
                border: '1px solid #eaeaea', borderRadius: 12, background: '#f8fafb',
                padding: 14, minWidth: 220, maxWidth: 250
              }}>
                <div style={{fontWeight: 700, fontSize: 16}}>{ad.title || ad.imageName}</div>
                <div style={{fontSize: 12, color: '#888', marginBottom: 8}}>
                  <span>
                    {ad.startDate? (typeof ad.startDate === "string"
                      ? ad.startDate
                      : new Date(ad.startDate._seconds * 1000).toLocaleDateString()) : ""}
                    {" - "}
                    {ad.endDate? (typeof ad.endDate === "string"
                      ? ad.endDate
                      : new Date(ad.endDate._seconds * 1000).toLocaleDateString()) : ""}
                  </span>
                </div>
                <div style={{
                  display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8
                }}>
                  {(ad.images || [ad.imageUrl]).map((img, idx) => (
                    <div key={idx} style={{position: 'relative'}}>
                      <img
                        src={typeof img === "string" ? img : img.imageUrl}
                        alt={ad.title}
                        style={{
                          width: 60, height: 60, borderRadius: 6, objectFit: 'cover',
                          border: '1px solid #dde'
                        }}
                      />
                      <button type="button" onClick={() => handleDeleteAd(ad.id)}
                        style={{
                          position: 'absolute', top: 2, right: 2, background: 'none', border: 'none', cursor: 'pointer'
                        }}>
                        <TrashIcon size={14}/>
                      </button>
                    </div>
                  ))}
                </div>
                <div style={{fontSize: 12, color: '#777'}}>
                  <div><strong>Time:</strong> {ad.startTime} - {ad.endTime}</div>
                  <div><strong>Duration:</strong> {ad.duration} min</div>
                  <div><strong>Vehicles:</strong> {(ad.assignedVehicles||[]).join(", ")}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <button style={{
          margin: "28px auto 0", display: "block",
          background: "#fff", color: "#003366", border: "1px solid #ddd",
          borderRadius: 6, padding: "10px 22px", fontWeight: 700, fontSize: 16, cursor: "pointer"
        }} onClick={() => setIsModalOpen(true)}>
          Manage Images
        </button>
        {isModalOpen && (
          <ImageModal
            images={ads}
            onClose={() => setIsModalOpen(false)}
            onDelete={(idx) => handleDeleteAd(ads[idx]?.id)}
          />
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  display: 'block',
  width: '100%',
  border: '1px solid #d8e2ef',
  borderRadius: 6,
  padding: '7px 10px',
  fontSize: 15,
  marginTop: 4,
  marginBottom: 2
};

export default App;
