import React from 'react';
import { PostComposer } from '../components/PostComposer';
import { PlatformAccount, Post } from '../types/platform';

interface PostsPageProps {
  accounts: PlatformAccount[];
  posts: Post[];
  isSchedulerActive: boolean;
  onCreatePost: (post: Omit<Post, 'id' | 'createdAt'>) => void;
  onDeletePost: (postId: string) => void;
}

export const PostsPage: React.FC<PostsPageProps> = ({
  accounts,
  posts,
  isSchedulerActive,
  onCreatePost,
  onDeletePost
}) => {
  const connectedAccounts = accounts.filter(acc => acc.connected);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16 px-6">
        <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent drop-shadow-lg mb-6 tracking-tight animate-fadeIn">
          Manage All Your Social Media Posts
        </h2>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed tracking-wide animate-fadeIn delay-200">
          Create engaging content, upload videos and images, and schedule posts across all your
          connected social media accounts with our unified posting dashboard.
        </p>
      </div>

      {/* Post Composer - Full Width Row */}
      <section className="mb-8">
        <PostComposer
          accounts={accounts}
          onCreatePost={onCreatePost}
        />
      </section>


      {/* Quick Start Guide */}
      {connectedAccounts.length === 0 && (
        <section className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Started</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔗</span>
              </div>
              <h4 className="font-semibold mb-2">1. Connect Accounts</h4>
              <p className="text-sm text-gray-600">
                Go to Accounts page to connect your social media platforms
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✍️</span>
              </div>
              <h4 className="font-semibold mb-2">2. Create Content</h4>
              <p className="text-sm text-gray-600">
                Write posts, upload media, or use AI to generate engaging content
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🚀</span>
              </div>
              <h4 className="font-semibold mb-2">3. Post & Schedule</h4>
              <p className="text-sm text-gray-600">
                Publish immediately or schedule posts across all your accounts
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};