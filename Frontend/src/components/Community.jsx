import React, { useState } from "react";

const Community = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "RahulCitizen",
      title: "Pothole Issue on MG Road - Update Needed",
      content: "Has anyone filed a complaint about the pothole near the bus stop? It's been 2 weeks now.",
      category: "Infrastructure",
      upvotes: 24,
      downvotes: 2,
      comments: 8,
      time: "2 hours ago",
      userVote: null
    },
    {
      id: 2,
      author: "MumbaiResident",
      title: "Great Response from Municipality!",
      content: "Filed a complaint about street lights last week. They fixed it in 3 days. Really impressed with the response time.",
      category: "Success Story",
      upvotes: 45,
      downvotes: 0,
      comments: 12,
      time: "5 hours ago",
      userVote: null
    },
    {
      id: 3,
      author: "GreenWarrior",
      title: "Garbage Collection Schedule Changes",
      content: "Notice from municipal corporation about new garbage collection timings in our area. Morning collection shifted to 7 AM.",
      category: "Announcement",
      upvotes: 18,
      downvotes: 3,
      comments: 5,
      time: "1 day ago",
      userVote: null
    }
  ]);

  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "General"
  });

  const [showNewPost, setShowNewPost] = useState(false);

  const categories = ["General", "Infrastructure", "Water Supply", "Electricity", "Sanitation", "Success Story", "Announcement"];

  const handleVote = (postId, voteType) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        let newUpvotes = post.upvotes;
        let newDownvotes = post.downvotes;
        let newUserVote = voteType;

        if (post.userVote === voteType) {
          // Remove vote if clicking same vote
          newUserVote = null;
          if (voteType === 'up') newUpvotes--;
          else newDownvotes--;
        } else if (post.userVote) {
          // Change vote
          if (post.userVote === 'up') {
            newUpvotes--;
            newDownvotes++;
          } else {
            newDownvotes--;
            newUpvotes++;
          }
        } else {
          // New vote
          if (voteType === 'up') newUpvotes++;
          else newDownvotes++;
        }

        return { ...post, upvotes: newUpvotes, downvotes: newDownvotes, userVote: newUserVote };
      }
      return post;
    }));
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (newPost.title.trim() && newPost.content.trim()) {
      const post = {
        id: posts.length + 1,
        author: "You",
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        upvotes: 1,
        downvotes: 0,
        comments: 0,
        time: "Just now",
        userVote: 'up'
      };
      setPosts([post, ...posts]);
      setNewPost({ title: "", content: "", category: "General" });
      setShowNewPost(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Infrastructure": "bg-blue-100 text-blue-800",
      "Water Supply": "bg-cyan-100 text-cyan-800",
      "Electricity": "bg-yellow-100 text-yellow-800",
      "Sanitation": "bg-green-100 text-green-800",
      "Success Story": "bg-emerald-100 text-emerald-800",
      "Announcement": "bg-purple-100 text-purple-800",
      "General": "bg-gray-100 text-gray-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-green-700">Community Forum</h2>
        <button
          onClick={() => setShowNewPost(!showNewPost)}
          className="btn bg-green-600 hover:bg-green-700 text-white border-none"
        >
          Create Post
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        Connect with fellow citizens, share experiences, and help each other with civic issues.
      </p>

      {/* Create New Post Form */}
      {showNewPost && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6 border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Post</h3>
          <form onSubmit={handleCreatePost}>
            <div className="mb-4">
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                className="select select-bordered w-full max-w-xs mb-4 bg-white text-black"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <input
              type="text"
              placeholder="Post title..."
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              className="input input-bordered w-full mb-4 bg-white text-black"
              required
            />
            <textarea
              placeholder="What's on your mind?"
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              className="textarea textarea-bordered w-full h-32 mb-4 bg-white text-black"
              required
            />
            <div className="flex gap-2">
              <button type="submit" className="btn bg-green-600 hover:bg-green-700 text-white border-none">
                Post
              </button>
              <button type="button" onClick={() => setShowNewPost(false)} className="btn btn-outline">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              {/* Vote Section */}
              <div className="flex flex-col items-center min-w-[60px]">
                <button
                  onClick={() => handleVote(post.id, 'up')}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    post.userVote === 'up' ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  ▲
                </button>
                <span className="text-sm font-semibold text-gray-700">
                  {post.upvotes - post.downvotes}
                </span>
                <button
                  onClick={() => handleVote(post.id, 'down')}
                  className={`p-1 rounded hover:bg-gray-100 ${
                    post.userVote === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}
                >
                  ▼
                </button>
              </div>

              {/* Post Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    Posted by u/{post.author} • {post.time}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {post.title}
                </h3>
                
                <p className="text-gray-700 mb-3">
                  {post.content}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <button className="flex items-center gap-1 hover:text-gray-700">
                    💬 {post.comments} comments
                  </button>
                  <button className="flex items-center gap-1 hover:text-gray-700">
                    📤 Share
                  </button>
                  <button className="flex items-center gap-1 hover:text-gray-700">
                    💾 Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Community;
