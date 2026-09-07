import { useStore } from "./contexts/StoreContext";

function App() {
  const { store } = useStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
        {store?.name || "Welcome to Our Store"}
      </h1>
      <p className="text-muted-foreground text-lg max-w-md mb-6">
        المتجر تحت الإنشاء حالياً وسيتم إطلاقه قريباً.
      </p>
      <a
        href="/admin/login"
        className="px-6 py-3 text-sm font-medium text-white bg-primary rounded-lg shadow hover:bg-primary/90 transition-colors"
      >
        الانتقال إلى لوحة التحكم
      </a>
    </div>
  );
}

export default App;
