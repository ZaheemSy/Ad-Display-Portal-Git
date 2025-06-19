import React, { useState, useRef, useEffect } from 'react';

function MovementLogs() {
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('https://ad-display-backend.onrender.com/api/logs');
      const data = await res.json();
      if (Array.isArray(data)) {
        setLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch logs', err);
    }
  };

  const startLogs = () => {
    if (intervalRef.current) return;
    fetchLogs();
    intervalRef.current = setInterval(fetchLogs, 500);
    setRunning(true);
  };

  const stopLogs = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Movement Logs</h2>
      <div style={{ marginBottom: 10 }}>
        <button onClick={startLogs} disabled={running} style={{ marginRight: 10 }}>
          Start
        </button>
        <button onClick={stopLogs} disabled={!running}>
          Stop
        </button>
      </div>
      <div
        style={{
          background: '#f7f7f7',
          padding: 10,
          border: '1px solid #ddd',
          borderRadius: 4,
          maxHeight: 400,
          overflowY: 'auto',
        }}
      >
        {logs.length === 0 ? (
          <div>No logs</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} style={{ marginBottom: 4 }}>
              <span style={{ color: '#555' }}>
                {new Date(log.createdAt._seconds * 1000).toLocaleString()} - {log.level}
              </span>{' '}
              {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MovementLogs;
