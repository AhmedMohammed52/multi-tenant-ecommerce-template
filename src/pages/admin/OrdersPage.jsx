import { useRef } from "react";
import PageHeader from "../../components/admin/PageHeader";
import { Button } from "../../components/admin/Button";
import { Download } from "lucide-react";
import OrdersTable from "../../components/admin/orders/OrdersTable";

export default function OrdersPage() {
  const tableRef = useRef(null);

  const handleExportCSV = () => {
    if (tableRef.current) {
      tableRef.current.exportData();
    }
  };

  return (
    <>
      <PageHeader title="Orders" subtitle="7 orders in the selected period.">
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="size-4" />
          Export CSV
        </Button>
      </PageHeader>

      <OrdersTable ref={tableRef} />
    </>
  );
}
