import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, Tag, Clock, ArrowRight, ThumbsUp, MessageSquare, BookmarkPlus, Share2, Sparkles } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';

const BlogPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Posts' },
    { id: 'ai-learning', name: 'AI Learning' },
    { id: 'education', name: 'Education' },
    { id: 'technology', name: 'Technology' },
    { id: 'tips', name: 'Learning Tips' }
  ];

  const featuredPosts = [
    {
      id: 1,
      title: "How AI is Transforming Education in 2023",
      excerpt: "Discover the latest trends in AI-powered education tools and how they're revolutionizing learning experiences worldwide.",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
      category: "ai-learning",
      date: "June 15, 2023",
      readTime: "8 min read",
      author: {
        name: "Dr. Sarah Chen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"
      },
      featured: true
    },
    {
      id: 2,
      title: "5 Effective Strategies for Better Quiz Creation",
      excerpt: "Learn how to create engaging and effective quizzes that boost learning retention and make studying more enjoyable.",
      image: "https://images.unsplash.com/photo-1546514714-df0ccc50d7bf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
      category: "tips",
      date: "May 28, 2023",
      readTime: "6 min read",
      author: {
        name: "James Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james"
      },
      featured: true
    }
  ];

  const recentPosts = [
    {
      id: 3,
      title: "Understanding Visual Learning: The Science Behind Our Image Analysis Tool",
      excerpt: "Explore how visual learning enhances comprehension and how our AI tools help interpret complex visuals effortlessly.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
      category: "technology",
      date: "June 10, 2023",
      readTime: "7 min read",
      author: {
        name: "Dr. Michael Lee",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael"
      }
    },
    {
      id: 4,
      title: "PDF to Knowledge: Making the Most of Our PDF Assistant",
      excerpt: "Learn advanced techniques to extract knowledge from PDFs using our AI assistant for more effective research and study.",
      image: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1773&q=80",
      category: "education",
      date: "June 5, 2023",
      readTime: "5 min read",
      author: {
        name: "Emily Rodriguez",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily"
      }
    },
    {
      id: 5,
      title: "The Future of Personalized Learning with Adaptive AI",
      excerpt: "Discover how adaptive AI technology is creating truly personalized learning experiences tailored to individual needs.",
      image: "https://images.unsplash.com/photo-1509869175650-a1d97972541a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
      category: "ai-learning",
      date: "May 30, 2023",
      readTime: "9 min read",
      author: {
        name: "Alex Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex"
      }
    },
    {
      id: 6,
      title: "How Educators Are Using QuizGen to Transform Testing",
      excerpt: "Real-world success stories from educators who have revolutionized their assessment methods with AI-powered quizzes.",
      image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80",
      category: "education",
      date: "May 25, 2023",
      readTime: "6 min read",
      author: {
        name: "Prof. Lisa Zhang",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa"
      }
    },
    {
      id: 7,
      title: "10 Tips for More Effective Self-Study Using AI Tools",
      excerpt: "Practical advice for leveraging AI learning assistants to enhance independent study and achieve better results.",
      image: "https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1748&q=80",
      category: "tips",
      date: "May 20, 2023",
      readTime: "4 min read",
      author: {
        name: "Jessica Park",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jessica"
      }
    }
  ];

  const filteredPosts = [...featuredPosts, ...recentPosts].filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Header />
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white">
        <Container>
          <div className="py-8 md:py-10 lg:py-12">
            <div className="flex justify-between items-center">
            </div>

            <div className="mt-12 lg:mt-16 max-w-3xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              >
                Insights & Ideas for
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-200">
                  Smarter Learning
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-4 text-xl text-purple-100 max-w-2xl"
              >
                Discover the latest trends, tips, and technologies reshaping how we learn and teach in the AI era.
              </motion.p>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between mb-10">
          <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0 no-scrollbar">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                className={`whitespace-nowrap ${
                  activeCategory === category.id 
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600" 
                    : "hover:text-purple-700"
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-64 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Featured Posts */}
        {(activeCategory === 'all' || featuredPosts.some(post => post.category === activeCategory)) && 
          filteredPosts.some(post => post.featured) && !searchQuery && (
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Featured Articles</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredPosts
                .filter(post => post.featured)
                .map(post => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/5 z-10" />
                    <div 
                      className="aspect-[16/9] w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${post.image})` }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
                      <span className="inline-block px-3 py-1 bg-purple-600 bg-opacity-90 rounded-full text-xs font-semibold mb-3">
                        {categories.find(c => c.id === post.category)?.name}
                      </span>
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-200 transition-colors duration-300">
                        {post.title}
                      </h3>
                      <p className="text-white/90 line-clamp-2 mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img 
                            src={post.author.avatar} 
                            alt={post.author.name} 
                            className="w-8 h-8 rounded-full"
                          />
                          <span className="text-sm text-white/90">{post.author.name}</span>
                        </div>
                        <div className="flex items-center text-white/80 text-sm">
                          <Clock className="h-3 w-3 mr-1" />
                          {post.readTime}
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="absolute right-4 bottom-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-purple-700 hover:bg-purple-50"
                      size="sm"
                    >
                      Read More
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </motion.div>
                ))}
            </div>
          </div>
        )}

        {/* All Posts */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery ? 'Search Results' : 'Latest Articles'}
            </h2>
            {filteredPosts.length > 0 && (
              <span className="text-sm text-gray-500">
                {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium text-gray-600 mb-2">No articles found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow duration-300"
                >
                  <div 
                    className="aspect-video w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${post.image})` }}
                  />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        {categories.find(c => c.id === post.category)?.name}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {post.date}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img 
                          src={post.author.avatar} 
                          alt={post.author.name} 
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-xs text-gray-600">{post.author.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="text-gray-400 hover:text-purple-600 transition-colors">
                          <ThumbsUp className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-purple-600 transition-colors">
                          <BookmarkPlus className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-purple-600 transition-colors">
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {filteredPosts.length > 6 && (
          <div className="mt-12 text-center">
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
              Load More Articles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </Container>
      
      <Footer />
    </div>
  );
};

export default BlogPage; 