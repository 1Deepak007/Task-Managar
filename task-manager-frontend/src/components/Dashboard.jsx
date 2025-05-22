import Navbar from './utils/Navbar';
import Tasks from './utils/Tasks';
import { useAuth } from './contextapi/AuthContext'

const Dashboard = () => {

  const { user } = useAuth();

  

  console.log('user : ', user)

  return (
    <>
      <Tasks />
    </>
  );
};

export default Dashboard;