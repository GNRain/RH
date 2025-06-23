import React, { useState } from 'react';
import axios from 'axios';
import { VscFilePdf, VscCloudDownload } from 'react-icons/vsc';
import { useTranslation } from 'react-i18next'; // --- ADD IMPORT ---
import './DocumentsPage.css';

const API_URL = 'http://localhost:3000';

export function DocumentsPage() {
  const { t } = useTranslation(); // --- INITIALIZE THE HOOK ---
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
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attestation_de_travail.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err: any) {
      // Use translation for the fallback error message
      const errorMessage = err.response?.data?.message || err.message || t('documents_page.error_unexpected');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="documents-container">
      <h1>{t('documents_page.title')}</h1>
      <p>{t('documents_page.subtitle')}</p>
      
      {error && <p className="documents-error">{error}</p>}

      <div className="document-card">
        <div className="document-card-icon">
          <VscFilePdf size={32} />
        </div>
        <div className="document-card-content">
          <h3>{t('documents_page.work_certificate_title')}</h3>
          <p>{t('documents_page.work_certificate_description')}</p>
        </div>
        <button 
          className="document-card-button" 
          onClick={handleDownloadCertificate}
          disabled={loading}
        >
          {loading ? (
            t('documents_page.generating_button')
          ) : (
            <>
              <VscCloudDownload size={18} />
              {t('documents_page.download_button')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}