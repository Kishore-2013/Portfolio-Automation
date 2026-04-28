export interface MatchingResult {
    matchedFields: string[];
    missingFields: string[];
    extraFields: string[];
    score: number;
}

export const mockMatchingResults: MatchingResult = {
    matchedFields: ["name", "role", "bio", "skills", "projects", "socialLinks"],
    missingFields: ["profileImage", "certifications"],
    extraFields: ["hobbies", "languages"],
    score: 85
};

