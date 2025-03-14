
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLeagueHighlights, fetchPremierLeagueFromScoreBat } from '@/services/highlightService';
import { League, MatchHighlight, ScoreBatMatch } from '@/types';
import Header from '@/components/Header';
import HighlightCard from '@/components/HighlightCard';
import ScoreBatHighlightCard from '@/components/ScoreBatHighlightCard';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

const getCountryFlag = (leagueId: string): string => {
  const flagMap: Record<string, string> = {
    'pl': 'https://flagcdn.com/w40/gb-eng.png',
    'laliga': 'https://flagcdn.com/w40/es.png',
    'bundesliga': 'https://flagcdn.com/w40/de.png',
    'seriea': 'https://flagcdn.com/w40/it.png',
    'ligue1': 'https://flagcdn.com/w40/fr.png',
    'eredivisie': 'https://flagcdn.com/w40/nl.png',
    'portugal': 'https://flagcdn.com/w40/pt.png',
    'brazil': 'https://flagcdn.com/w40/br.png',
    'argentina': 'https://flagcdn.com/w40/ar.png',
  };
  
  return flagMap[leagueId] || 'https://www.sofascore.com/static/images/placeholders/tournament.svg';
};

const LeaguePage = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoreBatMatches, setScoreBatMatches] = useState<ScoreBatMatch[]>([]);
  const [scoreBatLoading, setScoreBatLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        const leaguesData = await getLeagueHighlights();
        const leagueData = leaguesData.find(l => l.id === leagueId);
        
        if (leagueData) {
          setLeague(leagueData);
        }
        setLoading(false);
        
        if (leagueId === 'pl') {
          fetchScoreBatMatches();
        }
      } catch (error) {
        console.error('Error fetching league data:', error);
        setLoading(false);
      }
    };

    fetchLeagueData();
  }, [leagueId]);

  const fetchScoreBatMatches = async () => {
    if (leagueId !== 'pl') {
      toast({
        title: "API Limited",
        description: "ScoreBat API integration is only available for Premier League",
        variant: "destructive"
      });
      return;
    }

    setScoreBatLoading(true);
    try {
      const data = await fetchPremierLeagueFromScoreBat();
      if (data && data.response) {
        setScoreBatMatches(data.response);
        toast({
          title: "Live Matches Loaded",
          description: `Loaded ${data.response.length} matches from ScoreBat API`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Error fetching ScoreBat matches:', error);
      toast({
        title: "API Error",
        description: "Failed to load matches from ScoreBat API",
        variant: "destructive"
      });
    } finally {
      setScoreBatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <Header />
      
      <main className="pt-20 pb-10">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <Link to="/">
              <Button variant="ghost" className="text-gray-400 hover:text-white pl-0">
                <ArrowLeft size={18} />
                <span className="ml-1">Back</span>
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-highlight-800 rounded w-3/4 max-w-md"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-video bg-highlight-800 rounded"></div>
                ))}
              </div>
            </div>
          ) : league ? (
            <>
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
                  <img 
                    src={getCountryFlag(league.id)}
                    alt={league.name}
                    className="w-12 h-12 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://www.sofascore.com/static/images/placeholders/tournament.svg";
                    }}
                  />
                </div>
                <h1 className="text-3xl font-bold">{league.name}</h1>
              </div>
              
              {leagueId === 'pl' && (
                <div className="mb-12">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Live Matches</h2>
                    <Button 
                      variant="outline" 
                      onClick={fetchScoreBatMatches}
                      disabled={scoreBatLoading}
                      size="sm"
                    >
                      {scoreBatLoading ? 'Refreshing...' : 'Refresh Matches'}
                    </Button>
                  </div>
                  
                  {scoreBatLoading && scoreBatMatches.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="aspect-video bg-highlight-800 rounded-lg mb-2"></div>
                          <div className="h-5 bg-highlight-800 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-highlight-800 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : scoreBatMatches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {scoreBatMatches.map((match, index) => (
                        <div key={index} className="transform transition-all duration-300 hover:scale-105">
                          <ScoreBatHighlightCard match={match} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-highlight-800 p-6 rounded-lg text-center">
                      <p className="text-gray-400">No live matches available right now. Check back later or refresh.</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-300">Highlights</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {league.highlights.map((highlight: MatchHighlight) => (
                    <div key={highlight.id} className="transform transition-all duration-300 hover:scale-105">
                      <HighlightCard highlight={highlight} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-2">League not found</h2>
              <p className="text-gray-400 mb-6">The league you're looking for doesn't exist or is not available.</p>
              <Link to="/">
                <Button>Return to Home</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LeaguePage;
