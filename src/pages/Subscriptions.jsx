import Card from '../components/card';
import CustomBarChart from '../components/Charts/BarChart';
import dummyData from '../dummyData.json';

const Subscriptions = () => {
  const data = Object.entries(dummyData.subscriptionsData).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-4">
      <Card title="Subscription Plans"><CustomBarChart data={data} /></Card>
    </div>
  );
};

export default Subscriptions;