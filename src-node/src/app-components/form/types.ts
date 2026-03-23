import { ControllerFieldState, ControllerRenderProps, UseFormStateReturn } from "react-hook-form";

export interface AppFormItem{
    field: ControllerRenderProps<any, any>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<any>;
}