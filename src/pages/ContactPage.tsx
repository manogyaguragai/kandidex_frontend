import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Mail, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export const ContactPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      const response = await fetch("https://formsubmit.co/ajax/manogyaguragai2@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          _subject: `New Contact from Kandidex: ${data.subject}`,
          _template: 'table'
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Message sent successfully! We'll get back to you soon.");
        reset();
      } else {
        throw new Error(result.message || "Something went wrong");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message. Please try again later.");
    }
  };

  return (
    <div className="pt-20 min-h-screen">
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Get in Touch</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about Kandidex? Our team is here to help you revolutionize your hiring process.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <motion.div variants={fadeInUp} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Office</h3>
                      <p className="text-muted-foreground">
                        Sinamangal<br />
                        Kathmandu, Nepal
                      </p>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={fadeInUp} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-muted-foreground">
                        manogyaguragai2@gmail.com
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20">
                <h3 className="font-semibold mb-2">Enterprise Inquiry?</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Looking for a custom solution for your large organization? Book a demo with our sales team.
                </p>
                <Button variant="outline" className="w-full">Schedule Demo</Button>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6 md:p-8">
                <CardContent className="p-0 space-y-6">
                  <h2 className="text-2xl font-bold">Send us a message</h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <Input {...register("name")} placeholder="John Doe" />
                      {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <Input {...register("email")} type="email" placeholder="john@company.com" />
                      {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject</label>
                      <Input {...register("subject")} placeholder="How can we help?" />
                      {errors.subject && <span className="text-xs text-destructive">{errors.subject.message}</span>}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message</label>
                      <textarea 
                        {...register("message")}
                        className="flex min-h-[120px] w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Tell us about your project..."
                      />
                      {errors.message && <span className="text-xs text-destructive">{errors.message.message}</span>}
                    </div>
                    
                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : (
                        <>Send Message <Send className="ml-2 w-4 h-4" /></>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
