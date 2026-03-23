import { useRef, useState } from 'react'

const useSteps = ({ length }: { length: number }) => {
    const lengthRef = useRef<number>(0);
    const [counter, setCounter] = useState(1);
    lengthRef.current = length;
    
    const handleNext = () => {
        if (counter < lengthRef.current) setCounter(counter + 1);
    }


    const handlePrev = () => {
        if (counter > 1) setCounter(counter - 1);
    }
    const handle = (step: number) => {
        if (step <= lengthRef.current && step >= 1 ) setCounter(step);
    }


    const isLastStep = () => counter === lengthRef.current;
    const isFirstStep = () => counter === 1


    return {
        activeStep: counter,
        isLastStep: isLastStep(),
        isFirstStep: isFirstStep(),
        handleNext,
        moveTo: handle,
        length,
        handlePrev
        // isLoading: state.isLoading
    }
}

export default useSteps;
