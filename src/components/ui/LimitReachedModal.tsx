import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, ArrowUpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const LimitReachedModal = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("You have reached your usage limit for this period.");
  const navigate = useNavigate();

  useEffect(() => {
    const handleLimitReached = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.detail) {
        setMessage(customEvent.detail.detail);
      }
      setOpen(true);
    };

    window.addEventListener('kandidex:limit-reached', handleLimitReached);
    return () => window.removeEventListener('kandidex:limit-reached', handleLimitReached);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md border-0 bg-background/80 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600" />
        <DialogHeader className="pt-6">
          <div className="mx-auto bg-amber-100 dark:bg-amber-900/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">Usage Limit Reached</DialogTitle>
          <DialogDescription className="text-center pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted/50 rounded-lg p-4 my-4 text-sm text-center text-muted-foreground">
          Upgrade your plan to screen more candidates and unlock advanced features.
        </div>

        <DialogFooter className="flex-col sm:justify-center gap-2">
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700"
            onClick={() => {
              setOpen(false);
              navigate('/billing');
            }}
          >
            <ArrowUpCircle className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setOpen(false)}
            className="w-full"
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
