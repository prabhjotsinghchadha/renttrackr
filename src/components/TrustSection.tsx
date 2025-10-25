type TrustSectionProps = {
  title: string;
  description: string;
};

export function TrustSection({ title, description }: TrustSectionProps) {
  return (
    <section className="w-full bg-blue-50 px-6 py-16 text-center md:px-12 md:py-20 lg:px-16 xl:px-24 dark:bg-gray-800">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-6 text-4xl font-bold text-gray-800 md:text-5xl dark:text-white">
          {title}
        </h2>
        <p className="text-2xl leading-relaxed text-gray-600 dark:text-gray-200">{description}</p>
      </div>
    </section>
  );
}
