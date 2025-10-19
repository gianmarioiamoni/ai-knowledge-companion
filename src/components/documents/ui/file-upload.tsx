'use client'

import { JSX, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, FileText, AlertCircle } from 'lucide-react'
import { isValidFileType, getFileTypeIcon } from '@/lib/supabase/documents'
import { MAX_FILE_SIZE } from '@/types/documents'

interface FileUploadProps {
  onUpload: (file: File, title: string, description?: string) => Promise<{ success: boolean; error?: string }>
  loading?: boolean
  className?: string
}

interface FileWithMetadata {
  file: File
  title: string
  description: string
  error?: string
}

export function FileUpload({ onUpload, loading = false, className }: FileUploadProps): JSX.Element {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileWithMetadata[]>([])
  const [uploading, setUploading] = useState(false)

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  // Handle file input change
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }, [])

  // Process selected files
  const handleFiles = useCallback((files: File[]) => {
    const validFiles: FileWithMetadata[] = []

    files.forEach(file => {
      let error: string | undefined

      // Validate file type
      if (!isValidFileType(file.type)) {
        error = 'Unsupported file type. Please use PDF, TXT, MD, DOC, or DOCX files.'
      }
      // Validate file size
      else if (file.size > MAX_FILE_SIZE) {
        error = 'File size exceeds 10MB limit.'
      }

      validFiles.push({
        file,
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        description: '',
        error
      })
    })

    setSelectedFiles(prev => [...prev, ...validFiles])
  }, [])

  // Remove file from selection
  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Update file metadata
  const updateFileMetadata = useCallback((index: number, field: 'title' | 'description', value: string) => {
    setSelectedFiles(prev => prev.map((file, i) =>
      i === index ? { ...file, [field]: value } : file
    ))
  }, [])

  // Upload all valid files
  const handleUploadAll = useCallback(async () => {
    const validFiles = selectedFiles.filter(f => !f.error && f.title.trim())
    if (validFiles.length === 0) return

    setUploading(true)

    try {
      const results = await Promise.allSettled(
        validFiles.map(({ file, title, description }) =>
          onUpload(file, title.trim(), description.trim() || undefined)
        )
      )

      // Check results and update state
      const failedUploads: number[] = []
      results.forEach((result, index) => {
        if (result.status === 'rejected' || !result.value.success) {
          failedUploads.push(index)
        }
      })

      // Remove successful uploads
      if (failedUploads.length === 0) {
        setSelectedFiles([])
      } else {
        setSelectedFiles(prev => prev.filter((_, index) => failedUploads.includes(index)))
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }, [selectedFiles, onUpload])

  const hasValidFiles = selectedFiles.some(f => !f.error && f.title.trim())
  const isProcessing = loading || uploading

  return (
    <div className={className}>
      {/* Drop Zone */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-8 text-center">
          <Upload className={`h-12 w-12 mx-auto mb-4 ${dragActive ? 'text-blue-500' : 'text-gray-400'
            }`} />
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
            {dragActive ? 'Drop files here' : 'Drag and drop files here'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            or click to select files
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.txt,.md,.doc,.docx"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            disabled={isProcessing}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={isProcessing}
              asChild
            >
              <span>Browse Files</span>
            </Button>
          </label>
          <p className="text-xs text-gray-400 mt-2">
            Supported: PDF, TXT, MD, DOC, DOCX (max 10MB each)
          </p>
        </CardContent>
      </Card>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Selected Files ({selectedFiles.length})
          </h3>

          <div className="space-y-3">
            {selectedFiles.map((fileData, index) => (
              <Card key={index} className={`${fileData.error ? 'border-red-200 bg-red-50 dark:bg-red-950' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* File Icon */}
                    <div className="flex-shrink-0">
                      {fileData.error ? (
                        <AlertCircle className="h-8 w-8 text-red-500" />
                      ) : (
                        <div className="text-2xl">
                          {getFileTypeIcon(fileData.file.type)}
                        </div>
                      )}
                    </div>

                    {/* File Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {fileData.file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({(fileData.file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>

                      {fileData.error ? (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {fileData.error}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Title *
                            </label>
                            <input
                              type="text"
                              value={fileData.title}
                              onChange={(e) => updateFileMetadata(index, 'title', e.target.value)}
                              className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                              placeholder="Enter document title"
                              disabled={isProcessing}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={fileData.description}
                              onChange={(e) => updateFileMetadata(index, 'description', e.target.value)}
                              className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                              placeholder="Optional description"
                              disabled={isProcessing}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="flex-shrink-0 h-8 w-8 p-0"
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upload Button */}
          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedFiles.filter(f => !f.error).length} valid files ready to upload
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedFiles([])}
                disabled={isProcessing}
              >
                Clear All
              </Button>
              <Button
                onClick={handleUploadAll}
                disabled={!hasValidFiles || isProcessing}
                className="min-w-[100px]"
              >
                {isProcessing ? 'Uploading...' : `Upload ${selectedFiles.filter(f => !f.error && f.title.trim()).length} Files`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
