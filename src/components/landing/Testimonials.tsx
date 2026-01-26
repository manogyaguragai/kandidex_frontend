import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { AnimatedCard } from "@/components/ui/card";
import { staggerContainer, staggerItem } from "@/lib/animations";

const testimonials = [
  {
    content: "Kandidex slashed our time-to-hire by 60%. The AI ranking is shockingly accurate and saves us hours of manual screening every single day.",
    author: "Sarah Johnson",
    role: "Head of Talent, TechFlow",
    rating: 5
  },
  {
    content: "Finally, a recruitment tool that actually helps reduce bias. We've seen a 40% increase in diverse candidates reaching the interview stage.",
    author: "Michael Chen",
    role: "HR Director, InnovateInc",
    rating: 5
  },
  {
    content: "The generated interview questions are a game changer. They help our hiring managers dig deep into the specific areas where a candidate might be weak.",
    author: "Jessica Williams",
    role: "VP of People, GrowthCo",
    rating: 4
  }
];

export const Testimonials = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Trusted by <span className="gradient-text">Top Recruiters</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See how companies are transforming their hiring process with Kandidex.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={staggerItem}>
              <AnimatedCard className="h-full p-8 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground leading-relaxed italic mb-6">
                    "{testimonial.content}"
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
