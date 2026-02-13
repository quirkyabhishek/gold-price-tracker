'use client';

interface Platform {
  id: string;
  name: string;
  displayName: string;
  baseUrl: string;
  logoUrl?: string;
  category: string;
  productCount: number;
}

interface PlatformGridProps {
  platforms: Platform[];
}

const categoryLabels: Record<string, { label: string; emoji: string }> = {
  ECOMMERCE: { label: 'E-Commerce', emoji: '🛒' },
  JEWELLERY: { label: 'Jewellery Brands', emoji: '💎' },
  QUICK_COMMERCE: { label: 'Quick Commerce', emoji: '⚡' },
  GOLD_DEALER: { label: 'Gold Dealers', emoji: '🏦' },
};

export function PlatformGrid({ platforms }: PlatformGridProps) {
  // Group by category
  const grouped = platforms.reduce((acc, platform) => {
    if (!acc[platform.category]) {
      acc[platform.category] = [];
    }
    acc[platform.category].push(platform);
    return acc;
  }, {} as Record<string, Platform[]>);

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, items]) => {
        const categoryInfo = categoryLabels[category] || { label: category, emoji: '📦' };
        
        return (
          <div key={category}>
            <p className="text-xs text-zinc-500 mb-2">
              {categoryInfo.emoji} {categoryInfo.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {items.map((platform) => (
                <a
                  key={platform.id}
                  href={platform.baseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full text-sm text-zinc-300 hover:text-white transition-colors flex items-center gap-2"
                >
                  <span>{platform.displayName}</span>
                  {platform.productCount > 0 && (
                    <span className="text-xs text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">
                      {platform.productCount}
                    </span>
                  )}
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
