import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Globe, Link as LinkIcon, Lock } from "lucide-react";
import { useTranslations } from 'next-intl';
import type { TutorInsert, VisibilityLevel } from "@/types/tutors";
import { VISIBILITY_LEVELS } from "@/types/tutors";
import type { JSX } from 'react';

interface TutorFormVisibilityConfigProps {
  formData: TutorInsert;
  onInputChange: (field: keyof TutorInsert, value: any) => void;
  getVisibilityIcon: (visibility: VisibilityLevel) => string;
  getVisibilityDescription: (visibility: VisibilityLevel) => string;
}

export function TutorFormVisibilityConfig({
  formData,
  onInputChange,
  getVisibilityIcon,
  getVisibilityDescription,
}: TutorFormVisibilityConfigProps): JSX.Element {
  const t = useTranslations('tutors');
  const getVisibilityIconComponent = (visibility: VisibilityLevel) => {
    switch (getVisibilityIcon(visibility)) {
      case 'globe':
        return <Globe className="h-4 w-4" />;
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-orange-600" />
          <h4 className="font-medium">{t('form.sections.visibility')}</h4>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="visibility" className="text-sm font-medium">
            {t('form.sections.visibilityLevel')}
          </Label>
          <Select
            value={formData.visibility}
            onValueChange={(value: VisibilityLevel) => onInputChange('visibility', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona visibilità" />
            </SelectTrigger>
            <SelectContent>
              {VISIBILITY_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  <div className="flex items-center space-x-2">
                    {getVisibilityIconComponent(level)}
                    <div>
                      <div className="font-medium">
                        {t(`form.visibilityLevels.${level}`)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getVisibilityDescription(level)}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
