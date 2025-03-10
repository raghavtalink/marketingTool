import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-gray-950 py-10 px-4 md:px-8 text-gray-400 border-t border-gray-800">
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-6 md:mb-0">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mr-3 flex items-center justify-center text-lg font-bold text-white">
              S
            </div>
            <span className="text-xl font-bold text-white">Sellovate</span>
          </div>
        </div>
        <div className="flex space-x-8">
          <a href="#" className="hover:text-indigo-400 transition-colors duration-300">Privacy</a>
          <a href="#" className="hover:text-indigo-400 transition-colors duration-300">Terms</a>
          <a href="#" className="hover:text-indigo-400 transition-colors duration-300">Contact</a>
        </div>
      </div>
      <div className="mt-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Sellovate. All rights reserved.
      </div>
    </div>
  </footer>
  )
}

export default Footer