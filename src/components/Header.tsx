
import { useState, useEffect, useRef } from 'react';
import { Search, User, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { MatchHighlight } from '@/types';
import { searchHighlights } from '@/services/highlightService';

const Header = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MatchHighlight[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  useEffect(() => {
    // Add click outside listener
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchHighlights(searchQuery);
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (id: string) => {
    navigate(`/match/${id}`);
    setSearchQuery('');
    setShowResults(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-4 py-4 md:py-3 ${
        scrolled ? 'bg-[#222222]/95 backdrop-blur-md shadow-sm' : 'bg-[#222222]/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center flex-1 space-x-4 md:space-x-6">
          {/* Logo - sized similar to FotMob */}
          <Link to="/" className="flex-shrink-0">
            <img 
              src="/lovable-uploads/3f69b4d3-7c25-4f74-a779-c3f73cd73d08.png" 
              alt="Score 90" 
              className="h-7 md:h-8" 
            />
          </Link>

          {/* Search bar - styled similar to FotMob */}
          <div ref={searchRef} className="relative flex-1 max-w-xl">
            <div className="flex items-center bg-[#333333] rounded-full w-full">
              <Search size={20} className={`ml-4 ${isSearching ? 'text-[#FFC30B]' : 'text-gray-400'} flex-shrink-0`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for teams or matches"
                className="bg-transparent text-white placeholder:text-gray-400 w-full pl-3 pr-4 py-2 rounded-full focus:outline-none"
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowResults(true);
                  }
                }}
              />
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="mr-4 text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#333333] rounded-lg shadow-lg max-h-[80vh] overflow-y-auto z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-300">
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-gray-300">
                    No results found
                  </div>
                ) : (
                  <div className="py-2">
                    {searchResults.map((result) => (
                      <div 
                        key={result.id}
                        onClick={() => handleResultClick(result.id)}
                        className="px-4 py-2 hover:bg-[#444444] cursor-pointer"
                      >
                        <div className="flex items-center">
                          <div className="flex items-center space-x-2 flex-1">
                            <img 
                              src={result.homeTeam.logo} 
                              alt={result.homeTeam.name}
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://www.sofascore.com/static/images/placeholders/team.svg";
                              }}
                            />
                            <span className="text-white text-sm">{result.score.home} - {result.score.away}</span>
                            <img 
                              src={result.awayTeam.logo} 
                              alt={result.awayTeam.name}
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://www.sofascore.com/static/images/placeholders/team.svg";
                              }}
                            />
                          </div>
                          <div className="text-gray-300 text-xs">
                            {result.competition.name}
                          </div>
                        </div>
                        <div className="text-white text-sm mt-1">{result.title}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center pl-4">
          <button 
            className="p-2 rounded-full bg-highlight-800/50 hover:bg-highlight-700/50 transition-colors"
            aria-label="User profile"
          >
            <User size={20} className="text-white" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
