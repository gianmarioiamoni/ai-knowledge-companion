import { useState } from 'react';
import type { Tutor, TutorInsert, VisibilityLevel } from "@/types/tutors";

interface UseTutorFormProps {
  tutor?: Tutor;
  onSubmit: (data: TutorInsert) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function useTutorForm({ tutor, onSubmit, loading = false }: UseTutorFormProps) {
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

  const [activeTab, setActiveTab] = useState("basic");

  // Event handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanData = {
      ...formData,
      avatar_url: formData.avatar_url?.trim() || undefined,
    };
    
    await onSubmit(cleanData);
  };

  const handleInputChange = <K extends keyof TutorInsert>(field: K, value: TutorInsert[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNumericInputChange = (field: keyof TutorInsert, value: string) => {
    const numValue = parseInt(value);
    handleInputChange(field, isNaN(numValue) ? (field === 'max_tokens' ? 2000 : field === 'max_context_chunks' ? 5 : 0.7) : numValue);
  };

  // Utility functions
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
      case 'public': return 'globe';
      case 'unlisted': return 'link';
      case 'marketplace': return 'store';
      default: return 'lock';
    }
  };

  const getVisibilityDescription = (visibility: VisibilityLevel) => {
    switch (visibility) {
      case 'public': return "Visibile a tutti";
      case 'unlisted': return "Accessibile solo tramite link diretto";
      case 'marketplace': return "Listato pubblicamente nel marketplace";
      default: return "Visibile solo a te";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return {
    // State
    formData,
    activeTab,
    loading,
    
    // Actions
    setActiveTab,
    handleSubmit,
    handleInputChange,
    handleNumericInputChange,
    
    // Utility functions
    getTemperatureLabel,
    getSimilarityLabel,
    getVisibilityIcon,
    getVisibilityDescription,
    getInitials,
  };
}
