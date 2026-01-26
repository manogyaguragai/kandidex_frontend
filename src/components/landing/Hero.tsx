import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FlipWords } from "@/components/ui/flip-words";
import { GlowingOrb } from "@/components/ui/glowing-orb";
import { AnimatedCard } from "@/components/ui/card";
import { fadeInUp, staggerContainer, floatAnimation } from "@/lib/animations";

export const Hero = () => {
  const words = ["Smarter", "Faster", "Unbiased", "Together"];

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-background">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-b from-blue-500/10 to-purple-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                New Generation AI Recruitment
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                Hire <br />
                <FlipWords words={words} className="text-primary dark:text-primary" /> <br />
                with Kandidex
              </h1>

              <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                Transform your recruitment process with intelligent resume screening, instant candidate ranking, and unbiased AI-generated interview questions.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <Button size="xl" className="shadow-glow-blue hover:scale-105 transition-transform" asChild>
                <Link to="/login">
                  Start Using Kandidex <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" className="hover:bg-accent/5" asChild>
                <Link to="/demo">View Live Demo</Link>
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex items-center gap-8 pt-4">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-10 h-10 rounded-full border-2 border-background bg-gradient-to-br from-blue-${i}00 to-purple-${i}00 flex items-center justify-center text-xs font-bold text-white`}>
                    U{i}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                  +2k
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">Trusted by top companies</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <div className="relative h-[600px] flex items-center justify-center">
            <div className="absolute inset-0">
              <GlowingOrb />
            </div>

            {/* Floating Cards */}
            <motion.div
              animate={floatAnimation}
              className="absolute top-20 right-10 z-20"
            >
              <AnimatedCard glass className="p-4 flex items-center gap-3 w-48">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">90%</div>
                  <div className="text-xs text-muted-foreground">Faster Hiring</div>
                </div>
              </AnimatedCard>
            </motion.div>

            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-32 left-10 z-20"
            >
              <AnimatedCard glass className="p-4 flex items-center gap-3 w-52">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">99%</div>
                  <div className="text-xs text-muted-foreground">Accuracy Rate</div>
                </div>
              </AnimatedCard>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-1/2 right-0 z-20"
            >
              <AnimatedCard glass className="p-4 flex items-center gap-3 w-44">
                <div className="p-2 bg-pink-500/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <div className="text-sm font-bold">Smart Audit</div>
                  <div className="text-xs text-muted-foreground">Live Ranking</div>
                </div>
              </AnimatedCard>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
