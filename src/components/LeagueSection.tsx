
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { League } from "@/types";
import HighlightCard from "./HighlightCard";
import { ChevronRight } from "lucide-react";

interface LeagueSectionProps {
  league: League;
}

// Helper function to get country flag based on league ID
const getCountryFlag = (leagueId: string): string => {
  const flagMap: Record<string, string> = {
    'pl': 'https://flagcdn.com/w40/gb-eng.png', // English flag
    'laliga': 'https://flagcdn.com/w40/es.png', // Spanish flag
    'bundesliga': 'https://flagcdn.com/w40/de.png', // German flag
    'seriea': 'https://flagcdn.com/w40/it.png', // Italian flag
    'ligue1': 'https://flagcdn.com/w40/fr.png', // French flag
    'eredivisie': 'https://flagcdn.com/w40/nl.png', // Dutch flag
    'portugal': 'https://flagcdn.com/w40/pt.png', // Portuguese flag
    'brazil': 'https://flagcdn.com/w40/br.png', // Brazilian flag
    'argentina': 'https://flagcdn.com/w40/ar.png', // Argentine flag
  };
  
  return flagMap[leagueId] || 'https://www.sofascore.com/static/images/placeholders/tournament.svg';
};

const LeagueSection = ({ league }: LeagueSectionProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  const handleLeagueClick = () => {
    // Navigate to league page - this can be expanded based on requirements
    // For now, let's assume we'd navigate to /league/{id}
    navigate(`/league/${league.id}`);
  };

  return (
    <div className="mb-10 animate-fade-in">
      <div className="flex items-center space-x-3 mb-4">
        {/* Country flag instead of league logo - now clickable with hover effect */}
        <div 
          className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110"
          onClick={handleLeagueClick}
        >
          <img 
            src={getCountryFlag(league.id)}
            alt={league.name}
            className="w-8 h-8 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "https://www.sofascore.com/static/images/placeholders/tournament.svg";
            }}
          />
        </div>
        <div className="flex items-center justify-between flex-1">
          <div className="flex items-center space-x-3">
            {/* League name - now clickable with hover effect */}
            <h2 
              className="text-xl font-semibold tracking-tight text-white hover:text-[#FFC30B] cursor-pointer transition-colors duration-200"
              onClick={handleLeagueClick}
            >
              {league.name}
            </h2>
            {/* Removed the following span that displayed the number of highlights */}
            {/* <span className="text-sm text-gray-400">
              {league.highlights.length} highlights
            </span> */}
          </div>
        </div>
      </div>

      <div className="relative">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide gap-4 pb-2 -mx-1 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {league.highlights.map((highlight) => (
            <div 
              key={highlight.id} 
              className="flex-shrink-0 w-[280px] md:w-[320px] transform transition-all duration-300 hover:z-10"
            >
              <HighlightCard highlight={highlight} />
            </div>
          ))}
        </div>
        
        {/* Scroll button */}
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-highlight-800/80 hover:bg-highlight-700 p-2 rounded-full shadow-md z-10"
          aria-label="See more highlights"
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default LeagueSection;
