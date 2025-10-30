'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/blood-requests');
        const data = await response.json();
        setApiData(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Page - Blood Requests Data</h1>
      
      <h2>Total Requests: {apiData?.length || 0}</h2>
      
      {apiData && apiData.length > 0 && (
        <div>
          <h3>First Request Sample:</h3>
          <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th>Field</th>
                <th>Value</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(apiData[0]).map(([key, value]) => (
                <tr key={key}>
                  <td><strong>{key}</strong></td>
                  <td>{value === null ? '<NULL>' : value === undefined ? '<UNDEFINED>' : String(value)}</td>
                  <td style={{ color: '#666' }}>{typeof value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>All Requests (Age Focus):</h3>
          <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th>ID</th>
                <th>Patient Name</th>
                <th>Blood Group</th>
                <th>Age</th>
                <th>Age Type</th>
                <th>Age Value Check</th>
              </tr>
            </thead>
            <tbody>
              {apiData.map((request: any) => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>{request.patientName}</td>
                  <td>{request.bloodGroup}</td>
                  <td style={{ 
                    backgroundColor: request.age ? '#d4edda' : '#f8d7da',
                    fontWeight: 'bold'
                  }}>
                    {request.age === null ? 'NULL' : request.age === undefined ? 'UNDEFINED' : request.age === 0 ? 'ZERO' : request.age}
                  </td>
                  <td>{typeof request.age}</td>
                  <td>
                    {request.age ? '✓ Has value' : '✗ Empty/Falsy'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Raw JSON Data:</h3>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '5px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(apiData, null, 2)}
          </pre>
        </div>
      )}

      {(!apiData || apiData.length === 0) && (
        <p>No blood requests found in database.</p>
      )}
    </div>
  );
}
