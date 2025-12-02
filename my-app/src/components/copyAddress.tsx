import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface CopyStringWrapperProps {
    text?: string
    fulltext?: string
    children?: React.ReactNode
}

export function CopyAddress({
    text,
    fulltext,
    children,
}: CopyStringWrapperProps) {
    const [isClickBoard, setIsClickBoard] = useState<boolean>(false);

    const handleCopyClickboard = (uid: string) => {
        navigator.clipboard.writeText(uid);
        setIsClickBoard(true);
        setTimeout(() => {
            setIsClickBoard(false);
        }, 1000);
    };

    return (
        <div onClick={() => handleCopyClickboard(fulltext ? fulltext : text || "")}>
            <TooltipProvider >
                <Tooltip>
                    <TooltipTrigger>
                        {!children ? (
                            <span>
                                {text}
                            </span>
                        ) : (
                            <div>
                                {children}
                            </div>
                        )}
                    </TooltipTrigger>
                    <TooltipContent style={{
                        backgroundColor: isClickBoard ? "#2f9e44" : undefined,
                        transition: "background-color 2s ease-out",
                    }}>
                        {isClickBoard ? "Copied!" : `Press to copy entire address`}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
