"use client";

import { useState, useEffect } from "react";
import type { Document } from "@/types/database";
import * as documentsService from "@/lib/supabase/documents";
import { useAuth } from "./use-auth";

export function useDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user documents
  const loadDocuments = async () => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } =
        await documentsService.getUserDocuments(user.id);

      if (fetchError) {
        setError(fetchError);
      } else {
        setDocuments(data || []);

        // Check for stuck processing documents and retry processing
        const stuckDocuments = (data || []).filter(
          (doc) => doc.status === "processing"
        );
        if (stuckDocuments.length > 0) {
          // Process stuck documents in background
          stuckDocuments.forEach(async (doc) => {
            try {

              // Try to get the file from storage and reprocess
              const { url, error: urlError } =
                await documentsService.getFileUrl(doc.storage_path);
              if (urlError || !url) {
                console.warn(
                  `⚠️ Cannot get URL for document ${doc.id}, marking as error`
                );
                // Mark as error if we can't access the file
                setDocuments((prev) =>
                  prev.map((d) =>
                    d.id === doc.id ? { ...d, status: "error" } : d
                  )
                );
                return;
              }

              // Process document via API route (server-side)
              const response = await fetch('/api/documents/process', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ documentId: doc.id }),
              });

              const result = await response.json();

              if (result.success) {
                console.log(`✅ Document ${doc.id} processed successfully:`, {
                  chunks: result.chunks,
                  tokens: result.totalTokens,
                  embeddings: result.embeddingsGenerated,
                  cost: result.embeddingCost
                });
                
                setDocuments((prev) =>
                  prev.map((d) =>
                    d.id === doc.id
                      ? {
                          ...d,
                          status: "ready",
                          length_tokens: result.totalTokens || 0,
                        }
                      : d
                  )
                );
              } else {
                console.error(
                  `❌ Failed to reprocess document ${doc.id}:`,
                  result.error
                );
                setDocuments((prev) =>
                  prev.map((d) =>
                    d.id === doc.id ? { ...d, status: "error" } : d
                  )
                );
              }
            } catch (err) {
              console.error(
                `❌ Exception reprocessing document ${doc.id}:`,
                err
              );
              setDocuments((prev) =>
                prev.map((d) =>
                  d.id === doc.id ? { ...d, status: "error" } : d
                )
              );
            }
          });
        }
      }
    } catch (err) {
      setError("Failed to load documents");
      console.error("Load documents error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Upload and create document
  const uploadDocument = async (
    file: File,
    title: string,
    description?: string
  ) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      setError(null);

      // Upload file
      const { path, error: uploadError } = await documentsService.uploadFile(
        file,
        user.id
      );
      if (uploadError) {
        throw new Error(uploadError);
      }

      // Create document record
      const documentData = {
        owner_id: user.id,
        title,
        description,
        storage_path: path,
        mime_type: file.type,
        file_size: file.size,
        status: "processing" as const,
        visibility: "private" as const,
      };

      const { data, error: createError } =
        await documentsService.createDocument(documentData);
      if (createError) {
        throw new Error(createError);
      }

      if (!data) {
        throw new Error("Failed to create document record");
      }

      // Add to local state with processing status
      setDocuments((prev) => [data, ...prev]);

      // Process document via API route (server-side)
      console.log("🔄 Starting background processing for document:", data.id);

      // The processing will be handled by the loadDocuments function
      // when it detects the document is in 'processing' status

      return { success: true, document: data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Delete document
  const deleteDocument = async (documentId: string) => {
    try {
      setError(null);

      const { error: deleteError } = await documentsService.deleteDocument(
        documentId
      );
      if (deleteError) {
        throw new Error(deleteError);
      }

      // Remove from local state
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Delete failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Get file download URL
  const getFileUrl = async (storagePath: string) => {
    try {
      const { url, error: urlError } = await documentsService.getFileUrl(
        storagePath
      );
      if (urlError) {
        throw new Error(urlError);
      }
      return url;
    } catch (err) {
      console.error("Get file URL error:", err);
      return null;
    }
  };

  // Load documents when user changes
  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    getFileUrl,
    refreshDocuments: loadDocuments,
  };
}
