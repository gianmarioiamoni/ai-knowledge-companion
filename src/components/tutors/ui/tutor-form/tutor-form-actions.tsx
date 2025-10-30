import { Button } from "@/components/ui/button";
import { Shield, XCircle, CheckCircle, Loader2 } from "lucide-react";
import type { JSX } from 'react';

interface TutorFormActionsProps {
  loading: boolean;
  isEditing: boolean;
  onCancel: () => void;
}

export function TutorFormActions({
  loading,
  isEditing,
  onCancel,
}: TutorFormActionsProps): JSX.Element {
  return (
    <div className="flex justify-between items-center pt-6 border-t">
      <Button type="button" variant="outline" onClick={onCancel} className="flex items-center space-x-2">
        <XCircle className="h-4 w-4 mr-1" />
        <span>Annulla</span>
      </Button>
      <Button type="submit" disabled={loading} className="flex items-center space-x-2">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
            <span>Salvataggio...</span>
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-1" />
            <span>{isEditing ? 'Aggiorna Tutor' : 'Crea Tutor'}</span>
          </>
        )}
      </Button>
    </div>
  );
}
