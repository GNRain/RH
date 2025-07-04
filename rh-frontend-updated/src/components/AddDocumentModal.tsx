import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import API_URL from '../config';

export const AddDocumentModal = ({ isOpen, onClose, categories, onUploadSuccess }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('1.0');
  const [categoryId, setCategoryId] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title || !version || !categoryId) {
      toast({ title: t('toast.error_title'), description: t('documents_page.required_fields_error'), variant: 'destructive' });
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('version', version);
    formData.append('categoryId', categoryId);
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      toast({ title: t('toast.success_title'), description: t('documents_page.upload_success') });
      onUploadSuccess();
      onClose();
    } catch (err) {
      toast({ title: t('toast.error_title'), description: t('documents_page.upload_error'), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t('documents_page.add_modal_title')}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="title">{t('documents_page.doc_title_label')}</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('documents_page.doc_title_placeholder')} required/>
          </div>
          <div>
            <Label htmlFor="description">{t('documents_page.doc_desc_label')}</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('documents_page.doc_desc_placeholder')} rows={3}/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="version">{t('documents_page.version')}</Label>
              <Input id="version" value={version} onChange={(e) => setVersion(e.target.value)} placeholder={t('documents_page.version_placeholder')} required />
            </div>
            <div>
              <Label htmlFor="category">{t('documents_page.category')}</Label>
              <Select onValueChange={setCategoryId} required>
                <SelectTrigger><SelectValue placeholder={t('documents_page.select_category_placeholder')} /></SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="file">{t('documents_page.file_label')}</Label>
            <Input id="file" type="file" onChange={(e) => setFile(e.target.files[0])} required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t('documents_page.uploading_button') : t('documents_page.add_doc_button')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};