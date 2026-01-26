import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Globe, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCard } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export const AboutPage = () => {
  return (
    <div className="pt-20 min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <motion.div variants={fadeInUp}>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Revolutionizing Recruitment with <span className="gradient-text">Ethical AI</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                We're on a mission to remove bias, reduce time-to-hire, and connect the world's best talent with forward-thinking companies.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Team collaboration" 
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Our Mission</h2>
              <p className="text-lg text-muted-foreground">
                Kandidex was founded with a simple belief: talent is distributed equally, but opportunity is not. 
                Traditional hiring processes are riddled with unconscious bias and inefficiency.
              </p>
              <p className="text-lg text-muted-foreground">
                We leverage cutting-edge Artificial Intelligence to analyze candidate potential based on skills, 
                experience, and capability—ignoring demographic factors that shouldn't matter.
              </p>
              <div className="pt-4">
                <Button variant="outline" size="lg" asChild>
                  <Link to="/contact">Join Our Team <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Core Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide our product development and company culture.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedCard className="p-8">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Accessibility First</h3>
              <p className="text-muted-foreground">
                We believe technology should be accessible to everyone, regardless of ability or background.
              </p>
            </AnimatedCard>
            
            <AnimatedCard className="p-8">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Human-Centric AI</h3>
              <p className="text-muted-foreground">
                AI should augment human decision-making, not replace the human touch in recruitment.
              </p>
            </AnimatedCard>
            
            <AnimatedCard className="p-8">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center mb-6 text-pink-600 dark:text-pink-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Transparency</h3>
              <p className="text-muted-foreground">
                Our algorithms are explainable. We provide clear reasoning for every ranking decisions.
              </p>
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">10k+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Resumes Processed</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Companies</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Retention Rate</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
