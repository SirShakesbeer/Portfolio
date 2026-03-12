'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

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

type StudioEditorProps = {
  initialPostTypes: PostType[];
};

function makeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function StudioEditor({ initialPostTypes }: StudioEditorProps) {
  const [postTypes, setPostTypes] = useState(initialPostTypes);
  const [existingPosts, setExistingPosts] = useState<StudioPostSummary[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
  }, []);

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

      const res = await fetch('/api/studio/upload', {
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
          : `/posts/${body.postType}/${body.slug}`;
      setMessage(`${isEditMode ? 'Updated' : 'Saved'}. Open ${targetUrl}`);
      await refreshExistingPosts();
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
    <main className="container py-5" style={{ maxWidth: 1000 }}>
      <h1>Studio</h1>
      <p style={{ opacity: 0.75 }}>
        Write markdown, upload media, and publish posts with reusable post types.
      </p>

      <div className="row g-4 mt-1">
        <div className="col-12 col-lg-8">
          <label className="form-label">Title</label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My new post"
          />

          <div className="row g-2 mt-1">
            <div className="col-8">
              <label className="form-label">Slug</label>
              <input
                className="form-control"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-new-post"
              />
            </div>
            <div className="col-4">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
              >
                <option value="published">published</option>
                <option value="draft">draft</option>
              </select>
            </div>
          </div>

          <label className="form-label mt-3">Excerpt</label>
          <textarea
            className="form-control"
            rows={3}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short preview text for cards"
          />

          <label className="form-label mt-3">Markdown Content</label>
          <div className="d-flex gap-2 mb-2 flex-wrap">
            <button type="button" className="btn btn-outline-light btn-sm" onClick={() => wrapSelection('## ')}>H2</button>
            <button type="button" className="btn btn-outline-light btn-sm" onClick={() => wrapSelection('**', '**')}>Bold</button>
            <button type="button" className="btn btn-outline-light btn-sm" onClick={() => wrapSelection('*', '*')}>Italic</button>
            <button type="button" className="btn btn-outline-light btn-sm" onClick={() => wrapSelection('`', '`')}>Code</button>
            <button type="button" className="btn btn-outline-light btn-sm" onClick={() => wrapSelection('\n- ')}>List</button>
            <button type="button" className="btn btn-outline-light btn-sm" onClick={() => wrapSelection('[text](https://example.com)')}>Link</button>
          </div>
          <textarea
            ref={textRef}
            className="form-control"
            rows={18}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="# Headline\n\nWrite your content here..."
          />
        </div>

        <div className="col-12 col-lg-4">
          <label className="form-label">Edit Existing Post</label>
          <select
            className="form-select"
            value={selectedPostId ?? ''}
            onChange={(e) => void loadPost(e.target.value)}
            disabled={isLoadingPost}
          >
            <option value="">Create new post</option>
            {existingPosts.map((post) => (
              <option key={post.id} value={post.id}>
                #{post.id} {post.title} ({post.post_type}/{post.status})
              </option>
            ))}
          </select>

          <div className="d-flex gap-2 mt-2">
            <button className="btn btn-outline-light btn-sm" type="button" onClick={() => void refreshExistingPosts()}>
              Refresh list
            </button>
            <button className="btn btn-outline-light btn-sm" type="button" onClick={clearForm}>
              New post
            </button>
          </div>

          <label className="form-label">Post Type</label>
          <select className="form-select" value={postType} onChange={(e) => setPostType(e.target.value)}>
            {postTypes.map((type) => (
              <option key={type.slug} value={type.slug}>
                {type.label} ({type.slug})
              </option>
            ))}
          </select>

          <div className="card mt-3 p-3">
            <h5 className="mb-2">Add New Post Type</h5>
            <input
              className="form-control mb-2"
              placeholder="slug (e.g. article)"
              value={newTypeSlug}
              onChange={(e) => setNewTypeSlug(e.target.value)}
            />
            <input
              className="form-control mb-2"
              placeholder="label (e.g. Article)"
              value={newTypeLabel}
              onChange={(e) => setNewTypeLabel(e.target.value)}
            />
            <button className="btn btn-outline-light" type="button" onClick={createPostType}>
              Add Type
            </button>
          </div>

          <label className="form-label mt-3">Tags (comma-separated)</label>
          <input
            className="form-control"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="nextjs,sqlite,portfolio"
          />

          <label className="form-label mt-3">Cover Image URL</label>
          <input
            className="form-control"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="/uploads/2026/03/my-cover.webp"
          />

          <div className="card mt-3 p-3">
            <h5 className="mb-2">Media Upload</h5>
            <input ref={uploadRef} className="form-control" type="file" multiple />
            <button
              type="button"
              className="btn btn-outline-light mt-2"
              onClick={uploadFiles}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload + Insert Markdown'}
            </button>
            <small style={{ opacity: 0.7 }} className="mt-2 d-block">
              Uploaded files go to /public/uploads/YYYY/MM.
            </small>
          </div>

          <div className="card mt-3 p-3">
            <p className="mb-2"><strong>Preview URL slug:</strong> {previewSlug || '(empty)'}</p>
            <button className="btn btn-success" type="button" onClick={savePost} disabled={isSaving}>
              {isSaving ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Post' : 'Save Post')}
            </button>
            {isEditMode && (
              <button
                className="btn btn-danger mt-2"
                type="button"
                onClick={deletePost}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Post'}
              </button>
            )}
          </div>

          {message && (
            <div className="alert alert-info mt-3" role="alert">
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
