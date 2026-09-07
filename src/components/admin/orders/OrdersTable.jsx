import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { createPortal } from "react-dom";
import { Search, SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";

const initialOrders = [
  {
    id: "#10248",
    customer: { name: "Nour Ibrahim", email: "nour.ibrahim@example.com" },
    date: "Aug 26, 2026",
    method: "Credit card — Visa ••4242",
    payment: "Paid",
    fulfilment: "Processing",
    total: 2280,
  },
  {
    id: "#10247",
    customer: { name: "Youssef Kamal", email: "youssef.k@example.com" },
    date: "Aug 26, 2026",
    method: "Cash on delivery",
    payment: "Pending",
    fulfilment: "Processing",
    total: 1860,
  },
  {
    id: "#10246",
    customer: { name: "Salma Adel", email: "salma.adel@example.com" },
    date: "Aug 25, 2026",
    method: "Credit card — Mastercard ••8821",
    payment: "Paid",
    fulfilment: "Shipped",
    total: 2255,
  },
  {
    id: "#10245",
    customer: { name: "Omar Sherif", email: "omar.sherif@example.com" },
    date: "Aug 25, 2026",
    method: "Credit card — declined",
    payment: "Failed",
    fulfilment: "Cancelled",
    total: 1730,
  },
  {
    id: "#10244",
    customer: { name: "Hana Mostafa", email: "hana.m@example.com" },
    date: "Aug 24, 2026",
    method: "Credit card — Visa ••1109",
    payment: "Paid",
    fulfilment: "Delivered",
    total: 2020,
  },
  {
    id: "#10243",
    customer: { name: "Kareem Fouad", email: "kareem.fouad@example.com" },
    date: "Aug 23, 2026",
    method: "Credit card — refunded",
    payment: "Refunded",
    fulfilment: "Cancelled",
    total: 1530,
  },
  {
    id: "#10242",
    customer: { name: "Mariam Saad", email: "mariam.saad@example.com" },
    date: "Aug 23, 2026",
    method: "Cash on delivery",
    payment: "Paid",
    fulfilment: "Delivered",
    total: 1970,
  },
];

const paymentOptions = [
  "All payments",
  "Paid",
  "Pending",
  "Failed",
  "Refunded",
];
const fulfilmentOptions = [
  "All fulfilment",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const ITEMS_PER_PAGE = 5;

const OrdersTable = forwardRef(({ orders = initialOrders }, ref) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("All payments");
  const [selectedFulfilment, setSelectedFulfilment] =
    useState("All fulfilment");

  const [currentPage, setCurrentPage] = useState(1);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isFulfilmentOpen, setIsFulfilmentOpen] = useState(false);

  const [paymentPos, setPaymentPos] = useState({ top: 0, left: 0, width: 0 });
  const [fulfilmentPos, setFulfilmentPos] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const paymentRef = useRef(null);
  const fulfilmentRef = useRef(null);
  const paymentMenuRef = useRef(null);
  const fulfilmentMenuRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPayment, selectedFulfilment]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        paymentRef.current &&
        !paymentRef.current.contains(event.target) &&
        paymentMenuRef.current &&
        !paymentMenuRef.current.contains(event.target)
      ) {
        setIsPaymentOpen(false);
      }
      if (
        fulfilmentRef.current &&
        !fulfilmentRef.current.contains(event.target) &&
        fulfilmentMenuRef.current &&
        !fulfilmentMenuRef.current.contains(event.target)
      ) {
        setIsFulfilmentOpen(false);
      }
    }

    function handleScrollOrResize() {
      if (isPaymentOpen) setIsPaymentOpen(false);
      if (isFulfilmentOpen) setIsFulfilmentOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isPaymentOpen, isFulfilmentOpen]);

  const handleTogglePayment = () => {
    if (!isPaymentOpen && paymentRef.current) {
      const rect = paymentRef.current.getBoundingClientRect();
      setPaymentPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
    setIsPaymentOpen(!isPaymentOpen);
    setIsFulfilmentOpen(false);
  };

  const handleToggleFulfilment = () => {
    if (!isFulfilmentOpen && fulfilmentRef.current) {
      const rect = fulfilmentRef.current.getBoundingClientRect();
      setFulfilmentPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
    setIsFulfilmentOpen(!isFulfilmentOpen);
    setIsPaymentOpen(false);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPayment =
      selectedPayment === "All payments" ||
      order.payment.toLowerCase() === selectedPayment.toLowerCase();

    const matchesFulfilment =
      selectedFulfilment === "All fulfilment" ||
      order.fulfilment.toLowerCase() === selectedFulfilment.toLowerCase();

    return matchesSearch && matchesPayment && matchesFulfilment;
  });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const exportToCSV = () => {
    if (filteredOrders.length === 0) return;

    const dataToExport = filteredOrders.map((order) => ({
      "Order ID": order.id,
      "Customer Name": order.customer.name,
      "Customer Email": order.customer.email,
      Date: order.date,
      "Payment Method": order.method,
      Payment: order.payment,
      Fulfilment: order.fulfilment,
      "Total (EGP)": order.total,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `orders_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useImperativeHandle(ref, () => ({
    exportData: exportToCSV,
  }));

  const getPaymentBadge = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
      case "failed":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800";
      case "refunded":
        return "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getFulfilmentBadge = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
      case "processing":
        return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800";
      case "shipped":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <section className="panel w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-border p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search order number, name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex w-full rounded-md border border-input px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 bg-surface pl-8 md:text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <div className="relative w-full sm:w-auto min-w-44" ref={paymentRef}>
            <button
              type="button"
              onClick={handleTogglePayment}
              className="flex items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input px-3 py-2 text-sm shadow-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring h-9 w-full bg-surface"
            >
              <div className="flex items-center gap-2 truncate">
                <SlidersHorizontal className="size-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{selectedPayment}</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 opacity-50 transition-transform duration-200 ${
                  isPaymentOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <div
            className="relative w-full sm:w-auto min-w-44"
            ref={fulfilmentRef}
          >
            <button
              type="button"
              onClick={handleToggleFulfilment}
              className="flex items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input px-3 py-2 text-sm shadow-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring h-9 w-full bg-surface"
            >
              <div className="flex items-center gap-2 truncate">
                <SlidersHorizontal className="size-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{selectedFulfilment}</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 opacity-50 transition-transform duration-200 ${
                  isFulfilmentOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-full min-w-0 overflow-x-auto">
        <table className="w-full min-w-200 border-collapse text-sm">
          <caption className="sr-only">Orders List</caption>

          <thead>
            <tr className="border-b border-border bg-surface-muted/70">
              <th
                scope="col"
                className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Order
              </th>
              <th
                scope="col"
                className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Customer
              </th>
              <th
                scope="col"
                className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Method
              </th>
              <th
                scope="col"
                className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Payment
              </th>
              <th
                scope="col"
                className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Fulfilment
              </th>
              <th
                scope="col"
                className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Total
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-accent/30"
                >
                  <td className="px-4 py-3 align-middle font-medium text-foreground">
                    <Link
                      to={`/orders/${order.id.replace("#", "")}`}
                      className="hover:underline"
                    >
                      {order.id}
                    </Link>
                  </td>

                  <td className="px-4 py-3 align-middle">
                    <div className="min-w-0">
                      <span className="block font-medium text-foreground">
                        {order.customer.name}
                      </span>
                      <span className="block text-xs text-muted-foreground truncate">
                        {order.customer.email}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 align-middle whitespace-nowrap text-muted-foreground">
                    {order.date}
                  </td>

                  <td className="px-4 py-3 align-middle text-muted-foreground">
                    {order.method}
                  </td>

                  <td className="px-4 py-3 align-middle">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getPaymentBadge(
                        order.payment,
                      )}`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {order.payment}
                    </span>
                  </td>

                  <td className="px-4 py-3 align-middle">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getFulfilmentBadge(
                        order.fulfilment,
                      )}`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {order.fulfilment}
                    </span>
                  </td>

                  <td className="px-4 py-3 align-middle text-right font-medium text-foreground whitespace-nowrap">
                    {order.total.toLocaleString()} EGP
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="py-12 text-center text-muted-foreground text-xs"
                >
                  No orders found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
        <span>
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filteredOrders.length === 0 ? 0 : startIndex + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-foreground">
            {Math.min(endIndex, filteredOrders.length)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">
            {filteredOrders.length}
          </span>
        </span>

        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="h-8 px-3 rounded-md border border-input bg-background font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            className="h-8 px-3 rounded-md border border-input bg-background font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {isPaymentOpen &&
        createPortal(
          <div
            ref={paymentMenuRef}
            className="fixed z-50 rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 zoom-in-95"
            style={{
              top: `${paymentPos.top}px`,
              left: `${paymentPos.left}px`,
              width: `${paymentPos.width}px`,
            }}
          >
            <div className="p-1">
              {paymentOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    setSelectedPayment(opt);
                    setIsPaymentOpen(false);
                  }}
                  className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                    selectedPayment === opt ? "bg-accent/50 font-semibold" : ""
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {selectedPayment === opt && (
                    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="size-4 text-primary" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}

      {isFulfilmentOpen &&
        createPortal(
          <div
            ref={fulfilmentMenuRef}
            className="fixed z-50 rounded-md border border-border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 zoom-in-95"
            style={{
              top: `${fulfilmentPos.top}px`,
              left: `${fulfilmentPos.left}px`,
              width: `${fulfilmentPos.width}px`,
            }}
          >
            <div className="p-1">
              {fulfilmentOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    setSelectedFulfilment(opt);
                    setIsFulfilmentOpen(false);
                  }}
                  className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                    selectedFulfilment === opt
                      ? "bg-accent/50 font-semibold"
                      : ""
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {selectedFulfilment === opt && (
                    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                      <Check className="size-4 text-primary" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
});

export default OrdersTable;
