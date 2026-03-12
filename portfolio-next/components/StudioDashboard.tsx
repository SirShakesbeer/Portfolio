'use client';

import { useEffect, useState } from 'react';
import PostsOverview from './PostsOverview';
import MediaLibrary from './MediaLibrary';
import styles from './StudioDashboard.module.css';

export type DashboardTab = 'posts' | 'media' | 'editor';

interface StudioDashboardProps {
  initialTab?: DashboardTab;
  onEditPost?: (postId: number) => void;
  onCreatePost?: () => void;
}

export default function StudioDashboard({
  initialTab = 'posts',
  onEditPost,
  onCreatePost,
}: StudioDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
  const [postStats, setPostStats] = useState<{ total: number; draft: number; published: number }>({
    total: 0,
    draft: 0,
    published: 0,
  });
  const [mediaStats, setMediaStats] = useState<{ total: number }>({ total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats on mount
    const fetchStats = async () => {
      try {
        // Fetch posts stats
        const postsRes = await fetch('/api/studio/posts');
        if (postsRes.ok) {
          const data = await postsRes.json();
          const posts = Array.isArray(data) ? data : (data.posts || []);
          setPostStats({
            total: posts.length,
            draft: posts.filter((p: any) => p.status === 'draft').length,
            published: posts.filter((p: any) => p.status === 'published').length,
          });
        }

        // Fetch media stats
        const mediaRes = await fetch('/api/studio/media');
        if (mediaRes.ok) {
          const data = await mediaRes.json();
          const mediaList = data.media || [];
          setMediaStats({ total: mediaList.length });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1>Studio Dashboard</h1>
          <p className={styles.subtitle}>Manage posts and media for your portfolio</p>
        </div>
        <button className={styles.newPostBtn} onClick={onCreatePost}>
          + New Post
        </button>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tabButton} ${activeTab === 'posts' ? styles.active : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          📝 Posts
          <span className={styles.badge}>{postStats.total}</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'media' ? styles.active : ''}`}
          onClick={() => setActiveTab('media')}
        >
          🖼️ Media
          <span className={styles.badge}>{mediaStats.total}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.content}>
        {activeTab === 'posts' && (
          <PostsOverview onEditPost={onEditPost} onCreatePost={onCreatePost} />
        )}
        {activeTab === 'media' && <MediaLibrary />}
      </div>

      {/* Quick Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Posts</span>
          <span className={styles.statValue}>
            {postStats.published}
            <span className={styles.statSubtitle}>published</span>
            {postStats.draft > 0 && (
              <>
                {' '}
                + {postStats.draft}
                <span className={styles.statSubtitle}>draft</span>
              </>
            )}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Media</span>
          <span className={styles.statValue}>{mediaStats.total}</span>
        </div>
      </div>
    </div>
  );
}
