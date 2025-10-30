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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from 'next-intl';
import type { Tutor, TutorInsert, SupportedModel, VisibilityLevel } from "@/types/tutors";
import { SUPPORTED_MODELS, VISIBILITY_LEVELS } from "@/types/tutors";
import { TutorDocumentsSection } from './tutor-documents-section';
import { 
  User, 
  Settings, 
  Brain, 
  Eye, 
  FileText, 
  MessageSquare,
  Zap,
  Target,
  Shield,
  Globe,
  Link as LinkIcon,
  Lock
} from "lucide-react";

interface TutorFormProps {
  tutor?: Tutor;
  onSubmit: (data: TutorInsert) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function TutorFormImproved({ tutor, onSubmit, onCancel, loading = false }: TutorFormProps) {
  const t = useTranslations('tutors');
  const [formData, setFormData] = useState<TutorInsert>({
    name: tutor?.name || '',
    description: tutor?.description || '',
    avatar_url: tutor?.avatar_url || '',
    system_prompt: tutor?.system_prompt || 'You are a helpful AI tutor. Answer questions based on the provided context and be educational.',
    temperature: tutor?.temperature ?? 0.7,
    max_tokens: tutor?.max_tokens ?? 2000,
    model: tutor?.model || 'gpt-4o-mini',
    use_rag: tutor?.use_rag ?? true,
    max_context_chunks: tutor?.max_context_chunks ?? 5,
    similarity_threshold: tutor?.similarity_threshold ?? 0.7,
    allowed_document_types: tutor?.allowed_document_types || ['pdf', 'txt', 'md', 'doc', 'docx'],
    max_document_size_mb: tutor?.max_document_size_mb ?? 10,
    visibility: tutor?.visibility || 'private',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanData = {
      ...formData,
      avatar_url: formData.avatar_url?.trim() || undefined,
    };
    
    await onSubmit(cleanData);
  };

  const handleInputChange = (field: keyof TutorInsert, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getTemperatureLabel = (value: number | undefined) => {
    const temp = value ?? 0.7;
    if (temp <= 0.3) return "Molto Conservativo";
    if (temp <= 0.7) return "Bilanciato";
    if (temp <= 1.2) return "Creativo";
    return "Molto Creativo";
  };

  const getSimilarityLabel = (value: number | undefined) => {
    const sim = value ?? 0.7;
    if (sim <= 0.3) return "Bassa";
    if (sim <= 0.7) return "Media";
    return "Alta";
  };

  const getVisibilityIcon = (visibility: VisibilityLevel) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'unlisted': return <LinkIcon className="h-4 w-4" />;
      default: return <Lock className="h-4 w-4" />;
    }
  };

  const getVisibilityDescription = (visibility: VisibilityLevel) => {
    switch (visibility) {
      case 'public': return "Visibile a tutti nel marketplace";
      case 'unlisted': return "Accessibile solo tramite link diretto";
      default: return "Visibile solo a te";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {tutor ? t('form.editTitle') : t('form.createTitle')}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {tutor ? 'Modifica le impostazioni del tuo tutor' : 'Crea un nuovo tutor AI personalizzato'}
                </p>
              </div>
            </div>
            {tutor && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <MessageSquare className="h-3 w-3" />
                <span>Modifica</span>
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="basic" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Base</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span>AI</span>
              </TabsTrigger>
              <TabsTrigger value="rag" className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>RAG</span>
              </TabsTrigger>
              <TabsTrigger value="visibility" className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Visibilità</span>
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tab: Informazioni Base */}
              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Avatar Preview */}
                  <div className="lg:col-span-1">
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                          {formData.name ? formData.name[0].toUpperCase() : 'T'}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">Anteprima Avatar</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="avatar_url" className="text-sm font-medium">
                          URL Avatar (opzionale)
                        </Label>
                        <Input
                          id="avatar_url"
                          type="url"
                          value={formData.avatar_url}
                          onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                          placeholder="https://example.com/avatar.jpg"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Informazioni Principali */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Nome Tutor *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
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
                        onChange={(e) => handleInputChange('description', e.target.value)}
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
                        onChange={(e) => handleInputChange('system_prompt', e.target.value)}
                        placeholder="Definisci il comportamento e lo stile del tutor..."
                        rows={4}
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Questo prompt definisce come il tutor si comporta e risponde alle domande
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Configurazioni AI */}
              <TabsContent value="ai" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
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
                          onValueChange={(value: SupportedModel) => handleInputChange('model', value)}
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
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            handleInputChange('max_tokens', isNaN(value) ? 2000 : value);
                          }}
                          className="text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Limite massimo di token per risposta
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
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
                          onValueChange={([value]) => handleInputChange('temperature', value ?? 0.7)}
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
                  </Card>
                </div>
              </TabsContent>

              {/* Tab: Configurazioni RAG */}
              <TabsContent value="rag" className="space-y-6">
                <Card className="p-4">
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
                        onCheckedChange={(checked) => handleInputChange('use_rag', checked)}
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
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              handleInputChange('max_context_chunks', isNaN(value) ? 5 : value);
                            }}
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
                            onValueChange={([value]) => handleInputChange('similarity_threshold', value ?? 0.7)}
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
                </Card>
              </TabsContent>

              {/* Tab: Visibilità */}
              <TabsContent value="visibility" className="space-y-6">
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-orange-600" />
                      <h4 className="font-medium">Visibilità e Condivisione</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="visibility" className="text-sm font-medium">
                        Livello di Visibilità
                      </Label>
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
                              <div className="flex items-center space-x-2">
                                {getVisibilityIcon(level)}
                                <div>
                                  <div className="font-medium">
                                    {level === 'private' && 'Privato'}
                                    {level === 'public' && 'Pubblico'}
                                    {level === 'unlisted' && 'Non elencato'}
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
                </Card>
              </TabsContent>

              {/* Sezione Documenti - Solo per tutor esistenti */}
              {tutor && (
                <div className="mt-6">
                  <Card className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <FileText className="h-5 w-5 text-indigo-600" />
                      <h4 className="font-medium">Documenti Collegati</h4>
                    </div>
                    <TutorDocumentsSection tutorId={tutor.id} />
                  </Card>
                </div>
              )}

              {/* Azioni */}
              <div className="flex justify-between items-center pt-6 border-t">
                <Button type="button" variant="outline" onClick={onCancel} className="flex items-center space-x-2">
                  <span>Annulla</span>
                </Button>
                <Button type="submit" disabled={loading} className="flex items-center space-x-2">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Salvataggio...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      <span>{tutor ? 'Aggiorna Tutor' : 'Crea Tutor'}</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
