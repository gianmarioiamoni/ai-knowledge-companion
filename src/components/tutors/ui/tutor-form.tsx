"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useTranslations } from 'next-intl';
import type { Tutor, TutorInsert, SupportedModel, VisibilityLevel } from "@/types/tutors";
import { SUPPORTED_MODELS, VISIBILITY_LEVELS } from "@/types/tutors";
import { TutorDocumentsSection } from './tutor-documents-section';

interface TutorFormProps {
  tutor?: Tutor;
  onSubmit: (data: TutorInsert) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function TutorForm({ tutor, onSubmit, onCancel, loading = false }: TutorFormProps) {
  const t = useTranslations('tutors');
  const [formData, setFormData] = useState<TutorInsert>({
    name: tutor?.name || '',
    description: tutor?.description || '',
    avatar_url: tutor?.avatar_url || '',
    system_prompt: tutor?.system_prompt || 'You are a helpful AI tutor. Answer questions based on the provided context and be educational.',
    temperature: tutor?.temperature || 0.7,
    max_tokens: tutor?.max_tokens || 2000,
    model: tutor?.model || 'gpt-4o-mini',
    use_rag: tutor?.use_rag ?? true,
    max_context_chunks: tutor?.max_context_chunks || 5,
    similarity_threshold: tutor?.similarity_threshold || 0.7,
    allowed_document_types: tutor?.allowed_document_types || ['pdf', 'txt', 'md', 'doc', 'docx'],
    max_document_size_mb: tutor?.max_document_size_mb || 10,
    visibility: tutor?.visibility || 'private',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Pulisci i dati prima di inviarli
    const cleanData = {
      ...formData,
      avatar_url: formData.avatar_url?.trim() || undefined,
    };
    
    console.log('Form data being submitted:', cleanData);
    await onSubmit(cleanData);
  };

  const handleInputChange = (field: keyof TutorInsert, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {tutor ? t('form.editTitle') : t('form.createTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informazioni Base */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('form.sections.basicInfo')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('form.fields.name')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('form.fields.namePlaceholder')}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="avatar_url">URL Avatar</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descrizione del tutor..."
                rows={3}
              />
            </div>
          </div>

          {/* Configurazioni AI */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configurazioni AI</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Modello</Label>
                <Select
                  value={formData.model}
                  onValueChange={(value: SupportedModel) => handleInputChange('model', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona modello" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_MODELS.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_tokens">Max Tokens</Label>
                <Input
                  id="max_tokens"
                  type="number"
                  min="1"
                  max="4000"
                  value={formData.max_tokens}
                  onChange={(e) => handleInputChange('max_tokens', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature: {formData.temperature}</Label>
              <Slider
                value={[formData.temperature]}
                onValueChange={([value]) => handleInputChange('temperature', value)}
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

          {/* Configurazioni RAG */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configurazioni RAG</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="use_rag"
                checked={formData.use_rag}
                onCheckedChange={(checked) => handleInputChange('use_rag', checked)}
              />
              <Label htmlFor="use_rag">Usa RAG per risposte contestuali</Label>
            </div>
            
            {formData.use_rag && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_context_chunks">Max Chunk di Contesto</Label>
                  <Input
                    id="max_context_chunks"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.max_context_chunks}
                    onChange={(e) => handleInputChange('max_context_chunks', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="similarity_threshold">Soglia Similarità: {formData.similarity_threshold}</Label>
                  <Slider
                    value={[formData.similarity_threshold]}
                    onValueChange={([value]) => handleInputChange('similarity_threshold', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Configurazioni Visibilità */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Visibilità</h3>
            
            <div className="space-y-2">
              <Label htmlFor="visibility">Livello di Visibilità</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value: VisibilityLevel) => handleInputChange('visibility', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona visibilità" />
                </SelectTrigger>
                <SelectContent>
                  {VISIBILITY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level === 'private' && 'Privato - Solo tu'}
                      {level === 'public' && 'Pubblico - Visibile a tutti'}
                      {level === 'unlisted' && 'Non elencato - Solo con link'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* System Prompt */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">System Prompt</h3>
            
            <div className="space-y-2">
              <Label htmlFor="system_prompt">Prompt di Sistema</Label>
              <Textarea
                id="system_prompt"
                value={formData.system_prompt}
                onChange={(e) => handleInputChange('system_prompt', e.target.value)}
                placeholder="Definisci il comportamento del tutor..."
                rows={4}
              />
            </div>
          </div>

          {/* Sezione Documenti - Solo per tutor esistenti */}
          {tutor && (
            <div className="mt-6">
              <TutorDocumentsSection tutorId={tutor.id} />
            </div>
          )}

          {/* Azioni */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('form.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('form.saving') : (tutor ? t('form.update') : t('form.create'))}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
