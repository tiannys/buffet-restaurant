export default function LowStockAlert() {
    const [lowStockItems, setLowStockItems] = useState([]);
    
    useEffect(() => {
        loadLowStockItems();
        const interval = setInterval(loadLowStockItems, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);
    
    const loadLowStockItems = async () => {
        const res = await menus.getLowStock();
        setLowStockItems(res.data);
    };
    
    if (lowStockItems.length === 0) return null;
    
    return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    ⚠️
                </div>
                <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                        <strong>{lowStockItems.length} items</strong> are running low on stock
                    </p>
                    <ul className="mt-2 text-sm text-yellow-700">
                        {lowStockItems.map(item => (
                            <li key={item.id}>
                                {item.name}: {item.stock_quantity} left
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}