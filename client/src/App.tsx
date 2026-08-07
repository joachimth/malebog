import { lazy, Suspense } from "react";
import { Router, Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";

const Home = lazy(() => import("@/pages/Home"));
const Editor = lazy(() => import("@/pages/Editor"));
const SavedDrawings = lazy(() => import("@/pages/SavedDrawings"));
const NotFound = lazy(() => import("@/pages/not-found"));

function AppRouter() {
  return (
    <Router base={import.meta.env.BASE_URL}>
      <Suspense
        fallback={
          <div className="min-h-screen grid place-items-center text-muted-foreground">
            Henter malebogen...
          </div>
        }
      >
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/editor/:id" component={Editor} />
          <Route path="/editor/saved/:id" component={Editor} />
          <Route path="/saved" component={SavedDrawings} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  );
}

export default App;
