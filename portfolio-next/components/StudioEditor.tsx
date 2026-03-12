'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import MediaPicker from './MediaPicker';
import styles from './StudioEditor.module.css';

type PostType = {
  id: number;
  slug: string;
  label: string;
  description: string;
};

type StudioPostSummary = {
  id: number;
  title: string;
  slug: string;
  post_type: string;
  status: 'published' | 'draft';
  updated_at: string;
};

type StudioPostDetail = {
  id: number;
  title: string;
  slug: string;
  post_type: string;
  excerpt: string;
  content_markdown: string;
  cover_image: string | null;
  tags: string;
  status: 'published' | 'draft';
};

type Media = {
  id: number;
  file_path: string;
  media_kind: 'image' | 'video' | 'audio' | 'document' | 'other';
  original_name: string;
};

type StudioEditorProps = {
  initialPostTypes: PostType[];
  initialPostId?: number;
  onSave?: () => void;
};

function makeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function markdownForMedia(media: Media): string {
  const url = media.file_path;
  const altText = media.original_name.split('.')[0] || 'media';

  switch (media.media_kind) {
    case 'image':
      return `![${altText}](${url})`;
    case 'video':
      return `<video controls src="${url}"></video>`;
    case 'audio':
      return `<audio controls src="${url}"></audio>`;
    default:
      return `[${altText}](${url})`;
  }
}

