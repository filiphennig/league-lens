
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Expand, MessageCircle, Globe, Flame } from 'lucide-react';
import { MatchHighlight } from '@/types';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface HeroCarouselProps {
  highlights: MatchHighlight[];
}

// Example predefined games with working links and correct videos
const exampleGames: MatchHighlight[] = [
  {
    id: "1",
    title: "Manchester City vs Arsenal",
    date: new Date().toISOString(),
    thumbnailUrl: "https://e0.365dm.com/23/04/768x432/skysports-arsenal-manchester-city_6131683.jpg?20230426210634",
    videoUrl: "https://www.youtube.com/watch?v=38qkI3jAl68", // Updated Man City vs Arsenal
    duration: "10:25",
    views: 1500000,
    homeTeam: {
      id: "65",
      name: "Manchester City",
      logo: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg"
    },
    awayTeam: {
      id: "57",
      name: "Arsenal",
      logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg"
    },
    score: {
      home: 4,
      away: 1
    },
    competition: {
      id: "1",
      name: "Premier League",
      logo: "/competitions/premier-league.png"
    }
  },
  {
    id: "2",
    title: "Real Madrid vs Barcelona",
    date: new Date().toISOString(),
    thumbnailUrl: "https://cdn.wearefanatics.com/resources/products/football/barcelona-vs-real-madrid.png",
    videoUrl: "https://www.youtube.com/watch?v=MFb7LCqm6FE", // Real Madrid vs Barcelona
    duration: "11:40",
    views: 2300000,
    homeTeam: {
      id: "541",
      name: "Real Madrid",
      logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg"
    },
    awayTeam: {
      id: "529",
      name: "Barcelona",
      logo: "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg"
    },
    score: {
      home: 3,
      away: 2
    },
    competition: {
      id: "2",
      name: "La Liga",
      logo: "/competitions/la-liga.png"
    }
  },
  {
    id: "3",
    title: "Borussia Dortmund vs Bayern Munich",
    date: new Date().toISOString(),
    thumbnailUrl: "https://e0.365dm.com/22/10/768x432/skysports-bundesliga-bayern-munich_5922057.jpg?20221008170713",
    videoUrl: "https://www.youtube.com/watch?v=sApmPP5ku5k", // Dortmund vs Bayern
    duration: "9:15",
    views: 1800000,
    homeTeam: {
      id: "16",
      name: "Borussia Dortmund",
      logo: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg"
    },
    awayTeam: {
      id: "14",
      name: "Bayern Munich",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg"
    },
    score: {
      home: 2,
      away: 2
    },
    competition: {
      id: "3",
      name: "Bundesliga",
      logo: "/competitions/bundesliga.png"
    }
  }
];

