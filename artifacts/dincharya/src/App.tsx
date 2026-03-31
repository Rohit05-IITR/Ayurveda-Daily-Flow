import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Signup from "@/pages/Signup";
import Login from "@/pages/Login";
import Prakriti from "@/pages/Prakriti";
import Guna from "@/pages/Guna";
import Dashboard from "@/pages/Dashboard";
import "./dincharya.css";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/"          component={Home}      />
      <Route path="/signup"    component={Signup}    />
      <Route path="/login"     component={Login}     />
      <Route path="/prakriti"  component={Prakriti}  />
      <Route path="/guna"      component={Guna}      />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
