import { Button } from "@/app-components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app-components/ui/dialog"
import { ClassnameProps } from "@/app-model/BaseProps";
import app_logo from '@/assets/svg_icons/app_logo.svg';
import { FlexRow } from "./FlexRow";
import { ReactElement } from "react";
import { PrivacyPolicyContent } from "./policies/PrivacyPolicy";
import { cn } from "@/utils/utils";

export interface AppDialogProps extends ClassnameProps {
  open: boolean;
  title?: string;
  onOpenChange: (boolean) => void;
  body?: ReactElement;
  disableFooter?: boolean;
  disableHeader?: boolean;
  w?: 'sm' | 'lg';

}

export function AppDialog({ open, onOpenChange, title, body, disableFooter, disableHeader, w }: AppDialogProps) {
  const width = w === 'sm' ? "sm:max-w-[400px]" : "sm:max-w-[500px]";
  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent className={cn(width)}>

        {!disableHeader && (<DialogHeader>
          <FlexRow className="items-center">
            <img src={app_logo} className="w-20" />
            <DialogTitle>{title}</DialogTitle>
          </FlexRow>
        </DialogHeader>)}
        {body}

        {!disableFooter && (<DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>)}
      </DialogContent>
    </Dialog>
  )
}
