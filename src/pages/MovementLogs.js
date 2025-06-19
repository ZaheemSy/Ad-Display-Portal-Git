import React, { useState, useRef, useEffect } from 'react';

function MovementLogs() {
  const [deviceData, setDeviceData] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const fetchAllLogs = async () => {
    try {
      const res = await fetch('https://ad-display-backend.onrender.com/api/logs');
      const data = await res.json();
      if (Array.isArray(data)) {
        setDeviceData(data);
        if (selectedDevice) {
          const device = data.find((d) => d.deviceCode === selectedDevice);
          setLogs(device && Array.isArray(device.logs) ? device.logs : []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch logs', err);
    }
  };

  const fetchDeviceLogs = async () => {
    try {
      const res = await fetch('https://ad-display-backend.onrender.com/api/logs');
      const data = await res.json();
      if (Array.isArray(data)) {
        const device = data.find((d) => d.deviceCode === selectedDevice);
        setLogs(device && Array.isArray(device.logs) ? device.logs : []);
      }
    } catch (err) {
      console.error('Failed to fetch device logs', err);
    }
  };

  const startLogs = () => {
    if (intervalRef.current || !selectedDevice) return;
    fetchDeviceLogs();
    intervalRef.current = setInterval(fetchDeviceLogs, 500);
    setRunning(true);
  };

  const stopLogs = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  };

  const handleDeviceClick = (deviceCode) => {
    stopLogs();
    setSelectedDevice(deviceCode);
    const device = deviceData.find((d) => d.deviceCode === deviceCode);
    setLogs(device && Array.isArray(device.logs) ? device.logs : []);
  };

  const backToDevices = () => {
    stopLogs();
    setSelectedDevice(null);
    setLogs([]);
  };

  useEffect(() => {
    fetchAllLogs();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Movement Logs</h2>
      {!selectedDevice ? (
        <div style={{ background: '#f7f7f7', padding: 10, border: '1px solid #ddd', borderRadius: 4 }}>
          {deviceData.length === 0 ? (
            <div>No devices</div>
          ) : (
            deviceData.map((d) => (
              <div
                key={d.deviceCode}
                onClick={() => handleDeviceClick(d.deviceCode)}
                style={{ padding: 8, cursor: 'pointer', borderBottom: '1px solid #eee' }}
              >
                {d.deviceCode}
              </div>
            ))
          )}
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 10 }}>
            <button onClick={startLogs} disabled={running} style={{ marginRight: 10 }}>
              Start
            </button>
            <button onClick={stopLogs} disabled={!running} style={{ marginRight: 10 }}>
              Stop
            </button>
            <button onClick={backToDevices}>Back</button>
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
        </>
      )}
    </div>
  );
}

export default MovementLogs;
