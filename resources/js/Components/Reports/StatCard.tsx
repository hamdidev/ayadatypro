interface Props {
    title: string;
    value: string | number;
    sub?: string;
    color?: "blue" | "indigo" | "green" | "amber" | "red";
}

const colors = {
    blue: "text-blue-600   dark:text-blue-400   bg-blue-50   dark:bg-blue-900/20",
    indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20",
    green: "text-green-600  dark:text-green-400  bg-green-50  dark:bg-green-900/20",
    amber: "text-amber-600  dark:text-amber-400  bg-amber-50  dark:bg-amber-900/20",
    red: "text-red-600    dark:text-red-400    bg-red-50    dark:bg-red-900/20",
};

export default function StatCard({ title, value, sub, color = "blue" }: Props) {
    return (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {title}
            </p>
            <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );
}
