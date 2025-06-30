
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  Play, 
  Users, 
  TrendingUp, 
  Sparkles, 
  Headphones,
  Download,
  Share2,
  Heart,
  Zap,
  Star,
  Music,
  Volume2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PlayfulDashboard = () => {
  const [likedPodcasts, setLikedPodcasts] = useState<string[]>([]);

  const toggleLike = (podcastId: string) => {
    setLikedPodcasts(prev => 
      prev.includes(podcastId) 
        ? prev.filter(id => id !== podcastId)
        : [...prev, podcastId]
    );
  };

  const recentPodcasts = [
    { id: '1', title: 'My Career Journey', plays: 245, likes: 18 },
    { id: '2', title: 'Tech Leadership Stories', plays: 189, likes: 25 },
    { id: '3', title: 'Startup Adventures', plays: 156, likes: 12 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-white mb-4 drop-shadow-lg">
            🎙️ Your Podcast Empire
          </h1>
          <p className="text-xl text-white/90 font-medium">
            Create, share, and grow your audio brand
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 border-0 shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-8 text-center">
              <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 group-hover:rotate-12 transition-transform">
                <Mic className="h-8 w-8 text-white mx-auto" />
              </div>
              <h3 className="text-3xl font-black text-white mb-1">12</h3>
              <p className="text-white/90 font-semibold">Podcasts Created</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-400 to-blue-500 border-0 shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-8 text-center">
              <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 group-hover:bounce transition-all">
                <Headphones className="h-8 w-8 text-white mx-auto" />
              </div>
              <h3 className="text-3xl font-black text-white mb-1">2.5K</h3>
              <p className="text-white/90 font-semibold">Total Plays</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-400 to-purple-500 border-0 shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-8 text-center">
              <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 group-hover:pulse transition-all">
                <Users className="h-8 w-8 text-white mx-auto" />
              </div>
              <h3 className="text-3xl font-black text-white mb-1">847</h3>
              <p className="text-white/90 font-semibold">Followers</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-400 to-cyan-500 border-0 shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-8 text-center">
              <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 group-hover:wiggle transition-all">
                <TrendingUp className="h-8 w-8 text-white mx-auto" />
              </div>
              <h3 className="text-3xl font-black text-white mb-1">+45%</h3>
              <p className="text-white/90 font-semibold">Growth</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/create">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 cursor-pointer group">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-6 w-20 h-20 mx-auto mb-6 group-hover:rotate-12 transition-transform">
                  <Sparkles className="h-8 w-8 text-white mx-auto" />
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-2">Create Magic</h3>
                <p className="text-gray-600 mb-4">Turn your story into audio gold</p>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all">
                  <Zap className="h-4 w-4 mr-2" />
                  Start Creating
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/our-podcasts">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 cursor-pointer group">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-green-500 to-blue-500 rounded-full p-6 w-20 h-20 mx-auto mb-6 group-hover:bounce transition-all">
                  <Music className="h-8 w-8 text-white mx-auto" />
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-2">Explore Audio</h3>
                <p className="text-gray-600 mb-4">Discover amazing podcasts</p>
                <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Listen Now
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/financial">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 cursor-pointer group">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-full p-6 w-20 h-20 mx-auto mb-6 group-hover:pulse transition-all">
                  <TrendingUp className="h-8 w-8 text-white mx-auto" />
                </div>
                <h3 className="text-2xl font-black text-gray-800 mb-2">Track Success</h3>
                <p className="text-gray-600 mb-4">Monitor your podcast empire</p>
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-xl transition-all">
                  <Star className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Podcasts */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-black text-gray-800 flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-2">
                <Mic className="h-6 w-6 text-white" />
              </div>
              Your Latest Hits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentPodcasts.map((podcast) => (
              <div key={podcast.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-full p-3 group-hover:scale-110 transition-transform">
                    <Play className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">{podcast.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Headphones className="h-4 w-4" />
                        {podcast.plays} plays
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {podcast.likes} likes
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(podcast.id)}
                    className={`rounded-full hover:scale-110 transition-all ${
                      likedPodcasts.includes(podcast.id) 
                        ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${likedPodcasts.includes(podcast.id) ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full hover:scale-110 transition-all hover:bg-blue-50 hover:text-blue-500">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-full hover:scale-110 transition-all hover:bg-green-50 hover:text-green-500">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Fun Achievement Badges */}
        <Card className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 border-0 shadow-2xl">
          <CardContent className="p-8">
            <h3 className="text-2xl font-black text-white mb-6 text-center">🏆 Your Achievements</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg font-bold rounded-full hover:scale-110 transition-transform cursor-pointer">
                🎙️ Podcast Pioneer
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg font-bold rounded-full hover:scale-110 transition-transform cursor-pointer">
                🔥 Trending Creator
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg font-bold rounded-full hover:scale-110 transition-transform cursor-pointer">
                ⭐ Rising Star
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-lg font-bold rounded-full hover:scale-110 transition-transform cursor-pointer">
                🚀 Growth Hacker
              </Badge>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
