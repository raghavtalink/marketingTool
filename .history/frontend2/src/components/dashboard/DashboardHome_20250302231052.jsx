import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Bell, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar,
  BarChart2,
  ArrowUpRight,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  Zap,
  Award,
  Star,
  Truck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardHome = () => {
  const [activeInsight, setActiveInsight] = useState(0);
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  // Mock data - in real app would come from API
  const insights = [
    {
      id: 1,
      title: "Product Bundle Opportunity",
      description: "Your 'Wireless Earbuds' and 'Phone Charger' are frequently purchased together. Consider creating a bundle with a 15% discount to increase average order value.",
      type: "opportunity",
      icon: <Zap size={18} />,
      action: "Create Bundle",
      link: "/dashboard/bundle-builder",
      impact: "High"
    },
    {
      id: 2,
      title: "Competitor Price Alert",
      description: "A competitor has lowered their price on a similar product to your 'Smart Watch'. Consider reviewing your pricing strategy.",
      type: "alert",
      icon: <AlertTriangle size={18} />,
      action: "Analyze Pricing",
      link: "/dashboard/price-pilot",
      impact: "Medium"
    },
    {
      id: 3,
      title: "Trending Product Category",
      description: "Eco-friendly water bottles are trending in your market. Consider adding these to your product line.",
      type: "trend",
      icon: <TrendingUp size={18} />,
      action: "View Trends",
      link: "/dashboard/trendspot",
      impact: "High"
    }
  ];
  
  const recentActivity = [
    { 
      id: 1, 
      action: "Product added", 
      description: "Smart Watch XS Pro", 
      time: "2 hours ago",
      icon: <CheckCircle size={16} className="text-green-400" />
    },
    { 
      id: 2, 
      action: "Listing optimized", 
      description: "Wireless Earbuds", 
      time: "Yesterday",
      icon: <Star size={16} className="text-yellow-400" />
    },
    { 
      id: 3, 
      action: "Bundle created", 
      description: "Summer Essentials Pack", 
      time: "2 days ago",
      icon: <Package size={16} className="text-purple-400" />
    },
    { 
      id: 4, 
      action: "New order", 
      description: "Order #8742 - $124.99", 
      time: "3 days ago",
      icon: <Truck size={16} className="text-blue-400" />
    }
  ];

  const upcomingTasks = [
    { 
      id: 1, 
      task: "Update product descriptions", 
      due: "Today", 
      priority: "High",
      completed: false
    },
    { 
      id: 2, 
      task: "Review competitor analysis", 
      due: "Tomorrow", 
      priority: "Medium",
      completed: false
    },
    { 
      id: 3, 
      task: "Optimize product images", 
      due: "Next week", 
      priority: "Low",
      completed: true
    }
  ];
  
  const tipOfTheDay = {
    title: "Optimize Your Product Titles",
    content: "Include key features, benefits, and important keywords in your product titles to improve search visibility and conversion rates.",
    link: "/tips/product-titles"
  };
  
  return (
    <div className="h-full">
      {/* Top Section with Greeting and Date */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            {getGreeting()}, James
          </h1>
          <p className="mt-1 text-gray-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 bg-gray-800 rounded-full cursor-pointer"
        >
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
        </motion.div>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 text-sm font-medium">Active Products</h3>
              <p className="text-3xl font-bold mt-2">24</p>
            </div>
            <div className="p-3 rounded-md bg-blue-500/10">
              <Package size={20} className="text-blue-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-green-400 text-sm">
            <ArrowUpRight size={14} className="mr-1" />
            <span>+3 this month</span>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 text-sm font-medium">Total Sales (30d)</h3>
              <p className="text-3xl font-bold mt-2">$12,450</p>
            </div>
            <div className="p-3 rounded-md bg-green-500/10">
              <BarChart2 size={20} className="text-green-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-green-400 text-sm">
            <ArrowUpRight size={14} className="mr-1" />
            <span>+8.2% vs last month</span>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 text-sm font-medium">Conversion Rate</h3>
              <p className="text-3xl font-bold mt-2">4.2%</p>
            </div>
            <div className="p-3 rounded-md bg-purple-500/10">
              <Award size={20} className="text-purple-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-green-400 text-sm">
            <ArrowUpRight size={14} className="mr-1" />
            <span>+0.5% vs last month</span>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gray-900/60 border border-gray-800 rounded-xl p-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-400 text-sm font-medium">AI Assists Used</h3>
              <p className="text-3xl font-bold mt-2">52</p>
            </div>
            <div className="p-3 rounded-md bg-pink-500/10">
              <Zap size={20} className="text-pink-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-gray-400 text-sm">
            <span>24 remaining this month</span>
          </div>
        </motion.div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Insights & Actions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Smart Insights Section */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center">
                <Lightbulb size={18} className="mr-2 text-yellow-400" />
                Smart Insights
              </h2>
              <div className="flex">
                {insights.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveInsight(index)}
                    className={`w-2.5 h-2.5 rounded-full mx-1 ${
                      activeInsight === index ? 'bg-purple-500' : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="p-6">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ 
                    opacity: activeInsight === index ? 1 : 0,
                    x: activeInsight === index ? 0 : 20,
                    position: activeInsight === index ? 'relative' : 'absolute'
                  }}
                  className="w-full"
                  style={{ display: activeInsight === index ? 'block' : 'none' }}
                >
                  <div className="flex items-start">
                    <div className={`p-3 rounded-lg mr-4 ${
                      insight.type === 'opportunity' ? 'bg-blue-500/20 text-blue-400' : 
                      insight.type === 'alert' ? 'bg-orange-500/20 text-orange-400' : 
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {insight.icon}
                    </div>
                    <div>
                      <div className="flex items-center mb-1">
                        <h3 className="font-medium text-lg">{insight.title}</h3>
                        <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${
                          insight.impact === 'High' ? 'bg-purple-500/30 text-purple-300' : 
                          'bg-blue-500/30 text-blue-300'
                        }`}>
                          {insight.impact} Impact
                        </span>
                      </div>
                      <p className="text-gray-400 mb-4">{insight.description}</p>
                      <Link to={insight.link} className="inline-flex items-center px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition-colors">
                        {insight.action}
                        <ChevronRight size={16} className="ml-1" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Add Product', icon: <PlusCircle size={20} />, color: 'from-green-500 to-emerald-700', link: '/dashboard/products' },
                { name: 'Optimize Listing', icon: <Zap size={20} />, color: 'from-purple-500 to-indigo-700', link: '/dashboard/listing-wizard' },
                { name: 'Check Trends', icon: <TrendingUp size={20} />, color: 'from-pink-500 to-rose-700', link: '/dashboard/trendspot' },
                { name: 'Run Ad', icon: <ExternalLink size={20} />, color: 'from-blue-500 to-cyan-700', link: '/dashboard/ad-crafter' }
              ].map((action, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="cursor-pointer"
                  onClick={() => window.location.href = action.link}
                >
                  <div className={`h-full p-4 rounded-xl bg-gradient-to-br ${action.color} bg-opacity-10 flex flex-col items-center justify-center text-center`}>
                    <div>{action.icon}</div>
                    <span className="mt-2 text-sm font-medium">{action.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* To-Do List */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center">
                <CheckCircle size={18} className="mr-2 text-green-400" />
                Upcoming Tasks
              </h2>
              <button className="text-sm text-purple-400 hover:text-purple-300">View All</button>
            </div>
            
            <div className="divide-y divide-gray-800">
              {upcomingTasks.map((task) => (
                <div 
                  key={task.id}
                  className={`px-6 py-3 flex items-center justify-between ${task.completed ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 flex-shrink-0 ${
                      task.completed ? 'bg-green-500/20 border-2 border-green-500' : 
                      task.priority === 'High' ? 'bg-red-500/20 border-2 border-red-500' : 
                      task.priority === 'Medium' ? 'bg-yellow-500/20 border-2 border-yellow-500' : 
                      'bg-blue-500/20 border-2 border-blue-500'
                    }`} />
                    <span className={task.completed ? 'line-through text-gray-500' : ''}>
                      {task.task}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {task.due}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column - Activity & Tips */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center">
                <Clock size={18} className="mr-2 text-blue-400" />
                Recent Activity
              </h2>
              <button className="text-sm text-purple-400 hover:text-purple-300">View All</button>
            </div>
            
            <div className="p-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: index * 0.1 }
                  }}
                  className="mb-4 last:mb-0"
                >
                  <div className="relative pl-6 pb-4 border-l border-gray-800">
                    <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-gray-900 border-2 border-gray-700 flex items-center justify-center">
                      {activity.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{activity.action}</h4>
                      <p className="text-sm text-gray-400">{activity.description}</p>
                      <p className="mt-1 text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Tip of the Day */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-900/40 rounded-xl p-6"
          >
            <div className="flex items-start">
              <div className="p-3 bg-yellow-500/20 text-yellow-400 rounded-lg mr-4">
                <Lightbulb size={20} />
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">Tip of the Day</h3>
                <p className="text-gray-400 mb-4">{tipOfTheDay.content}</p>
                <a href={tipOfTheDay.link} className="text-sm text-purple-400 hover:text-purple-300 flex items-center">
                  Learn more
                  <ChevronRight size={16} className="ml-1" />
                </a>
              </div>
            </div>
          </motion.div>
          
          {/* Calendar Preview */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold flex items-center">
                <Calendar size={18} className="mr-2 text-purple-400" />
                Upcoming
              </h2>
            </div>
            
            <div className="p-4 space-y-3">
              {[
                { name: "Prime Day", date: "July 11-12", type: "sale-event" },
                { name: "Inventory Check", date: "July 15", type: "task" },
                { name: "Summer Sale", date: "Aug 1-15", type: "campaign" }
              ].map((event, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                  <div className={`w-10 h-10 rounded-lg mr-3 flex items-center justify-center ${
                    event.type === 'sale-event' ? 'bg-red-500/20 text-red-400' :
                    event.type === 'task' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {event.type === 'sale-event' ? 
                      <Tag size={18} /> : 
                      event.type === 'task' ? 
                      <CheckCircle size={18} /> : 
                      <Bell size={18} />
                    }
                  </div>
                  <div>
                    <h4 className="font-medium">{event.name}</h4>
                    <p className="text-sm text-gray-400">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;