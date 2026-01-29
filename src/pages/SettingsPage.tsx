import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Lock, Sliders, Save, LogOut, AlertCircle, CheckCircle } from "lucide-react";
import { settingsApi } from "@/api/settings";
import { authApi } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const SettingsPage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  // State for Ranking Settings
  const [phase1Limit, setPhase1Limit] = useState(20);
  const [phase2Limit, setPhase2Limit] = useState(10);
  const [questionsCount, setQuestionsCount] = useState(3);

  // State for Password Reset
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => settingsApi.updateRankingSettings(user!.user_id, data),
    onSuccess: () => {
      toast.success("Settings updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update settings");
      console.error(error);
    }
  });

  const handleSaveRankingSettings = () => {
    updateSettingsMutation.mutate({
      phase1_ranking_number: phase1Limit,
      phase2_ranking_number: phase2Limit,
      number_of_questions_to_generate: questionsCount
    });
  };

  const resetPasswordMutation = useMutation({
    mutationFn: (data: any) => authApi.resetPassword(data),
    onSuccess: () => {
      const successMsg = "Password updated successfully";
      toast.success(successMsg);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setResetError(null);
      setResetSuccess(successMsg);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || "Failed to update password";
      toast.error(errorMessage);
      setResetError(errorMessage);
      setResetSuccess(null);
      console.error(error);
    }
  });

  const handleUpdatePassword = () => {
    setResetError(null);
    setResetSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setResetError("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setResetError("Password must be at least 8 characters long");
      return;
    }

    resetPasswordMutation.mutate({
      email: user?.email,
      old_password: currentPassword,
      new_password: newPassword
    });
  };

  return (
    <div className="pt-24 pb-12 container mx-auto px-4 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
           <p className="text-muted-foreground">Manage your account and preferences.</p>
        </div>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          {/* <TabsTrigger value="notifications">Notify</TabsTrigger> */}
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl">{user?.initials}</AvatarFallback>
                </Avatar>
                {/* <div className="space-y-1">
                   <Button variant="outline" size="sm">Change Avatar</Button>
                   <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                </div> */}
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user?.email || ''} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>User ID</Label>
                  <Input value={user?.user_id || ''} disabled className="bg-muted font-mono text-xs" />
                </div>
                 <div className="space-y-2">
                  <Label>Role</Label>
                  <Input value={user?.tier || 'Free'} disabled className="bg-muted capitalize" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
               <div className="text-sm text-muted-foreground">Profile changes are disabled for this preview.</div>
              <Button onClick={handleLogout} variant="destructive" size="sm">
                 <LogOut className="w-4 h-4 mr-2" />
                 Sign Out
               </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Ranking Settings Tab */}
        <TabsContent value="ranking" className="space-y-6 mt-6">
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                 <Sliders className="w-5 h-5 text-primary" />
                 Ranking Configuration
              </CardTitle>
              <CardDescription>Customize how the AI ranks and screens your candidates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                 <div className="grid gap-2">
                    <Label>Phase 1 Filter Limit (Initial Screening)</Label>
                    <p className="text-[0.8rem] text-muted-foreground">
                       How many candidates to pass to the detailed analysis phase.
                    </p>
                    <Input 
                      type="number" 
                      value={phase1Limit} 
                      onChange={(e) => setPhase1Limit(parseInt(e.target.value))}
                      min={1}
                      max={100}
                    />
                 </div>
                 <div className="grid gap-2">
                    <Label>Phase 2 Selection Limit (Final Ranking)</Label>
                    <p className="text-[0.8rem] text-muted-foreground">
                       How many candidates to show in the final shortlist.
                    </p>
                    <Input 
                      type="number" 
                      value={phase2Limit} 
                      onChange={(e) => setPhase2Limit(parseInt(e.target.value))}
                      min={1}
                      max={50}
                    />
                 </div>
                 <div className="grid gap-2">
                    <Label>Interview Questions per Candidate</Label>
                    <p className="text-[0.8rem] text-muted-foreground">
                       Number of AI-generated questions for shortlisted candidates.
                    </p>
                    <Input 
                      type="number" 
                      value={questionsCount} 
                      onChange={(e) => setQuestionsCount(parseInt(e.target.value))}
                      min={0}
                      max={10}
                    />
                 </div>
              </div>
            </CardContent>
            <CardFooter>
               <Button onClick={handleSaveRankingSettings} disabled={updateSettingsMutation.isPending}>
                  {updateSettingsMutation.isPending ? "Saving..." : "Save Configuration"}
                  {!updateSettingsMutation.isPending && <Save className="w-4 h-4 ml-2" />}
               </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
             <CardHeader>
              <CardTitle className="flex items-center gap-2">
                 <Bell className="w-5 h-5 text-primary" />
                 Notification Preferences
              </CardTitle>
              <CardDescription>Manage how you receive alerts.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="email-notifs" className="flex flex-col space-y-1">
                    <span>Email Notifications</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Receive emails when screening runs complete.
                    </span>
                  </Label>
                  <Switch id="email-notifs" defaultChecked />
                </div>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="marketing" className="flex flex-col space-y-1">
                    <span>Marketing Emails</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Receive news about new features and promotions.
                    </span>
                  </Label>
                  <Switch id="marketing" />
                </div>
             </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
           <Card>
             <CardHeader>
              <CardTitle className="flex items-center gap-2">
                 <Lock className="w-5 h-5 text-primary" />
                 Security
              </CardTitle>
              <CardDescription>Manage your password and account security.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
              {resetError && (
                <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {resetError}
                </div>
              )}
              {resetSuccess && (
                <div className="bg-green-500/15 text-green-600 dark:text-green-400 p-3 rounded-md text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {resetSuccess}
                </div>
              )}
               <div className="grid gap-2">
                  <Label>Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (resetError) setResetError(null);
                    if (resetSuccess) setResetSuccess(null);
                  }}
                />
               </div>
               <div className="grid gap-2">
                  <Label>New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (resetError) setResetError(null);
                    if (resetSuccess) setResetSuccess(null);
                  }}
                />
               </div>
               <div className="grid gap-2">
                  <Label>Confirm Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (resetError) setResetError(null);
                    if (resetSuccess) setResetSuccess(null);
                  }}
                />
               </div>
             </CardContent>
             <CardFooter className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleUpdatePassword}
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? "Updating..." : "Update Password"}
              </Button>
                <div className="text-xs text-muted-foreground">Two-factor authentication coming soon.</div>
             </CardFooter>
           </Card>
           
          {/* <Card className="border-red-200 dark:border-red-900/50">
             <CardHeader>
               <CardTitle className="text-red-500">Danger Zone</CardTitle>
               <CardDescription>Irreversible actions requiring caution.</CardDescription>
             </CardHeader>
             <CardContent>
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <h4 className="font-medium">Delete Account</h4>
                      <p className="text-sm text-muted-foreground">Permanently remove your account and all data.</p>
                   </div>
                   <Button variant="destructive">Delete Account</Button>
                </div>
             </CardContent>
           </Card> */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
