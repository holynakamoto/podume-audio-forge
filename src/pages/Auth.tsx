
import { Link } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Logo from '@/components/Logo';

const AuthPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <Link to="/">
          <Logo />
        </Link>
      </div>
      <Tabs defaultValue="sign-in" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
          <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-in">
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
            </CardHeader>
            <CardContent>
              <SignIn 
                routing="path" 
                path="/auth" 
                afterSignInUrl="/"
                signUpUrl="/auth?tab=sign-up"
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sign-up">
          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
            </CardHeader>
            <CardContent>
              <SignUp 
                routing="path" 
                path="/auth" 
                afterSignUpUrl="/"
                signInUrl="/auth?tab=sign-in"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthPage;
