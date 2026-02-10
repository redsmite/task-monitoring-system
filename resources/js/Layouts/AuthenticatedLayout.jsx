import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import ModeToggle from '@/Components/Button/ModeToggle';
import IconButton from '@/Components/Button/IconButton';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ThemeProvider } from '@/Components/themeProvider';
import { Toaster } from 'sonner';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-gradient-to-tr from-green-200 via-gray-200 to-emerald-200 dark:bg-zinc-800 dark:bg-none">
                <nav className="border-b border-gray-100 bg-white dark:border-stone-800 dark:bg-zinc-900 sticky top-0 z-10">
                    <div className="mx-10 px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex">
                                <div className="flex shrink-0 items-center">
                                    <img src="/assets/logo.png" alt="Logo" className="w-10 h-10" />
                                </div>

                                <div className="hidden space-x-8 lg:-my-px lg:ms-10 lg:flex">
                                    <NavLink
                                        href={route('dashboard.index')}
                                        active={route().current('dashboard.index')}
                                    >
                                        Dashboard
                                    </NavLink>
                                    <NavLink
                                        href={route('task.index')}
                                        active={route().current('task.index')}
                                    >
                                        Tasks
                                    </NavLink>
                                    <NavLink
                                        href={route('assignee.index')}
                                        active={route().current('assignee.index')}
                                    >
                                        Assignee
                                    </NavLink>
                                    <NavLink
                                        href={route('division.index')}
                                        active={route().current('division.index')}
                                    >
                                        Divisions
                                    </NavLink>
                                    <NavLink
                                        href={route('timeline.index')}
                                        active={route().current('timeline.index')}
                                    >
                                        Timeline
                                    </NavLink>
                                </div>
                            </div>
                            <div className="hidden lg:ms-6 lg:flex lg:items-center space-x-4">
                                <div className="relative ms-3">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <span className="inline-flex rounded-md dark:text-gray-400 items-center">
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:bg-zinc-900 dark:text-gray-400 dark:hover:text-gray-300 cursor-pointer"
                                                >
                                                    {user.name}
                                                </button>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                            </span>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content>
                                            <Dropdown.Link
                                                href={route('profile.edit')}
                                            >
                                                Profile
                                            </Dropdown.Link>
                                            <a
                                                href="https://denrncrsys.online/"
                                                target="_self"
                                                className="block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800 transition duration-150 ease-in-out"
                                            >
                                                Back to DNIIS
                                            </a>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                                <ModeToggle />
                            </div>
                            <div className="-me-2 flex items-center lg:hidden space-x-2">
                                <ModeToggle />
                                <IconButton
                                    icon={
                                        <svg
                                            className="h-6 w-6"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                className={
                                                    !showingNavigationDropdown
                                                        ? 'inline-flex'
                                                        : 'hidden'
                                                }
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M4 6h16M4 12h16M4 18h16"
                                            />
                                            <path
                                                className={
                                                    showingNavigationDropdown
                                                        ? 'inline-flex'
                                                        : 'hidden'
                                                }
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    }
                                    iconColor="muted"
                                    onClick={() =>
                                        setShowingNavigationDropdown(
                                            (previousState) => !previousState,
                                        )
                                    }
                                    tooltip="Toggle navigation menu"
                                />
                            </div>
                        </div>
                    </div>

                    <div
                        className={
                            (showingNavigationDropdown ? 'block' : 'hidden') +
                            ' lg:hidden'
                        }
                    >
                        <div className="space-y-1 pb-3 pt-2">
                            <ResponsiveNavLink
                                href={route('dashboard.index')}
                                active={route().current('dashboard.index')}
                            >
                                Dashboard
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('task.index')}
                                active={route().current('task.index')}
                            >
                                Tasks
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('assignee.index')}
                                active={route().current('assignee.index')}
                            >
                                Assignee
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('division.index')}
                                active={route().current('division.index')}
                            >
                                Divisions
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                href={route('timeline.index')}
                                active={route().current('timeline.index')}
                            >
                                Timeline
                            </ResponsiveNavLink>
                        </div>

                        <div className="border-t border-gray-200 pb-1 pt-4 dark:border-gray-600">
                            <div className="px-4">
                                <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                                    {user.name}
                                </div>
                                <div className="text-sm font-medium text-gray-500">
                                    {user.email}
                                </div>
                            </div>

                            <div className="mt-3 space-y-1">
                                <ResponsiveNavLink href={route('profile.edit')}>
                                    Profile
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    method="post"
                                    href={route('logout')}
                                    as="button"
                                >
                                    Log Out
                                </ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                </nav>

                {header && (
                    <header className="bg-white shadow dark:bg-zinc-900 sticky top-0 z-2">
                        <div className="mx-10 px-4 py-6 sm:px-6 lg:px-8">
                            <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                                {header}
                            </h2>
                        </div>
                    </header>
                )}

                <div>
                    {children}
                    <Toaster richColors position="top-center" />
                </div>
            </div>
        </ThemeProvider>
    )
}
