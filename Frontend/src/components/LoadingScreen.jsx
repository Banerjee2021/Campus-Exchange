import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/20 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity
            }}
          />
        ))}
      </div>

      <div className="relative flex items-center justify-center">
        {/* Outermost pulsing ring */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut"
          }}
          className="absolute w-48 h-48 rounded-full border-2 border-purple-400/40"
        />

        {/* Outer rotating ring with gradient border */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "linear"
          }}
          className="absolute w-40 h-40 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, transparent 270deg, #a855f7 270deg, #6366f1 360deg)`,
            padding: '3px'
          }}
        >
          <div className="w-full h-full rounded-full bg-white" />
        </motion.div>
        
        {/* Middle rotating ring with different speed */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "linear"
          }}
          className="absolute w-32 h-32 rounded-full"
          style={{
            background: `conic-gradient(from 90deg, transparent 0deg, transparent 270deg, #3b82f6 270deg, #8b5cf6 360deg)`,
            padding: '3px'
          }}
        >
          <div className="w-full h-full rounded-full bg-white" />
        </motion.div>

        {/* Inner fast rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            ease: "linear"
          }}
          className="absolute w-24 h-24 rounded-full"
          style={{
            background: `conic-gradient(from 180deg, transparent 0deg, transparent 270deg, #06b6d4 270deg, #3b82f6 360deg)`,
            padding: '2px'
          }}
        >
          <div className="w-full h-full rounded-full bg-white" />
        </motion.div>

        {/* Brand text outside revolving animation - no delay */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          className="absolute -mt-60 text-center"
        >
          <motion.h1 
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-cyan-600 via-blue-700 to-purple-600 bg-clip-text text-transparent bg-[length:200%_100%] drop-shadow-lg opacity-100"
          >
            CampusXchange
          </motion.h1>
        </motion.div>

        {/* Loading text with blinking animation at center - no delay */}
        <motion.div
          initial={{ opacity: 1 }}
          className="absolute text-center"
        >
          <div className="flex items-center justify-center space-x-1">
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="text-lg font-semibold text-purple-600"
            >
              Loading
            </motion.span>
            
            {/* Animated dots */}
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ 
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: i * 0.2 
                }}
                className="text-3xl font-bold text-blue-500"
              >
                .
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;