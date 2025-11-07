import { JSX } from 'react'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { Store, Users, Download, TrendingUp, Sparkles } from 'lucide-react'

interface MarketplaceSectionProps {
  title: string
  description: string
  cta: string
  noAccountRequired: string
  stats: {
    tutors: string
    downloads: string
    users: string
  }
}

export function MarketplaceSection({
  title,
  description,
  cta,
  noAccountRequired,
  stats
}: MarketplaceSectionProps): JSX.Element {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 dark:from-purple-900 dark:via-indigo-900 dark:to-blue-900 p-6 md:p-8 shadow-xl">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-56 h-56 bg-blue-400/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Store className="w-6 h-6" />
              {title}
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            </h2>
            <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
              {description}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 text-center border border-white/20 hover:bg-white/15 transition-all">
              <Store className="w-5 h-5 md:w-6 md:h-6 text-white mx-auto mb-1" />
              <div className="text-xl md:text-2xl font-bold text-white">{stats.tutors}</div>
              <div className="text-xs md:text-sm text-white/80">Tutors</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 text-center border border-white/20 hover:bg-white/15 transition-all">
              <Download className="w-5 h-5 md:w-6 md:h-6 text-white mx-auto mb-1" />
              <div className="text-xl md:text-2xl font-bold text-white">{stats.downloads}</div>
              <div className="text-xs md:text-sm text-white/80">Downloads</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 md:p-4 text-center border border-white/20 hover:bg-white/15 transition-all">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-white mx-auto mb-1" />
              <div className="text-xl md:text-2xl font-bold text-white">{stats.users}</div>
              <div className="text-xs md:text-sm text-white/80">Users</div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Link href="/marketplace">
              <Button 
                className="bg-white text-indigo-600 hover:bg-white/90 hover:scale-105 transition-all shadow-lg font-semibold"
              >
                <Store className="w-4 h-4 mr-2" />
                {cta}
                <TrendingUp className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <p className="text-xs md:text-sm text-white/70 mt-2">
              {noAccountRequired}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

