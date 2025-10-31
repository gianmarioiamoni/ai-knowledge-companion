import { Button } from "@/components/ui/button";
import { Shield, XCircle, CheckCircle, Loader2 } from "lucide-react";
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('tutors');
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0 pt-4 sm:pt-6 border-t">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel} 
        className="flex items-center justify-center gap-2 w-full sm:w-auto order-2 sm:order-1"
      >
        <XCircle className="h-4 w-4" />
        <span className="text-sm sm:text-base">{t('form.cancel')}</span>
      </Button>
      <Button 
        type="submit" 
        disabled={loading} 
        className="flex items-center justify-center gap-2 w-full sm:w-auto order-1 sm:order-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm sm:text-base">{t('form.saving')}</span>
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm sm:text-base">{isEditing ? t('form.update') : t('form.create')}</span>
          </>
        )}
      </Button>
    </div>
  );
}
