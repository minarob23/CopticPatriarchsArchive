import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "./pages/not-found";
import Landing from "./pages/landing";
import Home from "./pages/home";
import Login from "@/pages/login";
import Admin from "@/pages/admin";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import References from "@/pages/references";
import ChurchHistory from "@/pages/church-history";
import SmartSummary from "@/pages/smart-summary";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Loading from "@/components/ui/loading";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/home" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={Admin} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/references" component={References} />
      <Route path="/church-history" component={ChurchHistory} />
      <Route path="/smart-summary" component={SmartSummary} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;