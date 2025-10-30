"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from 'next-intl';
import { useTutorForm } from '@/hooks/use-tutor-form';
import { TutorDocumentsSection } from './tutor-documents-section';
import { TutorFormActions } from './tutor-form/tutor-form-actions';
import { TutorFormAvatar } from './tutor-form/tutor-form-avatar';
import { TutorFormBasicInfo } from './tutor-form/tutor-form-basic-info';
import { TutorFormAiConfig } from './tutor-form/tutor-form-ai-config';
import { TutorFormRagConfig } from './tutor-form/tutor-form-rag-config';
import { TutorFormVisibilityConfig } from './tutor-form/tutor-form-visibility-config';
import { 
  User, 
  Brain, 
  Eye, 
  FileText, 
  MessageSquare,
  Zap,
  Database
} from "lucide-react";
import type { Tutor, TutorInsert } from "@/types/tutors";
import type { JSX } from 'react';

interface TutorFormProps {
  tutor?: Tutor;
  onSubmit: (data: TutorInsert) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function TutorFormImproved({ tutor, onSubmit, onCancel, loading = false }: TutorFormProps): JSX.Element {
  const t = useTranslations('tutors');
  const {
    formData,
    activeTab,
    setActiveTab,
    handleSubmit,
    handleInputChange,
    handleNumericInputChange,
    getTemperatureLabel,
    getSimilarityLabel,
    getVisibilityIcon,
    getVisibilityDescription,
    getInitials,
  } = useTutorForm({ tutor, onSubmit, onCancel, loading });

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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <TutorFormAvatar
                    name={formData.name}
                    avatarUrl={formData.avatar_url}
                    initials={getInitials(formData.name)}
                    onAvatarUrlChange={(url) => handleInputChange('avatar_url', url)}
                  />
                  <TutorFormBasicInfo
                    formData={formData}
                    onInputChange={handleInputChange}
                  />
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-6">
                <TutorFormAiConfig
                  formData={formData}
                  onInputChange={handleInputChange}
                  onNumericInputChange={handleNumericInputChange}
                  getTemperatureLabel={getTemperatureLabel}
                />
              </TabsContent>

              <TabsContent value="rag" className="space-y-6">
                <TutorFormRagConfig
                  formData={formData}
                  onInputChange={handleInputChange}
                  onNumericInputChange={handleNumericInputChange}
                  getSimilarityLabel={getSimilarityLabel}
                />
              </TabsContent>

              <TabsContent value="visibility" className="space-y-6">
                <TutorFormVisibilityConfig
                  formData={formData}
                  onInputChange={handleInputChange}
                  getVisibilityIcon={getVisibilityIcon}
                  getVisibilityDescription={getVisibilityDescription}
                />
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
              <TutorFormActions
                loading={loading}
                isEditing={!!tutor}
                onCancel={onCancel}
              />
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}