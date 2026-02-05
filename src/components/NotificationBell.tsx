 import { useState } from "react";
 import { Button } from "@/components/ui/button";
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { Bell, Check, Trash2, ExternalLink } from "lucide-react";
 import { useNotifications } from "@/hooks/useNotifications";
 import { cn } from "@/lib/utils";
 import { formatDistanceToNow } from "date-fns";
 import { useNavigate } from "react-router-dom";
 
 export function NotificationBell() {
   const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
   const navigate = useNavigate();
   const [open, setOpen] = useState(false);
 
   const handleNotificationClick = (notification: typeof notifications[0]) => {
     markAsRead.mutate(notification.id);
     
     // Navigate based on entity type
     if (notification.entity_type === "test_case" && notification.project_id) {
       navigate(`/test-repository?project=${notification.project_id}`);
     } else if (notification.entity_type === "defect" && notification.project_id) {
       navigate(`/defects?project=${notification.project_id}`);
     }
     
     setOpen(false);
   };
 
   return (
     <DropdownMenu open={open} onOpenChange={setOpen}>
       <DropdownMenuTrigger asChild>
         <Button variant="ghost" size="icon" className="relative">
           <Bell className="h-5 w-5" />
           {unreadCount > 0 && (
             <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
               {unreadCount > 9 ? "9+" : unreadCount}
             </span>
           )}
         </Button>
       </DropdownMenuTrigger>
       <DropdownMenuContent align="end" className="w-80">
         <DropdownMenuLabel className="flex items-center justify-between">
           <span>Notifications</span>
           {unreadCount > 0 && (
             <Button
               variant="ghost"
               size="sm"
               className="h-auto py-1 px-2 text-xs"
               onClick={() => markAllAsRead.mutate()}
             >
               <Check className="h-3 w-3 mr-1" />
               Mark all read
             </Button>
           )}
         </DropdownMenuLabel>
         <DropdownMenuSeparator />
         <ScrollArea className="h-[300px]">
           {notifications.length === 0 ? (
             <div className="p-4 text-center text-sm text-muted-foreground">
               No notifications
             </div>
           ) : (
             notifications.slice(0, 20).map((notification) => (
               <DropdownMenuItem
                 key={notification.id}
                 className={cn(
                   "flex flex-col items-start gap-1 p-3 cursor-pointer",
                   !notification.is_read && "bg-accent/50"
                 )}
                 onClick={() => handleNotificationClick(notification)}
               >
                 <div className="flex items-start justify-between w-full gap-2">
                   <span className="font-medium text-sm line-clamp-1">
                     {notification.title}
                   </span>
                   <Button
                     variant="ghost"
                     size="icon"
                     className="h-5 w-5 flex-shrink-0"
                     onClick={(e) => {
                       e.stopPropagation();
                       deleteNotification.mutate(notification.id);
                     }}
                   >
                     <Trash2 className="h-3 w-3 text-muted-foreground" />
                   </Button>
                 </div>
                 <p className="text-xs text-muted-foreground line-clamp-2">
                   {notification.message}
                 </p>
                 <span className="text-[10px] text-muted-foreground">
                   {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                 </span>
               </DropdownMenuItem>
             ))
           )}
         </ScrollArea>
       </DropdownMenuContent>
     </DropdownMenu>
   );
 }