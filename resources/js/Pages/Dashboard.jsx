import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import MainContainer from '@/Components/DivContainer/MainContainer';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <MainContainer>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                </div>
            </MainContainer>
        </AuthenticatedLayout>
    );
}
