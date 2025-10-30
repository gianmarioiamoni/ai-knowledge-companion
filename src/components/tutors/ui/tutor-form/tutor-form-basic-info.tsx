import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Nome Tutor *
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="Es. Tutor di Matematica, Assistente Legale..."
          required
          className="text-sm"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Descrizione
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="Descrivi le competenze e il ruolo del tutor..."
          rows={3}
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="system_prompt" className="text-sm font-medium">
          System Prompt
        </Label>
        <Textarea
          id="system_prompt"
          value={formData.system_prompt}
          onChange={(e) => onInputChange('system_prompt', e.target.value)}
          placeholder="Definisci il comportamento e lo stile del tutor..."
          rows={4}
          className="text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Questo prompt definisce come il tutor si comporta e risponde alle domande
        </p>
      </div>
    </div>
  );
}
