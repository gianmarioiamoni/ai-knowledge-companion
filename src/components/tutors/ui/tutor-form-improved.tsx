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
    /* getVisibilityDescription */,
    getInitials,
  } = useTutorForm({ tutor, onSubmit, onCancel, loading });

  return (
    <div className="w-full mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg md:text-xl truncate">
                  {tutor ? t('form.editTitle') : t('form.createTitle')}
                </CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
                  {tutor ? t('form.editSubtitle') : t('form.createSubtitle')}
                </p>
              </div>
            </div>
            {tutor && (
              <Badge variant="secondary" className="flex items-center space-x-1 flex-shrink-0 text-xs sm:text-sm">
                <MessageSquare className="h-3 w-3" />
                <span className="hidden sm:inline">{t('form.editBadge')}</span>
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 px-3 sm:px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4 sm:mb-6 h-auto gap-0.5 sm:gap-1">
              <TabsTrigger value="basic" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 px-1 sm:px-3 py-2 text-[10px] sm:text-sm">
                <User className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="sm:inline truncate">{t('form.tabs.basic')}</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 px-1 sm:px-3 py-2 text-[10px] sm:text-sm">
                <Brain className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="sm:inline truncate">{t('form.tabs.ai')}</span>
              </TabsTrigger>
              <TabsTrigger value="rag" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 px-1 sm:px-3 py-2 text-[10px] sm:text-sm">
                <Zap className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="sm:inline truncate">{t('form.tabs.rag')}</span>
              </TabsTrigger>
              <TabsTrigger value="visibility" className="flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 px-0.5 sm:px-2 py-2 text-[10px] sm:text-sm">
                <Eye className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="sm:inline truncate">{t('form.tabs.visibility')}</span>
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <TabsContent value="basic" className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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

              <TabsContent value="ai" className="space-y-4 sm:space-y-6">
                <TutorFormAiConfig
                  formData={formData}
                  onInputChange={handleInputChange}
                  onNumericInputChange={handleNumericInputChange}
                  getTemperatureLabel={getTemperatureLabel}
                />
              </TabsContent>

              <TabsContent value="rag" className="space-y-4 sm:space-y-6">
                <TutorFormRagConfig
                  formData={formData}
                  onInputChange={handleInputChange}
                  onNumericInputChange={handleNumericInputChange}
                  getSimilarityLabel={getSimilarityLabel}
                />
              </TabsContent>

              <TabsContent value="visibility" className="space-y-4 sm:space-y-6">
                <TutorFormVisibilityConfig
                  formData={formData}
                  onInputChange={handleInputChange}
                  getVisibilityIcon={getVisibilityIcon}
                  getVisibilityDescription={getVisibilityDescription}
                />
              </TabsContent>

              {/* Sezione Documenti - Solo per tutor esistenti */}
              {tutor && (
                <div className="mt-4 sm:mt-6">
                  <Card className="p-3 sm:p-4">
                    <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                      <h4 className="font-medium text-sm sm:text-base">{t('form.sections.documents')}</h4>
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