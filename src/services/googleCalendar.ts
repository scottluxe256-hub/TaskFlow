import { supabase } from "../lib/supabase";

export const getGoogleProviderToken = async (): Promise<string | null> => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.provider_token || null;
    } catch (err) {
        return null;
    }
};

// 1. API LIBUR NASIONAL ANTI-GAGAL (Tanpa Token Google)
export const fetchIndonesianHolidays = async (year: number = new Date().getFullYear()) => {
    try {
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/ID`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.map((item: any) => ({ date: item.date, title: item.localName }));
    } catch (error) {
        console.error("Error fetching holidays:", error);
        return [];
    }
};

// 2. CREATE EVENT KE GOOGLE
export const createGoogleCalendarEvent = async (title: string, dueDateIso: string, description?: string) => {
    try {
        const token = await getGoogleProviderToken();
        if (!token) return null;
        const startDate = new Date(dueDateIso);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                summary: title,
                description: description || "Sync via TaskFlow",
                start: { dateTime: startDate.toISOString() },
                end: { dateTime: endDate.toISOString() }
            })
        });
        const data = await response.json();
        return data.id || null;
    } catch (error) { return null; }
};

// 3. PULL GOOGLE EVENTS & TASKS SEKALIGUS
export const fetchAllGoogleData = async (year: number = new Date().getFullYear()) => {
    try {
        const token = await getGoogleProviderToken();
        if (!token) return [];

        const timeMin = new Date(year, 0, 1).toISOString();
        const timeMax = new Date(year, 11, 31, 23, 59, 59).toISOString();

        // Tarik Acara (Events)
        const eventsRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`, { headers: { Authorization: `Bearer ${token}` } });
        const eventsData = eventsRes.ok ? await eventsRes.json() : { items: [] };

        const events = (eventsData.items || []).map((item: any) => ({
            id: `gev_${item.id}`,
            title: item.summary || "Acara Tanpa Judul",
            due_date: item.start?.dateTime || `${item.start?.date}T09:00:00`,
            description: item.description || "",
            is_completed: false,
            category: { name: "Google Event", color: "#4285F4" }
        }));

        // Tarik Tugas (Tasks)
        const tasksRes = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?showHidden=false`, { headers: { Authorization: `Bearer ${token}` } });
        const tasksData = tasksRes.ok ? await tasksRes.json() : { items: [] };

        const tasks = (tasksData.items || []).map((item: any) => ({
            id: `gtsk_${item.id}`,
            title: item.title || "Tugas Tanpa Judul",
            due_date: item.due || new Date().toISOString(),
            description: item.notes || "",
            is_completed: item.status === "completed",
            category: { name: "Google Task", color: "#F4B400" }
        }));

        return [...events, ...tasks];
    } catch (error) {
        console.error("Error fetching Google data:", error);
        return [];
    }
};