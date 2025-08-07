import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, User, Mail, Shield, Bell, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { usersApi } from "@/utils/api";

export default function CreateUser() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    userType: "regular",
    sendWelcomeEmail: false,
    sendCredentialsEmail: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Username and email are required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await usersApi.create(formData);
      
      toast({
        title: "User Created Successfully",
        description: `User has been created successfully.`,
      });

      // Navigate back to user management
      navigate("/admin/users");
    } catch (error: any) {
      toast({
        title: "Error Creating User",
        description: error.message || "Failed to create user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New User</h1>
          <p className="text-muted-foreground mt-1">Add a new user to the Kubrick platform</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter the details for the new user account. A temporary password will be generated automatically.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter username (letters, numbers, hyphens, underscores)"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Username will be converted to lowercase automatically
                </p>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter user's email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  User will receive login credentials at this email address
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                User Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.userType}
                onValueChange={(value) => handleInputChange("userType", value)}
                className="space-y-4"
              >
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="regular" id="regular" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="regular" className="font-medium">
                      Regular User - Standard Access
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Can create and manage their own projects
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="admin" id="admin" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="admin" className="font-medium">
                      Administrator - Admin Access
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Full platform access including user management
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Email Notification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="welcome-email"
                  checked={formData.sendWelcomeEmail}
                  onCheckedChange={(checked) => handleInputChange("sendWelcomeEmail", !!checked)}
                />
                <Label htmlFor="welcome-email" className="text-sm">
                  Send welcome email with login credentials
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="credentials-email"
                  checked={formData.sendCredentialsEmail}
                  onCheckedChange={(checked) => handleInputChange("sendCredentialsEmail", !!checked)}
                />
                <Label htmlFor="credentials-email" className="text-sm">
                  User will receive their username and temporary password via email
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Security Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>A secure temporary password will be generated automatically</li>
                <li>Password expires in 24 hours</li>
                <li>User must change password on first login</li>
                <li>All account creation is logged for audit purposes</li>
              </ul>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button type="submit" className="flex-1 sm:flex-none" disabled={isLoading}>
              <User className="h-4 w-4 mr-2" />
              {isLoading ? "Creating User..." : "Create User"}
            </Button>
            <Button type="button" variant="outline" asChild disabled={isLoading}>
              <Link to="/admin/users">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}