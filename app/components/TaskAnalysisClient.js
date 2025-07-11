"use client";
import React, { useState } from 'react';

// --- Helper Icons ---
const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);



const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
);

const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 mr-2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);

// ShapeHero component for levitating shapes
const ShapeHero = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-black rounded-full opacity-5 animate-levitate-1"></div>
        <div className="absolute top-1/4 right-10 w-48 h-48 bg-black rounded-lg opacity-5 animate-levitate-2"></div>
        <div className="absolute bottom-20 left-1/4 w-32 h-32 bg-black rounded-full opacity-5 animate-levitate-3"></div>
        <div className="absolute bottom-40 right-20 w-40 h-40 bg-black opacity-5 animate-levitate-4"></div>
    </div>
);

export default function TaskAnalysisClient({ frameworkMap }) {
    // --- State Management ---
    const [userInput, setUserInput] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');


    // --- Core Functions ---
    const handleAnalysis = async () => {
        setAnalysis(null);
        setError('');

        if (userInput.length < 10) {
            setError("Please provide a more detailed task description (at least 10 characters).");
            return;
        }

        setIsLoading(true);

        // UPDATED: This prompt is refined to adopt a first-person reflective persona.
        const prompt = `
        You are an AI that helps me self-reflect. Your task is to take my raw input and structure it from my own first-person perspective ("I") using my personal Task Framework.

        **Your Primary Directive:**
        1.  Analyze my input to determine if I am reflecting on a **Problem** or expressing **Praise**.
        2.  Rephrase and structure my input into the appropriate JSON format, always writing from my point of view.

        **Output Format Rules:**
        Your entire response must be a single, valid JSON object.

        **1. If I am describing a problem:**
           - "Point Type": "Problem"
           - "Task Framework Category": The category from my framework that I missed.
           - "Sub-Category": The specific point from my framework that I missed.
           - "Situation (S)": "Describe the context of what happened from my perspective."
           - "Behavior (B)": "Describe what I did or failed to do."
           - "Impact (I)": "Describe the outcome or result of my behavior."
           - "Action Item (A)": "Describe the specific, actionable step I will take next time."

        **2. If I am expressing thanks or praise:**
           - "Point Type": "Praise"
           - "Task Framework Category": "learning hour"
           - "Sub-Category": "appreciation / praise"
           - "Recipient": "The name of the person I am thanking."
           - "Reason": "The specific reason why I am grateful to them."

        **3. If my input is invalid (a greeting, off-topic, etc.):**
           Return this exact JSON:
           { "error": "Invalid Framework Input. Please describe a specific task-related issue or praise someone." }
        ---
        My Raw Input:
        "${userInput}"
        ---
        My Task Framework for Reference:
        ${JSON.stringify(frameworkMap, null, 2)}
        ---
        `;

        try {
            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        response_mime_type: "application/json",
                        temperature: 0.2,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText} (Status: ${response.status})`);
            }

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0) {
                const jsonText = result.candidates[0].content.parts[0].text;
                const parsedJson = JSON.parse(jsonText);

                if (parsedJson.error) {
                    setError(parsedJson.error);
                } else {
                    setAnalysis(parsedJson);
                }
            } else {
                throw new Error("The API returned an empty or invalid response.");
            }

        } catch (e) {
            console.error(e);
            setError(`An unexpected error occurred: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <div className="bg-white min-h-screen font-sans text-black p-4 sm:p-6 md:p-8 relative overflow-hidden">
            <ShapeHero />
            <div className="max-w-4xl mx-auto relative z-10">
                <header className="text-center mb-12 mt-6">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">Task Analysis Tool</h1>
                    <p className="text-gray-600 mt-3 text-lg max-w-2xl mx-auto">
                        Describe a task issue or a moment of appreciation
                    </p>
                </header>

                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 relative z-10 transition-all duration-300 hover:shadow-2xl">
                    <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="e.g., 'I missed the deadline...' or 'Thanks to Sankar for helping me...'"
                        className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all duration-300 placeholder-gray-500 text-black resize-none"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleAnalysis}
                        disabled={isLoading || !userInput}
                        className="mt-6 w-full flex justify-center items-center bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-lg transform hover:scale-[1.02]"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Analyze Entry'}
                    </button>
                </div>

                <div className="mt-10 relative z-10">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl animate-fade-in">
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    {analysis && !isLoading && (
                        analysis['Point Type'] === 'Problem' ? (
                            <div className="bg-white p-7 rounded-2xl shadow-xl animate-fade-in border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">My Reflection</h2>
                                <div className="space-y-5">
                                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                                        <h3 className="font-medium text-gray-500 text-sm uppercase tracking-wider">Framework Point I Missed</h3>
                                        <p className="text-lg font-medium text-black mt-1">{analysis["Task Framework Category"]} → {analysis["Sub-Category"]}</p>
                                    </div>
                                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                                        <h3 className="font-medium text-gray-500 text-sm uppercase tracking-wider">Situation (S)</h3>
                                        <p className="text-black mt-2">{analysis["Situation (S)"]}</p>
                                    </div>
                                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                                        <h3 className="font-medium text-gray-500 text-sm uppercase tracking-wider">My Behavior (B)</h3>
                                        <p className="text-black mt-2">{analysis["Behavior (B)"]}</p>
                                    </div>
                                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                                        <h3 className="font-medium text-gray-500 text-sm uppercase tracking-wider">Impact (I)</h3>
                                        <p className="text-black mt-2">{analysis["Impact (I)"]}</p>
                                    </div>
                                    <div className="p-5 bg-black/5 border border-gray-200 rounded-xl">
                                        <h3 className="font-medium text-gray-600 text-sm uppercase tracking-wider">My Action Item (A)</h3>
                                        <p className="font-medium text-black mt-2">{analysis["Action Item (A)"]}</p>
                                    </div>
                                </div>
                                <div className="mt-8 w-full flex">
                                    <button
                                        onClick={handleAnalysis}
                                        className="flex justify-center w-full items-center bg-black hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                                    >
                                        <RefreshIcon /> Re-analyze
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-7 rounded-2xl shadow-xl animate-fade-in border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center tracking-tight">
                                    <HeartIcon className="mr-3" /> My Appreciation
                                </h2>
                                <div className="space-y-5">
                                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                                        <h3 className="font-medium text-gray-500 text-sm uppercase tracking-wider">Praise For</h3>
                                        <p className="text-lg font-medium text-black mt-1">{analysis["Recipient"]}</p>
                                    </div>
                                    <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                                        <h3 className="font-medium text-gray-500 text-sm uppercase tracking-wider">Reason</h3>
                                        <p className="text-black mt-2">{analysis["Reason"]}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}