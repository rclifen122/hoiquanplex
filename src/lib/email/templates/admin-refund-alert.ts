
interface RefundAlertProps {
    customerName: string;
    customerEmail: string;
    oldPlanName: string;
    newPlanName: string;
    refundAmount: number;
    reason?: string;
}

export const adminRefundAlertTemplate = (props: RefundAlertProps) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; mx-auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; }
    .header { background-color: #f8f9fa; padding: 15px; text-align: center; border-bottom: 1px solid #eee; }
    .content { padding: 20px 0; }
    .alert { background-color: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
    .details { background-color: #f8f9fa; padding: 15px; border-radius: 4px; }
    .amount { font-size: 1.2em; font-weight: bold; color: #dc3545; }
    .footer { font-size: 12px; color: #666; text-align: center; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>⚠️ Yêu cầu Hoàn tiền Mới</h2>
    </div>
    <div class="content">
      <div class="alert">
        <strong>Hành động:</strong> Khách hàng yêu cầu hạ cấp gói dịch vụ. Cần kiểm tra và hoàn tiền thủ công.
      </div>

      <p>Chi tiết yêu cầu:</p>
      
      <div class="details">
        <p><strong>Khách hàng:</strong> ${props.customerName} (${props.customerEmail})</p>
        <p><strong>Từ gói:</strong> ${props.oldPlanName}</p>
        <p><strong>Sang gói:</strong> ${props.newPlanName}</p>
        <p><strong>Số tiền cần hoàn (Ước tính):</strong> <span class="amount">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(props.refundAmount)}</span></p>
        ${props.reason ? `<p><strong>Lý do:</strong> ${props.reason}</p>` : ''}
      </div>

      <p>Vui lòng truy cập trang Admin để xử lý khoản hoàn tiền này.</p>
    </div>
    <div class="footer">
      <p>Email này được gửi tự động từ hệ thống HoiQuanPlex.</p>
    </div>
  </div>
</body>
</html>
`;
