import { ReactNode } from 'react';

interface Props {
    title: string;
    children: ReactNode;
    action?: ReactNode;
}

export default function ChartCard({ title, children, action }: Props) {
    return (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                    {title}
                </h3>
                {action}
            </div>
            {children}
        </div>
    );
}
