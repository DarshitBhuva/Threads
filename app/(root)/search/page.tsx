import ProfileHeader from '@/components/shared/ProfileHeader';
import { fetchUser, fetchUsers } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import React from 'react'
import { profileTabs } from '@/constants';
import Image from 'next/image';
import TreadTab from '@/components/shared/TreadTab';
import UserCard from '@/components/cards/UserCard';

const Search = async () => {

    const user = await currentUser();

    if (!user) return null;

    const userInfo = await fetchUser(user.id);

    if (!userInfo?.onboarded) redirect('/onboarding')

    const result = await fetchUsers({ userId: user.id, searchString: '', pageNo: 1, pageSize: 25 });

    return (
        <section>
            <h1 className='head-text mb-10'>Search</h1>

            <div className="mt-14 flex flex-col gap-9">
                {result.users.length === 0 ? (
                    <p className='no-result'>No Users</p>
                ) : (
                    <>
                        {result.users.map((person) => (
                            <UserCard key={person.id}
                                id={person.id}
                                name={person.name}
                                username={person.username} 
                                imageUrl={person.image}
                                personType="User"/>
                        ))}
                    </>
                )}

            </div>
        </section>
    )
}

export default Search
