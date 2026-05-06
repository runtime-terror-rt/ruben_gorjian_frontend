"use client";

import { useState } from "react";
import { 
  User, 
  Mail, 
  Hash, 
  Calendar as CalendarIcon, 
  Send, 
  Camera, 
  Video, 
  Clock, 
  ChevronLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List as ListIcon,
  Globe,
  Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientSelectionModal from "./ClientSelectionModal";
import { AdminPostComposer } from "./AdminPostComposer";
import AdminSessionComposer from "./AdminSessionComposer";
import AdminClientSessionsList from "./AdminClientSessionsList";
import { CalendarProvider } from "@/app/dashboard/calendar/calendar-context";
import EnhancedCalendar from "@/app/dashboard/calendar/enhanced-calendar";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string | null;
  fullName: string | null;
  email: string;
  status?: string;
  connectedPlatformCount?: number;
}

export default function AdminClientWorkspace() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [sessionRefreshKey, setSessionRefreshKey] = useState(0);
  const [editingSession, setEditingSession] = useState<any>(null);

  const handleSessionSuccess = () => {
    setSessionRefreshKey(prev => prev + 1);
    setEditingSession(null);
  };

  const handleEditSession = (session: any) => {
    setEditingSession(session);
    // Switch to sessions tab and scroll to top if needed
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!selectedClient) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-6">
        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] shadow-2xl backdrop-blur-xl flex flex-col items-center text-center space-y-4 max-w-md">
          <div className="p-4 bg-lime-400/10 rounded-full">
            <User className="h-12 w-12 text-lime-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">No Client Selected</h2>
            <p className="text-slate-400 text-sm mt-2">
              Select a client to manage their schedule, post on their behalf, and handle session bookings.
            </p>
          </div>
          <Button 
            onClick={() => setIsSelectorOpen(true)}
            className="w-full bg-lime-400 hover:bg-lime-500 text-slate-950 font-black h-12 rounded-2xl transition-all hover:scale-[1.02]"
          >
            <Search className="h-5 w-5 mr-2" />
            Search Client
          </Button>
        </div>

        <ClientSelectionModal 
          isOpen={isSelectorOpen}
          onClose={() => setIsSelectorOpen(false)}
          onSelect={(client) => {
            setSelectedClient(client);
            setIsSelectorOpen(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Client Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/40 border border-slate-800 rounded-[2rem] backdrop-blur-md">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-lime-400/10">
            <User className="h-8 w-8 text-slate-950" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {selectedClient.fullName || selectedClient.name || "N/A"}
              </h2>
              <Badge className="bg-lime-400/10 text-lime-400 border-lime-400/20 text-[10px] font-black uppercase tracking-widest">
                {selectedClient.status || "ACTIVE"}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
              <div className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 opacity-50" />
                {selectedClient.email}
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <Hash className="h-3 w-3 opacity-40" />
                {selectedClient.id}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsSelectorOpen(true)}
            className="border-slate-800 bg-slate-950/50 hover:bg-slate-800 text-slate-300 rounded-xl"
          >
            <Search className="h-4 w-4 mr-2" />
            Switch Client
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setSelectedClient(null)}
            className="text-slate-500 hover:text-white"
          >
            Close Workspace
          </Button>
        </div>
      </div>

      {/* Main Workspace Tabs */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="bg-slate-950/50 border border-slate-800 p-1.5 rounded-2xl">
          <TabsTrigger value="calendar" className="rounded-xl px-6 data-[state=active]:bg-slate-800 data-[state=active]:text-white transition-all">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="posts" className="rounded-xl px-6 data-[state=active]:bg-slate-800 data-[state=active]:text-white transition-all">
            <Send className="h-4 w-4 mr-2" />
            Post on Behalf
          </TabsTrigger>
          <TabsTrigger value="sessions" className="rounded-xl px-6 data-[state=active]:bg-slate-800 data-[state=active]:text-white transition-all">
            <Camera className="h-4 w-4 mr-2" />
            Book Session
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6 outline-none">
          <CalendarProvider targetUserId={selectedClient.id}>
            <div className="rounded-[2.5rem] border border-slate-800 bg-slate-900/20 overflow-hidden backdrop-blur-sm">
              <EnhancedCalendar />
            </div>
          </CalendarProvider>
        </TabsContent>

        <TabsContent value="posts" className="space-y-6 outline-none">
          <div className="max-w-4xl mx-auto">
            <AdminPostComposer 
              userId={selectedClient.id}
              userName={selectedClient.fullName || selectedClient.name}
              userEmail={selectedClient.email}
            />
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-8 outline-none">
          <div className="grid grid-cols-1 gap-8">
            <div className="max-w-4xl mx-auto w-full">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {editingSession ? "Edit Session" : "Book New Session"}
                </h3>
                <p className="text-sm text-slate-400">
                  {editingSession ? "Update the details for this session." : "Schedule a photoshoot or video session for this client."}
                </p>
              </div>
              <AdminSessionComposer 
                userId={selectedClient.id}
                userName={selectedClient.fullName || selectedClient.name}
                userEmail={selectedClient.email}
                onSuccess={handleSessionSuccess}
                editingSession={editingSession}
                onCancelEdit={() => setEditingSession(null)}
              />
            </div>
            
            <div className="w-full">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Session History</h3>
                <p className="text-sm text-slate-400">View and manage existing sessions for this client.</p>
              </div>
              <AdminClientSessionsList 
                key={sessionRefreshKey} 
                userId={selectedClient.id} 
                onEditSession={handleEditSession}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ClientSelectionModal 
        isOpen={isSelectorOpen}
        onClose={() => setIsSelectorOpen(false)}
        onSelect={(client) => {
          setSelectedClient(client);
          setIsSelectorOpen(false);
        }}
      />
    </div>
  );
}
