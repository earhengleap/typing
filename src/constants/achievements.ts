import {
    Zap,
    Target,
    Timer,
    Flame,
    Award,
    Wind,
    Users,
    HeartHandshake,
    LucideIcon
} from "lucide-react";

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    color: string;
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
    first_bite: {
        id: "first_bite",
        name: "First Bite",
        description: "Complete your first typing test.",
        icon: Zap,
        color: "#e2b714"
    },
    speed_demon_60: {
        id: "speed_demon_60",
        name: "Speed Demon I",
        description: "Reach 60 WPM in any test.",
        icon: Wind,
        color: "#4ade80"
    },
    speed_demon_100: {
        id: "speed_demon_100",
        name: "Speed Demon II",
        description: "Reach 100 WPM in any test.",
        icon: Wind,
        color: "#3b82f6"
    },
    speed_demon_120: {
        id: "speed_demon_120",
        name: "Speed Demon III",
        description: "Reach 120 WPM in any test.",
        icon: Wind,
        color: "#a855f7"
    },
    sniper: {
        id: "sniper",
        name: "Sniper",
        description: "Get 100% accuracy in a standard test.",
        icon: Target,
        color: "#f43f5e"
    },
    century: {
        id: "century",
        name: "Century",
        description: "Complete 100 typing tests.",
        icon: Award,
        color: "#8b5cf6"
    },
    marathoner: {
        id: "marathoner",
        name: "Marathoner",
        description: "Spend 1 hour total typing.",
        icon: Timer,
        color: "#f97316"
    },
    dedicated_7: {
        id: "dedicated_7",
        name: "Dedicated",
        description: "Maintain a 7-day typing streak.",
        icon: Flame,
        color: "#ef4444"
    },
    a_friends_call: {
        id: "a_friends_call",
        name: "A Friend's Call",
        description: "Join the platform via an invite link.",
        icon: HeartHandshake,
        color: "#ec4899"
    },
    the_recruiter: {
        id: "the_recruiter",
        name: "The Recruiter",
        description: "Successfully invite 1 friend to join.",
        icon: Users,
        color: "#14b8a6"
    },
    community_builder: {
        id: "community_builder",
        name: "Community Builder",
        description: "Successfully invite 5 friends to join.",
        icon: Award,
        color: "#eab308"
    },
};
