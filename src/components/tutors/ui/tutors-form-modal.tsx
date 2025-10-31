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
      <DialogContent className="w-[calc(100vw-2rem)] sm:w-[90vw] md:max-w-3xl lg:max-w-4xl xl:max-w-5xl h-[90vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col p-3 sm:p-6 gap-0">
        <DialogHeader className="space-y-1 sm:space-y-2 pb-3 sm:pb-4 flex-shrink-0">
          <DialogTitle className="text-base sm:text-xl md:text-2xl pr-8">
            {tutor ? t('editTitle') : t('createTitle')}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto min-h-0 -mx-3 sm:-mx-6 px-3 sm:px-6">
          <TutorFormImproved
            tutor={tutor}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
