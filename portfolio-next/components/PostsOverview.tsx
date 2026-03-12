'use client';

import { useEffect, useState, useCallback } from 'react';
import styles from './PostsOverview.module.css';

interface Post {
  id: number;
  title: string;
  slug: string;
  post_type: string;
  status: string;
  cover_image: string | null;
  updated_at: string;
  created_at: string;
}

interface PostsOverviewProps {
  onEditPost?: (postId: number) => void;
  onCreatePost?: () => void;
}

type SortBy = 'updated' | 'created' | 'type' | 'status';
type FilterStatus = 'all' | 'published' | 'draft';

export default function PostsOverview({ onEditPost, onCreatePost }: PostsOverviewProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [postTypes, setPostTypes] = useState<Set<string>>(new Set());
  const [selectedPostType, setSelectedPostType] = useState<string | 'all'>('all');

  // Fetch posts and post types
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const postsRes = await fetch('/api/studio/posts');
        if (!postsRes.ok) throw new Error('Failed to fetch posts');

        const postsData = await postsRes.json();
        const postsArray = Array.isArray(postsData) ? postsData : (postsData.posts || []);
        setPosts(postsArray);

        // Extract unique post types
        const types = new Set<string>(postsArray.map((p: Post) => p.post_type));
        setPostTypes(types);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort posts
  const filteredPosts = useCallback(() => {
    let filtered = posts.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchesType = selectedPostType === 'all' || p.post_type === selectedPostType;

      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'type':
          return a.post_type.localeCompare(b.post_type);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return filtered;
  }, [posts, searchTerm, filterStatus, sortBy, selectedPostType]);

  const displayedPosts = filteredPosts();

  const handleDelete = useCallback(
    async (postId: number, title: string) => {
      if (!confirm(`Delete post "${title}"? This cannot be undone.`)) return;

      try {
        const res = await fetch(`/api/studio/posts/${postId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');

        setPosts((prev) => prev.filter((p) => p.id !== postId));
      } catch (err) {
        alert(`Failed to delete post: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    },
    []
  );

  const handleViewLive = (post: Post) => {
    let url = `/posts/${post.post_type}/${post.slug}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return <div className={styles.message}>Loading posts...</div>;
  }

  if (error) {
    return <div className={styles.message}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by title or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.filters}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className={styles.select}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={selectedPostType}
            onChange={(e) => setSelectedPostType(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Types</option>
            {Array.from(postTypes).sort().map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className={styles.select}
          >
            <option value="updated">Last Updated</option>
            <option value="created">Date Created</option>
            <option value="type">Post Type</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className={styles.resultsInfo}>
        <span>
          {displayedPosts.length} post{displayedPosts.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Posts Grid */}
      {displayedPosts.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No posts found.</p>
          <button className={styles.emptyStateBtn} onClick={onCreatePost}>
            + Create your first post
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {displayedPosts.map((post) => (
            <div key={post.id} className={styles.card}>
              {post.cover_image && (
                <div className={styles.thumbnail}>
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className={styles.content}>
                <div className={styles.header}>
                  <h3 className={styles.title}>{post.title}</h3>
                  <span className={`${styles.badge} ${styles[post.status]}`}>
                    {post.status}
                  </span>
                </div>

                <p className={styles.meta}>
                  <span className={styles.type}>{post.post_type}</span>
                  <span className={styles.date}>
                    {new Date(post.updated_at).toLocaleDateString()}
                  </span>
                </p>

                <p className={styles.slug}>/{post.post_type}/{post.slug}</p>

                <div className={styles.actions}>
                  <button
                    className={`${styles.btn} ${styles.btnEdit}`}
                    onClick={() => onEditPost?.(post.id)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnView}`}
                    onClick={() => handleViewLive(post)}
                  >
                    👁️ View
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnDelete}`}
                    onClick={() => handleDelete(post.id, post.title)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
