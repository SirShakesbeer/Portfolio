'use client';

import { useState, useEffect } from 'react';
import StudioEditor from '@/components/StudioEditor';
import StudioDashboard, { type DashboardTab } from '@/components/StudioDashboard';
import type { PostType } from '@/lib/db';

export default function StudioPage() {
  const [postTypes, setPostTypes] = useState<PostType[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'editor'>('dashboard');
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  // Fetch post types
  useEffect(() => {
    const fetchPostTypes = async () => {
      try {
        const res = await fetch('/api/studio/post-types');
        const data = await res.json();
        if (res.ok && Array.isArray(data) && data.length > 0) {
          setPostTypes(data as PostType[]);
          return;
        }

        // Fallback: derive types from existing posts if post-types API is temporarily unavailable.
        const postsRes = await fetch('/api/studio/posts?status=all');
        const postsData = await postsRes.json();
        if (!postsRes.ok || !Array.isArray(postsData)) {
          throw new Error(data?.error || 'Failed to fetch post types');
        }

        const map = new Map<string, PostType>();
        postsData.forEach((post: { post_type?: string }) => {
          const slug = String(post.post_type || '').trim();
          if (!slug || map.has(slug)) return;
          map.set(slug, {
            id: Math.random(),
            slug,
            label: slug.charAt(0).toUpperCase() + slug.slice(1),
            description: '',
            created_at: new Date().toISOString(),
          });
        });
        setPostTypes(Array.from(map.values()));
      } catch (error) {
        console.error('Failed to fetch post types:', error);
      }
    };

    fetchPostTypes();
  }, []);

  const handleEditPost = (postId: number) => {
    setSelectedPostId(postId);
    setActiveView('editor');
  };

  const handleCreatePost = () => {
    setSelectedPostId(null);
    setActiveView('editor');
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    setSelectedPostId(null);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {activeView === 'dashboard' ? (
        <StudioDashboard onEditPost={handleEditPost} onCreatePost={handleCreatePost} />
      ) : (
        <div>
          <button
            onClick={handleBackToDashboard}
            style={{
              padding: '0.6rem 1.25rem',
              margin: '1rem 1.5rem',
              backgroundColor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'var(--text-color)',
            }}
          >
            ← Back to Dashboard
          </button>
          <StudioEditor
            initialPostTypes={postTypes}
            initialPostId={selectedPostId || undefined}
            onSave={() => {
              setActiveView('dashboard');
              setSelectedPostId(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
