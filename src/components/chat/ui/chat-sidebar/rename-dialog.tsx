'use client';

import { JSX } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newTitle: string;
  onNewTitleChange: (title: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function RenameDialog({
  open,
  onOpenChange,
  newTitle,
  onNewTitleChange,
  onSave,
  onCancel,
}: RenameDialogProps): JSX.Element {
  const t = useTranslations('chat');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('sidebar.menu.renameDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('sidebar.menu.renameDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="conversation-title">
              {t('sidebar.menu.renameDialog.placeholder')}
            </Label>
            <Input
              id="conversation-title"
              value={newTitle}
              onChange={(e) => onNewTitleChange(e.target.value)}
              placeholder={t('sidebar.menu.renameDialog.placeholder')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSave();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {t('sidebar.menu.renameDialog.cancel')}
          </Button>
          <Button onClick={onSave} disabled={!newTitle.trim()}>
            {t('sidebar.menu.renameDialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

