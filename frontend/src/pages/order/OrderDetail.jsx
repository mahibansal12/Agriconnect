
// Shared order detail page — used by both /buyer/orders/:id and /farmer/orders/:id.

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const STATUS_STEPS = ['placed', 'confirmed', 'shipped', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get(`/v1/orders/${id}`);
      setOrder(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="od-wrap"><p>Loading order...</p></div>;

  if (error || !order) {
    return (
      <div className="od-wrap">
        <p className="od-error">{error || 'Order not found'}</p>
        <button className="od-back" onClick={() => navigate(-1)}>← Back</button>
      </div>
    );
  }

  const stepIndex = STATUS_STEPS.indexOf(order.orderStatus);
  const isPaymentPending = order.paymentStatus === 'pending' && order.orderStatus === 'placed';

  return (
    <div className="od-wrap">
      <button className="od-back" onClick={() => navigate(-1)}>← Back</button>

      <div className="od-card">
        <div className="od-header">
          <img
            src={order.listing?.images?.[0]?.url || '/placeholder-crop.png'}
            alt={order.listing?.cropName}
            className="od-crop-img"
          />
          <div>
            <h2>{order.listing?.cropName || 'Crop'}</h2>
            <p className="od-id">Order ID: {order._id}</p>
            {isPaymentPending ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, background: "#fef3c7", color: "#92400e", border: "1.5px solid #fcd34d" }}>
                ⏳ Payment Pending
              </span>
            ) : (
              <>
                <span className={`od-badge od-badge--${order.orderStatus}`}>{order.orderStatus}</span>
                <span className={`od-badge od-badge--pay-${order.paymentStatus}`}>{order.paymentStatus}</span>
              </>
            )}
          </div>
        </div>

        {/* Payment pending warning banner */}
        {isPaymentPending && (
          <div style={{ margin: "0 0 20px", padding: "14px 18px", borderRadius: "12px", background: "#fffbeb", border: "1.5px solid #fcd34d", display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <span style={{ fontSize: "20px", flexShrink: 0 }}>⚠️</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: "#92400e", fontSize: "13px" }}>Payment Not Completed</p>
              <p style={{ margin: "4px 0 0", color: "#b45309", fontSize: "12px" }}>Your payment was not received for this order. The order is currently on hold. Please contact support if money was deducted.</p>
            </div>
          </div>
        )}

        {/* Progress timeline — hidden for payment-pending orders */}
        {order.orderStatus !== 'cancelled' && !isPaymentPending && (
          <div className="od-timeline">
            {STATUS_STEPS.map((step, i) => {
                const stepDateMap = {
                    placed: order.createdAt,
                    confirmed: order.confirmedAt,
                    shipped: order.shippedAt,
                    delivered: order.deliveredAt,
                };
                const stepDate = stepDateMap[step];
                return (
                    <div key={step} className={`od-step ${i <= stepIndex ? 'od-step--done' : ''}`}>
                    <span className="od-dot" />
                    <span className="od-step-label">{step}</span>
                    {stepDate && (
                      <span className="od-step-date">
                        {new Date(stepDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        <br />
                        {new Date(stepDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    </div>
                );
                })}
          </div>
        )}

        <div className="od-grid">
          <div className="od-field"><span>Quantity</span><strong>{order.quantity} quintal</strong></div>
          <div className="od-field"><span>Total Price</span><strong>₹{order.totalPrice?.toLocaleString('en-IN')}</strong></div>
          <div className="od-field"><span>Ordered On</span><strong>{new Date(order.createdAt).toLocaleDateString('en-IN')}</strong></div>
          <div className="od-field"><span>Payment ID</span><strong>{order.razorpayPaymentId || '—'}</strong></div>
        </div>

        <div className="od-section">
          <h3>Delivery Address</h3>
          <p>
            {[
              order.deliveryAddress?.village,
              order.deliveryAddress?.district,
              order.deliveryAddress?.state,
            ].filter(Boolean).join(', ')}
            {order.deliveryAddress?.pincode ? ` - ${order.deliveryAddress.pincode}` : ''}
          </p>
          {order.deliveryAddress?.phone && <p>Phone: {order.deliveryAddress.phone}</p>}
        </div>

        <div className="od-section od-people">
          <div>
            <h3>Buyer</h3>
            <p>{order.buyer?.name}</p>
            <p className="od-muted">{order.buyer?.phone} · {order.buyer?.email}</p>
          </div>
          <div>
            <h3>Farmer</h3>
            <p>{order.farmer?.name}</p>
            <p className="od-muted">{order.farmer?.phone} · {order.farmer?.email}</p>
          </div>
        </div>
      </div>

      <style>{`
        .od-wrap { max-width: 760px; margin: 0 auto; padding: 24px 16px; }
        .od-back { background: none; border: none; color: #4d7c0f; font-weight: 600; cursor: pointer; margin-bottom: 16px; padding: 0; }
        .od-error { color: #b91c1c; margin-bottom: 12px; }
        .od-card { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .od-header { display: flex; gap: 16px; align-items: center; margin-bottom: 20px; }
        .od-crop-img { width: 72px; height: 72px; border-radius: 12px; object-fit: cover; background: #f3f4f6; }
        .od-id { color: #6b7280; font-size: 13px; margin: 2px 0 8px; }
        .od-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-right: 6px; background: #f3f4f6; color: #374151; text-transform: capitalize; }
        .od-badge--delivered { background: #dcfce7; color: #166534; }
        .od-badge--cancelled { background: #fee2e2; color: #991b1b; }
        .od-badge--pay-paid { background: #dcfce7; color: #166534; }
        .od-badge--pay-failed { background: #fee2e2; color: #991b1b; }
        .od-timeline { display: flex; justify-content: space-between; margin: 24px 0; }
        .od-step { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; opacity: 0.4; position: relative; }
        .od-step--done { opacity: 1; }
        .od-step:not(:first-child)::before {
            content: '';
            position: absolute;
            top: 6px;
            right: 50%;
            width: 100%;
            height: 2px;
            background: #84cc16;
            z-index: 0;
            }
        .od-dot { width: 12px; height: 12px; border-radius: 50%; background: #84cc16; position: relative; z-index: 1; }
        .od-step-label { font-size: 12px; text-transform: capitalize; }
        .od-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 20px; }
        .od-field { display: flex; flex-direction: column; gap: 2px; }
        .od-field span { font-size: 12px; color: #6b7280; }
        .od-section { border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 8px; }
        .od-people { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .od-muted { color: #6b7280; font-size: 13px; }
        .od-step-date { font-size: 11px; color: #9ca3af; }
      `}</style>
    </div>
  );
}