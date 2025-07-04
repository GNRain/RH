import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Eye, FileText, Trash2, FileCode, FileImage } from 'lucide-react';
import API_URL from '../config';

const getFileIcon = (format) => {
  const upperFormat = format?.toUpperCase();
  if (['PDF'].includes(upperFormat)) return <FileText className="h-6 w-6 text-red-500" />;
  if (['DOC', 'DOCX'].includes(upperFormat)) return <FileText className="h-6 w-6 text-blue-500" />;
  if (['PNG', 'JPG', 'JPEG'].includes(upperFormat)) return <FileImage className="h-6 w-6 text-green-500" />;
  return <FileCode className="h-6 w-6 text-gray-500" />;
};

export const DocumentCard = ({ document, onDelete }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const filePreviewUrl = `${API_URL}/${document.filePath}`;
  const fileDownloadUrl = `${API_URL}/documents/${document.id}/download`;

  const isHr = user && (user.role === 'HR' || user.role === 'DHR');

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-muted rounded-lg">
            {getFileIcon(document.format)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-foreground truncate">{document.title}</h3>
              <Badge style={{ backgroundColor: document.category.color, color: "#fff" }}>{document.category.name}</Badge>
            </div>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{document.description || t('documents_page.no_description')}</p>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground mb-4">
              <div><span className="font-medium text-foreground">{t('documents_page.version')}:</span> {document.version}</div>
              <div><span className="font-medium text-foreground">{t('documents_page.size')}:</span> {document.size} KB</div>
              <div><span className="font-medium text-foreground">{t('documents_page.format')}:</span> {document.format}</div>
              <div><span className="font-medium text-foreground">{t('documents_page.downloads')}:</span> {document.downloads}</div>
            </div>
            
            <div className="text-xs text-muted-foreground mb-4">
              {t('documents_page.uploaded_on')} {new Date(document.createdAt).toLocaleDateString()}
            </div>
            
            <div className="flex space-x-2">
              {isHr && (
                  <Button size="sm" variant="destructive" onClick={() => onDelete(document)} className="flex items-center space-x-1">
                      <Trash2 className="h-4 w-4" /><span>{t('common.delete')}</span>
                  </Button>
              )}
              <Button size="sm" variant="outline" asChild className="flex items-center space-x-1">
                <a href={filePreviewUrl} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4" /><span>{t('documents_page.preview')}</span>
                </a>
              </Button>
              <Button size="sm" asChild className="flex items-center space-x-1">
                <a href={fileDownloadUrl}>
                  <Download className="h-4 w-4" /><span>{t('documents_page.download')}</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};