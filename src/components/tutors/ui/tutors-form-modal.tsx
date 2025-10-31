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
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2 pb-4">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl">
            {tutor ? t('editTitle') : t('createTitle')}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
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
