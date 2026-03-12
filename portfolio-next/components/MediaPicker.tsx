'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './MediaPicker.module.css';

interface Media {
  id: number;
  post_id: number | null;
  original_name: string;
  file_path: string;
  media_kind: 'image' | 'video' | 'audio' | 'document' | 'other';
  mime_type: string;
  size_bytes: number;
  alt_text: string;
  created_at: string;
  usage_count?: number;
}

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (media: Media) => void;
  postId?: number;
}

export default function MediaPicker({
  isOpen,
  onClose,
  onSelectMedia,
  postId,
}: MediaPickerProps) {
  const [activeTab, setActiveTab] = useState<'existing' | 'upload'>('existing');
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Load media when modal opens
  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const url = postId ? `/api/studio/media?postId=${postId}` : '/api/studio/media';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
      }
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    const files = uploadInputRef.current?.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('files', file));

      const uploadUrl = postId
        ? `/api/studio/upload?postId=${postId}`
        : '/api/studio/upload';

      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const uploadedMediaList: Media[] = data.uploaded.map((file: any) => ({
          id: Math.random(), // Temporary ID for new uploads
          post_id: postId || null,
          original_name: file.url.split('/').pop() || 'file',
          file_path: file.url,
          media_kind: 'other',
          mime_type: file.mime,
          size_bytes: file.size,
          alt_text: '',
          created_at: new Date().toISOString(),
        }));

        // Add to media list
        setMedia((prev) => [...uploadedMediaList, ...prev]);
        setActiveTab('existing');

        // Reset input
        if (uploadInputRef.current) {
          uploadInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const filteredMedia = media.filter(
    (m) =>
      m.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.alt_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Insert Media</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'existing' ? styles.active : ''}`}
            onClick={() => setActiveTab('existing')}
          >
            Choose Existing
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'upload' ? styles.active : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload New
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {activeTab === 'existing' ? (
            <div className={styles.existingTab}>
              <input
                type="text"
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />

              {loading ? (
                <div className={styles.message}>Loading media...</div>
              ) : filteredMedia.length === 0 ? (
                <div className={styles.message}>No media found. Upload your first file!</div>
              ) : (
                <div className={styles.mediaGrid}>
                  {filteredMedia.map((m) => (
                    <div
                      key={m.id}
                      className={styles.mediaItem}
                      onClick={() => {
                        onSelectMedia(m);
                        onClose();
                      }}
                    >
                      {m.media_kind === 'image' ? (
                        <img
                          src={m.file_path}
                          alt={m.alt_text || m.original_name}
                          className={styles.thumbnail}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className={styles.placeholder}>
                          {m.media_kind === 'video'
                            ? '▶️'
                            : m.media_kind === 'audio'
                              ? '🔊'
                              : '📄'}
                        </div>
                      )}
                      <div className={styles.itemInfo}>
                        <p className={styles.itemName}>{m.original_name}</p>
                        <small className={styles.itemMeta}>{m.media_kind}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.uploadTab}>
              <div className={styles.uploadArea}>
                <p className={styles.uploadIcon}>📤</p>
                <p className={styles.uploadText}>Drag and drop files here or click to select</p>
                <input
                  ref={uploadInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.txt"
                  className={styles.fileInput}
                  onChange={handleUpload}
                />
              </div>
              <button
                className={styles.uploadBtn}
                onClick={() => uploadInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Select Files'}
              </button>
              <small className={styles.uploadNote}>Max 25MB per file</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
