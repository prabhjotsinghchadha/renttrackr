type FeatureCardProps = {
  icon: string;
  title: string;
  description: string;
};

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group rounded-xl bg-gray-50 p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400 dark:hover:shadow-2xl">
      <div className="mb-6 text-6xl">{icon}</div>
      <h3 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">{title}</h3>
      <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-200">{description}</p>
    </div>
  );
}
