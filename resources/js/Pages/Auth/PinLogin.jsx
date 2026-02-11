import GuestLayout from '@/Layouts/GuestLayout';
import LoginButton from '@/Components/Button/LoginButton';
import PrimaryInput from '@/Components/Form/PrimaryInput';
import { Head, useForm } from '@inertiajs/react';

export default function PinLogin() {
    const { data, setData, post, processing, errors, reset } = useForm({
        pin: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('pin')
        })
    };

    return (
        <GuestLayout>
            <Head title="Login" />
            <div className="flex flex-col items-center justify-center">
                <div className="max-w-120 flex-col items-center justify-center space-y-20">
                    <div className="space-y-10 pt-40 px-4 md:px-0 pt-0">
                        <div className="flex items-center justify-center w-full md:hidden">
                            <img
                                src="/assets/logo.png"
                                alt="denr"
                                width={100}
                                height={100}
                                className="rounded-full shadow-lg shadow-green-200/50"
                            />
                        </div>
                        <div className="space-y-3">
                            <p className="font-large text-2xl md:text-3xl text-center">
                                Task Management System
                            </p>
                            {/* <p className="text-gray-600 text-center dark:text-gray-200">
                                Please enter your password to login
                            </p> */}
                        </div>
                        {/* <form className="w-full space-y-4">
                            <PrimaryInput
                                type="password"
                                placeholder="Password"
                                value={data.pin}
                                onChange={(e) => setData("pin", e.target.value)}
                                error={errors.pin}
                            />

                            <LoginButton
                                text="Login"
                                disabled={processing}
                                onClick={submit}
                            />
                            <p className="text-gray-600 text-center mt-2 dark:text-gray-200">
                                For
                                <span className="text-green-600 dark:text-green-300"> DENR NCR </span>
                                employees only.
                            </p>
                        </form> */}
                        <div className="mt-60 flex items-center justify-center gap-3">
                            <span className="text-green-600 font-semibold dark:text-green-400"> © DENR NCR 2025</span>
                            <span className="text-green-600 font-semibold dark:text-green-400">|</span>
                            <span className="text-green-600 font-semibold dark:text-green-400">v0.9</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="hidden bg-gradient-to-br from-green-400 via-green-600 to-green-300 md:flex items-center justify-center">
                <img
                    src="/assets/logo.png"
                    alt="denr"
                    width={300}
                    height={300}
                    className="rounded-full shadow-lg shadow-green-900/50"
                />
            </div>
        </GuestLayout>
    )
}
