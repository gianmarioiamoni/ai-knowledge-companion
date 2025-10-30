import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TutorFormImproved } from './tutor-form-improved';
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
  return (
    <Dialog open={show} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tutor ? 'Modifica Tutor' : 'Crea Nuovo Tutor'}
          </DialogTitle>
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
