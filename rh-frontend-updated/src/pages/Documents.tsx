import React, { useState } from 'react';
import axios from 'axios';
import { VscCloudDownload } from 'react-icons/vsc';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import API_URL from '../config';


const Documents = () => {
  const { t } = useTranslation();
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
      toast({
        title: t('documents_page.download_started'),
        description: t('documents_page.work_certificate_download_success'),
      });

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || t('documents_page.error_unexpected');
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('documents_page.title')}</h2>
        <p className="text-gray-600">{t('documents_page.subtitle')}</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>{t('documents_page.work_certificate_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {t('documents_page.work_certificate_title')}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {t('documents_page.work_certificate_description')}
              </p>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={handleDownloadCertificate}
                  className="flex items-center space-x-1"
                  disabled={loading}
                >
                  <Download className="h-4 w-4" />
                  <span>{loading ? t('documents_page.generating_button') : t('documents_page.download_button')}</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Documents;
