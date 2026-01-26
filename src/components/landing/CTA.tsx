import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const CTA = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={containerRef} className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 clip-path-slant" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900 to-slate-900 border border-white/10 shadow-2xl">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-grid opacity-20" />
          <motion.div 
            style={{ y }}
            className="absolute -top-[300px] -right-[300px] w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-[100px] pointer-events-none" 
          />
          <motion.div 
            style={{ y: useTransform(scrollYProgress, [0, 1], [-100, 100]) }}
            className="absolute -bottom-[300px] -left-[300px] w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-[100px] pointer-events-none" 
          />

          <div className="relative px-8 py-20 md:px-20 md:py-32 text-center max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
              Ready to Transform Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Hiring Process?
              </span>
            </h2>
            
            <p className="text-xl text-blue-100/80 max-w-2xl mx-auto">
              Join thousands of forward-thinking companies using Kandidex to find the best talent, faster and fairer.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button size="xl" className="bg-white text-blue-900 hover:bg-blue-50 shadow-xl border-0 text-lg font-bold px-10 h-16" asChild>
                <Link to="/register">
                  Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm h-16 px-10 text-lg" asChild>
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>
            
            <p className="text-sm text-blue-200/60 pt-6">
              No credit card required for 14-day trial. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
