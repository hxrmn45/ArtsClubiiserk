import { Link } from "react-router-dom";
import { ArrowRight, Palette, Calendar, Gamepad2, Users, Star, Zap, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";

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

      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-orange-50 via-white to-cyan-50">

        <div className="max-w-7xl mx-auto px-4 py-24 grid lg:grid-cols-2 gap-16 items-center">

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
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-orange-500 text-white font-outfit font-semibold text-base hover:bg-orange-600"
                >
                  Go to Community <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-orange-500 text-white font-outfit font-semibold text-base hover:bg-orange-600"
                  >
                    Join for Free <ArrowRight className="w-5 h-5" />
                  </Link>

                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-stone-200 text-stone-700 font-outfit font-semibold text-base hover:border-stone-300"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

        </div>
      </section>

      <section className="bg-stone-900 py-16">
        <div className="max-w-7xl mx-auto px-4">
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

      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center mb-16">
            <h2 className="font-outfit font-extrabold text-4xl md:text-5xl text-stone-900 tracking-tight mb-4">
              Everything you need to <span className="text-orange-500">create & connect</span>
            </h2>

            <p className="font-manrope text-stone-500 text-lg max-w-xl mx-auto">
              ArtsClub IISERK brings artists together through events, games, and a community feed built for creativity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="p-8 rounded-3xl border border-stone-100 hover:shadow-xl">
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6`}>
                  <Icon className="w-7 h-7" />
                </div>

                <h3 className="font-outfit font-bold text-xl text-stone-900 mb-3">{title}</h3>
                <p className="font-manrope text-stone-500">{desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
}
