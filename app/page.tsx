import { redirect } from 'next/navigation';

export default function Home() {
  // This automatically sends the user to your new login screen
  redirect('/login');
}