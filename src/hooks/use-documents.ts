"use client";

import { useState, useEffect } from "react";
import type { Document } from "@/types/database";
import * as documentsService from "@/lib/supabase/documents";
import { processDocument } from "@/lib/workers/document-processor";
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
          console.log(
            `🔄 Found ${stuckDocuments.length} stuck documents, attempting to reprocess...`
          );

          // Process stuck documents in background
          stuckDocuments.forEach(async (doc) => {
            try {
              console.log(
                `🔄 Reprocessing stuck document: ${doc.title} (${doc.id})`
              );

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

              // Fetch the file and reprocess
              const response = await fetch(url);
              const blob = await response.blob();
              const file = new File([blob], doc.title, { type: doc.mime_type });

              const result = await processDocument(file, doc.id, {
                saveToDatabase: true,
              });

              if (result.success) {
                console.log(`✅ Reprocessed document ${doc.id} successfully`);
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

      // Process document in background (parsing + chunking)
      console.log("🔄 Starting background processing for document:", data.id);

      processDocument(file, data.id, {
        saveToDatabase: true,
      })
        .then((result) => {
          console.log("📋 Processing result received:", {
            success: result.success,
            documentId: data.id,
            chunks: result.chunks?.length,
            tokens: result.totalTokens,
            error: result.error,
          });

          if (result.success) {
            console.log(
              "✅ Document processed successfully, updating status to ready"
            );

            // Update document status to ready
            setDocuments((prev) => {
              const updated = prev.map((doc) =>
                doc.id === data.id
                  ? {
                      ...doc,
                      status: "ready",
                      length_tokens: result.totalTokens || 0,
                    }
                  : doc
              );
              console.log(
                "📊 Documents state updated:",
                updated.find((d) => d.id === data.id)
              );
              return updated;
            });
          } else {
            console.error("❌ Document processing failed:", result.error);

            // Update document status to error
            setDocuments((prev) =>
              prev.map((doc) =>
                doc.id === data.id ? { ...doc, status: "error" } : doc
              )
            );

            setError(`Processing failed: ${result.error}`);
          }
        })
        .catch((err) => {
          console.error("❌ Document processing exception:", err);

          // Update document status to error
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === data.id ? { ...doc, status: "error" } : doc
            )
          );

          setError(`Processing failed: ${err.message}`);
        });

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
