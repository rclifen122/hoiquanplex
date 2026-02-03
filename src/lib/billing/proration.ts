import { differenceInDays, differenceInMonths, addMonths } from 'date-fns';

export interface ProrationResult {
    remainingValue: number;
    upgradeCost: number;
    amountToPay: number; // positive = pay more, negative = excess (refund/credit)
    isUpgrade: boolean;
}

/**
 * Calculate the remaining value of the current subscription in VND.
 * Logic: (Days Remaining / Total Days in Period) * Plan Price
 */
export function calculateRemainingValue(
    startDate: Date,
    endDate: Date,
    originalPrice: number
): number {
    const now = new Date();
    if (now > endDate) return 0;
    if (now < startDate) return originalPrice; // Not started yet?

    const totalDays = differenceInDays(endDate, startDate);
    const remainingDays = differenceInDays(endDate, now);

    if (totalDays === 0) return 0;

    const rawValue = (remainingDays / totalDays) * originalPrice;
    return Math.round(rawValue); // Round to integer VND
}

/**
 * Calculate cost for switching to a new plan.
 * Logic:
 * 1. Calculate Credit from old plan (Remaining Value).
 * 2. Calculate Cost of new plan (Full Price).
 * 3. Net = New Cost - Credit.
 */
export function calculateUpgradeCost(
    currentSubscription: {
        start_date: string;
        end_date: string;
        plan_price: number; // Stored timestamp price or current price? Ideally actual paid price.
    },
    newPlanPrice: number
): ProrationResult {
    const startDate = new Date(currentSubscription.start_date);
    const endDate = new Date(currentSubscription.end_date);

    // Safety check for valid dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return {
            remainingValue: 0,
            upgradeCost: newPlanPrice,
            amountToPay: newPlanPrice,
            isUpgrade: true
        };
    }

    const remainingValue = calculateRemainingValue(startDate, endDate, currentSubscription.plan_price);
    const amountToPay = newPlanPrice - remainingValue;

    return {
        remainingValue,
        upgradeCost: newPlanPrice,
        amountToPay,
        isUpgrade: amountToPay > 0
    };
}
