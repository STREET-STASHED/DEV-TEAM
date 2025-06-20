import Link from 'next/link';

const Hero = () => {
  return (
    <section className="relative bg-transparent text-gold py-20 px-6 text-center overflow-hidden">
      <div className="relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-widest uppercase mb-4">
          Where Style Moves Like You Do.
        </h1>
        <p className="text-lg md:text-xl text-yellow-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Fashion delivered on demand. From exclusive drops to everyday heat — all day in every neighborhood.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <button className="bg-yellow-500 text-black font-bold py-3 px-6 rounded-full hover:bg-yellow-400 transition">
            Browse Drops
          </button>
          <Link href="/onboarding">
            <button className="border border-yellow-500 text-yellow-500 font-bold py-3 px-6 rounded-full hover:bg-yellow-500 hover:text-black transition">
              Join Us
            </button>
          </Link>
        </div>
      </div>
      <div className="absolute inset-0 bg-[url('/graffiti-bg.png')] bg-cover bg-center opacity-10 z-0" />
    </section>
  );
};

export default Hero;