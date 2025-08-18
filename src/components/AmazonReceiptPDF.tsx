import React, { useEffect, useState } from 'react';
import { AmazonOrder, AmazonProduct } from '@/integrations/amazon-uae/types';
import { amazonUAEService } from '@/integrations/amazon-uae/service';

interface AmazonReceiptPDFProps {
  order: AmazonOrder;
}

const AmazonReceiptPDF: React.FC<AmazonReceiptPDFProps> = ({ order }) => {
  const [product, setProduct] = useState<AmazonProduct | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await amazonUAEService.getProductById(order.product_id);
        setProduct(productData);
      } catch (error) {
        console.error('Error fetching product for receipt:', error);
      }
    };

    if (order.product_id) {
      fetchProduct();
    }
  }, [order.product_id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      id="receipt-pdf"
      style={{
        width: '800px',
        padding: '40px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#ffffff',
        color: '#333333',
        lineHeight: '1.6'
      }}
    >
      {/* Header */}
      <div style={{
        textAlign: 'center',
        borderBottom: '3px solid #2563eb',
        paddingBottom: '20px',
        marginBottom: '30px'
      }}>
        <h1 style={{
          color: '#2563eb',
          fontSize: '32px',
          margin: '0 0 10px 0',
          fontWeight: 'bold'
        }}>
          DREAM WEAVE
        </h1>
        <h2 style={{
          color: '#1e40af',
          fontSize: '20px',
          margin: '0 0 5px 0',
          fontWeight: '600'
        }}>
          Dream Weave Dubai Store
        </h2>
        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          margin: '0'
        }}>
          Your Trusted Shopping Partner
        </p>
      </div>

      {/* Receipt Title */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h2 style={{
          color: '#1f2937',
          fontSize: '24px',
          margin: '0 0 10px 0',
          fontWeight: 'bold'
        }}>
          ORDER RECEIPT
        </h2>
        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          margin: '0 0 15px 0'
        }}>
          {order.quantity > 1 ? `Multiple items (${order.quantity} units)` : 'Single item order'}
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div>
            <strong style={{ color: '#374151' }}>Order Number:</strong>
            <span style={{ 
              color: '#2563eb', 
              fontWeight: 'bold',
              marginLeft: '10px',
              fontSize: '16px'
            }}>
              {order.order_number}
            </span>
          </div>
          <div>
            <strong style={{ color: '#374151' }}>Date:</strong>
            <span style={{ marginLeft: '10px' }}>
              {formatDate(order.order_date)}
            </span>
          </div>
          <div>
            <strong style={{ color: '#374151' }}>Time:</strong>
            <span style={{ marginLeft: '10px' }}>
              {formatTime(order.order_date)}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div style={{
        marginBottom: '30px',
        backgroundColor: '#f8fafc',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{
          color: '#1f2937',
          fontSize: '18px',
          margin: '0 0 15px 0',
          fontWeight: 'bold',
          borderBottom: '2px solid #2563eb',
          paddingBottom: '5px'
        }}>
          Customer Information
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px'
        }}>
          <div>
            <strong style={{ color: '#374151' }}>Full Name:</strong>
            <div style={{ marginTop: '5px' }}>{order.delivery_address.full_name}</div>
          </div>
          <div>
            <strong style={{ color: '#374151' }}>Phone:</strong>
            <div style={{ marginTop: '5px' }}>{order.delivery_address.phone}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <strong style={{ color: '#374151' }}>Address:</strong>
            <div style={{ marginTop: '5px' }}>
              {order.delivery_address.address_line1}
              {order.delivery_address.address_line2 && (
                <div>{order.delivery_address.address_line2}</div>
              )}
              <div>
                {order.delivery_address.city}, {order.delivery_address.postal_code}
              </div>
              <div>{order.delivery_address.country}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div style={{
        marginBottom: '30px',
        backgroundColor: '#f8fafc',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{
          color: '#1f2937',
          fontSize: '18px',
          margin: '0 0 15px 0',
          fontWeight: 'bold',
          borderBottom: '2px solid #2563eb',
          paddingBottom: '5px'
        }}>
          Order Details
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px'
        }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <strong style={{ color: '#374151' }}>Product:</strong>
            <div style={{ marginTop: '5px' }}>
              {product ? product.title : `Product ID: ${order.product_id}`}
            </div>
            {product && product.description && (
              <div style={{ 
                marginTop: '5px', 
                fontSize: '14px', 
                color: '#6b7280',
                fontStyle: 'italic'
              }}>
                {product.description}
              </div>
            )}
          </div>
          <div>
            <strong style={{ color: '#374151' }}>Quantity:</strong>
            <div style={{ marginTop: '5px' }}>{order.quantity}</div>
          </div>
          {product && (
            <>
              <div>
                <strong style={{ color: '#374151' }}>Brand:</strong>
                <div style={{ marginTop: '5px' }}>{product.brand}</div>
              </div>
              <div>
                <strong style={{ color: '#374151' }}>Category:</strong>
                <div style={{ marginTop: '5px' }}>{product.category}</div>
              </div>
              <div>
                <strong style={{ color: '#374151' }}>Rating:</strong>
                <div style={{ marginTop: '5px' }}>
                  ⭐ {product.rating}/5 ({product.review_count} reviews)
                </div>
              </div>
            </>
          )}
          <div>
            <strong style={{ color: '#374151' }}>Order Status:</strong>
            <div style={{ 
              marginTop: '5px',
              color: '#059669',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {order.status}
            </div>
          </div>
          <div>
            <strong style={{ color: '#374151' }}>Estimated Delivery:</strong>
            <div style={{ marginTop: '5px' }}>
              {formatDate(order.estimated_delivery)}
            </div>
          </div>
          {order.paychangu_reference && (
            <div>
              <strong style={{ color: '#374151' }}>Payment Reference:</strong>
              <div style={{ marginTop: '5px', fontFamily: 'monospace' }}>
                {order.paychangu_reference}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Tracking */}
      {order.tracking_number && (
        <div style={{
          marginBottom: '30px',
          backgroundColor: '#f0f9ff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #0ea5e9'
        }}>
          <h3 style={{
            color: '#0c4a6e',
            fontSize: '18px',
            margin: '0 0 15px 0',
            fontWeight: 'bold',
            borderBottom: '2px solid #0ea5e9',
            paddingBottom: '5px'
          }}>
            📦 Tracking Information
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px'
          }}>
            <div>
              <strong style={{ color: '#0c4a6e' }}>Tracking Number:</strong>
              <div style={{ 
                marginTop: '5px',
                fontFamily: 'monospace',
                fontWeight: 'bold'
              }}>
                {order.tracking_number}
              </div>
            </div>
            <div>
              <strong style={{ color: '#0c4a6e' }}>Current Status:</strong>
              <div style={{ 
                marginTop: '5px',
                color: '#059669',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {order.status}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing */}
      <div style={{
        marginBottom: '30px',
        backgroundColor: '#f8fafc',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{
          color: '#1f2937',
          fontSize: '18px',
          margin: '0 0 15px 0',
          fontWeight: 'bold',
          borderBottom: '2px solid #2563eb',
          paddingBottom: '5px'
        }}>
          Payment Summary
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          fontSize: '16px'
        }}>
          <div style={{ textAlign: 'right' }}>
            <strong>Unit Price:</strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            MWK {product ? product.price.toLocaleString() : order.product_price.toLocaleString()}
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong>Quantity:</strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            {order.quantity}
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong>Subtotal:</strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            MWK {order.product_price.toLocaleString()}
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong>Shipping Cost:</strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            MWK {order.shipping_cost.toLocaleString()}
          </div>
          <div style={{ 
            textAlign: 'right',
            borderTop: '2px solid #2563eb',
            paddingTop: '10px',
            marginTop: '10px',
            fontWeight: 'bold',
            fontSize: '18px',
            color: '#1f2937'
          }}>
            <strong>Total Amount:</strong>
          </div>
          <div style={{ 
            textAlign: 'right',
            borderTop: '2px solid #2563eb',
            paddingTop: '10px',
            marginTop: '10px',
            fontWeight: 'bold',
            fontSize: '18px',
            color: '#2563eb'
          }}>
            MWK {order.total_amount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Admin Notes */}
      {order.admin_notes && (
        <div style={{
          marginBottom: '30px',
          backgroundColor: '#fef3c7',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #f59e0b'
        }}>
          <h3 style={{
            color: '#92400e',
            fontSize: '18px',
            margin: '0 0 15px 0',
            fontWeight: 'bold',
            borderBottom: '2px solid #f59e0b',
            paddingBottom: '5px'
          }}>
            📝 Admin Notes
          </h3>
          <div style={{
            color: '#92400e',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            {order.admin_notes}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        borderTop: '3px solid #2563eb',
        paddingTop: '20px',
        marginTop: '30px',
        color: '#6b7280',
        fontSize: '14px'
      }}>
        <p style={{ margin: '0 0 10px 0' }}>
          <strong>Thank you for your order!</strong>
        </p>
        <p style={{ margin: '0 0 10px 0' }}>
          Your order has been successfully placed and is being processed.
        </p>
        <p style={{ margin: '0 0 10px 0' }}>
          Please keep this receipt for your records.
        </p>
        <p style={{ margin: '0 0 10px 0' }}>
          You will receive email updates about your order status.
        </p>
        <p style={{ margin: '0 0 15px 0' }}>
          For any questions, please contact our support team.
        </p>
        <div style={{
          backgroundColor: '#f3f4f6',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #d1d5db'
        }}>
          <strong style={{ color: '#374151' }}>DreamWeave Support:</strong>
          <div>Email: support@dreamweave.com</div>
          <div>Phone: +265 XXX XXX XXX</div>
        </div>
      </div>
    </div>
  );
};

export default AmazonReceiptPDF;