const HeroCarousel = ({ highlights: propHighlights }: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const navigate = useNavigate();

  // Use example games instead of the passed highlights for demonstration
  const highlights = exampleGames; 
  const currentHighlight = highlights[currentIndex];

  // Extract YouTube video ID
  const getYoutubeVideoId = (url: string): string => {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : '';
  };

  const handleNavigateToMatch = () => {
    navigate(`/match/${currentHighlight.id}`);
  };

  const handlePrevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? highlights.length - 1 : prevIndex - 1
    );
  };

  const handleNextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === highlights.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleOpenComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments(true);
  };

  const handleCloseComments = () => {
    setShowComments(false);
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#222222] rounded-xl shadow-lg min-h-[550px] border border-highlight-700/10">
      {/* Games of the Week Badge - Top Left */}
      <div className="absolute top-4 left-4 z-30 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 text-white flex items-center">
        <Flame className="w-4 h-4 mr-2 text-[#FFC30B]" />
        <span className="text-sm font-medium">Games of the Week</span>
      </div>
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/70 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/80 to-transparent z-10"></div>
        
        <img
          src={currentHighlight.thumbnailUrl}
          alt=""
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      {/* Content Container - Vertically centered with flex */}
      <div className="relative z-20 w-full h-full flex items-center justify-center py-6 px-6 md:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-8 w-full max-w-7xl mx-auto mt-4">
          {/* Match Info Container - Left side */}
          <div className="w-full lg:w-[40%] self-center order-2 lg:order-1 lg:pl-10">
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                <img 
                  src={currentHighlight.homeTeam.logo} 
                  alt={currentHighlight.homeTeam.name} 
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://www.sofascore.com/static/images/placeholders/team.svg";
                  }}
                />
                <span className="text-white text-2xl font-bold mx-3">{currentHighlight.score.home} - {currentHighlight.score.away}</span>
                <img 
                  src={currentHighlight.awayTeam.logo} 
                  alt={currentHighlight.awayTeam.name} 
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://www.sofascore.com/static/images/placeholders/team.svg";
                  }}
                />
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {currentHighlight.homeTeam.name} vs {currentHighlight.awayTeam.name}
            </h1>

            <div className="flex items-center mb-4">
              <p className="text-white/70">2 hours ago</p>
              <span className="mx-2 text-white/40">•</span>
              <p className="text-white/70">{currentHighlight.competition.name}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <button 
                onClick={handleNavigateToMatch}
                className="bg-white text-black px-5 py-2 rounded-full font-semibold flex items-center hover:bg-white/90 transition-colors"
              >
                <Expand className="w-4 h-4 mr-2" />
                Expand
              </button>
              
              <button
                onClick={handleOpenComments}
                className="bg-[#FFC30B] text-black px-4 py-2 rounded-full font-medium flex items-center hover:bg-[#FFC30B]/90 transition-colors"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                +{Math.floor(Math.random() * 20) + 5}
              </button>
            </div>
          </div>

          {/* Video Container - Right side */}
          <div className="w-full lg:w-[60%] aspect-video rounded-lg overflow-hidden shadow-xl order-1 lg:order-2 lg:pr-10">
            <iframe
              src={`https://www.youtube.com/embed/${getYoutubeVideoId(currentHighlight.videoUrl)}?autoplay=1&mute=1&controls=1&modestbranding=1`}
              title={currentHighlight.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Carousel Controls - Now positioned closer to the content */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-30">
        {highlights.map((_, index) => (
          <button
            key={index}
            className={`h-3 rounded-full transition-all ${
              index === currentIndex ? "bg-[#FFC30B] w-8" : "bg-white/50 w-3"
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Previous/Next buttons - Moved further to edges with padding */}
      <button
        className="absolute left-2 md:left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white z-30 hover:bg-black/50 transition-colors"
        onClick={handlePrevSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        className="absolute right-2 md:right-6 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white z-30 hover:bg-black/50 transition-colors"
        onClick={handleNextSlide}
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Comments Dialog */}
      <Dialog open={showComments} onOpenChange={handleCloseComments}>
        <DialogContent className="sm:max-w-md bg-[#222222] border-gray-700">
          <div className="p-4">
            <h2 className="text-xl font-bold text-white mb-4">Comments</h2>
            <div className="space-y-4">
              {/* Example comments */}
              <div className="bg-[#333333] p-3 rounded">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#FFC30B] flex items-center justify-center text-black font-bold">J</div>
                  <div className="ml-2">
                    <div className="text-white font-medium">John</div>
                    <div className="text-gray-400 text-xs">2 hours ago</div>
                  </div>
                </div>
                <p className="text-white text-sm">What a goal by Robertson! Incredible finish.</p>
              </div>
              
              <div className="bg-[#333333] p-3 rounded">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#FFC30B] flex items-center justify-center text-black font-bold">S</div>
                  <div className="ml-2">
                    <div className="text-white font-medium">Sarah</div>
                    <div className="text-gray-400 text-xs">1 hour ago</div>
                  </div>
                </div>
                <p className="text-white text-sm">Liverpool deserved this win. Great team performance!</p>
              </div>
              
              <div className="bg-[#333333] p-3 rounded">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#FFC30B] flex items-center justify-center text-black font-bold">M</div>
                  <div className="ml-2">
                    <div className="text-white font-medium">Mike</div>
                    <div className="text-gray-400 text-xs">30 minutes ago</div>
                  </div>
                </div>
                <p className="text-white text-sm">Arsenal's defense was all over the place today.</p>
              </div>
            </div>
            
            <div className="mt-4">
              <input
                type="text"
                placeholder="Add a comment..."
                className="w-full bg-[#111111] border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#FFC30B]"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HeroCarousel;
