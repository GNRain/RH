import React, { useState } from 'react';
import axios from 'axios';
import { VscFilePdf, VscCloudDownload } from 'react-icons/vsc';
import './DocumentsPage.css';

const API_URL = 'http://localhost:3000';

export function DocumentsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownloadCertificate = async () => {
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await axios.get(`${API_URL}/users/me/work-certificate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob', // Important: tells axios to expect a binary file
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attestation_de_travail.pdf');
      
      // Append to the document, click, and then remove
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An unexpected error occurred.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="documents-container">
      <h1>Documents</h1>
      <p>Select a document to generate and download.</p>
      
      {error && <p className="documents-error">{error}</p>}

      <div className="document-card">
        <div className="document-card-icon">
          <VscFilePdf size={32} />
        </div>
        <div className="document-card-content">
          <h3>Work Certificate</h3>
          <p>An official document certifying your employment, position, and start date.</p>
        </div>
        <button 
          className="document-card-button" 
          onClick={handleDownloadCertificate}
          disabled={loading}
        >
          {loading ? (
            'Generating...'
          ) : (
            <>
              <VscCloudDownload size={18} />
              Download
            </>
          )}
        </button>
      </div>
    </div>
  );
}