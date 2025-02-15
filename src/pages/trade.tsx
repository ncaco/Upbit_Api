import { OrderForm } from '@/components/trade/order-form';
import { OrderHistory } from '@/components/trade/order-history';

export function Trade() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8">
        <OrderForm />
      </div>
      <div className="col-span-4">
        <OrderHistory />
      </div>
    </div>
  );
} 