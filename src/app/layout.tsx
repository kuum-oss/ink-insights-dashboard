import "./globals.css";
import { ThemeProvider } from "@/theme/ThemeProvider";

export const metadata = {
    title: "E-Ink Insights Dashboard",
    description: "Reading analytics for E-Ink devices",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ru">
        <body>
        <ThemeProvider>
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}
