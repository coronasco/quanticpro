import { Bell } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover"

const Notification = () => {
  return (
    <Popover>
        <PopoverTrigger asChild>
            <Bell className="w-5 h-5" />
        </PopoverTrigger>
        <PopoverContent>
            <div className="flex flex-col gap-2">
                <p>Notifiche</p>
            </div>
        </PopoverContent>
    </Popover>
  )
}

export default Notification