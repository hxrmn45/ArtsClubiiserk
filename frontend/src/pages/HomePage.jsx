import { Link } from "react-router-dom";
import { ArrowRight, Palette, Calendar, Gamepad2, Users, Star, Zap, Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const FEATURES = [
  {
    icon: Calendar,
    color: "bg-orange-100 text-orange-600",
    title: "Live Events",
    desc: "Join workshops, exhibitions, and art jams hosted by the community.",
  },
  {
    icon: Gamepad2,
    color: "bg-cyan-100 text-cyan-600",
    title: "Art Games",
    desc: "Compete in Color Memory, Brush Rush, and climb the leaderboard.",
  },
  {
    icon: Users,
    color: "bg-yellow-100 text-yellow-600",
    title: "Community Feed",
    desc: "Share your artwork, get feedback, and celebrate each other's creativity.",
  },
];

const STATS = [
  { value: "500+", label: "Artists", icon: Palette },
  { value: "120+", label: "Events", icon: Calendar },
  { value: "3K+", label: "Artworks", icon: Star },
  { value: "10K+", label: "Likes given", icon: Heart },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-orange-50 via-white to-cyan-50">
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-56 h-56 bg-cyan-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-outfit font-semibold mb-6">
              <Zap className="w-4 h-4" />
              Your Creative Community
            </div>
            <h1 className="font-outfit font-extrabold text-5xl md:text-6xl lg:text-7xl tracking-tighter leading-[0.95] text-stone-900 mb-6">
              Where Art
              <br />
              <span className="text-orange-500">Meets</span>
              <br />
              Community
            </h1>
            <p className="font-manrope text-lg text-stone-500 leading-relaxed mb-10 max-w-md">
              Join ArtsClub IISERK — a vibrant space to discover events, play creative games, and share your
              art with people who get it.
            </p>
            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link
                  to="/community"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-orange-500 text-white font-outfit font-semibold text-base hover:bg-orange-600 hover:scale-105 active:scale-95 transition-transform duration-200 shadow-lg shadow-orange-200"
                >
                  Go to Community <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-orange-500 text-white font-outfit font-semibold text-base hover:bg-orange-600 hover:scale-105 active:scale-95 transition-transform duration-200 shadow-lg shadow-orange-200"
                  >
                    Join for Free <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-stone-200 text-stone-700 font-outfit font-semibold text-base hover:border-stone-300 hover:bg-stone-50 transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hero image collage */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1743691434566-8d81416c66c3?w=400&q=80"
                    alt="Art workshop"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden aspect-square shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1717675615860-1ea09962213d?w=300&q=80"
                    alt="Abstract art"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-3xl overflow-hidden aspect-square shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1716901548718-da465a9060fe?w=300&q=80"
                    alt="Abstract painting"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1767330855561-d96ee7dbbd99?w=400&q=80"
                    alt="Creative process"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-400" />
              </div>
              <div>
                <p className="font-outfit font-bold text-stone-900 text-sm">Top Artist</p>
                <p className="font-manrope text-xs text-stone-400">This week</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-stone-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <p className="font-outfit font-extrabold text-3xl text-white">{value}</p>
                <p className="font-manrope text-stone-400 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-outfit font-extrabold text-4xl md:text-5xl text-stone-900 tracking-tight mb-4">
              Everything you need to{" "}
              <span className="text-orange-500">create & connect</span>
            </h2>
            <p className="font-manrope text-stone-500 text-lg max-w-xl mx-auto">
              ArtsClub IISERK brings artists together through events, games, and a community feed built for
              creativity.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="group p-8 rounded-3xl border border-stone-100 hover:border-orange-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-outfit font-bold text-xl text-stone-900 mb-3">{title}</h3>
                <p className="font-manrope text-stone-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-orange-500 to-orange-600">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-outfit font-extrabold text-4xl md:text-5xl text-white tracking-tight mb-6">
            Ready to create something incredible?
          </h2>
          <p className="font-manrope text-orange-100 text-lg mb-10">
            Join artists of IISERK already sharing, competing, and growing together on ArtsClub IISERK.
          </p>
          {!isAuthenticated && (
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-white text-orange-600 font-outfit font-bold text-base hover:scale-105 active:scale-95 transition-transform duration-200 shadow-xl"
            >
              Get Started — It's Free <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 py-10 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img
            src="/logo.png"
            alt="ArtsClub IISERK Logo"
            className="w-10 h-10 object-contain"
          />
          <span className="font-outfit font-bold text-white text-lg">ArtsClub IISERK</span>
        </div>
        <p className="font-manrope text-stone-400 text-sm mt-1">
          Made with ❤️ for artists of IISERK
        </p>
        <p className="font-manrope text-stone-600 text-xs mt-2">
          by Harman
        </p>
      </footer>
    </div>
  );
}