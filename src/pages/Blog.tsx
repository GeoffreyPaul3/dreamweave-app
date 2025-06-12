import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  readTime: string;
  category: string;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Top 10 Safety Tips for Online Marketplace Trading in Malawi',
    excerpt: 'Learn essential safety measures to protect yourself when buying and selling on online marketplaces in Malawi.',
    content: 'Trading online has become increasingly popular in Malawi, but it\'s important to stay safe...',
    author: 'Sarah Phiri',
    publishedAt: '2024-06-01',
    readTime: '5 min read',
    category: 'Safety',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop'
  },
  {
    id: '2',
    title: 'How to Take Great Product Photos for Your Listings',
    excerpt: 'Discover professional tips for photographing your products to attract more buyers and increase sales.',
    content: 'Great product photos are essential for successful online selling...',
    author: 'James Banda',
    publishedAt: '2024-05-28',
    readTime: '7 min read',
    category: 'Tips',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=200&fit=crop'
  },
  {
    id: '3',
    title: 'The Growing E-commerce Market in Malawi: Opportunities and Challenges',
    excerpt: 'An in-depth look at the current state of e-commerce in Malawi and what the future holds.',
    content: 'The e-commerce landscape in Malawi is rapidly evolving...',
    author: 'Grace Mwale',
    publishedAt: '2024-05-25',
    readTime: '8 min read',
    category: 'Market Insights',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop'
  },
  {
    id: '4',
    title: 'Success Story: From Small Business to Marketplace Leader',
    excerpt: 'Meet Jane Tembo, who transformed her small tailoring business into a thriving online enterprise.',
    content: 'Jane Tembo started with just a sewing machine and a dream...',
    author: 'Michael Chisomo',
    publishedAt: '2024-05-22',
    readTime: '6 min read',
    category: 'Success Stories',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop'
  },
  {
    id: '5',
    title: 'Understanding Payment Methods and Security in Malawi',
    excerpt: 'A comprehensive guide to secure payment options available for online transactions in Malawi.',
    content: 'Payment security is crucial for both buyers and sellers...',
    author: 'Peter Nyasulu',
    publishedAt: '2024-05-20',
    readTime: '9 min read',
    category: 'Finance',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop'
  },
  {
    id: '6',
    title: 'Mobile Commerce Trends in Africa: Malawi Leading the Way',
    excerpt: 'Exploring how mobile technology is revolutionizing commerce across Africa, with Malawi at the forefront.',
    content: 'Mobile commerce is transforming the way Africans buy and sell...',
    author: 'Esther Kaunda',
    publishedAt: '2024-05-18',
    readTime: '7 min read',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop'
  }
];

const Blog = () => {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Safety': 'bg-red-100 text-red-800',
      'Tips': 'bg-blue-100 text-blue-800',
      'Market Insights': 'bg-green-100 text-green-800',
      'Success Stories': 'bg-purple-100 text-purple-800',
      'Finance': 'bg-yellow-100 text-yellow-800',
      'Technology': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            DreamWeave Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest insights, tips, and stories from Malawi's leading marketplace
          </p>
        </div>

        {/* Featured Post */}
        <div className="mb-12">
          <Card className="overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={blogPosts[0].image}
                  alt={blogPosts[0].title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-6 md:p-8">
                <Badge className={getCategoryColor(blogPosts[0].category)}>
                  {blogPosts[0].category}
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold mt-4 mb-4">
                  {blogPosts[0].title}
                </h2>
                <p className="text-gray-600 mb-6">
                  {blogPosts[0].excerpt}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{blogPosts[0].author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(blogPosts[0].publishedAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{blogPosts[0].readTime}</span>
                  </div>
                </div>
                <Button>
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge className={getCategoryColor(post.category)}>
                    {post.category}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg leading-tight">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-16">
          <Card className="bg-gray-50">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
              <p className="text-gray-600 mb-6">
                Get the latest updates, tips, and stories delivered straight to your inbox
              </p>
              <div className="max-w-md mx-auto">
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button>
                    Subscribe
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Blog;
