import { useState } from "react";
import { useRouter } from '@/i18n/navigation';
import { useTutors } from "@/hooks/use-tutors";
import type { Tutor, TutorInsert } from "@/types/tutors";

export function useTutorsPage() {
  const router = useRouter();
  const {
    tutors,
    loading,
    error,
    createTutor,
    updateTutor,
    deleteTutor,
  } = useTutors();

  // UI State
  const [showForm, setShowForm] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Computed values
  const filteredTutors = tutors.filter(tutor =>
    tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tutor.description && tutor.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stats = {
    totalTutors: tutors.length,
    publicTutors: tutors.filter(t => t.visibility === 'public').length,
    totalConversations: tutors.reduce((sum, t) => sum + t.total_conversations, 0),
  };

  // Actions
  const handleCreateTutor = async (data: TutorInsert): Promise<void> => {
    const result = await createTutor(data);
    if (result.success) {
      setShowForm(false);
    }
  };

  const handleUpdateTutor = async (data: TutorInsert): Promise<void> => {
    if (!editingTutor) return;
    
    const result = await updateTutor(editingTutor.id, data);
    if (result.success) {
      setEditingTutor(null);
    }
  };

  const handleDeleteTutor = async (tutor: Tutor): Promise<void> => {
    if (confirm(`Sei sicuro di voler eliminare il tutor "${tutor.name}"?`)) {
      await deleteTutor(tutor.id);
    }
  };

  const handleEditTutor = (tutor: Tutor) => {
    setEditingTutor(tutor);
    setShowForm(true);
  };

  const handleChatTutor = (tutor: Tutor) => {
    router.push(`/chat?tutor=${tutor.id}`);
  };

  const handleDuplicateTutor = async (tutor: Tutor): Promise<void> => {
    const duplicateData: TutorInsert = {
      name: `${tutor.name} (Copy)`,
      description: tutor.description,
      avatar_url: tutor.avatar_url,
      system_prompt: tutor.system_prompt,
      temperature: tutor.temperature,
      max_tokens: tutor.max_tokens,
      model: tutor.model,
      use_rag: tutor.use_rag,
      max_context_chunks: tutor.max_context_chunks,
      similarity_threshold: tutor.similarity_threshold,
      allowed_document_types: tutor.allowed_document_types,
      max_document_size_mb: tutor.max_document_size_mb,
      visibility: tutor.visibility,
    };
    
    await createTutor(duplicateData);
  };

  const handleNewTutor = () => {
    setEditingTutor(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTutor(null);
  };

  const handleFilters = () => {
    // TODO: Implement filters
    console.log('Filters not implemented yet');
  };

  return {
    // Data
    tutors: filteredTutors,
    allTutors: tutors,
    stats,
    loading,
    error,
    
    // UI State
    showForm,
    editingTutor,
    searchQuery,
    
    // Actions
    setSearchQuery,
    handleCreateTutor,
    handleUpdateTutor,
    handleDeleteTutor,
    handleEditTutor,
    handleChatTutor,
    handleDuplicateTutor,
    handleNewTutor,
    handleCloseForm,
    handleFilters,
  };
}
