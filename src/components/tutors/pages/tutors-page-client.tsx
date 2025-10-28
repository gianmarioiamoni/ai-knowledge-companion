"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Filter } from "lucide-react";
import { TutorCard } from "../ui/tutor-card";
import { TutorForm } from "../ui/tutor-form";
import { useTutors } from "@/hooks/use-tutors";
import { useTranslations } from 'next-intl';
import type { Tutor, TutorInsert } from "@/types/tutors";

export function TutorsPageClient() {
  const t = useTranslations('tutors');
  const {
    tutors,
    loading,
    error,
    createTutor,
    updateTutor,
    deleteTutor,
  } = useTutors();

  const [showForm, setShowForm] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateTutor = async (data: TutorInsert) => {
    const result = await createTutor(data);
    if (result.success) {
      setShowForm(false);
    }
  };

  const handleUpdateTutor = async (data: TutorInsert) => {
    if (!editingTutor) return;
    
    const result = await updateTutor(editingTutor.id, data);
    if (result.success) {
      setEditingTutor(null);
    }
  };

  const handleDeleteTutor = async (tutor: Tutor) => {
    if (confirm(`Sei sicuro di voler eliminare il tutor "${tutor.name}"?`)) {
      await deleteTutor(tutor.id);
    }
  };

  const handleEditTutor = (tutor: Tutor) => {
    setEditingTutor(tutor);
    setShowForm(true);
  };

  const handleChatTutor = (tutor: Tutor) => {
    // TODO: Implementare navigazione alla chat
    console.log("Chat with tutor:", tutor.name);
  };

  const filteredTutors = tutors.filter(tutor =>
    tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tutor.description && tutor.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento tutor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <p className="font-semibold">Errore nel caricamento dei tutor</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('subtitle')}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('newTutor')}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              {t('filters')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <TutorForm
              tutor={editingTutor || undefined}
              onSubmit={editingTutor ? handleUpdateTutor : handleCreateTutor}
              onCancel={() => {
                setShowForm(false);
                setEditingTutor(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Tutors Grid */}
      {filteredTutors.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? t('noTutorsFound') : t('noTutors')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? t('tryDifferentSearch')
                  : t('createFirstTutor')
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('createFirstTutorButton')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutors.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              onEdit={handleEditTutor}
              onDelete={handleDeleteTutor}
              onChat={handleChatTutor}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      {tutors.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{tutors.length}</div>
                <div className="text-sm text-muted-foreground">{t('stats.totalTutors')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {tutors.filter(t => t.visibility === 'public').length}
                </div>
                <div className="text-sm text-muted-foreground">{t('stats.public')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {tutors.reduce((sum, t) => sum + t.total_conversations, 0)}
                </div>
                <div className="text-sm text-muted-foreground">{t('stats.conversations')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
