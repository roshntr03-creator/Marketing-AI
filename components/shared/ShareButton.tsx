import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../context/LocalizationContext.ts';
import { STRINGS } from '../../constants.ts';
import { triggerHapticFeedback } from '../../utils/haptics.ts';
import { ShareIcon } from '../icons/ShareIcon.tsx';

export const ShareButton: React.FC<{ textToShare: string; title: string; }> = ({ textToShare, title }) => {
    const { language } = useLocalization();
    const s = STRINGS[language];
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if (navigator.share) {
            setIsSupported(true);
        }
    }, []);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                triggerHapticFeedback();
                await navigator.share({
                    title: title,
                    text: textToShare,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        }
    };

    if (!isSupported) {
        return null;
    }

    return (
        <button
            onClick={handleShare}
            className="p-2 text-gray-500 bg-gray-100 rounded-full hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label={s.share}
        >
            <ShareIcon className="w-5 h-5" />
        </button>
    );
};