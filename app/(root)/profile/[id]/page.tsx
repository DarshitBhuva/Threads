import ProfileHeader from '@/components/shared/ProfileHeader';
import { fetchUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import React from 'react'
import { profileTabs } from '@/constants';
import Image from 'next/image';
import TreadTab from '@/components/shared/TreadTab';

const Profile = async ({ params }: { params: { id: string } }) => {

  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(params.id);

  if (!userInfo?.onboarded) redirect('/onboarding')

  return (
    <section>
      <ProfileHeader
        accountId={userInfo.id}
        authUserId={user.id}
        name={userInfo.name}
        username={userInfo.username}
        imageUrl={userInfo.image}
        bio={userInfo.bio} />

      <div className="mt-9">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className='tab'>
            {profileTabs.map((tab) => (
              <TabsTrigger value={tab.value} key={tab.label} className='tab'>
                <Image src={tab.icon} alt={tab.label} height={24} width={24} className='object-contain' />
                <p className='max-sm:hidden'>{tab.label}</p>

                {tab.label === "Threads" && (
                  <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 
                  !text-tiny-medium text-light-2">
                    {userInfo?.threads?.length}
                  </p>
                )}
              </TabsTrigger>

            ))}
          </TabsList>
          {profileTabs.map((tab) => (
            <TabsContent key={`content-${tab.label}`} value={tab.value} className='w-full text-light-4'>
              <TreadTab 
                currentUserId={user.id}
                accountId={userInfo.id}
                accountType="User"

              />
            </TabsContent>
          ))}
        </Tabs>

      </div>
    </section>
  )
}

export default Profile
