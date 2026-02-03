import { createClient } from '@/lib/supabase/server';

export interface CouponValidationResult {
    valid: boolean;
    promotion?: Record<string, any>;
    error?: string;
    finalAmount?: number;
    discountAmount?: number;
}

export async function validateCoupon(code: string, originalAmount: number, customerId: string): Promise<CouponValidationResult> {
    const supabase = await createClient();

    // 1. Fetch promotion
    const { data: promotion, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('code', code)
        .single();

    if (error || !promotion) {
        return { valid: false, error: 'Mã giảm giá không hợp lệ' };
    }

    // 2. Check active status
    if (!promotion.is_active) {
        return { valid: false, error: 'Mã giảm giá đã ngừng hoạt động' };
    }

    // 3. Check expiration
    if (promotion.expires_at && new Date(promotion.expires_at) < new Date()) {
        return { valid: false, error: 'Mã giảm giá đã hết hạn' };
    }

    // 4. Check usage limit
    if (promotion.max_uses !== null && promotion.current_uses >= promotion.max_uses) {
        return { valid: false, error: 'Mã giảm giá đã hết lượt sử dụng' };
    }

    // 5. Check if user already used this specific global code? 
    // (Optional: depending on rule, usually one-time use per user for welcome codes)
    // Let's implement strict check: One use per customer per promotion
    const { data: usage } = await supabase
        .from('promotion_usage')
        .select('id')
        .eq('promotion_id', promotion.id)
        .eq('customer_id', customerId)
        .single();

    if (usage) {
        return { valid: false, error: 'Bạn đã sử dụng mã giảm giá này rồi' };
    }

    // 6. Calculate discount
    let discountAmount = 0;
    if (promotion.discount_type === 'percent') {
        discountAmount = (originalAmount * promotion.discount_value) / 100;
    } else {
        discountAmount = promotion.discount_value;
    }

    // Ensure discount doesn't exceed total, or cap it?
    // Let's just cap at 100%
    if (discountAmount > originalAmount) {
        discountAmount = originalAmount;
    }

    const finalAmount = originalAmount - discountAmount;

    return {
        valid: true,
        promotion,
        discountAmount,
        finalAmount
    };
}
