'use client'

import { JSX, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileText, Download, ExternalLink } from 'lucide-react'
import { getDocumentChunks, getFileUrl } from '@/lib/supabase/documents'
import type { Document } from '@/types/database'
import type { Database } from '@/types/database'

type DocumentChunk = Database['public']['Tables']['document_chunks']['Row']

interface DocumentPreviewProps {
    document: Document | null
    isOpen: boolean
    onClose: () => void
    onDownload?: (document: Document) => void
}

export function DocumentPreview({
    document,
    isOpen,
    onClose,
    onDownload
}: DocumentPreviewProps): JSX.Element {
    const [chunks, setChunks] = useState<DocumentChunk[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fileUrl, setFileUrl] = useState<string | null>(null)

    // Load document chunks when document changes
    useEffect(() => {
        if (!document || !isOpen) {
            setChunks([])
            setFileUrl(null)
            return
        }

        loadDocumentData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [document, isOpen])

    const loadDocumentData = async () => {
        if (!document) return

        try {
            setLoading(true)
            setError(null)

            // Load chunks
            const { data: chunksData, error: chunksError } = await getDocumentChunks(document.id)
            if (chunksError) {
                throw new Error(chunksError)
            }

            setChunks(chunksData || [])

            // Get file URL for download
            const { url, error: urlError } = await getFileUrl(document.storage_path)
            if (urlError) {
                console.warn('Failed to get file URL:', urlError)
            } else {
                setFileUrl(url || null)
            }
        } catch (err) {
            console.error('Failed to load document data:', err)
            setError(err instanceof Error ? err.message : 'Failed to load document')
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = () => {
        if (document && onDownload) {
            onDownload(document)
        } else if (fileUrl) {
            // Fallback: direct download
            window.open(fileUrl, '_blank')
        }
    }

    const formatFileSize = (bytes?: number | null) => {
        if (!bytes) return 'Unknown size'
        const mb = bytes / (1024 * 1024)
        return `${mb.toFixed(1)} MB`
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ready':
                return 'text-green-600'
            case 'processing':
                return 'text-yellow-600'
            case 'error':
                return 'text-red-600'
            default:
                return 'text-gray-600'
        }
    }

    if (!document) return <></>

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-xl font-semibold truncate">
                        {document.title}
                    </DialogTitle>
                    {document.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {document.description}
                        </p>
                    )}
                </DialogHeader>

                <div className="flex-1 overflow-auto">
                    {/* Document Info */}
                    <Card className="mb-4">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Document Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
                                    <span className="ml-2">{document.mime_type}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Size:</span>
                                    <span className="ml-2">{formatFileSize(document.file_size)}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                                    <span className={`ml-2 font-medium ${getStatusColor(document.status)}`}>
                                        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Tokens:</span>
                                    <span className="ml-2">
                                        {document.length_tokens ? document.length_tokens.toLocaleString() : 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
                                    <span className="ml-2">
                                        {new Date(document.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Chunks:</span>
                                    <span className="ml-2">{chunks.length}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                {(fileUrl || onDownload) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDownload}
                                        className="gap-2"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download
                                    </Button>
                                )}
                                {fileUrl && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(fileUrl, '_blank')}
                                        className="gap-2"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Open Original
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Document Content */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Content Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-3 text-gray-600">Loading content...</span>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8">
                                    <p className="text-red-600 mb-2">Failed to load content</p>
                                    <p className="text-sm text-gray-500">{error}</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={loadDocumentData}
                                        className="mt-3"
                                    >
                                        Retry
                                    </Button>
                                </div>
                            ) : chunks.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-600">No content available</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {document.status === 'processing'
                                            ? 'Document is still being processed'
                                            : 'Content could not be extracted from this document'
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {chunks.map((chunk) => (
                                        <div
                                            key={chunk.id}
                                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-medium text-gray-500">
                                                    Chunk {chunk.chunk_index + 1} of {chunks.length}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {chunk.tokens} tokens
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                {chunk.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    )
}
