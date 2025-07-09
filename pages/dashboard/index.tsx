// src/pages/dashboard/index.tsx
import { useSupabase } from '../../hooks/useSupabase';

export default function Dashboard() {
  const { user } = useSupabase();
  
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Welcome, {user?.email}!</p>
      
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Getting Started</h2>
          <p>This is your application dashboard. Start building your app here.</p>
        </div>
        
        {/* Add more dashboard content here */}
      </div>
    </div>
  );
}