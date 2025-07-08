import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const DeleteDocumentModal = ({ isOpen, onClose, document, onConfirm, isSubmitting }) => {
  const { t } = useTranslation();
  const [confirmationText, setConfirmationText] = useState('');

  // Reset confirmation text when the modal opens for a new document
  useEffect(() => {
    if (isOpen) {
      setConfirmationText('');
    }
  }, [isOpen]);

  if (!document) return null;

  const isConfirmationMatch = confirmationText === document.title;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('documents_page.delete_modal_title')}</DialogTitle>
          <DialogDescription>
            {t('documents_page.delete_modal_desc_1')} <strong>{document.title}</strong>? {t('documents_page.delete_modal_desc_2')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="confirmationText" className="text-muted-foreground">
            {t('documents_page.delete_modal_label')}
          </Label>
          <Input
            id="confirmationText"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder={document.title}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(document.id)}
            disabled={!isConfirmationMatch || isSubmitting}
          >
            {isSubmitting ? t('common.deleting') : t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};