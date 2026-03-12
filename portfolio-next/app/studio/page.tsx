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
        const res = await fetch('/api/studio/posts');
        // Post types are fetched from the API, but for now we'll load from client-side fetch
        // In production, you might want to pass this as initial props
        const data = await res.json();
        // Extract unique types from posts
        const types = new Map<string, PostType>();
        if (data.posts) {
          data.posts.forEach((post: any) => {
            if (!types.has(post.post_type)) {
              types.set(post.post_type, {
                id: Math.random(),
                slug: post.post_type,
                label: post.post_type.charAt(0).toUpperCase() + post.post_type.slice(1),
                description: '',
                created_at: new Date().toISOString(),
              });
            }
          });
        }
        setPostTypes(Array.from(types.values()));
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
