import { motion } from "framer-motion";

export const GlowingOrb = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px]">
        {/* Core Gradient Orb */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 90, 180, 270, 360],
            filter: ["blur(40px)", "blur(60px)", "blur(40px)"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60 mix-blend-screen"
        />

        {/* Secondary Orb for depth */}
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 270, 180, 90, 0],
            x: [0, 20, 0, -20, 0],
            y: [0, -20, 0, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 opacity-40 blur-3xl mix-blend-screen"
        />

        {/* Floating Particles/Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-white/10"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-12 rounded-full border border-white/5 border-dashed"
        />
        
        {/* Center Glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-white/10 backdrop-blur-3xl rounded-full shadow-[0_0_100px_rgba(59,130,246,0.5)] z-10" />
        </div>
      </div>
    </div>
  );
};
