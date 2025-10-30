import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Zap } from "lucide-react";
import type { TutorInsert } from "@/types/tutors";
import type { JSX } from 'react';

interface TutorFormRagConfigProps {
  formData: TutorInsert;
  onInputChange: (field: keyof TutorInsert, value: any) => void;
  onNumericInputChange: (field: keyof TutorInsert, value: string) => void;
  getSimilarityLabel: (value: number | undefined) => string;
}

export function TutorFormRagConfig({
  formData,
  onInputChange,
  onNumericInputChange,
  getSimilarityLabel,
}: TutorFormRagConfigProps): JSX.Element {
  return (
    <div className="p-4 border rounded-lg">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-purple-600" />
          <h4 className="font-medium">Retrieval Augmented Generation (RAG)</h4>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="space-y-1">
            <Label htmlFor="use_rag" className="text-sm font-medium">
              Abilita RAG
            </Label>
            <p className="text-xs text-muted-foreground">
              Usa i documenti per risposte più accurate e contestuali
            </p>
          </div>
          <Switch
            id="use_rag"
            checked={formData.use_rag}
            onCheckedChange={(checked) => onInputChange('use_rag', checked)}
          />
        </div>
        
        {formData.use_rag && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-3">
              <Label htmlFor="max_context_chunks" className="text-sm font-medium">
                Max Chunk di Contesto
              </Label>
              <Input
                id="max_context_chunks"
                type="number"
                min="1"
                max="20"
                value={formData.max_context_chunks}
                onChange={(e) => onNumericInputChange('max_context_chunks', e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Numero massimo di frammenti di documento da utilizzare
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Soglia Similarità: {formData.similarity_threshold}
                </Label>
                <Badge variant="outline" className="text-xs">
                  {getSimilarityLabel(formData.similarity_threshold)}
                </Badge>
              </div>
              <Slider
                value={[formData.similarity_threshold ?? 0.7]}
                onValueChange={([value]) => onInputChange('similarity_threshold', value ?? 0.7)}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Bassa (0)</span>
                <span>Alta (1)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
