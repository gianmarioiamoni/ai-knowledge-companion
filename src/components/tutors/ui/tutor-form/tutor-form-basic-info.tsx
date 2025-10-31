import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from 'next-intl';
import type { TutorInsert } from "@/types/tutors";
import type { JSX } from 'react';

interface TutorFormBasicInfoProps {
  formData: TutorInsert;
  onInputChange: (field: keyof TutorInsert, value: any) => void;
}

export function TutorFormBasicInfo({
  formData,
  onInputChange,
}: TutorFormBasicInfoProps): JSX.Element {
  const t = useTranslations('tutors');
  
  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          {t('form.fields.name')}
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder={t('form.fields.namePlaceholder')}
          required
          className="text-sm"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          {t('form.fields.description')}
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder={t('form.fields.descriptionPlaceholder')}
          rows={3}
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="system_prompt" className="text-sm font-medium">
          {t('form.fields.systemPrompt')}
        </Label>
        <Textarea
          id="system_prompt"
          value={formData.system_prompt}
          onChange={(e) => onInputChange('system_prompt', e.target.value)}
          placeholder={t('form.fields.systemPromptPlaceholder')}
          rows={4}
          className="text-sm"
        />
        <p className="text-xs text-muted-foreground">
          {t('form.fields.systemPromptHint')}
        </p>
      </div>
    </div>
  );
}
