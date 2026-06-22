interface Props {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            <div className="relative bg-white dark:bg-zinc-900 rounded-lg shadow-lg w-full max-w-md mx-4 p-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button aria-label="Close dialog" onClick={onClose} className="text-sm px-2 py-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">✕</button>
                </div>

                <div>{children}</div>
            </div>
        </div>
    );
}
