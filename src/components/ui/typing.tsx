"use client";
import React from "react";
import { useEffect, useState } from "react";

const TypingEffect = ({
    text,
    speed = 500,
    className = ""
}: {
    text: string;
    speed?: number;
    className?: string;
}) => {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        }
    }, [currentIndex, text, speed]);

    return (
        <div className={className}>
            {displayedText}
            <span
                style={{
                    display: "inline",
                    fontWeight: "bold"
                }}
                className="blinking-cursor"
            >
                _
            </span>
            <style>{`
                @keyframes blink {
                    from,
                    to {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0;
                    }
                }
                .blinking-cursor {
                    display: inline;
                    font-weight: bold;
                    animation: blink 1s step-end infinite;
                }
            `}</style>
        </div>
    );
};

export default TypingEffect;
