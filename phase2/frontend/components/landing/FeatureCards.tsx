import { motion } from 'framer-motion';
import { List, Shield, Database, Bot, Lock, Zap } from 'lucide-react';

export default function FeatureCards() {
  const features = [
    {
      icon: List,
      title: "Todo Management",
      description: "Intuitive task management with priorities, categories, due dates, and recurring tasks to boost your productivity.",
      hoverEffect: "transform scale-105"
    },
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "Enterprise-grade security with JWT-based authentication, password hashing, and multi-factor authentication support.",
      hoverEffect: "transform scale-105"
    },
    {
      icon: Database,
      title: "Cloud Storage",
      description: "Reliable PostgreSQL database with ACID compliance and seamless data synchronization across devices.",
      hoverEffect: "transform scale-105"
    },
    {
      icon: Bot,
      title: "AI Insights",
      description: "Intelligent task suggestions, smart categorization, and productivity analytics powered by advanced AI models.",
      hoverEffect: "transform scale-105"
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Powerful Features for Modern Productivity
        </h2>
        <p className="text-xl text-center mb-16 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Everything you need to manage your tasks efficiently and securely
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Transform Your Productivity?</h3>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Join thousands of satisfied users who have revolutionized their task management with our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-blue-600 font-bold rounded-full hover:bg-gray-100 transition">
              Start Free Trial
            </button>
            <button className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-blue-600 transition">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}