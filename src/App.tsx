import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UserSearch from "./Components/UserSearch";

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <UserSearch />
  </QueryClientProvider>
);

export default App;
