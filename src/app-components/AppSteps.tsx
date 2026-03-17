import { FC } from "react";
import { FaCircleDot } from "react-icons/fa6";
import { ClassnameProps } from "@/app-model/BaseProps";

export interface AppStepsProps extends ClassnameProps {
  length: number;
  currentStep: number;
  move: (c: number) => void;
}
export const AppSteps: FC<AppStepsProps> = ({ className, length, currentStep, move }) => {
  // Heads Up: Tailwind can spot these because they're scanned during compilation;
  const lineColor = (i: number) => currentStep <= i + 1 ? 'border-grey' : 'border-[#0092FF]';
  const dotColor = (i: number) => currentStep >= i + 1 ? 'text-[#0092FF]' : 'text-grey'

  return (
    <aside>
      {new Array(length).fill(0).map((x, i, a) => {
        const count = i + 1;
        return (
          <div key={i} className=" cursor-pointer" onClick={() => move(count) }>
            <p className={`text-[14px] font-medium ${dotColor(i)}`}>
              <FaCircleDot className={`inline`} />
              <span className="align-middle ml-2">Step {count}</span>
            </p>
            {i !== a.length - 1
              && (<div className={`border-l-[1px] ${lineColor(i)} min-h-[57px] ml-[7px]`}></div>)}
          </div>
        )
      })}
    </aside>

  )
}