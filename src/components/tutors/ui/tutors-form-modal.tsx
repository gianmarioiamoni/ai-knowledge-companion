import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TutorFormImproved } from './tutor-form-improved';
import { useTranslations } from 'next-intl';
import type { Tutor, TutorInsert } from "@/types/tutors";
import type { JSX } from 'react';

interface TutorsFormModalProps {
  show: boolean;
  tutor?: Tutor;
  onSubmit: (data: TutorInsert) => Promise<void>;
  onCancel: () => void;
}

export function TutorsFormModal({
  show,
  tutor,
  onSubmit,
  onCancel,
}: TutorsFormModalProps): JSX.Element {
  const t = useTranslations('tutors.form');

  return (
    <Dialog open={show} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tutor ? t('editTitle') : t('createTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        <TutorFormImproved
          tutor={tutor}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
