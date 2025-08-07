import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Users, Settings } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">Admin Platform</h1>
          <p className="text-xl text-muted-foreground">Secure access to your admin dashboard</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/login">
              <Shield className="h-4 w-4 mr-2" />
              Admin Login
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link to="/admin">
              <Users className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Secure admin panel for user and project management</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
