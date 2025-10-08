import Link from 'next/link';

type HeroSectionProps = {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
};

export function HeroSection({ title, subtitle, ctaText, ctaLink }: HeroSectionProps) {
  return (
    <section className="w-full bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 px-6 py-16 text-center md:px-12 md:py-24 lg:px-16 xl:px-24">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-5xl leading-tight font-bold text-gray-800 md:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="mb-10 text-2xl leading-relaxed text-gray-600 md:text-3xl">{subtitle}</p>
        <Link
          href={ctaLink}
          className="inline-block rounded-xl bg-blue-600 px-12 py-5 text-2xl font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl focus:ring-4 focus:ring-blue-300 focus:outline-none"
        >
          {ctaText}
        </Link>
      </div>
    </section>
  );
}
