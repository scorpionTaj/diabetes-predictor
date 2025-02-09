import React from "react";

const Resources: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-10">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-10 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <h1 className="text-5xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500">
          Resources
        </h1>
        <div className="space-y-6">
          <ResourceItem
            title="Diabetes Overview"
            description="Learn about diabetes, its types, symptoms, and treatments."
            link="https://www.diabetes.org/diabetes"
          />
          <ResourceItem
            title="Healthy Eating"
            description="Find tips and recipes for a healthy diet to manage diabetes."
            link="https://www.diabetes.org/nutrition"
          />
          <ResourceItem
            title="Exercise and Fitness"
            description="Discover exercises and fitness routines to help manage diabetes."
            link="https://www.diabetes.org/fitness"
          />
          <ResourceItem
            title="Diabetes Research"
            description="Stay updated with the latest research and advancements in diabetes care."
            link="https://www.diabetes.org/research"
          />
          <ResourceItem
            title="Support Groups"
            description="Join support groups and connect with others managing diabetes."
            link="https://www.diabetes.org/community"
          />
        </div>
      </div>
    </div>
  );
};

const ResourceItem: React.FC<{
  title: string;
  description: string;
  link: string;
}> = ({ title, description, link }) => (
  <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 hover:shadow-2xl transition-shadow duration-300">
    <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">
      {title}
    </h2>
    <p className="text-gray-700 dark:text-gray-300 mb-4">{description}</p>
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
    >
      Learn More
    </a>
  </div>
);

export default Resources;
