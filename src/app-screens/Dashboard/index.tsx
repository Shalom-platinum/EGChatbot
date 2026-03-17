import { useMsal } from '@azure/msal-react';
import { FlexCol } from '@/app-components/FlexCol';
import { AppStatCard } from '@/app-components/AppStatCard';
import { useNavigate } from 'react-router';
import {DataTable} from "@/app-components/table/reusabletable";
// @ts-ignore
import tableData from "@/app-components/table/tableData.json"
import {tablecol} from "@/app-components/table/tablecol";
import { Button } from '@/app-components/ui/button';
import { api } from '@/app-services/auth.service';
import FAQSComponent from '@/app-components/FAQSComponent';


const dummyStats = [
  { title: 'Total Courses', count: '0' },
  { title: 'Completed Courses', count: '0' },
  { title: 'Ongoing Courses', count: '0' },
  { title: 'Cancelled Courses', count: '0' },
  { title: 'Total Cases', count: '0' },
  { title: 'Completed Cases', count: '0' },
  { title: 'Ongoing Cases', count: '0' },
  { title: 'Cancelled Cases', count: '0' },
];

function Dashboard() {
  const { instance, accounts, inProgress } = useMsal();
  const nav = useNavigate();

      // const email = accounts[0]?.username ?? "";
      // const { data } = api.useGetCustomerEligibilityQuery({Email: email},)
      // console.log("Eligibility Data:", data);

  return (

    <main className='w-full mt-5 relative'>
      <FAQSComponent />
    </main>

  )
}

export default Dashboard;

