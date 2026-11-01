import SiteHeader from "@/components/layout/SiteHeader";
import OrderDetailsForm from "@/components/order/OrderDetailsForm";

export default function OrderPage() {
  return (
    <>
      <SiteHeader />

      <main>
        <OrderDetailsForm />
      </main>
    </>
  );
}
