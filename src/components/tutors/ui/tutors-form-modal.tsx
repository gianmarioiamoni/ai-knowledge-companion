import type { JSX } from 'react';
import { TutorFormImproved as TutorForm } from './tutor-form-improved';
import type { Tutor, TutorInsert } from "@/types/tutors";

interface TutorsFormModalProps {
  show: boolean;
  tutor?: Tutor | null;
  onSubmit: (data: TutorInsert) => Promise<void>;
  onCancel: () => void;
}

export function TutorsFormModal({ 
  show, 
  tutor, 
  onSubmit, 
  onCancel 
}: TutorsFormModalProps): JSX.Element {
  if (!show) return <></>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <TutorForm
          tutor={tutor || undefined}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}
