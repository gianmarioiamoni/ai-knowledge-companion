import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Brain, Target } from "lucide-react";
import type { TutorInsert, SupportedModel } from "@/types/tutors";
import { SUPPORTED_MODELS } from "@/types/tutors";
import type { JSX } from 'react';

interface TutorFormAiConfigProps {
  formData: TutorInsert;
  onInputChange: (field: keyof TutorInsert, value: any) => void;
  onNumericInputChange: (field: keyof TutorInsert, value: string) => void;
  getTemperatureLabel: (value: number | undefined) => string;
}

export function TutorFormAiConfig({
  formData,
  onInputChange,
  onNumericInputChange,
  getTemperatureLabel,
}: TutorFormAiConfigProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-4 border rounded-lg">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium">Modello AI</h4>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="model" className="text-sm font-medium">
              Modello
            </Label>
            <Select
              value={formData.model}
              onValueChange={(value: SupportedModel) => onInputChange('model', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona modello" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_MODELS.map((model) => (
                  <SelectItem key={model} value={model}>
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4" />
                      <span>{model}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_tokens" className="text-sm font-medium">
              Max Tokens
            </Label>
            <Input
              id="max_tokens"
              type="number"
              min="1"
              max="4000"
              value={formData.max_tokens}
              onChange={(e) => onNumericInputChange('max_tokens', e.target.value)}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Limite massimo di token per risposta
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border rounded-lg">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-600" />
            <h4 className="font-medium">Creatività</h4>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Temperature: {formData.temperature}
              </Label>
              <Badge variant="outline" className="text-xs">
                {getTemperatureLabel(formData.temperature)}
              </Badge>
            </div>
            <Slider
              value={[formData.temperature ?? 0.7]}
              onValueChange={([value]) => onInputChange('temperature', value ?? 0.7)}
              min={0}
              max={2}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Conservativo (0)</span>
              <span>Creativo (2)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
