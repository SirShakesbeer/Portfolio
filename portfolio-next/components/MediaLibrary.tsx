'use client';

import { useEffect, useState, useCallback } from 'react';
import styles from './MediaLibrary.module.css';

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

interface Post {
  id: number;
  title: string;
  slug: string;
  post_type: string;
}

type FilterKind = 'all' | 'image' | 'video' | 'audio' | 'document' | 'other';

export default function MediaLibrary() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ added: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKind, setFilterKind] = useState<FilterKind>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedMediaUsage, setExpandedMediaUsage] = useState<Map<number, Post[]>>(new Map());

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/studio/media');
      if (!res.ok) throw new Error('Failed to fetch media');

      const data = await res.json();
      setMedia(data.media || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch media
  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleScanPublicFolder = useCallback(async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await fetch('/api/studio/media/scan', { method: 'POST' });
      if (!res.ok) throw new Error('Scan failed');
      const data = await res.json();
      setScanResult({ added: data.added?.length ?? 0, skipped: data.skipped?.length ?? 0 });
      // Refresh media list to show newly registered files
      await fetchMedia();
    } catch (err) {
      alert(`Scan failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setScanning(false);
    }
  }, [fetchMedia]);

  const getMediaIcon = (kind: string) => {
    switch (kind) {
      case 'image':
        return '🖼️';
      case 'video':
        return '▶️';
      case 'audio':
        return '🔊';
      case 'document':
        return '📄';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleExpandDetails = useCallback(
    async (mediaId: number) => {
      if (expandedId === mediaId) {
        setExpandedId(null);
        return;
      }

      try {
        const res = await fetch(`/api/studio/media/${mediaId}`);
        if (res.ok) {
          const data = await res.json();
          setExpandedMediaUsage((prev) => new Map(prev).set(mediaId, data.usedBy || []));
        }
      } catch (err) {
        console.error('Failed to fetch media details:', err);
      }

      setExpandedId(mediaId);
    },
    [expandedId]
  );

  const handleDelete = useCallback(
    async (mediaId: number, filename: string) => {
      if (!confirm(`Delete "${filename}"? This will remove the file permanently.`)) return;

      try {
        const res = await fetch(`/api/studio/media/${mediaId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');

        setMedia((prev) => prev.filter((m) => m.id !== mediaId));
        setExpandedId(null);
      } catch (err) {
        alert(`Failed to delete: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    },
    []
  );

  // Filter media
  const filteredMedia = media.filter((m) => {
    const matchesSearch =
      m.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.alt_text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKind = filterKind === 'all' || m.media_kind === filterKind;

    return matchesSearch && matchesKind;
  });

  if (loading) {
    return <div className={styles.message}>Loading media...</div>;
  }

  if (error) {
    return <div className={styles.message}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.controlsRow}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search by filename or alt text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.input}
            />
          </div>

          <div className={styles.controlActions}>
            <select
              value={filterKind}
              onChange={(e) => setFilterKind(e.target.value as FilterKind)}
              className={styles.select}
            >
              <option value="all">All Types</option>
              <option value="image">🖼️ Images</option>
              <option value="video">▶️ Videos</option>
              <option value="audio">🔊 Audio</option>
              <option value="document">📄 Documents</option>
              <option value="other">📎 Other</option>
            </select>
            <button
              className={styles.scanBtn}
              onClick={handleScanPublicFolder}
              disabled={scanning}
              title="Scan the public folder and register any new files into the media library"
            >
              {scanning ? '⏳ Scanning...' : '🔍 Scan Public Folder'}
            </button>
          </div>
        </div>

        {scanResult && (
          <div className={styles.scanResult}>
            ✅ Scan complete: <strong>{scanResult.added}</strong> new file{scanResult.added !== 1 ? 's' : ''} added,{' '}
            <strong>{scanResult.skipped}</strong> already registered.
          </div>
        )}
      </div>

      {/* Results */}
      <div className={styles.resultsInfo}>
        <span>
          {filteredMedia.length} file{filteredMedia.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className={styles.message}>No media found. Upload your first file in the editor!</div>
      ) : (
        <div className={styles.grid}>
          {filteredMedia.map((m) => {
            const usageList = expandedMediaUsage.get(m.id) || [];

            return (
              <div
                key={m.id}
                className={`${styles.card} ${expandedId === m.id ? styles.expanded : ''}`}
              >
                {/* Thumbnail */}
                <div
                  className={styles.thumbnail}
                  onClick={() => handleExpandDetails(m.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {m.media_kind === 'image' ? (
                    <img
                      src={m.file_path}
                      alt={m.alt_text || m.original_name}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className={styles.placeholder}>{getMediaIcon(m.media_kind)}</div>
                  )}
                </div>

                {/* Info */}
                <div className={styles.info}>
                  <div
                    className={styles.header}
                    onClick={() => handleExpandDetails(m.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <h4 className={styles.filename}>{m.original_name}</h4>
                    <span className={styles.icon}>{getMediaIcon(m.media_kind)}</span>
                  </div>

                  <div className={styles.meta}>
                    <span className={styles.kind}>{m.media_kind}</span>
                    <span className={styles.size}>{formatFileSize(m.size_bytes)}</span>
                    <span className={styles.date}>
                      {new Date(m.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Usage */}
                  <div
                    className={styles.usage}
                    onClick={() => handleExpandDetails(m.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className={styles.usageBadge}>
                      Used by {m.usage_count || 0} post{(m.usage_count || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Details (Expanded) */}
                {expandedId === m.id && (
                  <div className={styles.details}>
                    <div className={styles.detailsSection}>
                      <h5>File Path</h5>
                      <code className={styles.code}>{m.file_path}</code>
                      <button
                        className={styles.copyBtn}
                        onClick={() => copyToClipboard(m.file_path)}
                      >
                        Copy Path
                      </button>
                    </div>

                    <div className={styles.detailsSection}>
                      <h5>Alt Text</h5>
                      <p className={styles.altText}>{m.alt_text || '(not set)'}</p>
                    </div>

                    {usageList.length > 0 && (
                      <div className={styles.detailsSection}>
                        <h5>Used in Posts ({usageList.length})</h5>
                        <ul className={styles.usageList}>
                          {usageList.map((post) => (
                            <li key={post.id} className={styles.usageItem}>
                              <span className={styles.postTitle}>{post.title}</span>
                              <span className={styles.postType}>{post.post_type}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className={styles.detailsActions}>
                      <button
                        className={`${styles.btn} ${styles.btnDelete}`}
                        onClick={() => handleDelete(m.id, m.original_name)}
                      >
                        🗑️ Delete File
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