export default function StudioEditor({
  initialPostTypes,
  initialPostId,
  onSave,
}: StudioEditorProps) {
  const [postTypes, setPostTypes] = useState(initialPostTypes);
  const [existingPosts, setExistingPosts] = useState<StudioPostSummary[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(initialPostId || null);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [postType, setPostType] = useState(initialPostTypes[0]?.slug || 'project');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [markdown, setMarkdown] = useState('');

  const [newTypeSlug, setNewTypeSlug] = useState('');
  const [newTypeLabel, setNewTypeLabel] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');

  const textRef = useRef<HTMLTextAreaElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const previewSlug = useMemo(() => makeSlug(slug || title), [slug, title]);
  const isEditMode = selectedPostId !== null;

  useEffect(() => {
    void refreshExistingPosts();
    // Load initial post if provided
    if (initialPostId) {
      void loadPost(String(initialPostId));
    }
  }, [initialPostId]);

  async function refreshExistingPosts() {
    const res = await fetch('/api/studio/posts?status=all');
    const body = await res.json().catch(() => []);
    if (!res.ok) {
      setMessage(`Failed to fetch existing posts: ${body.error || 'Unknown error'}`);
      return;
    }
    setExistingPosts(body as StudioPostSummary[]);
  }

  function clearForm() {
    setSelectedPostId(null);
    setTitle('');
    setSlug('');
    setPostType(postTypes[0]?.slug || 'project');
    setExcerpt('');
    setTags('');
    setCoverImage('');
    setStatus('published');
    setMarkdown('');
    setMessage('');
  }

  async function loadPost(postIdValue: string) {
    if (!postIdValue) {
      clearForm();
      return;
    }

    const numericId = Number(postIdValue);
    if (!Number.isInteger(numericId)) return;

    setIsLoadingPost(true);
    setMessage('');

    try {
      const res = await fetch(`/api/studio/posts/${numericId}`);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(`Failed to load post: ${body.error || 'Unknown error'}`);
        return;
      }

      const post = body as StudioPostDetail;
      setSelectedPostId(post.id);
      setTitle(post.title);
      setSlug(post.slug);
      setPostType(post.post_type);
      setExcerpt(post.excerpt || '');
      try {
        setTags((JSON.parse(post.tags || '[]') as string[]).join(', '));
      } catch {
        setTags('');
      }
      setCoverImage(post.cover_image || '');
      setStatus(post.status);
      setMarkdown(post.content_markdown || '');
      setMessage(`Loaded post #${post.id} for editing.`);
    } finally {
      setIsLoadingPost(false);
    }
  }

  function wrapSelection(prefix: string, suffix = '') {
    const el = textRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = markdown.slice(start, end);
    const replacement = `${prefix}${selected}${suffix}`;
    const updated = markdown.slice(0, start) + replacement + markdown.slice(end);

    setMarkdown(updated);
    queueMicrotask(() => {
      el.focus();
      const cursor = start + replacement.length;
      el.setSelectionRange(cursor, cursor);
    });
  }

  async function createPostType() {
    setMessage('');
    const slugValue = makeSlug(newTypeSlug);
    const labelValue = newTypeLabel.trim();

    if (!slugValue || !labelValue) {
      setMessage('Post type slug and label are required.');
      return;
    }

    const res = await fetch('/api/studio/post-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: slugValue, label: labelValue }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Unknown error' }));
      setMessage(`Failed to create post type: ${body.error}`);
      return;
    }

    const refreshed = await fetch('/api/studio/post-types');
    const types = (await refreshed.json()) as PostType[];
    setPostTypes(types);
    setPostType(slugValue);
    setNewTypeSlug('');
    setNewTypeLabel('');
    setMessage(`Post type '${slugValue}' created.`);
  }

  async function uploadFiles() {
    const files = uploadRef.current?.files;
    if (!files || files.length === 0) {
      setMessage('Choose at least one file to upload.');
      return;
    }

    setIsUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('files', file));

      // Pass postId if editing a post
      const uploadUrl = isEditMode ? `/api/studio/upload?postId=${selectedPostId}` : '/api/studio/upload';

      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const body = await res.json();
      if (!res.ok) {
        setMessage(`Upload failed: ${body.error || 'Unknown error'}`);
        return;
      }

      const block = (body.uploaded as Array<{ markdown: string }>)
        .map((file) => file.markdown)
        .join('\n\n');

      setMarkdown((prev) => `${prev}${prev.endsWith('\n') || prev.length === 0 ? '' : '\n\n'}${block}`);
      if (uploadRef.current) uploadRef.current.value = '';
      setMessage('Upload complete. Markdown snippets were added to the editor.');
    } finally {
      setIsUploading(false);
    }
  }

  function handleMediaSelected(media: any) {
    const mediaMarkdown = markdownForMedia(media);
    
    // Insert at cursor or append
    const el = textRef.current;
    if (el && el.selectionStart !== undefined) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const before = markdown.slice(0, start);
      const selected = markdown.slice(start, end);
      const after = markdown.slice(end);
      
      const updated = before + mediaMarkdown + '\n\n' + after;
      setMarkdown(updated);
      
      queueMicrotask(() => {
        el.focus();
        const cursor = start + mediaMarkdown.length + 2;
        el.setSelectionRange(cursor, cursor);
      });
    } else {
      // Append if no selection
      setMarkdown((prev) => `${prev}${prev.endsWith('\n') || prev.length === 0 ? '' : '\n\n'}${mediaMarkdown}`);
    }
  }

  async function savePost() {
    setIsSaving(true);
    setMessage('');

    try {
      const payload = {
        title,
        slug: previewSlug,
        postType,
        excerpt,
        tags,
        coverImage,
        status,
        markdown,
      };

      const endpoint = isEditMode ? `/api/studio/posts/${selectedPostId}` : '/api/studio/posts';
      const method = isEditMode ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(`Save failed: ${body.error || 'Unknown error'}`);
        return;
      }

      const targetUrl =
        body.postType === 'project'
          ? `/projects/${body.slug}`
          : body.postType === 'skill'
            ? `/skills/${body.slug}`
            : body.postType === 'life'
              ? `/life/${body.slug}`
              : `/posts/${body.postType}/${body.slug}`;
      setMessage(`${isEditMode ? 'Updated' : 'Saved'}. Open ${targetUrl}`);
      await refreshExistingPosts();
      
      // Call onSave callback if provided
      if (onSave) {
        onSave();
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function deletePost() {
    if (!selectedPostId) return;
    const confirmed = window.confirm('Delete this post permanently?');
    if (!confirmed) return;

    setIsDeleting(true);
    setMessage('');

    try {
      const res = await fetch(`/api/studio/posts/${selectedPostId}`, { method: 'DELETE' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(`Delete failed: ${body.error || 'Unknown error'}`);
        return;
      }

      await refreshExistingPosts();
      clearForm();
      setMessage('Post deleted successfully.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className={styles.editor}>
      <h1 className={styles.heading}>Studio</h1>
      <p className={styles.subtext}>
        Write markdown, upload media, and publish posts with reusable post types.
      </p>

      <div className={styles.layout}>
        {/* ── Left column: content ── */}
        <div>
          <div className={styles.field}>
            <label className={styles.label}>Title</label>
            <input
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My new post"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Slug</label>
              <input
                className={styles.input}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-new-post"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Status</label>
              <select
                className={styles.select}
                value={status}
                onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Excerpt</label>
            <textarea
              className={styles.textarea}
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short preview text for cards"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Markdown Content</label>
            <div className={styles.toolbar}>
              <button type="button" className={styles.toolbarBtn} onClick={() => wrapSelection('## ')}>H2</button>
              <button type="button" className={styles.toolbarBtn} onClick={() => wrapSelection('**', '**')}>Bold</button>
              <button type="button" className={styles.toolbarBtn} onClick={() => wrapSelection('*', '*')}>Italic</button>
              <button type="button" className={styles.toolbarBtn} onClick={() => wrapSelection('`', '`')}>Code</button>
              <button type="button" className={styles.toolbarBtn} onClick={() => wrapSelection('\n- ')}>List</button>
              <button type="button" className={styles.toolbarBtn} onClick={() => wrapSelection('[text](https://example.com)')}>Link</button>
              <button type="button" className={styles.mediaBtnToolbar} onClick={() => setIsMediaPickerOpen(true)}>🖼️ Insert Media</button>
            </div>
            <textarea
              ref={textRef}
              className={styles.markdownArea}
              rows={18}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder={'# Headline\n\nWrite your content here...'}
            />
          </div>
        </div>

        {/* ── Right column: settings ── */}
        <div>
          <div className={styles.sideCard}>
            <h5>Edit Existing Post</h5>
            <select
              className={styles.select}
              value={selectedPostId ?? ''}
              onChange={(e) => void loadPost(e.target.value)}
              disabled={isLoadingPost}
            >
              <option value="">— Create new post —</option>
              {existingPosts.map((post) => (
                <option key={post.id} value={post.id}>
                  #{post.id} {post.title} ({post.post_type}/{post.status})
                </option>
              ))}
            </select>
            <div className={styles.btnRow}>
              <button className={styles.btnGhost} type="button" onClick={() => void refreshExistingPosts()}>
                Refresh list
              </button>
              <button className={styles.btnGhost} type="button" onClick={clearForm}>
                New post
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Post Type</label>
            <select className={styles.select} value={postType} onChange={(e) => setPostType(e.target.value)}>
              {postTypes.map((type) => (
                <option key={type.slug} value={type.slug}>
                  {type.label} ({type.slug})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.sideCard}>
            <h5>Add New Post Type</h5>
            <div className={styles.field}>
              <input
                className={styles.input}
                placeholder="slug (e.g. article)"
                value={newTypeSlug}
                onChange={(e) => setNewTypeSlug(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <input
                className={styles.input}
                placeholder="label (e.g. Article)"
                value={newTypeLabel}
                onChange={(e) => setNewTypeLabel(e.target.value)}
              />
            </div>
            <button className={styles.btnGhost} type="button" onClick={createPostType}>
              Add Type
            </button>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tags (comma-separated)</label>
            <input
              className={styles.input}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="nextjs, sqlite, portfolio"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Cover Image URL</label>
            <input
              className={styles.input}
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="/uploads/2026/03/my-cover.webp"
            />
          </div>

          <div className={styles.sideCard}>
            <h5>Media Upload</h5>
            <input className={styles.input} type="file" ref={uploadRef} multiple />
            <div className={styles.btnRow}>
              <button
                type="button"
                className={styles.btnGhost}
                onClick={uploadFiles}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading…' : 'Upload + Insert Markdown'}
              </button>
            </div>
            <span className={styles.uploadHint}>Files go to /public/uploads/YYYY/MM</span>
          </div>

          <div className={styles.sideCard}>
            <p className={styles.slugPreview}>
              <strong>Slug preview:</strong> {previewSlug || '(empty)'}
            </p>
            <button className={styles.btnPrimary} type="button" onClick={savePost} disabled={isSaving}>
              {isSaving ? (isEditMode ? 'Updating…' : 'Saving…') : (isEditMode ? 'Update Post' : 'Save Post')}
            </button>
            {isEditMode && (
              <button
                className={styles.btnDanger}
                type="button"
                onClick={deletePost}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting…' : 'Delete Post'}
              </button>
            )}
          </div>

          {message && (
            <div className={styles.message}>{message}</div>
          )}
        </div>
      </div>

      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectMedia={handleMediaSelected}
        postId={selectedPostId || undefined}
      />
    </main>
  );
}
