import { Router, Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Editor from "@/pages/Editor";
import SavedDrawings from "@/pages/SavedDrawings";

function AppRouter() {
  return (
    <Router base={import.meta.env.BASE_URL}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/editor/:id" component={Editor} />
        <Route path="/editor/saved/:id" component={Editor} />
        <Route path="/saved" component={SavedDrawings} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
