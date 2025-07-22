import { Button } from "@/components/ui/button";
import { Heart, Star } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { Commodity } from "@/services/api";
import { toast } from "sonner";

interface FavoriteButtonProps {
  commodity: Commodity;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function FavoriteButton({ 
  commodity, 
  variant = 'ghost',
  size = 'sm',
  showText = false,
  className = ""
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(commodity.symbol);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    
    // Store current state before toggle for toast message
    const wasFevarited = favorited;
    
    // Toggle immediately for instant UI response
    toggleFavorite(commodity.symbol, commodity.name, commodity.category);
    
    // Show appropriate toast message based on the previous state
    if (wasFevarited) {
      toast.success(`${commodity.symbol} retiré des favoris`, {
        description: `${commodity.name} n'est plus dans votre liste de suivi`
      });
    } else {
      toast.success(`${commodity.symbol} ajouté aux favoris`, {
        description: `${commodity.name} est maintenant dans votre liste de suivi`
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleFavorite}
      className={`${favorited ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'} transition-colors duration-150 ${className}`}
      title={favorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      {favorited ? (
        <Heart className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} fill-current`} />
      ) : (
        <Star className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />
      )}
      {showText && (
        <span className="ml-1 text-xs">
          {favorited ? 'Retirer' : 'Ajouter'}
        </span>
      )}
    </Button>
  );
} 